import { getDb, resetDb, SCHEMA_VERSION } from './database';

/**
 * Full JSON export / import. This is the safety net on top of the
 * survives-an-update guarantee: it lets you move your history to a new phone or
 * recover after a clean uninstall. The Settings screen serialises this to a
 * file and shares it.
 */

export interface BackupData {
  schemaVersion: number;
  exportedAt: number;
  players: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  results: Record<string, unknown>[];
  events: Record<string, unknown>[];
  question_history: Record<string, unknown>[];
  kv: Record<string, unknown>[];
}

export async function exportAll(): Promise<BackupData> {
  const db = await getDb();
  const [players, sessions, results, events, question_history, kv] = await Promise.all([
    db.getAllAsync<Record<string, unknown>>('SELECT * FROM players'),
    db.getAllAsync<Record<string, unknown>>('SELECT * FROM sessions'),
    db.getAllAsync<Record<string, unknown>>('SELECT * FROM results'),
    db.getAllAsync<Record<string, unknown>>('SELECT * FROM events'),
    db.getAllAsync<Record<string, unknown>>('SELECT * FROM question_history'),
    db.getAllAsync<Record<string, unknown>>('SELECT * FROM kv'),
  ]);
  return { schemaVersion: SCHEMA_VERSION, exportedAt: Date.now(), players, sessions, results, events, question_history, kv };
}

function val(row: Record<string, unknown>, key: string): string | number | null {
  const v = row[key];
  if (v === undefined || v === null) return null;
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  return String(v);
}

/** Replace ALL local data with the backup's contents. */
export async function importAll(data: BackupData): Promise<void> {
  const db = await getDb();
  await resetDb();

  await db.withTransactionAsync(async () => {
    for (const p of data.players ?? []) {
      await db.runAsync(
        'INSERT INTO players (id, name, emoji, color, created_at, archived) VALUES (?, ?, ?, ?, ?, ?)',
        [val(p, 'id'), val(p, 'name'), val(p, 'emoji'), val(p, 'color'), val(p, 'created_at'), val(p, 'archived') ?? 0],
      );
    }
    for (const s of data.sessions ?? []) {
      await db.runAsync(
        'INSERT INTO sessions (id, game_id, mode, config, started_at, ended_at, player_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [val(s, 'id'), val(s, 'game_id'), val(s, 'mode'), val(s, 'config'), val(s, 'started_at'), val(s, 'ended_at'), val(s, 'player_count')],
      );
    }
    for (const r of data.results ?? []) {
      await db.runAsync(
        'INSERT INTO results (id, session_id, game_id, started_at, player_id, points, rank, sips_drunk, sips_given, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          val(r, 'id'), val(r, 'session_id'), val(r, 'game_id'), val(r, 'started_at'), val(r, 'player_id'),
          val(r, 'points'), val(r, 'rank'), val(r, 'sips_drunk'), val(r, 'sips_given'), val(r, 'details'),
        ],
      );
    }
    for (const e of data.events ?? []) {
      await db.runAsync(
        'INSERT INTO events (id, session_id, game_id, type, player_id, at, payload) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [val(e, 'id'), val(e, 'session_id'), val(e, 'game_id'), val(e, 'type'), val(e, 'player_id'), val(e, 'at'), val(e, 'payload')],
      );
    }
    for (const h of data.question_history ?? []) {
      await db.runAsync(
        'INSERT INTO question_history (question_id, times_used, last_used_at) VALUES (?, ?, ?)',
        [val(h, 'question_id'), val(h, 'times_used'), val(h, 'last_used_at')],
      );
    }
    for (const k of data.kv ?? []) {
      await db.runAsync('INSERT INTO kv (key, value) VALUES (?, ?)', [val(k, 'key'), val(k, 'value')]);
    }
  });
}
