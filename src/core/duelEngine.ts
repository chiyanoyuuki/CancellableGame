/**
 * « Duel » — moteur pur et testable (aucun import React Native).
 *
 * Chacun a des questions sur SON thème, chacun son tour. La difficulté monte
 * pour tout le monde selon un barème global : les 2 premières questions sont
 * faciles, les 2 suivantes moyennes, les 2 suivantes dures, puis tout le reste
 * en pro. Une mauvaise réponse élimine le joueur ; la partie s'arrête quand il
 * ne reste qu'un joueur, le survivant.
 */
import type { Difficulty, DuelConfig, GameEvent, Player, PlayerSessionResult, Question, SessionResult } from './models';
import { mulberry32, type Rng, shuffle } from './rng';

export type DuelPhase = 'question' | 'reveal' | 'finished';

type ThemeQueues = Record<string, Partial<Record<Difficulty, Question[]>>>;

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
  /** Nombre total de questions déjà posées (pilote le barème de difficulté). */
  asked: number;
  /** Files de questions mélangées, par thème puis difficulté. */
  queues: ThemeQueues;
  current: Question | null;
  currentOptions: string[];
  pairOptions: string[];
  propsShown: 0 | 2 | 4;
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
  | { type: 'REVEAL_PROPS'; count: 2 | 4 }
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'CONTINUE' };

const DIFFS: Difficulty[] = [1, 2, 3, 4];

/** Barème : 2 faciles, 2 moyennes, 2 dures, puis tout le reste en pro. */
export function duelDifficulty(asked: number): Difficulty {
  if (asked < 2) return 1;
  if (asked < 4) return 2;
  if (asked < 6) return 3;
  return 4;
}

function stepRng(state: DuelState): { rng: Rng; step: number } {
  const rng = mulberry32((state.seed ^ Math.imul(state.step + 1, 0x9e3779b1)) >>> 0);
  return { rng, step: state.step + 1 };
}

/** Tire une question du thème à la difficulté voulue ; sinon replie sur une autre. */
function drawFor(queues: ThemeQueues, theme: string, diff: Difficulty): { q: Question | null; queues: ThemeQueues } {
  const themeQ = queues[theme] ?? {};
  const prefs = [diff, ...DIFFS.filter((d) => d !== diff)]; // difficulté voulue d'abord, puis les autres
  for (const d of prefs) {
    const arr = themeQ[d];
    if (arr && arr.length > 0) {
      const q = arr[0] as Question;
      const nextThemeQ = { ...themeQ, [d]: arr.slice(1) };
      return { q, queues: { ...queues, [theme]: nextThemeQ } };
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
  const theme = state.config.themesByPlayer[activeId] ?? Object.keys(state.queues)[0] ?? '';
  const diff = duelDifficulty(state.asked);
  const drawn = drawFor(state.queues, theme, diff);
  const q = drawn.q;
  if (!q) {
    // Thème épuisé (improbable) : le joueur actif survit et gagne.
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
    asked: state.asked + 1,
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
  const queues: ThemeQueues = {};
  for (const theme of new Set(Object.values(args.config.themesByPlayer))) {
    const buckets: Partial<Record<Difficulty, Question[]>> = {};
    for (const d of DIFFS) {
      buckets[d] = shuffle(
        args.pool.filter((q) => q.theme === theme && q.difficulty === d),
        rng0,
      );
    }
    queues[theme] = buckets;
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
    queues,
    current: null,
    currentOptions: [],
    pairOptions: [],
    propsShown: 0,
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
    case 'REVEAL_PROPS': {
      if (state.phase !== 'question' || !state.config.allowPropositions) return state;
      if (state.propsShown === 2) return state; // 2 propositions est l'aide maximale
      if (action.count === 4 && state.propsShown !== 0) return state;
      return { ...state, propsShown: action.count };
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
