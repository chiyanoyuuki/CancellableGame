import type { StatAnswer, StatResult, StatSession } from '../core/stats';
import { getDb } from './database';

/**
 * Load raw rows in the exact shapes the (pure, tested) stats functions expect.
 * All the crunching happens in src/core/stats.ts; this file only fetches.
 */

export async function loadStatSessions(): Promise<StatSession[]> {
  const db = await getDb();
  return db.getAllAsync<StatSession>(
    `SELECT id, game_id AS gameId, mode, started_at AS startedAt, ended_at AS endedAt, player_count AS playerCount
     FROM sessions`,
  );
}

export async function loadStatResults(): Promise<StatResult[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<StatResult & { details?: string }>(
    `SELECT session_id AS sessionId, game_id AS gameId, started_at AS startedAt, player_id AS playerId,
            points, rank, sips_drunk AS sipsDrunk, sips_given AS sipsGiven, details
     FROM results`,
  );
  return rows.map((r) => {
    let details: Record<string, unknown> | undefined;
    if (typeof r.details === 'string') {
      try {
        details = JSON.parse(r.details) as Record<string, unknown>;
      } catch {
        details = undefined;
      }
    }
    return { ...r, details };
  });
}

export async function loadStatAnswers(): Promise<StatAnswer[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ payload: string; gameId: string; startedAt: number }>(
    `SELECT e.payload AS payload, e.game_id AS gameId, s.started_at AS startedAt
     FROM events e
     JOIN sessions s ON e.session_id = s.id
     WHERE e.type = 'answer'`,
  );

  const out: StatAnswer[] = [];
  for (const r of rows) {
    try {
      const p = JSON.parse(r.payload) as {
        playerId: string;
        theme: string;
        difficulty: number;
        correct: boolean;
        hintsUsed?: number;
        timeMs?: number | null;
        points?: number;
      };
      out.push({
        gameId: r.gameId,
        startedAt: r.startedAt,
        playerId: p.playerId,
        theme: p.theme,
        difficulty: p.difficulty,
        correct: !!p.correct,
        hintsUsed: p.hintsUsed ?? 0,
        timeMs: p.timeMs ?? null,
        points: p.points ?? 0,
      });
    } catch {
      // Skip malformed payloads rather than crashing the stats screen.
    }
  }
  return out;
}
