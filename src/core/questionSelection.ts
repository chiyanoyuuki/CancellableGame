import type { Difficulty, Question, Theme, TurnMode } from './models';
import { type Rng, shuffle } from './rng';

/**
 * Selecting which questions a round uses. Three goals, in priority order:
 *  1. Nouvelles questions d'abord : on épuise les questions jamais vues (puis les
 *     moins vues) avant de réutiliser une question déjà posée.
 *  2. Un maximum d'univers différents : au sein des questions d'un même joueur,
 *     on évite de reprendre deux fois le même univers tant qu'il en reste
 *     d'autres — personne ne se retrouve noyé sous un univers qu'il ne connaît
 *     pas.
 *  3. Univers préférés / à éviter : les préférés d'un joueur sont sur-pondérés,
 *     les évités fortement sous-pondérés, sur les questions de CE joueur (mode
 *     « chacun son tour ») ou de n'importe qui (mode « au plus rapide »).
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
  /** Per-player universes to avoid → their questions get a heavy penalty. */
  avoidByPlayer?: Record<string, string[]>;
  turnMode?: TurnMode;
  /**
   * Per-player favourite universes (sub-categories) → their questions get a
   * bonus: in 'turn' mode only for that player's own slots, in 'fastest' mode
   * for any player's preference.
   */
  preferByPlayer?: Record<string, string[]>;
  /**
   * Per-player question history (each player's OWN seen questions). When
   * provided, 'turn' mode gives every player their own lot: their slots
   * prioritise questions THAT player hasn't seen yet — independently of what
   * other players on the device already saw. A player absent from the map is
   * treated as brand new (everything is fresh for them). The top-level
   * `history` argument is then only used in 'fastest' mode.
   */
  historyByPlayer?: Record<string, QuestionHistory>;
}

/** Reused for players with no personal history yet (everything is fresh). */
const EMPTY_HISTORY: QuestionHistory = {};

/** How much an avoided universe is down-weighted (0.1 = « 90 % de chance en moins »). */
const AVOID_FACTOR = 0.1;
/** How much a preferred universe is up-weighted (1.9 = « 90 % de chance en plus »). */
const PREFER_FACTOR = 1.9;
/**
 * Chaque question supplémentaire tirée d'un univers déjà servi (au même joueur
 * en mode « tour », ou globalement sinon) est ré-pondérée par ce facteur. Assez
 * bas pour qu'avec un vrai pool (des dizaines d'univers) chaque joueur tombe sur
 * autant d'univers distincts que possible, mais pas nul : si un univers est le
 * seul disponible, ses questions restent tirables.
 */
const UNIVERSE_REPEAT_DECAY = 0.15;

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

/** Clé de diversité : l'univers, ou à défaut le thème (pour les questions sans univers). */
function diversityKey(q: Question): string {
  return q.universe ?? `#${q.theme}`;
}

export function selectQuestions(
  pool: readonly Question[],
  filter: SelectionFilter,
  history: QuestionHistory,
  rng: Rng,
  opts?: SelectionOptions,
): Question[] {
  const eligible = eligiblePool(pool, filter);
  const order = opts?.order ?? [];
  const turnMode: TurnMode = opts?.turnMode ?? 'turn';
  const n = order.length;

  const avoidSets: Record<string, Set<string>> = {};
  const anyAvoided = new Set<string>();
  for (const [pid, arr] of Object.entries(opts?.avoidByPlayer ?? {})) {
    avoidSets[pid] = new Set(arr);
    for (const u of arr) anyAvoided.add(u);
  }
  const preferSets: Record<string, Set<string>> = {};
  const anyPreferred = new Set<string>();
  for (const [pid, arr] of Object.entries(opts?.preferByPlayer ?? {})) {
    preferSets[pid] = new Set(arr);
    for (const u of arr) anyPreferred.add(u);
  }

  // Pre-shuffle so that, among questions of equal weight, the pick is random.
  const remaining = shuffle(eligible, rng);
  const total = Math.max(0, Math.min(filter.count, remaining.length));
  const result: Question[] = [];

  // How many times each universe has already been served — globally, and per
  // player. We decay a universe's weight by how often it has already come up for
  // whoever is about to receive the question, which spreads a round across as
  // many distinct universes as possible.
  const globalUniv = new Map<string, number>();
  const perPlayerUniv = new Map<string, Map<string, number>>();
  const seenCount = (playerId: string, key: string): number => {
    if (turnMode === 'turn' && playerId) return perPlayerUniv.get(playerId)?.get(key) ?? 0;
    return globalUniv.get(key) ?? 0;
  };

  for (let slot = 0; slot < total; slot++) {
    const slotPlayer = turnMode === 'turn' && n > 0 ? (order[slot % n] ?? '') : '';
    const avoidSet = slotPlayer ? avoidSets[slotPlayer] : undefined;
    const preferSet = slotPlayer ? preferSets[slotPlayer] : undefined;
    // Each player's own history drives « nouvelles questions d'abord » for their
    // own slots; fall back to the shared history when none is provided.
    const slotHistory =
      turnMode === 'turn' && slotPlayer && opts?.historyByPlayer
        ? (opts.historyByPlayer[slotPlayer] ?? EMPTY_HISTORY)
        : history;

    // Nouvelles questions d'abord : on restreint le tirage au palier d'usage le
    // plus bas encore disponible (jamais vues, puis vues une fois, etc.).
    let minUsage = Infinity;
    for (const q of remaining) {
      const u = slotHistory[q.id]?.timesUsed ?? 0;
      if (u < minUsage) minUsage = u;
    }

    let bestSum = 0;
    const weighted: { q: Question; w: number; idx: number }[] = [];
    remaining.forEach((q, idx) => {
      if ((slotHistory[q.id]?.timesUsed ?? 0) !== minUsage) return;
      let w = 1;
      const key = diversityKey(q);
      w *= Math.pow(UNIVERSE_REPEAT_DECAY, seenCount(slotPlayer, key));
      if (q.universe) {
        const avoided = turnMode === 'turn' ? (avoidSet?.has(q.universe) ?? false) : anyAvoided.has(q.universe);
        if (avoided) w *= AVOID_FACTOR;
        const preferred = turnMode === 'turn' ? (preferSet?.has(q.universe) ?? false) : anyPreferred.has(q.universe);
        if (preferred) w *= PREFER_FACTOR;
      }
      bestSum += w;
      weighted.push({ q, w, idx });
    });

    // Weighted draw within the current usage tier.
    let r = rng() * bestSum;
    let chosen = weighted[weighted.length - 1] as { q: Question; w: number; idx: number };
    for (const cand of weighted) {
      r -= cand.w;
      if (r <= 0) {
        chosen = cand;
        break;
      }
    }

    result.push(chosen.q);
    remaining.splice(chosen.idx, 1);

    const key = diversityKey(chosen.q);
    globalUniv.set(key, (globalUniv.get(key) ?? 0) + 1);
    if (turnMode === 'turn' && slotPlayer) {
      let m = perPlayerUniv.get(slotPlayer);
      if (!m) {
        m = new Map<string, number>();
        perPlayerUniv.set(slotPlayer, m);
      }
      m.set(key, (m.get(key) ?? 0) + 1);
    }
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
