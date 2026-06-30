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
