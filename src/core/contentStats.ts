/**
 * Statistiques de contenu : combien de questions, d'univers, et où en est la
 * traduction anglaise. Fonctions pures (aucune dépendance React/Expo) : elles
 * reçoivent la banque de questions et la crunchent, l'UI se contente d'afficher.
 *
 * Une question est considérée « traduite » dès qu'elle possède un texte anglais
 * (`text_en`) — c'est le marqueur qu'utilise aussi localizeQuestion().
 */

import type { Difficulty, Question, Theme } from './models';
import { THEMES } from './models';

/** Une question est traduite dès qu'elle a un énoncé anglais. */
export function isTranslated(q: Question): boolean {
  return q.text_en !== undefined;
}

export interface ThemeCoverage {
  theme: Theme;
  total: number;
  translated: number;
  /** Nombre d'univers (sous-catégories) distincts du thème. */
  universes: number;
}

export interface ContentStats {
  totalQuestions: number;
  translatedQuestions: number;
  /** Part traduite, de 0 à 1. */
  translatedRatio: number;
  /** Nombre d'univers distincts, tous thèmes confondus. */
  totalUniverses: number;
  /** Nombre de thèmes réellement présents dans la banque. */
  themesPresent: number;
  /** Couverture par thème, dans l'ordre canonique de THEMES. */
  byTheme: ThemeCoverage[];
  /** Nombre de questions par difficulté (1 à 4). */
  byDifficulty: Record<Difficulty, number>;
}

export function contentStats(questions: readonly Question[]): ContentStats {
  const perTheme = new Map<Theme, { total: number; translated: number; universes: Set<string> }>();
  const byDifficulty: Record<Difficulty, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const allUniverses = new Set<string>();
  let translatedQuestions = 0;

  for (const q of questions) {
    let agg = perTheme.get(q.theme);
    if (!agg) {
      agg = { total: 0, translated: 0, universes: new Set() };
      perTheme.set(q.theme, agg);
    }
    agg.total += 1;
    if (q.universe) {
      agg.universes.add(q.universe);
      allUniverses.add(`${q.theme}/${q.universe}`);
    }
    if (isTranslated(q)) {
      agg.translated += 1;
      translatedQuestions += 1;
    }
    byDifficulty[q.difficulty] += 1;
  }

  const byTheme: ThemeCoverage[] = [];
  for (const theme of THEMES) {
    const agg = perTheme.get(theme);
    if (!agg) continue;
    byTheme.push({ theme, total: agg.total, translated: agg.translated, universes: agg.universes.size });
  }

  const totalQuestions = questions.length;
  return {
    totalQuestions,
    translatedQuestions,
    translatedRatio: totalQuestions > 0 ? translatedQuestions / totalQuestions : 0,
    totalUniverses: allUniverses.size,
    themesPresent: byTheme.length,
    byTheme,
    byDifficulty,
  };
}
