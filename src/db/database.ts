import * as SQLite from 'expo-sqlite';

/**
 * SQLite access + schema migrations.
 *
 * The database file lives in the app sandbox, so its contents survive an APK
 * update (re-install of a newer build with the SAME applicationId). This is
 * exactly why the stats persist "même après avoir régénéré un APK". Bump the
 * schema with numbered migrations below; never rewrite an old one.
 */

const DB_NAME = 'soiree.db';
export const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA_V1 = `
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎲',
  color TEXT NOT NULL DEFAULT '#7c5cff',
  created_at INTEGER NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  config TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER NOT NULL,
  player_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  game_id TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  player_id TEXT NOT NULL,
  points INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  sips_drunk INTEGER NOT NULL,
  sips_given INTEGER NOT NULL,
  details TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  game_id TEXT NOT NULL,
  type TEXT NOT NULL,
  player_id TEXT,
  at INTEGER NOT NULL,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS question_history (
  question_id TEXT PRIMARY KEY NOT NULL,
  times_used INTEGER NOT NULL,
  last_used_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_results_player ON results(player_id);
CREATE INDEX IF NOT EXISTS idx_results_session ON results(session_id);
CREATE INDEX IF NOT EXISTS idx_results_game ON results(game_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
`;

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(SCHEMA_V1);
    version = 1;
  }
  // Future migrations:
  // if (version < 2) { await db.execAsync(SCHEMA_V2); version = 2; }

  await db.execAsync(`PRAGMA user_version = ${version}`);
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

/** Ensure the DB is open and migrated (call once at startup). */
export async function initDatabase(): Promise<void> {
  await getDb();
}

/** Wipe all gameplay data. Used by the "import backup" and "reset" flows. */
export async function resetDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM events;
    DELETE FROM results;
    DELETE FROM sessions;
    DELETE FROM question_history;
    DELETE FROM players;
    DELETE FROM kv;
  `);
}
