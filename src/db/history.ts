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
 * Load the question history split PER PLAYER. Une question est comptée comme
 * « vue » par un joueur dès qu'il a PARTICIPÉ à une partie qui la contenait —
 * même si c'est quelqu'un d'autre qui y a répondu. On croise donc les parties
 * jouées par chaque joueur (`results`) avec les questions posées dans chaque
 * partie (événements « answer »).
 */
export async function getQuestionHistoryByPlayer(): Promise<Record<string, QuestionHistory>> {
  const db = await getDb();
  // Questions posées par session (via les événements « answer »), avec l'instant le plus récent.
  const eventRows = await db.getAllAsync<{ session_id: number; payload: string; at: number }>(
    "SELECT session_id, payload, at FROM events WHERE type = 'answer'",
  );
  const sessionQuestions = new Map<number, Map<string, number>>();
  for (const r of eventRows) {
    let qid: unknown;
    try {
      qid = (JSON.parse(r.payload) as { questionId?: unknown }).questionId;
    } catch {
      continue;
    }
    if (typeof qid !== 'string') continue;
    let m = sessionQuestions.get(r.session_id);
    if (!m) {
      m = new Map<string, number>();
      sessionQuestions.set(r.session_id, m);
    }
    m.set(qid, Math.max(m.get(qid) ?? 0, r.at));
  }
  // Participants de chaque session.
  const resultRows = await db.getAllAsync<{ session_id: number; player_id: string }>(
    'SELECT session_id, player_id FROM results',
  );
  const byPlayer: Record<string, QuestionHistory> = {};
  for (const r of resultRows) {
    const questions = sessionQuestions.get(r.session_id);
    if (!questions) continue;
    let h = byPlayer[r.player_id];
    if (!h) {
      h = {};
      byPlayer[r.player_id] = h;
    }
    for (const [qid, at] of questions) {
      const prev = h[qid];
      h[qid] = { timesUsed: (prev?.timesUsed ?? 0) + 1, lastUsedAt: Math.max(prev?.lastUsedAt ?? 0, at) };
    }
  }
  return byPlayer;
}
