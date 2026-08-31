/**
 * « Qui est le plus susceptible de… ? » — moteur pur et testable.
 *
 * Téléphone qui tourne : à chaque manche une affirmation s'affiche (« Qui est le
 * plus susceptible de… »). Chacun vote en secret pour LE joueur qui colle le
 * mieux, puis on révèle le décompte. Le plus désigné est la « vedette » de la
 * manche : il boit autant que de doigts pointés sur lui (modulé par l'intensité)
 * et accumule des points de personnage. Classement final = la plus grande
 * vedette de la soirée.
 */
import type { DrinkIntensity, Player, PlayerSessionResult, SessionResult } from './models';
import { mulberry32, type Rng, shuffle } from './rng';

export interface QuiDeNousConfig {
  rounds: number;
  drinksEnabled: boolean;
  drinkIntensity: DrinkIntensity;
}

export type QuiDeNousPhase = 'vote' | 'result' | 'finished';

export interface QuiDeNousOutcome {
  prompt: string;
  /** Votes reçus par chaque joueur cette manche. */
  votesByTarget: Record<string, number>;
  /** Joueur(s) le(s) plus désigné(s). */
  winners: string[];
  maxVotes: number;
  /** Gorgées bues par chaque gagnant. */
  sips: number;
}

export interface QuiDeNousState {
  config: QuiDeNousConfig;
  players: Player[];
  order: string[];
  round: number;
  totalRounds: number;
  phase: QuiDeNousPhase;
  // --- Manche en cours ---
  prompt: string;
  voterIdx: number;
  /** Vote de chaque votant → identifiant du joueur désigné. */
  votes: Record<string, string>;
  lastOutcome: QuiDeNousOutcome | null;
  // --- Cumuls ---
  scores: Record<string, number>; // total des votes reçus (personnage)
  sipsById: Record<string, number>;
  // --- Pioche d'affirmations ---
  pool: string[];
  poolIdx: number;
  seed: number;
}

export type QuiDeNousAction =
  | { type: 'VOTE'; targetId: string } // le votant courant désigne un joueur
  | { type: 'NEXT' };

const INTENSITY_FACTOR: Record<DrinkIntensity, number> = { soft: 0.5, normal: 1, hardcore: 1.5 };

function startRound(state: QuiDeNousState, round: number): QuiDeNousState {
  const prompt = state.pool.length > 0 ? (state.pool[state.poolIdx % state.pool.length] as string) : '???';
  return {
    ...state,
    round,
    phase: 'vote',
    prompt,
    voterIdx: 0,
    votes: {},
    poolIdx: state.poolIdx + 1,
    lastOutcome: null,
  };
}

function resolveRound(state: QuiDeNousState): QuiDeNousState {
  const votesByTarget: Record<string, number> = {};
  for (const voter of state.order) {
    const target = state.votes[voter];
    if (target) votesByTarget[target] = (votesByTarget[target] ?? 0) + 1;
  }
  let maxVotes = 0;
  for (const id of state.order) maxVotes = Math.max(maxVotes, votesByTarget[id] ?? 0);
  const winners = maxVotes > 0 ? state.order.filter((id) => (votesByTarget[id] ?? 0) === maxVotes) : [];

  const scores = { ...state.scores };
  for (const id of state.order) scores[id] = (scores[id] ?? 0) + (votesByTarget[id] ?? 0);

  // Gorgées = nombre de doigts pointés, modulé par l'intensité (min 1).
  const sips = Math.max(1, Math.round(maxVotes * INTENSITY_FACTOR[state.config.drinkIntensity]));
  const sipsById = { ...state.sipsById };
  if (state.config.drinksEnabled) for (const id of winners) sipsById[id] = (sipsById[id] ?? 0) + sips;

  return {
    ...state,
    phase: 'result',
    scores,
    sipsById,
    lastOutcome: {
      prompt: state.prompt,
      votesByTarget,
      winners,
      maxVotes,
      sips: state.config.drinksEnabled ? sips : 0,
    },
  };
}

export function createQuiDeNousState(args: {
  config: QuiDeNousConfig;
  players: Player[];
  pool: readonly string[];
  seed: number;
  order?: string[];
}): QuiDeNousState {
  const order = args.order ?? args.players.map((p) => p.id);
  const rng = mulberry32(args.seed >>> 0);
  const pool = shuffle([...args.pool], rng);
  const base: QuiDeNousState = {
    config: args.config,
    players: args.players,
    order,
    round: 0,
    totalRounds: Math.max(1, args.config.rounds),
    phase: 'vote',
    prompt: '',
    voterIdx: 0,
    votes: {},
    lastOutcome: null,
    scores: {},
    sipsById: {},
    pool,
    poolIdx: 0,
    seed: args.seed >>> 0,
  };
  if (order.length < 3) return { ...base, phase: 'finished' };
  return startRound(base, 1);
}

export function quiDeNousReducer(state: QuiDeNousState, action: QuiDeNousAction): QuiDeNousState {
  if (state.phase === 'finished') return state;
  switch (action.type) {
    case 'VOTE': {
      if (state.phase !== 'vote') return state;
      const voter = state.order[state.voterIdx];
      if (!voter) return state;
      if (!state.order.includes(action.targetId)) return state;
      const votes = { ...state.votes, [voter]: action.targetId };
      const nextIdx = state.voterIdx + 1;
      const voted = { ...state, votes, voterIdx: nextIdx };
      if (nextIdx >= state.order.length) return resolveRound(voted);
      return voted;
    }
    case 'NEXT': {
      if (state.phase !== 'result') return state;
      if (state.round >= state.totalRounds) return { ...state, phase: 'finished' };
      return startRound(state, state.round + 1);
    }
  }
}

/** Classement : plus de votes reçus (la vedette) d'abord ; égalité = même rang. */
export function quiDeNousRanking(state: QuiDeNousState): string[] {
  return [...state.order].sort((a, b) => (state.scores[b] ?? 0) - (state.scores[a] ?? 0));
}

export function quiDeNousToSessionResult(
  state: QuiDeNousState,
  startedAt: number,
  endedAt: number,
): SessionResult {
  const ranked = quiDeNousRanking(state);
  let lastPoints: number | null = null;
  let lastRank = 0;
  const players: PlayerSessionResult[] = ranked.map((id, i) => {
    const points = state.scores[id] ?? 0;
    const rank = lastPoints !== null && points === lastPoints ? lastRank : i + 1;
    lastPoints = points;
    lastRank = rank;
    return { playerId: id, points, rank, sipsDrunk: state.sipsById[id] ?? 0, sipsGiven: 0 };
  });
  return { gameId: 'quidenous', mode: 'quidenous', config: { ...state.config }, startedAt, endedAt, players };
}
