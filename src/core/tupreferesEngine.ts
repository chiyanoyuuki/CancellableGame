/**
 * « Tu préfères ? » — moteur pur et testable (aucun import React Native).
 *
 * Téléphone qui tourne : à chaque manche un dilemme s'affiche (option A ou B).
 * Chacun vote en secret en passant le téléphone, puis on révèle le partage.
 * Par défaut la MINORITÉ boit (les originaux !) et la majorité marque un point
 * (« tu penses comme le groupe »). Égalité parfaite = tout le monde trinque.
 * Plusieurs manches, puis un classement final.
 */
import type { DrinkIntensity, Player, PlayerSessionResult, SessionResult } from './models';
import { mulberry32, type Rng, shuffle } from './rng';

/** Un dilemme : deux options que tout oppose. */
export interface Dilemma {
  a: string;
  b: string;
}

/** Quel camp boit : la minorité (défaut) ou la majorité. */
export type DrinkingSide = 'minority' | 'majority';

export interface TuPreferesConfig {
  rounds: number;
  drinksEnabled: boolean;
  drinkIntensity: DrinkIntensity;
  /** Camp qui boit à chaque manche. */
  drinkingSide: DrinkingSide;
}

export type TuPreferesPhase = 'vote' | 'result' | 'finished';
export type Vote = 'a' | 'b';

export interface TuPreferesOutcome {
  a: string;
  b: string;
  votesA: number;
  votesB: number;
  /** Camp qui boit ('a', 'b' ou null si égalité → tout le monde trinque). */
  drinkingChoice: Vote | null;
  tie: boolean;
  /** Joueurs qui boivent cette manche. */
  drinkers: string[];
  sips: number;
}

export interface TuPreferesState {
  config: TuPreferesConfig;
  players: Player[];
  order: string[];
  round: number;
  totalRounds: number;
  phase: TuPreferesPhase;
  // --- Manche en cours ---
  dilemma: Dilemma;
  /** Index du joueur en train de voter (téléphone qui tourne). */
  voterIdx: number;
  /** Vote de chaque joueur pour la manche en cours. */
  votes: Record<string, Vote>;
  lastOutcome: TuPreferesOutcome | null;
  // --- Cumuls ---
  scores: Record<string, number>;
  sipsById: Record<string, number>;
  // --- Pioche de dilemmes ---
  pool: Dilemma[];
  poolIdx: number;
  seed: number;
}

export type TuPreferesAction =
  | { type: 'VOTE'; vote: Vote } // le joueur courant vote, on passe au suivant
  | { type: 'NEXT' };

const SIPS_BY_INTENSITY: Record<DrinkIntensity, number> = { soft: 1, normal: 2, hardcore: 3 };
const MAJORITY_POINTS = 1;

function startRound(state: TuPreferesState, round: number): TuPreferesState {
  const dilemma =
    state.pool.length > 0
      ? (state.pool[state.poolIdx % state.pool.length] as Dilemma)
      : { a: '???', b: '???' };
  return {
    ...state,
    round,
    phase: 'vote',
    dilemma,
    voterIdx: 0,
    votes: {},
    poolIdx: state.poolIdx + 1,
    lastOutcome: null,
  };
}

function resolveRound(state: TuPreferesState): TuPreferesState {
  let votesA = 0;
  let votesB = 0;
  for (const id of state.order) {
    if (state.votes[id] === 'a') votesA += 1;
    else if (state.votes[id] === 'b') votesB += 1;
  }
  const tie = votesA === votesB;
  // Camp qui boit selon la config (la minorité par défaut).
  let drinkingChoice: Vote | null = null;
  if (!tie) {
    const minoritySide: Vote = votesA < votesB ? 'a' : 'b';
    const majoritySide: Vote = votesA < votesB ? 'b' : 'a';
    drinkingChoice = state.config.drinkingSide === 'minority' ? minoritySide : majoritySide;
  }

  const scores = { ...state.scores };
  const sipsById = { ...state.sipsById };

  // La majorité marque un point (personne en cas d'égalité).
  if (!tie) {
    const majoritySide: Vote = votesA < votesB ? 'b' : 'a';
    for (const id of state.order) {
      if (state.votes[id] === majoritySide) scores[id] = (scores[id] ?? 0) + MAJORITY_POINTS;
    }
  }

  const sips = SIPS_BY_INTENSITY[state.config.drinkIntensity];
  // Égalité : tout le monde trinque. Sinon, le camp désigné boit.
  const drinkers = tie
    ? [...state.order]
    : state.order.filter((id) => state.votes[id] === drinkingChoice);
  if (state.config.drinksEnabled) for (const id of drinkers) sipsById[id] = (sipsById[id] ?? 0) + sips;

  return {
    ...state,
    phase: 'result',
    scores,
    sipsById,
    lastOutcome: {
      a: state.dilemma.a,
      b: state.dilemma.b,
      votesA,
      votesB,
      drinkingChoice,
      tie,
      drinkers: state.config.drinksEnabled ? drinkers : [],
      sips: state.config.drinksEnabled ? sips : 0,
    },
  };
}

export function createTuPreferesState(args: {
  config: TuPreferesConfig;
  players: Player[];
  pool: readonly Dilemma[];
  seed: number;
  order?: string[];
}): TuPreferesState {
  const order = args.order ?? args.players.map((p) => p.id);
  const rng = mulberry32(args.seed >>> 0);
  const pool = shuffle([...args.pool], rng);
  const base: TuPreferesState = {
    config: args.config,
    players: args.players,
    order,
    round: 0,
    totalRounds: Math.max(1, args.config.rounds),
    phase: 'vote',
    dilemma: { a: '', b: '' },
    voterIdx: 0,
    votes: {},
    lastOutcome: null,
    scores: {},
    sipsById: {},
    pool,
    poolIdx: 0,
    seed: args.seed >>> 0,
  };
  if (order.length < 2) return { ...base, phase: 'finished' };
  return startRound(base, 1);
}

export function tuPreferesReducer(state: TuPreferesState, action: TuPreferesAction): TuPreferesState {
  if (state.phase === 'finished') return state;
  switch (action.type) {
    case 'VOTE': {
      if (state.phase !== 'vote') return state;
      const voter = state.order[state.voterIdx];
      if (!voter) return state;
      const votes = { ...state.votes, [voter]: action.vote };
      const nextIdx = state.voterIdx + 1;
      const voted = { ...state, votes, voterIdx: nextIdx };
      // Dernier votant → on résout la manche.
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

/** Classement : plus de points d'abord ; égalité = même rang. */
export function tuPreferesRanking(state: TuPreferesState): string[] {
  return [...state.order].sort((a, b) => (state.scores[b] ?? 0) - (state.scores[a] ?? 0));
}

export function tuPreferesToSessionResult(
  state: TuPreferesState,
  startedAt: number,
  endedAt: number,
): SessionResult {
  const ranked = tuPreferesRanking(state);
  let lastPoints: number | null = null;
  let lastRank = 0;
  const players: PlayerSessionResult[] = ranked.map((id, i) => {
    const points = state.scores[id] ?? 0;
    const rank = lastPoints !== null && points === lastPoints ? lastRank : i + 1;
    lastPoints = points;
    lastRank = rank;
    return { playerId: id, points, rank, sipsDrunk: state.sipsById[id] ?? 0, sipsGiven: 0 };
  });
  return { gameId: 'tupreferes', mode: 'tupreferes', config: { ...state.config }, startedAt, endedAt, players };
}
