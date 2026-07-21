/**
 * « Duel » — moteur pur et testable (aucun import React Native).
 *
 * On choisit 1 à n univers, communs à tous les joueurs. Chacun son tour répond
 * à une question tirée de ces univers. La difficulté monte PAR JOUEUR selon ses
 * propres questions déjà passées : 3 faciles, 3 moyennes, 2 dures, puis tout le
 * reste en pro. Une mauvaise réponse élimine le joueur ; la partie s'arrête
 * quand il ne reste qu'un joueur, le survivant.
 */
import type { Difficulty, DuelConfig, DuelJoker, GameEvent, Player, PlayerSessionResult, Question, SessionResult } from './models';
import { mulberry32, type Rng, shuffle } from './rng';

export type DuelPhase = 'question' | 'reveal' | 'finished';

type DiffQueues = Partial<Record<Difficulty, Question[]>>;

export interface DuelState {
  config: DuelConfig;
  players: Player[];
  /** Ordre de départ (tous les joueurs). */
  order: string[];
  /** Joueurs encore en lice, dans l'ordre du tour. */
  alive: string[];
  /** Éliminés, le premier éliminé en tête. */
  eliminationOrder: string[];
  /** Index du joueur actif dans `alive`. */
  turnIdx: number;
  activeId: string | null;
  /** Total de questions posées (info). */
  asked: number;
  /** Questions déjà posées à chaque joueur — pilote SON barème de difficulté. */
  askedByPlayer: Record<string, number>;
  /** Files de questions mélangées des univers choisis, par difficulté (communes). */
  queues: DiffQueues;
  current: Question | null;
  currentOptions: string[];
  pairOptions: string[];
  propsShown: 0 | 2 | 4;
  /** Jokers déjà utilisés par chaque joueur (une fois chacun, toute la partie). */
  jokersUsed: Record<string, DuelJoker[]>;
  /** Le joueur actif a-t-il demandé l'aide d'un autre joueur sur CETTE question ? */
  helpUsed: boolean;
  correctById: Record<string, number>;
  wrongById: Record<string, number>;
  phase: DuelPhase;
  lastCorrect: boolean | null;
  lastEliminatedId: string | null;
  winnerId: string | null;
  seed: number;
  step: number;
}

export type DuelAction =
  | { type: 'USE_JOKER'; joker: DuelJoker }
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'CONTINUE' };

const DIFFS: Difficulty[] = [1, 2, 3, 4];

/** Barème PAR JOUEUR : 3 faciles, 3 moyennes, 2 dures, puis tout le reste en pro. */
export function duelDifficulty(playerAsked: number): Difficulty {
  if (playerAsked < 3) return 1;
  if (playerAsked < 6) return 2;
  if (playerAsked < 8) return 3;
  return 4;
}

function stepRng(state: DuelState): { rng: Rng; step: number } {
  const rng = mulberry32((state.seed ^ Math.imul(state.step + 1, 0x9e3779b1)) >>> 0);
  return { rng, step: state.step + 1 };
}

/** Tire une question à la difficulté voulue ; sinon replie sur une autre difficulté. */
function drawFor(queues: DiffQueues, diff: Difficulty): { q: Question | null; queues: DiffQueues } {
  const prefs = [diff, ...DIFFS.filter((d) => d !== diff)];
  for (const d of prefs) {
    const arr = queues[d];
    if (arr && arr.length > 0) {
      const q = arr[0] as Question;
      return { q, queues: { ...queues, [d]: arr.slice(1) } };
    }
  }
  return { q: null, queues };
}

function setupQuestion(state: DuelState): DuelState {
  if (state.alive.length <= 1) {
    const winner = state.alive[0] ?? null;
    return { ...state, phase: 'finished', winnerId: winner, activeId: winner };
  }
  const activeId = state.alive[state.turnIdx] ?? state.alive[0] ?? null;
  if (!activeId) return { ...state, phase: 'finished' };

  const { rng, step } = stepRng(state);
  const diff = duelDifficulty(state.askedByPlayer[activeId] ?? 0);
  const drawn = drawFor(state.queues, diff);
  const q = drawn.q;
  if (!q) {
    // Plus aucune question disponible (improbable) : le joueur actif l'emporte.
    return { ...state, phase: 'finished', winnerId: activeId, activeId };
  }
  const currentOptions = shuffle([q.answer, ...q.distractors.slice(0, 3)], rng);
  const pairOptions = shuffle([q.answer, q.distractors[0] ?? '???'], rng);
  return {
    ...state,
    step,
    queues: drawn.queues,
    current: q,
    currentOptions,
    pairOptions,
    propsShown: 0,
    helpUsed: false,
    asked: state.asked + 1,
    askedByPlayer: { ...state.askedByPlayer, [activeId]: (state.askedByPlayer[activeId] ?? 0) + 1 },
    activeId,
    phase: 'question',
    lastCorrect: null,
    lastEliminatedId: null,
  };
}

export function createDuelState(args: {
  config: DuelConfig;
  players: Player[];
  pool: readonly Question[];
  seed: number;
  /** Ordre de départ imposé (identifiants) ; défaut = ordre des joueurs. */
  order?: string[];
}): DuelState {
  const order = args.order ?? args.players.map((p) => p.id);
  const rng0 = mulberry32(args.seed >>> 0);
  const chosen = new Set(args.config.universes);
  const queues: DiffQueues = {};
  for (const d of DIFFS) {
    queues[d] = shuffle(
      args.pool.filter((q) => q.universe !== undefined && chosen.has(q.universe) && q.difficulty === d),
      rng0,
    );
  }

  const base: DuelState = {
    config: args.config,
    players: args.players,
    order,
    alive: [...order],
    eliminationOrder: [],
    turnIdx: 0,
    activeId: order[0] ?? null,
    asked: 0,
    askedByPlayer: {},
    queues,
    current: null,
    currentOptions: [],
    pairOptions: [],
    propsShown: 0,
    jokersUsed: {},
    helpUsed: false,
    correctById: {},
    wrongById: {},
    phase: 'question',
    lastCorrect: null,
    lastEliminatedId: null,
    winnerId: null,
    seed: args.seed >>> 0,
    step: 0,
  };
  if (order.length <= 1) return { ...base, phase: 'finished', winnerId: order[0] ?? null };
  return setupQuestion(base);
}

export function duelReducer(state: DuelState, action: DuelAction): DuelState {
  if (state.phase === 'finished') return state;

  switch (action.type) {
    case 'USE_JOKER': {
      if (state.phase !== 'question' || !state.activeId) return state;
      const active = state.activeId;
      const j = action.joker;
      // Joker désactivé, ou déjà utilisé par ce joueur.
      if (!state.config.jokers[j]) return state;
      if ((state.jokersUsed[active] ?? []).includes(j)) return state;
      const consume: Record<string, DuelJoker[]> = {
        ...state.jokersUsed,
        [active]: [...(state.jokersUsed[active] ?? []), j],
      };

      if (j === 'props4') {
        if (state.propsShown !== 0) return state;
        return { ...state, propsShown: 4, jokersUsed: consume };
      }
      if (j === 'props2') {
        if (state.propsShown === 2) return state;
        return { ...state, propsShown: 2, jokersUsed: consume };
      }
      if (j === 'playerHelp') {
        return { ...state, helpUsed: true, jokersUsed: consume };
      }
      // otherUniverse : une question d'un AUTRE univers, même difficulté.
      const q = state.current;
      if (!q) return state;
      const arr = state.queues[q.difficulty] ?? [];
      const idx = arr.findIndex((x) => x.universe !== q.universe);
      if (idx < 0) return state; // aucun autre univers dispo → joker non consommé
      const replacement = arr[idx] as Question;
      const nextArr = [...arr.slice(0, idx), ...arr.slice(idx + 1)];
      const { rng, step } = stepRng(state);
      return {
        ...state,
        step,
        current: replacement,
        currentOptions: shuffle([replacement.answer, ...replacement.distractors.slice(0, 3)], rng),
        pairOptions: shuffle([replacement.answer, replacement.distractors[0] ?? '???'], rng),
        propsShown: 0,
        queues: { ...state.queues, [q.difficulty]: nextArr },
        jokersUsed: consume,
      };
    }

    case 'ANSWER': {
      if (state.phase !== 'question' || !state.activeId) return state;
      const active = state.activeId;
      return {
        ...state,
        phase: 'reveal',
        lastCorrect: action.correct,
        lastEliminatedId: action.correct ? null : active,
        correctById: action.correct
          ? { ...state.correctById, [active]: (state.correctById[active] ?? 0) + 1 }
          : state.correctById,
        wrongById: action.correct
          ? state.wrongById
          : { ...state.wrongById, [active]: (state.wrongById[active] ?? 0) + 1 },
      };
    }

    case 'CONTINUE': {
      if (state.phase !== 'reveal') return state;

      if (state.lastCorrect === false && state.activeId) {
        // Élimination du joueur actif.
        const active = state.activeId;
        const idx = state.alive.indexOf(active);
        const alive = state.alive.filter((id) => id !== active);
        const eliminationOrder = [...state.eliminationOrder, active];
        if (alive.length <= 1) {
          return {
            ...state,
            alive,
            eliminationOrder,
            winnerId: alive[0] ?? null,
            activeId: alive[0] ?? null,
            phase: 'finished',
          };
        }
        // Le joueur suivant occupe désormais la place libérée.
        const turnIdx = ((idx % alive.length) + alive.length) % alive.length;
        return setupQuestion({ ...state, alive, eliminationOrder, turnIdx });
      }

      // Bonne réponse : au joueur suivant.
      const turnIdx = (state.turnIdx + 1) % state.alive.length;
      return setupQuestion({ ...state, turnIdx });
    }
  }
}

/** Classement final : le survivant en tête, puis les éliminés du dernier au premier. */
export function duelRanking(state: DuelState): string[] {
  const ranked: string[] = [];
  if (state.winnerId) ranked.push(state.winnerId);
  for (let i = state.eliminationOrder.length - 1; i >= 0; i--) {
    const id = state.eliminationOrder[i];
    if (id && !ranked.includes(id)) ranked.push(id);
  }
  for (const id of state.order) if (!ranked.includes(id)) ranked.push(id);
  return ranked;
}

export function duelToSessionResult(state: DuelState, startedAt: number, endedAt: number): SessionResult {
  const ranked = duelRanking(state);
  const players: PlayerSessionResult[] = ranked.map((id, i) => ({
    playerId: id,
    points: state.correctById[id] ?? 0,
    rank: i + 1,
    sipsDrunk: 0,
    sipsGiven: 0,
    details: { correct: state.correctById[id] ?? 0, wrong: state.wrongById[id] ?? 0 },
  }));
  const events: GameEvent[] = [];
  return { gameId: 'duel', mode: 'duel', config: { ...state.config }, startedAt, endedAt, players, events };
}
