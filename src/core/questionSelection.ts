import type { Difficulty, Question, Theme } from './models';
import { type Rng, shuffle } from './rng';

/**
 * Selecting which questions a round uses. This is the other half of "chaque
 * partie est différente": we keep a per-question usage history and always
 * prefer the least-used questions, so a fresh round avoids the ones you just
 * saw until the eligible pool has been exhausted.
 */

export interface QuestionUsage {
  timesUsed: number;
  lastUsedAt: number;
}

export type QuestionHistory = Record<string, QuestionUsage>;

export interface SelectionFilter {
  themes: Theme[];
  difficulties: Difficulty[];
  count: number;
}

export function selectQuestions(
  pool: readonly Question[],
  filter: SelectionFilter,
  history: QuestionHistory,
  rng: Rng,
): Question[] {
  const themeSet = new Set(filter.themes);
  const diffSet = new Set<Difficulty>(filter.difficulties);

  const eligible = pool.filter((q) => themeSet.has(q.theme) && diffSet.has(q.difficulty));

  // Shuffle first so questions with equal usage come out in random order,
  // then bring the least-used (and least-recently-used) to the front.
  const decorated = shuffle(eligible, rng).map((q) => {
    const usage = history[q.id];
    return { q, times: usage?.timesUsed ?? 0, last: usage?.lastUsedAt ?? 0 };
  });
  decorated.sort((a, b) => a.times - b.times || a.last - b.last);

  const picked = decorated.slice(0, Math.max(0, Math.min(filter.count, decorated.length))).map((d) => d.q);

  // Final shuffle so themes/difficulties are interleaved instead of grouped.
  return shuffle(picked, rng);
}

/** Apply a finished round to the history (returns a NEW history object). */
export function recordUsage(
  history: QuestionHistory,
  questionIds: readonly string[],
  at: number,
): QuestionHistory {
  const next: QuestionHistory = { ...history };
  for (const id of questionIds) {
    const prev = next[id];
    next[id] = { timesUsed: (prev?.timesUsed ?? 0) + 1, lastUsedAt: at };
  }
  return next;
}
