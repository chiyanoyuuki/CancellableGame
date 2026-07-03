import type { Difficulty, Question, Theme, TurnMode } from './models';
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
  /** Universes (sub-categories) to exclude; questions without a universe are unaffected. */
  excludedUniverses?: string[];
}

export interface SelectionOptions {
  /** Turn order (player ids). In 'turn' mode, question i is for order[i % N]. */
  order?: string[];
  /** Per-player universes to avoid → questions of those universes get half weight. */
  avoidByPlayer?: Record<string, string[]>;
  turnMode?: TurnMode;
}

/** How much an avoided universe is down-weighted (0.5 = « 50 % de chance en moins »). */
const AVOID_FACTOR = 0.5;

function eligiblePool(pool: readonly Question[], filter: SelectionFilter): Question[] {
  const themeSet = new Set(filter.themes);
  const diffSet = new Set<Difficulty>(filter.difficulties);
  const excluded = new Set(filter.excludedUniverses ?? []);
  return pool.filter(
    (q) =>
      themeSet.has(q.theme) &&
      diffSet.has(q.difficulty) &&
      !(q.universe !== undefined && excluded.has(q.universe)),
  );
}

export function selectQuestions(
  pool: readonly Question[],
  filter: SelectionFilter,
  history: QuestionHistory,
  rng: Rng,
  opts?: SelectionOptions,
): Question[] {
  const eligible = eligiblePool(pool, filter);

  const avoidByPlayer = opts?.avoidByPlayer ?? {};
  const avoidanceActive = Object.values(avoidByPlayer).some((a) => a.length > 0);
  if (avoidanceActive) {
    return weightedSelect(eligible, filter.count, history, rng, opts as SelectionOptions);
  }

  // Default path: shuffle first so equal-usage questions come out random, then
  // bring the least-used (and least-recently-used) to the front.
  const decorated = shuffle(eligible, rng).map((q) => {
    const usage = history[q.id];
    return { q, times: usage?.timesUsed ?? 0, last: usage?.lastUsedAt ?? 0 };
  });
  decorated.sort((a, b) => a.times - b.times || a.last - b.last);

  const picked = decorated.slice(0, Math.max(0, Math.min(filter.count, decorated.length))).map((d) => d.q);

  // Final shuffle so themes/difficulties are interleaved instead of grouped.
  return shuffle(picked, rng);
}

/**
 * Weighted, per-slot selection used when at least one player avoids a universe.
 * A question's weight combines anti-repeat (0.5^timesUsed) with the avoidance
 * penalty (×0.5 when its universe is avoided by the slot's player in 'turn'
 * mode, or by any player in 'fastest' mode). Questions are picked one slot at a
 * time (no final reshuffle) so that question i is meant for player order[i%N].
 */
function weightedSelect(
  eligible: Question[],
  count: number,
  history: QuestionHistory,
  rng: Rng,
  opts: SelectionOptions,
): Question[] {
  const order = opts.order ?? [];
  const turnMode = opts.turnMode ?? 'turn';
  const avoidSets: Record<string, Set<string>> = {};
  const anyAvoided = new Set<string>();
  for (const [pid, arr] of Object.entries(opts.avoidByPlayer ?? {})) {
    avoidSets[pid] = new Set(arr);
    for (const u of arr) anyAvoided.add(u);
  }

  const remaining = shuffle(eligible, rng);
  const n = order.length;
  const total = Math.max(0, Math.min(count, remaining.length));
  const result: Question[] = [];

  for (let slot = 0; slot < total; slot++) {
    const avoidSet = turnMode === 'turn' && n > 0 ? avoidSets[order[slot % n] ?? ''] : undefined;
    const weights = remaining.map((q) => {
      let w = Math.pow(0.5, history[q.id]?.timesUsed ?? 0);
      if (q.universe) {
        const avoided = turnMode === 'turn' ? (avoidSet?.has(q.universe) ?? false) : anyAvoided.has(q.universe);
        if (avoided) w *= AVOID_FACTOR;
      }
      return w;
    });
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = rng() * sum;
    let idx = 0;
    while (idx < weights.length - 1 && (r -= weights[idx] as number) > 0) idx++;
    result.push(remaining[idx] as Question);
    remaining.splice(idx, 1);
  }
  return result;
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
