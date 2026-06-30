import type { SessionResult } from '../core/models';
import { getDb } from './database';

/**
 * Persist a finished game. EVERY mini-game funnels through here, which is what
 * makes the stats cross-game and time-aware. The question-usage history is also
 * updated from any "answer" events so future rounds avoid repeats.
 */
export async function saveSessionResult(result: SessionResult): Promise<number> {
  const db = await getDb();
  let sessionId = 0;

  await db.withTransactionAsync(async () => {
    const inserted = await db.runAsync(
      'INSERT INTO sessions (game_id, mode, config, started_at, ended_at, player_count) VALUES (?, ?, ?, ?, ?, ?)',
      [
        result.gameId,
        result.mode,
        JSON.stringify(result.config),
        result.startedAt,
        result.endedAt,
        result.players.length,
      ],
    );
    sessionId = inserted.lastInsertRowId;

    for (const p of result.players) {
      await db.runAsync(
        'INSERT INTO results (session_id, game_id, started_at, player_id, points, rank, sips_drunk, sips_given, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          sessionId,
          result.gameId,
          result.startedAt,
          p.playerId,
          p.points,
          p.rank,
          p.sipsDrunk,
          p.sipsGiven,
          p.details ? JSON.stringify(p.details) : null,
        ],
      );
    }

    const usedQuestionIds = new Set<string>();
    for (const e of result.events ?? []) {
      await db.runAsync(
        'INSERT INTO events (session_id, game_id, type, player_id, at, payload) VALUES (?, ?, ?, ?, ?, ?)',
        [sessionId, result.gameId, e.type, e.playerId, e.at, JSON.stringify(e.payload)],
      );
      const qid = (e.payload as { questionId?: unknown }).questionId;
      if (typeof qid === 'string') usedQuestionIds.add(qid);
    }

    for (const qid of usedQuestionIds) {
      await db.runAsync(
        `INSERT INTO question_history (question_id, times_used, last_used_at)
         VALUES (?, 1, ?)
         ON CONFLICT(question_id) DO UPDATE SET
           times_used = times_used + 1,
           last_used_at = excluded.last_used_at`,
        [qid, result.endedAt],
      );
    }
  });

  return sessionId;
}

export async function getSessionCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sessions');
  return row?.c ?? 0;
}
