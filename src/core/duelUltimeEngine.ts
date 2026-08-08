/**
 * « Duel Ultime » — moteur pur et testable (aucun import React Native).
 *
 * 1 à n joueurs. Chaque joueur choisit SON propre univers et répond à N
 * questions PRO (difficulté 4) tirées de cet univers, sous forme de QCM.
 * Les joueurs jouent leur bloc de questions à tour de rôle. À la fin, on
 * compare les scores (nombre de bonnes réponses) : le meilleur l'emporte.
 * Avec un seul joueur, c'est un défi solo chronométré par le score.
 */
import type { GameEvent, Player, PlayerSessionResult, Question, SessionResult } from './models';
import { mulberry32, type Rng, shuffle } from './rng';
import type { DuelUltimeConfig } from './models';

export type DuelUltimePhase = 'question' | 'reveal' | 'finished';

export interface DuelUltimeState {
  config: DuelUltimeConfig;
  players: Player[];
  /** Ordre de passage (identifiants). */
  order: string[];
  /** Index du joueur actif dans `order`. */
  playerIdx: number;
  activeId: string | null;
  /** Numéro de la question en cours pour le joueur actif (1..questionsPerPlayer). */
  qNumber: number;
  /** Files de questions restantes par joueur (déjà mélangées, limitées à N). */
  queues: Record<string, Question[]>;
  current: Question | null;
  currentOptions: string[];
  correctById: Record<string, number>;
  wrongById: Record<string, number>;
  /** Nombre de questions déjà répondues par chaque joueur. */
  answeredById: Record<string, number>;
  phase: DuelUltimePhase;
  lastCorrect: boolean | null;
  seed: number;
  step: number;
}

export type DuelUltimeAction =
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'CONTINUE' };

function stepRng(state: DuelUltimeState): { rng: Rng; step: number } {
  const rng = mulberry32((state.seed ^ Math.imul(state.step + 1, 0x9e3779b1)) >>> 0);
  return { rng, step: state.step + 1 };
}

/**
 * Prépare la prochaine question. Avance de joueur en joueur tant que la file du
 * joueur courant est vide ; si tous les joueurs ont fini, la partie est terminée.
 */
function setupQuestion(state: DuelUltimeState): DuelUltimeState {
  let playerIdx = state.playerIdx;
  while (playerIdx < state.order.length) {
    const id = state.order[playerIdx];
    const queue = id ? state.queues[id] ?? [] : [];
    if (id && queue.length > 0) {
      const q = queue[0] as Question;
      const { rng, step } = stepRng({ ...state, playerIdx });
      const currentOptions = shuffle([q.answer, ...q.distractors.slice(0, 3)], rng);
      return {
        ...state,
        step,
        playerIdx,
        activeId: id,
        qNumber: (state.answeredById[id] ?? 0) + 1,
        queues: { ...state.queues, [id]: queue.slice(1) },
        current: q,
        currentOptions,
        phase: 'question',
        lastCorrect: null,
      };
    }
    playerIdx += 1;
  }
  return { ...state, playerIdx, activeId: null, current: null, currentOptions: [], phase: 'finished' };
}

export function createDuelUltimeState(args: {
  config: DuelUltimeConfig;
  players: Player[];
  pool: readonly Question[];
  seed: number;
  /** Ordre de passage imposé (identifiants) ; défaut = ordre des joueurs. */
  order?: string[];
}): DuelUltimeState {
  const order = (args.order ?? args.players.map((p) => p.id)).filter(
    (id) => args.config.universeByPlayer[id] !== undefined,
  );
  const n = Math.max(1, args.config.questionsPerPlayer);
  const queues: Record<string, Question[]> = {};
  order.forEach((id, i) => {
    const universe = args.config.universeByPlayer[id];
    const rng = mulberry32((args.seed ^ Math.imul(i + 1, 0x85ebca6b)) >>> 0);
    const pro = args.pool.filter((q) => q.universe === universe && q.difficulty === 4);
    queues[id] = shuffle(pro, rng).slice(0, n);
  });

  const base: DuelUltimeState = {
    config: args.config,
    players: args.players,
    order,
    playerIdx: 0,
    activeId: order[0] ?? null,
    qNumber: 0,
    queues,
    current: null,
    currentOptions: [],
    correctById: {},
    wrongById: {},
    answeredById: {},
    phase: 'question',
    lastCorrect: null,
    seed: args.seed >>> 0,
    step: 0,
  };
  if (order.length === 0) return { ...base, phase: 'finished', activeId: null };
  return setupQuestion(base);
}

export function duelUltimeReducer(state: DuelUltimeState, action: DuelUltimeAction): DuelUltimeState {
  if (state.phase === 'finished') return state;

  switch (action.type) {
    case 'ANSWER': {
      if (state.phase !== 'question' || !state.activeId) return state;
      const active = state.activeId;
      return {
        ...state,
        phase: 'reveal',
        lastCorrect: action.correct,
        answeredById: { ...state.answeredById, [active]: (state.answeredById[active] ?? 0) + 1 },
        correctById: action.correct
          ? { ...state.correctById, [active]: (state.correctById[active] ?? 0) + 1 }
          : state.correctById,
        wrongById: action.correct
          ? state.wrongById
          : { ...state.wrongById, [active]: (state.wrongById[active] ?? 0) + 1 },
      };
    }

    case 'CONTINUE': {
      if (state.phase !== 'reveal' || !state.activeId) return state;
      const active = state.activeId;
      // La file du joueur actif est vide ? On passe au joueur suivant.
      const queueEmpty = (state.queues[active] ?? []).length === 0;
      const playerIdx = queueEmpty ? state.playerIdx + 1 : state.playerIdx;
      return setupQuestion({ ...state, playerIdx });
    }
  }
}

/** Classement : plus de bonnes réponses d'abord ; égalité = même rang. */
export function duelUltimeRanking(state: DuelUltimeState): string[] {
  return [...state.order].sort((a, b) => (state.correctById[b] ?? 0) - (state.correctById[a] ?? 0));
}

/** Identifiant du gagnant, ou null en cas d'égalité en tête (ou solo). */
export function duelUltimeWinner(state: DuelUltimeState): string | null {
  if (state.order.length < 2) return null;
  const ranked = duelUltimeRanking(state);
  const first = ranked[0];
  const second = ranked[1];
  if (!first) return null;
  if (second && (state.correctById[first] ?? 0) === (state.correctById[second] ?? 0)) return null;
  return first;
}

export function duelUltimeToSessionResult(
  state: DuelUltimeState,
  startedAt: number,
  endedAt: number,
): SessionResult {
  const ranked = duelUltimeRanking(state);
  let lastPoints: number | null = null;
  let lastRank = 0;
  const players: PlayerSessionResult[] = ranked.map((id, i) => {
    const points = state.correctById[id] ?? 0;
    // Rang par compétition standard : égalité de score = même rang.
    const rank = lastPoints !== null && points === lastPoints ? lastRank : i + 1;
    lastPoints = points;
    lastRank = rank;
    return {
      playerId: id,
      points,
      rank,
      sipsDrunk: 0,
      sipsGiven: 0,
      details: {
        correct: points,
        wrong: state.wrongById[id] ?? 0,
        universe: state.config.universeByPlayer[id] ?? '',
      },
    };
  });
  const events: GameEvent[] = [];
  return { gameId: 'duelultime', mode: 'ultime', config: { ...state.config }, startedAt, endedAt, players, events };
}
