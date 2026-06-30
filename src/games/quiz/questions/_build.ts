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
    return q;
  });
}
