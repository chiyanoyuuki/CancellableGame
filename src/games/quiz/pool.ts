import type { Question } from '../../core/models';
import { loadCustomQuestionsAsQuestions } from '../../db';
import { QUESTIONS } from './questions';

/**
 * Le pool de questions du quiz = banque intégrée + questions ajoutées par
 * l'utilisateur. Config et jeu utilisent tous deux cette même source.
 */
export async function getQuizPool(): Promise<Question[]> {
  const custom = await loadCustomQuestionsAsQuestions();
  return custom.length > 0 ? [...QUESTIONS, ...custom] : QUESTIONS;
}
