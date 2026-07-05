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
  /**
   * Per-player favourite universes (sub-categories, max 3 each) → their
   * questions get a weight bonus: in 'turn' mode only for that player's own
   * slots, in 'fastest' mode for any player's preference.
   */
  preferByPlayer?: Record<string, string[]>;
}

/** How much an avoided universe is down-weighted (0.1 = « 90 % de chance en moins »). */
const AVOID_FACTOR = 0.1;
/** How much a preferred universe is up-weighted (1.9 = « 90 % de chance en plus »). */
const PREFER_FACTOR = 1.9;

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
  const preferActive = Object.values(opts?.preferByPlayer ?? {}).some((a) => a.length > 0);
  if (avoidanceActive || preferActive) {
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
 * Weighted, per-slot selection used when at least one player avoids or prefers
 * a universe. A question's weight combines anti-repeat (0.5^timesUsed)
 * with the avoidance penalty (×0.5) and the preference bonus (×1.5). Both are
 * applied for the slot's player in 'turn' mode, or for any player in 'fastest'
 * mode. Questions are picked one slot at a time (no final reshuffle) so that
 * question i is meant for player order[i%N].
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
  const preferSets: Record<string, Set<string>> = {};
  const anyPreferred = new Set<string>();
  for (const [pid, arr] of Object.entries(opts.preferByPlayer ?? {})) {
    preferSets[pid] = new Set(arr);
    for (const t of arr) anyPreferred.add(t);
  }

  const remaining = shuffle(eligible, rng);
  const n = order.length;
  const total = Math.max(0, Math.min(count, remaining.length));
  const result: Question[] = [];

  for (let slot = 0; slot < total; slot++) {
    const slotPlayer = turnMode === 'turn' && n > 0 ? (order[slot % n] ?? '') : '';
    const avoidSet = slotPlayer ? avoidSets[slotPlayer] : undefined;
    const preferSet = slotPlayer ? preferSets[slotPlayer] : undefined;
    const weights = remaining.map((q) => {
      let w = Math.pow(0.5, history[q.id]?.timesUsed ?? 0);
      if (q.universe) {
        const avoided = turnMode === 'turn' ? (avoidSet?.has(q.universe) ?? false) : anyAvoided.has(q.universe);
        if (avoided) w *= AVOID_FACTOR;
        const preferred = turnMode === 'turn' ? (preferSet?.has(q.universe) ?? false) : anyPreferred.has(q.universe);
        if (preferred) w *= PREFER_FACTOR;
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
