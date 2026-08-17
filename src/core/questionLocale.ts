import type { Lang } from '../lib/i18n';
import type { Question } from './models';

/**
 * Renvoie une question dans la langue active.
 *
 * En anglais, chaque champ retombe sur le français tant qu'il n'a pas de
 * traduction — même philosophie que l'interface : jamais de blanc, la
 * couverture se complète par lots. Le français reste la source canonique
 * (sélection anti-répétition, historique et identifiants restent inchangés,
 * puisqu'ils s'appuient sur l'`id`, indépendant de la langue).
 *
 * Le nom de l'univers n'est PAS traduit : il sert d'identifiant de catégorie.
 */
export function localizeQuestion(q: Question, lang: Lang): Question {
  if (lang !== 'en') return q;
  // Rien à traduire : on renvoie l'objet tel quel (pas de copie inutile).
  if (
    q.text_en === undefined &&
    q.answer_en === undefined &&
    q.distractors_en === undefined &&
    q.acceptable_en === undefined &&
    q.hints_en === undefined &&
    q.explanation_en === undefined
  ) {
    return q;
  }
  return {
    ...q,
    text: q.text_en ?? q.text,
    answer: q.answer_en ?? q.answer,
    distractors: q.distractors_en ?? q.distractors,
    acceptable: q.acceptable_en ?? q.acceptable,
    hints: q.hints_en ?? q.hints,
    explanation: q.explanation_en ?? q.explanation,
  };
}
