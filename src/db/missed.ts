import { getDb } from './database';

/**
 * Questions ratées, pour le mode solo « Réviser mes erreurs ». On enregistre une
 * question quand elle est manquée en jeu, et on la retire dès qu'elle est
 * réussie (en partie ou en révision) : la liste fond au fur et à mesure qu'on
 * progresse.
 */

/** Marque une question comme ratée (+1 au compteur). Best-effort. */
export async function recordMissedQuestion(questionId: string): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO missed_questions (question_id, times_missed, last_missed_at) VALUES (?, 1, ?)
       ON CONFLICT(question_id) DO UPDATE SET times_missed = times_missed + 1, last_missed_at = excluded.last_missed_at`,
      [questionId, Date.now()],
    );
  } catch {
    // best-effort : ne jamais faire planter le jeu pour une stat de révision
  }
}

/** Retire une question de la liste à réviser (maîtrisée). Best-effort. */
export async function clearMissedQuestion(questionId: string): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync('DELETE FROM missed_questions WHERE question_id = ?', [questionId]);
  } catch {
    // best-effort
  }
}

/** Identifiants des questions à réviser, les plus récemment ratées en tête. */
export async function getMissedQuestionIds(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ question_id: string }>(
    'SELECT question_id FROM missed_questions ORDER BY last_missed_at DESC',
  );
  return rows.map((r) => r.question_id);
}

/** Nombre de questions à réviser. */
export async function getMissedCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM missed_questions');
  return row?.n ?? 0;
}
