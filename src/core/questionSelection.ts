import type { Difficulty, Question, Theme, TurnMode } from './models';
import { type Rng, shuffle } from './rng';

/**
 * Selecting which questions a round uses.
 *
 * Garantie de base : jamais deux fois la même question dans une partie. Au-delà
 * du même id, deux entrées au même énoncé ET à la même réponse comptent pour
 * « la même question » (un item rangé dans deux thèmes, ou la même image en
 * double) et une seule reste tirable. Les énoncés identiques mais aux réponses
 * différentes (drapeaux, rébus, images) restent bien des questions distinctes.
 *
 * Priorités, dans l'ordre :
 *  1. Nouvelles questions d'abord : on épuise les questions jamais vues (puis les
 *     moins vues) avant de réutiliser une question déjà posée.
 *  2. Un maximum d'univers différents : au sein des questions d'un même joueur,
 *     on évite de reprendre deux fois le même univers tant qu'il en reste
 *     d'autres.
 *  3. Univers/thèmes non souhaités : chaque joueur peut désactiver des univers,
 *     ou des thèmes entiers sans univers (rébus, énigmes…). Une question qui lui
 *     est attribuée n'a alors qu'environ 2 % de chance d'appartenir à l'un d'eux ;
 *     sinon on tire dans les catégories souhaitées.
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
   * Per-player UNWANTED categories. Chaque entrée est soit un nom d'univers,
   * soit « #thème » pour un thème entier sans univers (rébus, énigmes…). Leurs
   * questions ne sont quasiment jamais tirées : chaque question attribuée à un
   * joueur n'a qu'environ 2 % de chance d'appartenir à l'une d'elles. En mode
   * « tour », on utilise la liste du joueur du slot ; en mode « au plus rapide »
   * (question partagée), l'union des listes de tous.
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
  /**
   * Per-player ALLOWED universes (mode « tour » uniquement). Quand la liste d'un
   * joueur est non vide, ses questions sont RESTREINTES à ces univers : on ne lui
   * tire que des questions dont l'univers y figure. Sert au mode équipe, où les
   * questions d'une équipe doivent venir des univers choisis par au moins un de
   * ses membres. Repli de sûreté : si plus aucune question autorisée n'est
   * disponible pour ce joueur, on retombe sur le tirage normal plutôt que de
   * bloquer la partie. Une liste absente ou vide n'impose aucune restriction.
   */
  allowedUniversesByPlayer?: Record<string, string[]>;
  /**
   * Per-player ALLOWED difficulties (mode « tour » uniquement) — difficulté
   * adaptative. Même logique que `allowedUniversesByPlayer` mais sur les paliers :
   * le slot du joueur ne tire que dans ces difficultés, avec repli de sûreté si
   * plus aucune question autorisée n'est disponible. Absente/vide = aucune contrainte.
   */
  difficultiesByPlayer?: Record<string, Difficulty[]>;
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

/**
 * Normalisation pour comparer deux questions : minuscules, sans accents ni
 * ponctuation. Deux textes qui ne diffèrent que par la casse ou un accent sont
 * alors considérés identiques.
 */
export function normalizeForIdentity(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Identité d'une question pour l'anti-doublon : énoncé + réponse normalisés. */
export function identityKey(q: Pick<Question, 'text' | 'answer'>): string {
  return `${normalizeForIdentity(q.text)} ${normalizeForIdentity(q.answer)}`;
}

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

  // Univers autorisés par joueur (mode équipe) : quand la liste est non vide, ce
  // joueur ne reçoit que des questions de ces univers — sauf s'il n'en reste plus.
  const allowedSets: Record<string, Set<string>> = {};
  for (const [pid, arr] of Object.entries(opts?.allowedUniversesByPlayer ?? {})) {
    if (arr.length > 0) allowedSets[pid] = new Set(arr);
  }

  // Difficultés autorisées par joueur (difficulté adaptative, mode « tour »).
  const diffSets: Record<string, Set<Difficulty>> = {};
  for (const [pid, arr] of Object.entries(opts?.difficultiesByPlayer ?? {})) {
    if (arr.length > 0) diffSets[pid] = new Set(arr);
  }

  // Pre-shuffle so that, among questions of equal weight, the pick is random.
  const shuffled = shuffle(eligible, rng);

  // Anti-doublon : on ne garde qu'un seul exemplaire tirable par identité
  // (énoncé + réponse), pour ne jamais poser deux fois la même question dans une
  // partie — même si elle est rangée dans deux thèmes/univers différents. Comme
  // `shuffled` est déjà mélangé, l'exemplaire conservé est aléatoire.
  const remaining: Question[] = [];
  const seenIdentity = new Set<string>();
  for (const qq of shuffled) {
    const key = identityKey(qq);
    if (seenIdentity.has(key)) continue;
    seenIdentity.add(key);
    remaining.push(qq);
  }

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
    // Une question est « non souhaitée » si son univers l'est ; pour les thèmes
    // sans univers (rébus, énigmes, blind test…), on peut viser le thème entier
    // via la clé « #thème » (même convention que diversityKey).
    const isUnwanted = (q: Question): boolean => {
      if (!unwanted || unwanted.size === 0) return false;
      return unwanted.has(q.universe ?? `#${q.theme}`);
    };

    // Univers autorisés pour CE slot (mode équipe) : n'est actif que s'il reste
    // au moins une question autorisée à tirer ; sinon on retombe sur le tirage
    // normal pour ne jamais bloquer la partie.
    const allowed = turnMode === 'turn' && slotPlayer ? allowedSets[slotPlayer] : undefined;
    const allowedActive =
      !!allowed && remaining.some((q) => q.universe !== undefined && allowed.has(q.universe));
    const passesAllowed = (q: Question): boolean =>
      !allowedActive || (q.universe !== undefined && allowed!.has(q.universe));

    // Difficultés adaptatives pour CE slot : actif seulement s'il reste au moins
    // une question autorisée (difficulté ∈ paliers ET univers autorisé) ; sinon
    // repli sur le tirage normal pour ne jamais bloquer la partie.
    const allowedDiffs = turnMode === 'turn' && slotPlayer ? diffSets[slotPlayer] : undefined;
    const diffActive =
      !!allowedDiffs && remaining.some((q) => allowedDiffs.has(q.difficulty) && passesAllowed(q));
    const passesDifficulty = (q: Question): boolean => !diffActive || allowedDiffs!.has(q.difficulty);
    const passes = (q: Question): boolean => passesAllowed(q) && passesDifficulty(q);

    // 98 % univers souhaités, 2 % univers non souhaité — sans jamais tirer dans
    // un sous-ensemble vide.
    let pickUnwanted = (unwanted?.size ?? 0) > 0 && rng() < UNWANTED_UNIVERSE_CHANCE;
    let hasWanted = false;
    let hasUnwanted = false;
    for (const q of remaining) {
      if (!passes(q)) continue;
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
      if (!passes(q)) continue;
      if (isUnwanted(q) !== pickUnwanted) continue;
      const u = slotHistory[q.id]?.timesUsed ?? 0;
      if (u < minUsage) minUsage = u;
    }

    let bestSum = 0;
    const weighted: { q: Question; w: number; idx: number }[] = [];
    remaining.forEach((q, idx) => {
      if (!passes(q)) return;
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

/**
 * Nombre de questions ENCORE JAMAIS VUES parmi `questions`, pour un historique
 * donné. Dédoublonne par identité (énoncé + réponse), exactement comme la
 * sélection, pour ne pas compter deux fois une même question rangée dans deux
 * univers. Une question compte comme « vue » dès `timesUsed >= 1`.
 */
export function countUnseen(questions: readonly Question[], history: QuestionHistory): number {
  return countUnseenGroups(identityGroups(questions), history);
}

/** Un groupe d'identité : les ids d'une même question (même énoncé + réponse). */
export type IdentityGroups = readonly (readonly string[])[];

/**
 * Regroupe un pool par identité (énoncé + réponse) : chaque groupe rassemble les
 * ids d'une même question rangée à plusieurs endroits (deux univers, une image en
 * double…). La normalisation du texte n'est faite qu'ici — on peut ensuite
 * compter les inédites de plusieurs joueurs à moindre coût via `countUnseenGroups`.
 */
export function identityGroups(questions: readonly Question[]): string[][] {
  const byKey = new Map<string, string[]>();
  for (const q of questions) {
    const key = identityKey(q);
    const arr = byKey.get(key);
    if (arr) arr.push(q.id);
    else byKey.set(key, [q.id]);
  }
  return [...byKey.values()];
}

/**
 * Nombre de groupes d'identité dont AUCUN exemplaire n'a été vu (timesUsed ≥ 1),
 * quel que soit l'ordre. À utiliser avec `identityGroups` pré-calculé une fois,
 * pour afficher les inédites de chaque joueur sans renormaliser le pool.
 */
export function countUnseenGroups(groups: IdentityGroups, history: QuestionHistory): number {
  let unseen = 0;
  for (const ids of groups) {
    let seen = false;
    for (const id of ids) {
      if ((history[id]?.timesUsed ?? 0) > 0) {
        seen = true;
        break;
      }
    }
    if (!seen) unseen += 1;
  }
  return unseen;
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
