/**
 * « La Bombe » — moteur pur et testable (aucun import React Native).
 *
 * Une bombe au minuteur caché tourne pour toute la manche. Le joueur actif doit
 * répondre correctement pour passer la bombe au joueur suivant (sens horaire).
 * Toute erreur, demande de propositions ou « passer » raccourcit la mèche. Le
 * porteur au moment de l'explosion est éliminé ; on rejoue avec les survivants
 * jusqu'à ce qu'il n'en reste qu'un.
 *
 * Le temps réel vit dans le composant : il envoie des actions TICK avec le
 * temps écoulé. Le hasard (durée des mèches) est calculé côté composant via
 * `randomFuseMs` puis injecté dans les actions, ce qui garde ce moteur pur.
 */
import type {
  BombeConfig,
  DrinkIntensity,
  GameEvent,
  Player,
  PlayerSessionResult,
  Question,
  SessionResult,
} from './models';
import type { Rng } from './rng';

export interface BombeAnswer {
  playerId: string;
  questionId: string;
  theme: string;
  difficulty: number;
  correct: boolean;
  hintsUsed: number;
  timeMs: number | null;
  points: number;
}

export type BombePhase = 'question' | 'exploded' | 'finished';

export interface BombeState {
  config: BombeConfig;
  players: Player[];
  /** Ordre horaire fixe des joueurs (identifiants). */
  order: string[];
  /** Joueurs encore en lice, dans l'ordre. */
  aliveIds: string[];
  activeId: string | null;
  questions: Question[];
  qIndex: number;
  current: Question | null;
  /** Mèche restante de la manche en cours, en millisecondes. */
  fuseMs: number;
  /** Mèche initiale de la manche (pour l'animation en pourcentage). */
  roundMax: number;
  /** Propositions révélées pour la question courante (0, 2 ou 4). */
  propsShown: 0 | 2 | 4;
  phase: BombePhase;
  /** Éliminés dans l'ordre (le premier éliminé en tête). */
  eliminationOrder: string[];
  correctById: Record<string, number>;
  wrongById: Record<string, number>;
  answers: BombeAnswer[];
  lastEliminatedId: string | null;
  winnerId: string | null;
}

export type BombeAction =
  | { type: 'TICK'; deltaMs: number }
  | { type: 'REVEAL_PROPS'; count: 2 | 4 }
  | { type: 'ANSWER'; correct: boolean; timeMs?: number | null }
  | { type: 'SKIP' }
  | { type: 'IMAGE_FAILED' }
  | { type: 'NEXT_ROUND'; fuseMs: number };

/** Gorgées bues par un joueur éliminé, selon l'intensité. */
const ELIM_SIPS: Record<DrinkIntensity, number> = { soft: 1, normal: 2, hardcore: 3 };

/** Durée de mèche aléatoire d'une manche, fonction du nombre de joueurs en vie. */
export function randomFuseMs(config: BombeConfig, aliveCount: number, rng: Rng): number {
  const base = config.secondsPerPlayer * Math.max(1, aliveCount);
  const factor = 0.7 + rng() * 0.6; // 0,7 à 1,3 : on ne sait jamais quand ça explose
  return Math.max(3000, Math.round(base * factor * 1000));
}

export function createBombeState(args: {
  config: BombeConfig;
  players: Player[];
  questions: Question[];
  order: string[];
  startIndex: number;
  firstFuseMs: number;
}): BombeState {
  const { config, players, questions, order, startIndex, firstFuseMs } = args;
  const activeId = order.length > 0 ? (order[startIndex % order.length] ?? order[0] ?? null) : null;
  return {
    config,
    players,
    order,
    aliveIds: [...order],
    activeId,
    questions,
    qIndex: 1,
    current: questions[0] ?? null,
    fuseMs: firstFuseMs,
    roundMax: firstFuseMs,
    propsShown: 0,
    phase: 'question',
    eliminationOrder: [],
    correctById: {},
    wrongById: {},
    answers: [],
    lastEliminatedId: null,
    winnerId: null,
  };
}

/** Prochain joueur vivant, dans le sens horaire, à partir de `fromId`. */
function nextAliveAfter(state: BombeState, fromId: string): string {
  const { order, aliveIds } = state;
  const n = order.length;
  const start = order.indexOf(fromId);
  for (let step = 1; step <= n; step++) {
    const cand = order[(start + step) % n];
    if (cand && aliveIds.includes(cand)) return cand;
  }
  return fromId;
}

function drawQuestion(state: BombeState): { current: Question | null; qIndex: number } {
  const n = state.questions.length;
  if (n === 0) return { current: null, qIndex: state.qIndex };
  return { current: state.questions[state.qIndex % n] ?? null, qIndex: state.qIndex + 1 };
}

/** La mèche a atteint zéro : le porteur explose et est éliminé. */
function explode(state: BombeState): BombeState {
  const eliminated = state.activeId;
  if (!eliminated) return { ...state, fuseMs: 0 };
  const aliveIds = state.aliveIds.filter((id) => id !== eliminated);
  const eliminationOrder = [...state.eliminationOrder, eliminated];
  if (aliveIds.length <= 1) {
    return {
      ...state,
      fuseMs: 0,
      aliveIds,
      eliminationOrder,
      lastEliminatedId: eliminated,
      winnerId: aliveIds[0] ?? null,
      phase: 'finished',
    };
  }
  return { ...state, fuseMs: 0, aliveIds, eliminationOrder, lastEliminatedId: eliminated, phase: 'exploded' };
}

/** Retire du temps à la mèche ; si elle atteint zéro, la bombe explose. */
function burn(state: BombeState, deltaMs: number): BombeState {
  const fuseMs = state.fuseMs - Math.max(0, deltaMs);
  if (fuseMs <= 0) return explode({ ...state, fuseMs: 0 });
  return { ...state, fuseMs };
}

export function bombeReducer(state: BombeState, action: BombeAction): BombeState {
  if (state.phase === 'finished') return state;

  switch (action.type) {
    case 'TICK':
      if (state.phase !== 'question') return state;
      return burn(state, action.deltaMs);

    case 'REVEAL_PROPS': {
      if (state.phase !== 'question') return state;
      const penalty = action.count === 4 ? state.config.penaltyProps4Sec : state.config.penaltyProps2Sec;
      return burn({ ...state, propsShown: action.count }, penalty * 1000);
    }

    case 'ANSWER': {
      if (state.phase !== 'question' || !state.activeId || !state.current) return state;
      const active = state.activeId;
      const q = state.current;
      const answer: BombeAnswer = {
        playerId: active,
        questionId: q.id,
        theme: q.theme,
        difficulty: q.difficulty,
        correct: action.correct,
        hintsUsed: state.propsShown > 0 ? 1 : 0,
        timeMs: action.timeMs ?? null,
        points: action.correct ? 1 : 0,
      };
      const answers = [...state.answers, answer];

      if (action.correct) {
        // Bonne réponse : la bombe (et sa mèche) passe au joueur suivant.
        const correctById = { ...state.correctById, [active]: (state.correctById[active] ?? 0) + 1 };
        const next = nextAliveAfter(state, active);
        const { current, qIndex } = drawQuestion(state);
        return { ...state, answers, correctById, activeId: next, current, qIndex, propsShown: 0 };
      }
      // Mauvaise réponse : pénalité de temps, même question (on peut réessayer).
      const wrongById = { ...state.wrongById, [active]: (state.wrongById[active] ?? 0) + 1 };
      return burn({ ...state, answers, wrongById }, state.config.penaltyWrongSec * 1000);
    }

    case 'SKIP': {
      if (state.phase !== 'question') return state;
      const { current, qIndex } = drawQuestion(state);
      return burn({ ...state, current, qIndex, propsShown: 0 }, state.config.penaltySkipSec * 1000);
    }

    case 'IMAGE_FAILED': {
      // Image cassée : on remplace la question sans pénalité, même joueur.
      if (state.phase !== 'question') return state;
      const { current, qIndex } = drawQuestion(state);
      return { ...state, current, qIndex, propsShown: 0 };
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'exploded' || !state.lastEliminatedId) return state;
      const next = nextAliveAfter(state, state.lastEliminatedId);
      const { current, qIndex } = drawQuestion(state);
      return {
        ...state,
        activeId: next,
        current,
        qIndex,
        propsShown: 0,
        phase: 'question',
        fuseMs: action.fuseMs,
        roundMax: action.fuseMs,
      };
    }
  }
}

/** Classement final : le survivant en tête, puis les éliminés du dernier au premier. */
export function bombeRanking(state: BombeState): string[] {
  const ranked: string[] = [];
  if (state.winnerId) ranked.push(state.winnerId);
  for (let i = state.eliminationOrder.length - 1; i >= 0; i--) {
    const id = state.eliminationOrder[i];
    if (id && !ranked.includes(id)) ranked.push(id);
  }
  for (const id of state.order) if (!ranked.includes(id)) ranked.push(id);
  return ranked;
}

/** Convertit une partie terminée en SessionResult générique et persistable. */
export function bombeToSessionResult(state: BombeState, startedAt: number, endedAt: number): SessionResult {
  const ranked = bombeRanking(state);
  const drink = state.config.drinksEnabled ? ELIM_SIPS[state.config.drinkIntensity] : 0;

  const players: PlayerSessionResult[] = ranked.map((id, i) => ({
    playerId: id,
    points: state.correctById[id] ?? 0,
    rank: i + 1,
    // Chaque joueur éliminé boit ; le survivant ne boit pas.
    sipsDrunk: i === 0 ? 0 : drink,
    sipsGiven: 0,
    details: { correct: state.correctById[id] ?? 0, wrong: state.wrongById[id] ?? 0 },
  }));

  const events: GameEvent[] = state.answers.map((a) => ({
    type: 'answer',
    playerId: a.playerId,
    at: 0,
    payload: { ...a },
  }));

  return { gameId: 'bombe', mode: 'survie', config: { ...state.config }, startedAt, endedAt, players, events };
}
