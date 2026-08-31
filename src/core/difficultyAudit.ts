import type { StatAnswer } from './stats';

/**
 * Audit de calibrage — mesure, à partir des réponses réellement jouées
 * (`StatAnswer`), le taux de réussite empirique par difficulté et par thème.
 * Logique pure et testable ; l'écran de stats l'affiche.
 *
 * Les réponses ne mémorisent pas l'ID de question (impossible d'auditer question
 * par question), mais l'agrégat par difficulté/thème suffit à repérer un mauvais
 * calibrage global (ex. une difficulté « facile » moins réussie qu'une « moyenne »).
 */

export interface RateStat {
  key: string;
  total: number;
  correct: number;
  rate: number; // 0..1
}

function rate(total: number, correct: number): number {
  return total > 0 ? correct / total : 0;
}

/** Taux de réussite par difficulté (1..4), uniquement celles ayant des données. */
export function successByDifficulty(answers: readonly StatAnswer[]): RateStat[] {
  const acc = new Map<number, { total: number; correct: number }>();
  for (const a of answers) {
    const e = acc.get(a.difficulty) ?? { total: 0, correct: 0 };
    e.total += 1;
    if (a.correct) e.correct += 1;
    acc.set(a.difficulty, e);
  }
  return [...acc.entries()]
    .sort(([d1], [d2]) => d1 - d2)
    .map(([d, e]) => ({ key: String(d), total: e.total, correct: e.correct, rate: rate(e.total, e.correct) }));
}

/**
 * Taux de réussite par thème, du plus DUR au plus facile. `minSamples` filtre les
 * thèmes trop peu joués pour être fiables.
 */
export function successByTheme(answers: readonly StatAnswer[], minSamples = 10): RateStat[] {
  const acc = new Map<string, { total: number; correct: number }>();
  for (const a of answers) {
    const e = acc.get(a.theme) ?? { total: 0, correct: 0 };
    e.total += 1;
    if (a.correct) e.correct += 1;
    acc.set(a.theme, e);
  }
  return [...acc.entries()]
    .map(([theme, e]) => ({ key: theme, total: e.total, correct: e.correct, rate: rate(e.total, e.correct) }))
    .filter((s) => s.total >= minSamples)
    .sort((a, b) => a.rate - b.rate);
}

/**
 * Anomalies de calibrage : on attend que le taux de réussite DÉCROISSE avec la
 * difficulté. Toute inversion (une difficulté plus dure mieux réussie qu'une plus
 * facile) est signalée. On n'examine que les difficultés ayant assez d'échantillons.
 */
export function calibrationIssues(answers: readonly StatAnswer[], minSamples = 20): string[] {
  const stats = successByDifficulty(answers).filter((s) => s.total >= minSamples);
  const issues: string[] = [];
  for (let i = 1; i < stats.length; i++) {
    const prev = stats[i - 1]!;
    const cur = stats[i]!;
    if (cur.rate > prev.rate + 0.02) {
      issues.push(
        `Difficulté ${cur.key} (${Math.round(cur.rate * 100)}%) plus réussie que ${prev.key} (${Math.round(prev.rate * 100)}%)`,
      );
    }
  }
  return issues;
}
