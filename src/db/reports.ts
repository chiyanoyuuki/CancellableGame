import { getDb } from './database';

/**
 * Questions signalées en jeu (« Signaler une question »). Sert d'outil de QA :
 * l'hôte peut relire les signalements et corriger la banque. Purement local.
 */

export interface ReportedQuestion {
  id: number;
  questionId: string;
  questionText: string;
  answer: string;
  universe: string | null;
  reason: string | null;
  at: number;
}

/** Enregistre un signalement (instantané du texte au cas où la banque évolue). */
export async function reportQuestion(
  q: { id: string; text: string; answer: string; universe?: string },
  reason: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO reported_questions (question_id, question_text, answer, universe, reason, at) VALUES (?, ?, ?, ?, ?, ?)',
    [q.id, q.text, q.answer, q.universe ?? null, reason || null, Date.now()],
  );
}

/** Signalements, du plus récent au plus ancien. */
export async function listReportedQuestions(): Promise<ReportedQuestion[]> {
  const db = await getDb();
  return db.getAllAsync<ReportedQuestion>(
    `SELECT id, question_id AS questionId, question_text AS questionText, answer, universe, reason, at
     FROM reported_questions ORDER BY at DESC`,
  );
}

export interface GroupedReport {
  questionId: string;
  questionText: string;
  answer: string;
  universe: string | null;
  count: number;
  lastAt: number;
  reasons: string;
}

/**
 * Signalements regroupés par question, les plus signalés d'abord : les vrais
 * problèmes (plusieurs joueurs, même question) remontent en tête pour la QA.
 */
export async function listReportedGrouped(): Promise<GroupedReport[]> {
  const db = await getDb();
  return db.getAllAsync<GroupedReport>(
    `SELECT question_id AS questionId,
            question_text AS questionText,
            answer,
            universe,
            COUNT(*) AS count,
            MAX(at) AS lastAt,
            GROUP_CONCAT(DISTINCT COALESCE(reason, 'autre')) AS reasons
     FROM reported_questions
     GROUP BY question_id
     ORDER BY count DESC, lastAt DESC`,
  );
}

/** Supprime tous les signalements d'une question donnée. */
export async function deleteReportsForQuestion(questionId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM reported_questions WHERE question_id = ?', [questionId]);
}

export async function getReportedCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM reported_questions');
  return row?.c ?? 0;
}

export async function deleteReportedQuestion(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM reported_questions WHERE id = ?', [id]);
}

export async function clearReportedQuestions(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM reported_questions');
}
