import type { Difficulty, Question, Theme, TurnMode } from './models';
import { type Rng, shuffle } from './rng';

/**
 * Selecting which questions a round uses. Priorités, dans l'ordre :
 *  1. Nouvelles questions d'abord : on épuise les questions jamais vues (puis les
 *     moins vues) avant de réutiliser une question déjà posée.
 *  2. Un maximum d'univers différents : au sein des questions d'un même joueur,
 *     on évite de reprendre deux fois le même univers tant qu'il en reste
 *     d'autres.
 *  3. Univers non souhaités : chaque joueur peut marquer des univers non
 *     souhaités. Une question qui lui est attribuée n'a alors qu'environ 2 % de
 *     chance d'appartenir à l'un d'eux (un univers au hasard parmi eux) ; sinon
 *     on tire dans les univers souhaités.
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
  turnMode?: TurnMode;
  /**
   * Per-player UNWANTED universes. Leurs questions ne sont quasiment jamais
   * tirées : chaque question attribuée à un joueur n'a qu'environ 2 % de chance
   * d'appartenir à l'un de ses univers non souhaités. En mode « tour », on
   * utilise la liste du joueur du slot ; en mode « au plus rapide » (question
   * partagée), l'union des listes de tous.
   */
  unwantedUniversesByPlayer?: Record<string, string[]>;
  /**
   * Per-player question history (each player's OWN seen questions). When
   * provided, 'turn' mode gives every player their own lot: their slots
   * prioritise questions THAT player hasn't seen yet. A player absent from the
   * map is treated as brand new. The top-level `history` argument is then only
   * used in 'fastest' mode.
   */
  historyByPlayer?: Record<string, QuestionHistory>;
}

/** Reused for players with no personal history yet (everything is fresh). */
const EMPTY_HISTORY: QuestionHistory = {};

/**
 * Chaque question supplémentaire tirée d'un univers déjà servi (au même joueur
 * en mode « tour », ou globalement sinon) est ré-pondérée par ce facteur. Assez
 * bas pour qu'avec un vrai pool (des dizaines d'univers) chaque joueur tombe sur
 * autant d'univers distincts que possible, mais pas nul.
 */
const UNIVERSE_REPEAT_DECAY = 0.15;

/** Probabilité, par question attribuée à un joueur, qu'elle vienne d'un de ses univers non souhaités. */
const UNWANTED_UNIVERSE_CHANCE = 0.02;

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

  const unwantedSets: Record<string, Set<string>> = {};
  const anyUnwanted = new Set<string>();
  for (const [pid, arr] of Object.entries(opts?.unwantedUniversesByPlayer ?? {})) {
    unwantedSets[pid] = new Set(arr);
    for (const u of arr) anyUnwanted.add(u);
  }

  // Pre-shuffle so that, among questions of equal weight, the pick is random.
  const remaining = shuffle(eligible, rng);
  const total = Math.max(0, Math.min(filter.count, remaining.length));
  const result: Question[] = [];

  // How many times each universe has already been served — globally, and per
  // player — to spread a round across as many distinct universes as possible.
  const globalUniv = new Map<string, number>();
  const perPlayerUniv = new Map<string, Map<string, number>>();
  const seenCount = (playerId: string, key: string): number => {
    if (turnMode === 'turn' && playerId) return perPlayerUniv.get(playerId)?.get(key) ?? 0;
    return globalUniv.get(key) ?? 0;
  };

  for (let slot = 0; slot < total; slot++) {
    const slotPlayer = turnMode === 'turn' && n > 0 ? (order[slot % n] ?? '') : '';
    const slotHistory =
      turnMode === 'turn' && slotPlayer && opts?.historyByPlayer
        ? (opts.historyByPlayer[slotPlayer] ?? EMPTY_HISTORY)
        : history;
    const unwanted = turnMode === 'turn' ? (slotPlayer ? unwantedSets[slotPlayer] : undefined) : anyUnwanted;
    const isUnwanted = (q: Question): boolean => q.universe !== undefined && (unwanted?.has(q.universe) ?? false);

    // 98 % univers souhaités, 2 % univers non souhaité — sans jamais tirer dans
    // un sous-ensemble vide.
    let pickUnwanted = (unwanted?.size ?? 0) > 0 && rng() < UNWANTED_UNIVERSE_CHANCE;
    let hasWanted = false;
    let hasUnwanted = false;
    for (const q of remaining) {
      if (isUnwanted(q)) hasUnwanted = true;
      else hasWanted = true;
      if (hasWanted && hasUnwanted) break;
    }
    if (pickUnwanted && !hasUnwanted) pickUnwanted = false;
    if (!pickUnwanted && !hasWanted) pickUnwanted = true;

    // Nouvelles questions d'abord : on restreint le tirage au palier d'usage le
    // plus bas encore disponible, dans le sous-ensemble choisi.
    let minUsage = Infinity;
    for (const q of remaining) {
      if (isUnwanted(q) !== pickUnwanted) continue;
      const u = slotHistory[q.id]?.timesUsed ?? 0;
      if (u < minUsage) minUsage = u;
    }

    let bestSum = 0;
    const weighted: { q: Question; w: number; idx: number }[] = [];
    remaining.forEach((q, idx) => {
      if (isUnwanted(q) !== pickUnwanted) return;
      if ((slotHistory[q.id]?.timesUsed ?? 0) !== minUsage) return;
      const w = Math.pow(UNIVERSE_REPEAT_DECAY, seenCount(slotPlayer, diversityKey(q)));
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
