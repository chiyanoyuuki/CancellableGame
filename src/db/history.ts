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
 * Taux de réussite par joueur (bonnes / total), à partir des événements « answer ».
 * Sert à la difficulté adaptative : calibrer les questions sur le niveau de chacun.
 */
export async function getAccuracyByPlayer(): Promise<Record<string, { correct: number; total: number }>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ payload: string }>("SELECT payload FROM events WHERE type = 'answer'");
  const out: Record<string, { correct: number; total: number }> = {};
  for (const r of rows) {
    let pid: unknown;
    let correct: unknown;
    try {
      const p = JSON.parse(r.payload) as { playerId?: unknown; correct?: unknown };
      pid = p.playerId;
      correct = p.correct;
    } catch {
      continue;
    }
    if (typeof pid !== 'string') continue;
    const acc = out[pid] ?? (out[pid] = { correct: 0, total: 0 });
    acc.total += 1;
    if (correct === true) acc.correct += 1;
  }
  return out;
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

  // Fusionne les questions « déjà vues » importées avec un profil transféré.
  const seenRows = await db.getAllAsync<{ player_id: string; question_id: string; last_used_at: number }>(
    'SELECT player_id, question_id, last_used_at FROM player_seen_questions',
  );
  for (const r of seenRows) {
    let h = byPlayer[r.player_id];
    if (!h) {
      h = {};
      byPlayer[r.player_id] = h;
    }
    const prev = h[r.question_id];
    h[r.question_id] = {
      timesUsed: (prev?.timesUsed ?? 0) + 1,
      lastUsedAt: Math.max(prev?.lastUsedAt ?? 0, r.last_used_at),
    };
  }

  return byPlayer;
}

/**
 * Enregistre des questions « déjà vues » pour un joueur (import d'un profil
 * transféré). Table dédiée pour ne pas fausser les statistiques.
 */
export async function addSeenQuestionsForPlayer(
  playerId: string,
  seen: readonly { id: string; at: number }[],
): Promise<void> {
  if (seen.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const s of seen) {
      await db.runAsync(
        `INSERT INTO player_seen_questions (player_id, question_id, last_used_at) VALUES (?, ?, ?)
         ON CONFLICT(player_id, question_id) DO UPDATE SET last_used_at = MAX(last_used_at, excluded.last_used_at)`,
        [playerId, s.id, s.at],
      );
    }
  });
}
