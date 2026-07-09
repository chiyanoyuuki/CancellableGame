import type { QuestionHistory } from '../core/questionSelection';
import { getDb } from './database';

/** Load the per-question usage history used by the anti-repeat selection. */
export async function getQuestionHistory(): Promise<QuestionHistory> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ question_id: string; times_used: number; last_used_at: number }>(
    'SELECT question_id, times_used, last_used_at FROM question_history',
  );
  const history: QuestionHistory = {};
  for (const r of rows) {
    history[r.question_id] = { timesUsed: r.times_used, lastUsedAt: r.last_used_at };
  }
  return history;
}

/**
 * Load the question history split PER PLAYER, reconstructed from the recorded
 * « answer » events (each carries the player who was asked the question). This
 * lets every player get their own fresh questions: someone who never saw a
 * question still receives it, even if another player on this device already did.
 */
export async function getQuestionHistoryByPlayer(): Promise<Record<string, QuestionHistory>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ player_id: string | null; payload: string; at: number }>(
    "SELECT player_id, payload, at FROM events WHERE type = 'answer'",
  );
  const byPlayer: Record<string, QuestionHistory> = {};
  for (const r of rows) {
    const pid = r.player_id;
    if (!pid) continue;
    let qid: unknown;
    try {
      qid = (JSON.parse(r.payload) as { questionId?: unknown }).questionId;
    } catch {
      continue;
    }
    if (typeof qid !== 'string') continue;
    let h = byPlayer[pid];
    if (!h) {
      h = {};
      byPlayer[pid] = h;
    }
    const prev = h[qid];
    h[qid] = { timesUsed: (prev?.timesUsed ?? 0) + 1, lastUsedAt: Math.max(prev?.lastUsedAt ?? 0, r.at) };
  }
  return byPlayer;
}
