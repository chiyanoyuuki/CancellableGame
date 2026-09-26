import { uid } from '../core/id';
import type { Player } from '../core/models';
import { getDb } from './database';
import { kvGetJSON, kvSetJSON } from './kv';

const UNWANTED_UNIVERSES_KEY = 'player:unwantedUniverses';

/**
 * Per-player list of UNWANTED universes. A player almost never gets questions
 * from these universes : chaque question qui lui est attribuée n'a qu'environ
 * 2 % de chance d'appartenir à l'un d'eux.
 *
 * C'est la SEULE préférence d'univers d'un profil : il n'existe pas de liste
 * « favoris » séparée. Les univers « souhaités » d'un joueur sont simplement
 * tous ceux qu'il n'a pas marqués comme non souhaités. Les modes qui ont besoin
 * des univers voulus d'un joueur les déduisent donc de cette seule liste.
 */
export async function getPlayerUnwantedUniverses(): Promise<Record<string, string[]>> {
  return kvGetJSON<Record<string, string[]>>(UNWANTED_UNIVERSES_KEY, {});
}

export async function setPlayerUnwantedUniverses(map: Record<string, string[]>): Promise<void> {
  await kvSetJSON(UNWANTED_UNIVERSES_KEY, map);
}

interface PlayerRow {
  id: string;
  name: string;
  emoji: string;
  color: string;
  created_at: number;
  archived: number;
  photo_uri: string | null;
}

function toPlayer(r: PlayerRow): Player {
  const p: Player = { id: r.id, name: r.name, emoji: r.emoji, color: r.color };
  if (r.photo_uri) p.photoUri = r.photo_uri;
  return p;
}

export async function listPlayers(includeArchived = false): Promise<Player[]> {
  const db = await getDb();
  const where = includeArchived ? '' : 'WHERE archived = 0';
  const rows = await db.getAllAsync<PlayerRow>(
    `SELECT id, name, emoji, color, created_at, archived, photo_uri FROM players ${where} ORDER BY name COLLATE NOCASE`,
  );
  return rows.map(toPlayer);
}

/** A single player by id (or null). */
export async function getPlayer(id: string): Promise<Player | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<PlayerRow>(
    'SELECT id, name, emoji, color, created_at, archived, photo_uri FROM players WHERE id = ?',
    [id],
  );
  return r ? toPlayer(r) : null;
}

/** Only the archived players (for the "Archivés" view). */
export async function listArchivedPlayers(): Promise<Player[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<PlayerRow>(
    'SELECT id, name, emoji, color, created_at, archived, photo_uri FROM players WHERE archived = 1 ORDER BY name COLLATE NOCASE',
  );
  return rows.map(toPlayer);
}

export async function createPlayer(input: { name: string; emoji: string; color: string; photoUri?: string }): Promise<Player> {
  const db = await getDb();
  const player: Player = { id: uid(), name: input.name.trim(), emoji: input.emoji, color: input.color };
  if (input.photoUri) player.photoUri = input.photoUri;
  await db.runAsync(
    'INSERT INTO players (id, name, emoji, color, created_at, archived, photo_uri) VALUES (?, ?, ?, ?, ?, 0, ?)',
    [player.id, player.name, player.emoji, player.color, Date.now(), input.photoUri ?? null],
  );
  return player;
}

export async function updatePlayer(player: Player): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE players SET name = ?, emoji = ?, color = ?, photo_uri = ? WHERE id = ?', [
    player.name.trim(),
    player.emoji,
    player.color,
    player.photoUri ?? null,
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
