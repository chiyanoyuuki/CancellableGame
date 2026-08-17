import type { Difficulty, Question, QuestionMedia, Theme } from '../../../core/models';

/**
 * Petit outil pour écrire les questions de façon compacte et sûre.
 *
 * On fixe le thème et l'univers UNE fois, puis on liste des items courts :
 *   d = difficulté (1 facile, 2 moyen, 3 dur, 4 pro)
 *   t = texte de la question
 *   a = bonne réponse
 *   x = mauvaises propositions (au moins 3, pour le QCM)
 *   acc = autres orthographes acceptées (mode réponse libre)
 *   h = indices (réduisent les points)
 *   m = média (image / emoji / audio)
 *
 * Convention de remplissage d'un univers : 5 faciles, 10 moyennes, 15 dures,
 * 20 pro (= 50 questions).
 */
export interface QItem {
  id: string;
  d: Difficulty;
  t: string;
  a: string;
  x: string[];
  acc?: string[];
  h?: string[];
  m?: QuestionMedia;
  /** e = explication courte de la reponse (affichee a la revelation). */
  e?: string;
  // --- Traductions anglaises (facultatives) : mêmes champs, suffixe _en ------
  t_en?: string;
  a_en?: string;
  x_en?: string[];
  acc_en?: string[];
  h_en?: string[];
  e_en?: string;
}

export function universe(theme: Theme, universeName: string, items: QItem[]): Question[] {
  return items.map((i) => {
    const q: Question = {
      id: i.id,
      theme,
      universe: universeName,
      difficulty: i.d,
      text: i.t,
      answer: i.a,
      distractors: i.x,
    };
    if (i.acc) q.acceptable = i.acc;
    if (i.h) q.hints = i.h;
    if (i.m) q.media = i.m;
    if (i.e) q.explanation = i.e;
    if (i.t_en) q.text_en = i.t_en;
    if (i.a_en) q.answer_en = i.a_en;
    if (i.x_en) q.distractors_en = i.x_en;
    if (i.acc_en) q.acceptable_en = i.acc_en;
    if (i.h_en) q.hints_en = i.h_en;
    if (i.e_en) q.explanation_en = i.e_en;
    return q;
  });
}
