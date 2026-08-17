import { localizeQuestion } from '../../core/questionLocale';
import type { Question } from '../../core/models';
import { loadCustomQuestionsAsQuestions } from '../../db';
import { currentLang } from '../../lib/i18n';
import { QUESTIONS } from './questions';

/**
 * Le pool de questions du quiz = banque intégrée + questions ajoutées par
 * l'utilisateur. Config et jeu utilisent tous deux cette même source.
 *
 * Le pool est résolu dans la langue active : en anglais, chaque question
 * bascule sur ses champs `*_en` quand ils existent (repli français sinon).
 * Tout l'aval (sélection, moteur, affichage, comparaison de réponse) reçoit
 * donc directement les bons textes, sans autre changement.
 */
export async function getQuizPool(): Promise<Question[]> {
  const lang = currentLang();
  const custom = await loadCustomQuestionsAsQuestions();
  const all = custom.length > 0 ? [...QUESTIONS, ...custom] : QUESTIONS;
  return lang === 'en' ? all.map((q) => localizeQuestion(q, lang)) : all;
}
