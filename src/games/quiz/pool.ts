import { localizeQuestion } from '../../core/questionLocale';
import type { CancelLevel, Question } from '../../core/models';
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
 *
 * Les univers d'apprentissage de langue sont réservés à l'AUTRE langue : « Anglais »
 * (apprendre l'anglais) n'a de sens qu'en français, et « Français » (apprendre le
 * français) qu'en anglais. On masque donc celui de la langue courante, sinon il
 * serait trivial (« Comment dit-on X en français ? » posé en français).
 */
const HIDDEN_UNIVERSE_BY_LANG: Record<string, string> = { fr: 'Français', en: 'Anglais' };

export async function getQuizPool(opts?: { maxCancelLevel?: CancelLevel }): Promise<Question[]> {
  const lang = currentLang();
  const max = opts?.maxCancelLevel ?? 1;
  const custom = await loadCustomQuestionsAsQuestions();
  const merged = custom.length > 0 ? [...QUESTIONS, ...custom] : QUESTIONS;
  const hidden = HIDDEN_UNIVERSE_BY_LANG[lang];
  // Contenu « cancellable » : exclu par défaut (max = 1), pour que tous les
  // contextes grand public (quiz solo, défi du jour, onboarding, sélecteurs…)
  // restent sages sans rien changer. Les modes de soirée passent le plafond voulu.
  const all = merged.filter(
    (q) => (q.cancelLevel ?? 1) <= max && !(hidden && q.universe === hidden),
  );
  return lang === 'en' ? all.map((q) => localizeQuestion(q, lang)) : all;
}
