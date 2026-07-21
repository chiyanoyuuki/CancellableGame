import { uid } from '../core/id';
import type { Player } from '../core/models';
import { getDb } from './database';
import { kvGetJSON, kvSetJSON } from './kv';

const UNWANTED_UNIVERSES_KEY = 'player:unwantedUniverses';
const CHOSEN_UNIVERSES_KEY = 'player:chosenUniverses';

/**
 * Per-player list of UNWANTED universes. A player almost never gets questions
 * from these universes : chaque question qui lui est attribuée n'a qu'environ
 * 2 % de chance d'appartenir à l'un d'eux.
 */
export async function getPlayerUnwantedUniverses(): Promise<Record<string, string[]>> {
  return kvGetJSON<Record<string, string[]>>(UNWANTED_UNIVERSES_KEY, {});
}

export async function setPlayerUnwantedUniverses(map: Record<string, string[]>): Promise<void> {
  await kvSetJSON(UNWANTED_UNIVERSES_KEY, map);
}

/**
 * Per-player list of CHOSEN (favourite) universes : les univers que le joueur
 * connaît / préfère. Sert au Duel « univers aléatoires depuis les profils » et
 * au mode équipe (les questions d'une équipe viennent des univers choisis par
 * au moins un de ses membres).
 */
export async function getPlayerChosenUniverses(): Promise<Record<string, string[]>> {
  return kvGetJSON<Record<string, string[]>>(CHOSEN_UNIVERSES_KEY, {});
}

export async function setPlayerChosenUniverses(map: Record<string, string[]>): Promise<void> {
  await kvSetJSON(CHOSEN_UNIVERSES_KEY, map);
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
