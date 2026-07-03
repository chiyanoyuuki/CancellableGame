import { uid } from '../core/id';
import type { Player } from '../core/models';
import { getDb } from './database';
import { kvGetJSON, kvSetJSON } from './kv';

const AVOID_KEY = 'player:avoidedUniverses';

/** Per-player list of universes to avoid (soft: 50% less likely, not excluded). */
export async function getPlayerAvoidance(): Promise<Record<string, string[]>> {
  return kvGetJSON<Record<string, string[]>>(AVOID_KEY, {});
}

export async function setPlayerAvoidance(map: Record<string, string[]>): Promise<void> {
  await kvSetJSON(AVOID_KEY, map);
}

interface PlayerRow {
  id: string;
  name: string;
  emoji: string;
  color: string;
  created_at: number;
  archived: number;
}

function toPlayer(r: PlayerRow): Player {
  return { id: r.id, name: r.name, emoji: r.emoji, color: r.color };
}

export async function listPlayers(includeArchived = false): Promise<Player[]> {
  const db = await getDb();
  const where = includeArchived ? '' : 'WHERE archived = 0';
  const rows = await db.getAllAsync<PlayerRow>(
    `SELECT id, name, emoji, color, created_at, archived FROM players ${where} ORDER BY name COLLATE NOCASE`,
  );
  return rows.map(toPlayer);
}

export async function createPlayer(input: { name: string; emoji: string; color: string }): Promise<Player> {
  const db = await getDb();
  const player: Player = { id: uid(), name: input.name.trim(), emoji: input.emoji, color: input.color };
  await db.runAsync(
    'INSERT INTO players (id, name, emoji, color, created_at, archived) VALUES (?, ?, ?, ?, ?, 0)',
    [player.id, player.name, player.emoji, player.color, Date.now()],
  );
  return player;
}

export async function updatePlayer(player: Player): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE players SET name = ?, emoji = ?, color = ? WHERE id = ?', [
    player.name.trim(),
    player.emoji,
    player.color,
    player.id,
  ]);
}

/** Soft-delete: keep the player out of the roster but preserve their stats. */
export async function archivePlayer(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE players SET archived = 1 WHERE id = ?', [id]);
}

export async function restorePlayer(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE players SET archived = 0 WHERE id = ?', [id]);
}

/** Hard-delete a player and all of their stats. Irreversible. */
export async function deletePlayerForever(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM results WHERE player_id = ?', [id]);
  await db.runAsync('DELETE FROM events WHERE player_id = ?', [id]);
  await db.runAsync('DELETE FROM players WHERE id = ?', [id]);
}
