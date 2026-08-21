/**
 * « L'Imposteur » — moteur pur et testable (aucun import React Native).
 *
 * Déduction sociale, téléphone qui tourne. À chaque manche, le jeu tire un MOT
 * secret (une réponse concrète tirée d'un univers) et le montre à tout le monde
 * SAUF à l'imposteur, qui ne voit que l'univers (la catégorie). Chacun donne un
 * indice à l'oral ; l'imposteur bluffe. On vote pour un suspect : s'il est
 * l'imposteur, il tente de deviner le mot pour renverser la manche. Points et
 * gorgées à la clé, sur plusieurs manches, puis un classement final.
 */
import type { DrinkIntensity, Player, PlayerSessionResult, SessionResult } from './models';
import { mulberry32, type Rng, shuffle } from './rng';

/** Mode d'indice pour l'imposteur (voir ImposteurConfig.imposterHint). */
export type ImposterHint = 'none' | 'close';

export interface ImposteurConfig {
  /** Univers d'où proviennent les mots secrets (résolus par l'écran de config :
   * soit ceux gardés par tous les profils, soit un choix manuel). */
  universes: string[];
  /** Nombre de manches. */
  rounds: number;
  /** Nombre d'imposteurs par manche (1 ou 2). */
  imposterCount: number;
  /** Indice donné à l'imposteur :
   *  - 'none'  : il ne voit que l'univers (défaut, façon « Mr. White ») ;
   *  - 'close' : il reçoit un mot PROCHE (même univers) pour bluffer sans être perdu. */
  imposterHint: ImposterHint;
  /** Minuteur de discussion en secondes (0 = pas de minuteur). */
  discussionSec: number;
  drinksEnabled: boolean;
  drinkIntensity: DrinkIntensity;
}

/** Un mot secret candidat : le mot lui-même et l'univers (catégorie) affichée. */
export interface WordCard {
  word: string;
  universe: string;
  theme: string;
}

export type ImposteurPhase = 'reveal' | 'discuss' | 'vote' | 'guess' | 'result' | 'finished';

export interface ImposteurOutcome {
  crewWon: boolean;
  accusedId: string | null;
  accusedWasImposter: boolean;
  imposterGuessed: boolean;
  imposterIds: string[];
  word: string;
  universe: string;
  /** Joueurs qui boivent cette manche. */
  drinkers: string[];
  /** Gorgées par buveur. */
  sips: number;
}

export interface ImposteurState {
  config: ImposteurConfig;
  players: Player[];
  /** Ensemble stable des identifiants de joueurs. */
  order: string[];
  round: number;
  totalRounds: number;
  phase: ImposteurPhase;
  // --- Données de la manche en cours ---
  word: string;
  universe: string;
  theme: string;
  /** Mot proche donné à l'imposteur (mode 'close') ; '' sinon. */
  imposterWord: string;
  imposterIds: string[];
  /** Ordre (mélangé) de passage du téléphone pour la révélation des rôles. */
  revealOrder: string[];
  revealIdx: number;
  accusedId: string | null;
  // --- Cumuls sur la partie ---
  scores: Record<string, number>;
  sipsById: Record<string, number>;
  imposterRounds: Record<string, number>;
  lastOutcome: ImposteurOutcome | null;
  // --- Pioche de mots ---
  pool: WordCard[];
  poolIdx: number;
  seed: number;
  step: number;
}

export type ImposteurAction =
  | { type: 'SEEN' } // un joueur a vu son rôle, on passe au suivant
  | { type: 'START_VOTE' }
  | { type: 'ACCUSE'; playerId: string }
  | { type: 'GUESS'; correct: boolean }
  | { type: 'NEXT' };

const SIPS_BY_INTENSITY: Record<DrinkIntensity, number> = { soft: 1, normal: 2, hardcore: 3 };
const CREW_WIN_POINTS = 2;
const IMPOSTER_WIN_POINTS = 3;

/** Filtre un « bon » mot secret : concret, sans être une date ou un nombre. */
export function isGoodImposteurWord(answer: string): boolean {
  const a = (answer ?? '').trim();
  if (a.length < 2 || a.length > 28) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(a)) return false; // doit contenir une lettre
  if (a.includes('\n')) return false;
  const digits = (a.match(/\d/g) ?? []).length;
  if (digits > 2) return false; // écarte années/dates « 1999 »…
  return true;
}

function stepRng(state: ImposteurState): { rng: Rng; step: number } {
  const step = state.step + 1;
  return { rng: mulberry32((state.seed ^ Math.imul(step, 0x9e3779b1)) >>> 0), step };
}

function startRound(state: ImposteurState, round: number): ImposteurState {
  const { rng, step } = stepRng(state);
  const card =
    state.pool.length > 0
      ? (state.pool[state.poolIdx % state.pool.length] as WordCard)
      : { word: '???', universe: '???', theme: '' };
  const count = Math.max(1, Math.min(state.config.imposterCount, state.order.length - 1));
  const imposterIds = shuffle(state.order, rng).slice(0, count);
  const revealOrder = shuffle(state.order, rng);
  // Mode « mot proche » : on donne à l'imposteur un autre mot du MÊME univers,
  // pour qu'il puisse bluffer sans être totalement perdu. S'il n'existe aucun
  // autre mot dans cet univers, on retombe sur le mode sans mot ('').
  let imposterWord = '';
  if (state.config.imposterHint === 'close') {
    const sameUniverse = state.pool.filter((c) => c.universe === card.universe && c.word !== card.word);
    if (sameUniverse.length > 0) imposterWord = (shuffle(sameUniverse, rng)[0] as WordCard).word;
  }
  return {
    ...state,
    step,
    round,
    phase: 'reveal',
    word: card.word,
    universe: card.universe,
    theme: card.theme,
    imposterWord,
    imposterIds,
    revealOrder,
    revealIdx: 0,
    accusedId: null,
    poolIdx: state.poolIdx + 1,
    lastOutcome: null,
  };
}

function resolveRound(state: ImposteurState, imposterGuessed: boolean): ImposteurState {
  const accusedWasImposter = state.accusedId ? state.imposterIds.includes(state.accusedId) : false;
  const crewWon = accusedWasImposter && !imposterGuessed;
  const imposterSet = new Set(state.imposterIds);
  const crew = state.order.filter((id) => !imposterSet.has(id));

  const scores = { ...state.scores };
  const sipsById = { ...state.sipsById };
  const imposterRounds = { ...state.imposterRounds };
  for (const id of state.imposterIds) imposterRounds[id] = (imposterRounds[id] ?? 0) + 1;

  const drinkers = crewWon ? [...state.imposterIds] : crew;
  if (crewWon) {
    for (const id of crew) scores[id] = (scores[id] ?? 0) + CREW_WIN_POINTS;
  } else {
    for (const id of state.imposterIds) scores[id] = (scores[id] ?? 0) + IMPOSTER_WIN_POINTS;
  }

  const sips = SIPS_BY_INTENSITY[state.config.drinkIntensity];
  if (state.config.drinksEnabled) for (const id of drinkers) sipsById[id] = (sipsById[id] ?? 0) + sips;

  return {
    ...state,
    phase: 'result',
    scores,
    sipsById,
    imposterRounds,
    lastOutcome: {
      crewWon,
      accusedId: state.accusedId,
      accusedWasImposter,
      imposterGuessed,
      imposterIds: state.imposterIds,
      word: state.word,
      universe: state.universe,
      drinkers: state.config.drinksEnabled ? drinkers : [],
      sips: state.config.drinksEnabled ? sips : 0,
    },
  };
}

export function createImposteurState(args: {
  config: ImposteurConfig;
  players: Player[];
  pool: readonly WordCard[];
  seed: number;
  order?: string[];
}): ImposteurState {
  const order = args.order ?? args.players.map((p) => p.id);
  const rng = mulberry32(args.seed >>> 0);
  const pool = shuffle([...args.pool], rng);
  const base: ImposteurState = {
    config: args.config,
    players: args.players,
    order,
    round: 0,
    totalRounds: Math.max(1, args.config.rounds),
    phase: 'reveal',
    word: '',
    universe: '',
    theme: '',
    imposterWord: '',
    imposterIds: [],
    revealOrder: order,
    revealIdx: 0,
    accusedId: null,
    scores: {},
    sipsById: {},
    imposterRounds: {},
    lastOutcome: null,
    pool,
    poolIdx: 0,
    seed: args.seed >>> 0,
    step: 0,
  };
  // Il faut au moins 3 joueurs pour une déduction sociale qui a du sens.
  if (order.length < 3) return { ...base, phase: 'finished' };
  return startRound(base, 1);
}

export function imposteurReducer(state: ImposteurState, action: ImposteurAction): ImposteurState {
  if (state.phase === 'finished') return state;
  switch (action.type) {
    case 'SEEN': {
      if (state.phase !== 'reveal') return state;
      const next = state.revealIdx + 1;
      if (next >= state.revealOrder.length) return { ...state, revealIdx: next, phase: 'discuss' };
      return { ...state, revealIdx: next };
    }
    case 'START_VOTE': {
      if (state.phase !== 'discuss') return state;
      return { ...state, phase: 'vote' };
    }
    case 'ACCUSE': {
      if (state.phase !== 'vote') return state;
      if (!state.order.includes(action.playerId)) return state;
      const caught = state.imposterIds.includes(action.playerId);
      const next = { ...state, accusedId: action.playerId };
      // Imposteur démasqué : il a une dernière chance de deviner le mot.
      if (caught) return { ...next, phase: 'guess' };
      // Mauvaise accusation : l'imposteur l'emporte tout de suite.
      return resolveRound(next, false);
    }
    case 'GUESS': {
      if (state.phase !== 'guess') return state;
      return resolveRound(state, action.correct);
    }
    case 'NEXT': {
      if (state.phase !== 'result') return state;
      if (state.round >= state.totalRounds) return { ...state, phase: 'finished' };
      return startRound(state, state.round + 1);
    }
  }
}

/** Classement : plus de points d'abord ; égalité = même rang. */
export function imposteurRanking(state: ImposteurState): string[] {
  return [...state.order].sort((a, b) => (state.scores[b] ?? 0) - (state.scores[a] ?? 0));
}

export function imposteurToSessionResult(
  state: ImposteurState,
  startedAt: number,
  endedAt: number,
): SessionResult {
  const ranked = imposteurRanking(state);
  let lastPoints: number | null = null;
  let lastRank = 0;
  const players: PlayerSessionResult[] = ranked.map((id, i) => {
    const points = state.scores[id] ?? 0;
    const rank = lastPoints !== null && points === lastPoints ? lastRank : i + 1;
    lastPoints = points;
    lastRank = rank;
    return {
      playerId: id,
      points,
      rank,
      sipsDrunk: state.sipsById[id] ?? 0,
      sipsGiven: 0,
      details: { imposterRounds: state.imposterRounds[id] ?? 0 },
    };
  });
  return { gameId: 'imposteur', mode: 'imposteur', config: { ...state.config }, startedAt, endedAt, players };
}
