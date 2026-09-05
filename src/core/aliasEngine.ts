/**
 * « Fais deviner » (façon Alias/Time's Up) — moteur pur et testable.
 *
 * Jeu d'équipes, téléphone qui tourne. À son tour, une équipe a un « décriveur »
 * qui voit un MOT (tiré des réponses du quiz) et le fait deviner à son équipe
 * SANS le prononcer, contre le chrono. Chaque mot trouvé = 1 point ; on peut
 * passer. À la fin du temps, l'équipe suivante joue. Après le même nombre de
 * tours pour toutes, l'équipe la plus haute gagne. (Le chrono est géré par
 * l'écran ; le moteur ne connaît pas le temps.)
 */
import type { PlayerSessionResult, SessionResult } from './models';
import { mulberry32, shuffle } from './rng';

export interface AliasTeam {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface AliasConfig {
  teams: AliasTeam[];
  /** Nombre de tours joués par CHAQUE équipe. */
  roundsPerTeam: number;
  /** Durée d'un tour en secondes (informatif ; l'écran gère le chrono). */
  roundSeconds: number;
  /** Thèmes d'où viennent les mots ([] ou absent = tous). Filtré par l'écran. */
  themes?: string[];
  /** Univers exclus au sein des thèmes retenus. Filtré par l'écran. */
  excludedUniverses?: string[];
}

export type AliasPhase = 'ready' | 'playing' | 'turnEnd' | 'finished';

/** Un mot du pool, avec son contexte pour aider à le faire deviner. */
export interface AliasWord {
  word: string;
  /** Code du thème d'origine (ex. 'manga'). */
  theme?: string;
  /** Nom de l'univers d'origine (ex. 'Naruto'). */
  universe?: string;
}

export interface AliasWordResult {
  word: string;
  found: boolean;
  /** Mot affiché au moment où le tour s'est terminé (temps écoulé) : montré dans le recap. */
  timedOut?: boolean;
}

export interface AliasState {
  config: AliasConfig;
  teams: AliasTeam[];
  turnIdx: number; // index de l'équipe courante
  roundsDone: number; // tours entièrement terminés (toutes équipes confondues)
  totalTurns: number; // teams.length * roundsPerTeam
  phase: AliasPhase;
  word: string;
  /** Thème/univers du mot courant, affichés au décriveur pendant la manche. */
  theme?: string;
  universe?: string;
  scores: Record<string, number>;
  /** Résultats mot par mot du tour EN COURS (recap de fin de tour). */
  turnResults: AliasWordResult[];
  pool: AliasWord[];
  poolIdx: number;
  seed: number;
}

export type AliasAction =
  | { type: 'START_TURN' }
  | { type: 'FOUND' }
  | { type: 'SKIP' }
  | { type: 'END_TURN'; timedOut?: boolean }
  | { type: 'NEXT_TURN' };

function nextWord(state: AliasState): { word: string; theme?: string; universe?: string; poolIdx: number } {
  if (state.pool.length === 0) return { word: '???', poolIdx: 0 };
  const entry = state.pool[state.poolIdx % state.pool.length] as AliasWord;
  return { word: entry.word, theme: entry.theme, universe: entry.universe, poolIdx: state.poolIdx + 1 };
}

export function currentTeam(state: AliasState): AliasTeam | null {
  return state.teams[state.turnIdx] ?? null;
}

export function createAliasState(args: {
  config: AliasConfig;
  pool: readonly (AliasWord | string)[];
  seed: number;
}): AliasState {
  const rng = mulberry32(args.seed >>> 0);
  const normalized: AliasWord[] = args.pool.map((p) => (typeof p === 'string' ? { word: p } : p));
  const pool = shuffle(normalized, rng);
  const teams = args.config.teams;
  const base: AliasState = {
    config: args.config,
    teams,
    turnIdx: 0,
    roundsDone: 0,
    totalTurns: teams.length * Math.max(1, args.config.roundsPerTeam),
    phase: 'ready',
    word: '',
    theme: undefined,
    universe: undefined,
    scores: {},
    turnResults: [],
    pool,
    poolIdx: 0,
    seed: args.seed >>> 0,
  };
  if (teams.length < 2 || pool.length === 0) return { ...base, phase: 'finished' };
  return base;
}

export function aliasReducer(state: AliasState, action: AliasAction): AliasState {
  if (state.phase === 'finished') return state;
  switch (action.type) {
    case 'START_TURN': {
      if (state.phase !== 'ready') return state;
      const nw = nextWord(state);
      return { ...state, phase: 'playing', word: nw.word, theme: nw.theme, universe: nw.universe, poolIdx: nw.poolIdx, turnResults: [] };
    }
    case 'FOUND': {
      if (state.phase !== 'playing') return state;
      const team = currentTeam(state);
      if (!team) return state;
      const scores = { ...state.scores, [team.id]: (state.scores[team.id] ?? 0) + 1 };
      const turnResults = [...state.turnResults, { word: state.word, found: true }];
      const nw = nextWord(state);
      return { ...state, scores, turnResults, word: nw.word, theme: nw.theme, universe: nw.universe, poolIdx: nw.poolIdx };
    }
    case 'SKIP': {
      if (state.phase !== 'playing') return state;
      const turnResults = [...state.turnResults, { word: state.word, found: false }];
      const nw = nextWord(state);
      return { ...state, turnResults, word: nw.word, theme: nw.theme, universe: nw.universe, poolIdx: nw.poolIdx };
    }
    case 'END_TURN': {
      if (state.phase !== 'playing') return state;
      // Le mot affiché quand le tour se termine (souvent au temps écoulé) rejoint le recap.
      const turnResults = state.word
        ? [...state.turnResults, { word: state.word, found: false, timedOut: !!action.timedOut }]
        : state.turnResults;
      return { ...state, turnResults, phase: 'turnEnd' };
    }
    case 'NEXT_TURN': {
      if (state.phase !== 'turnEnd') return state;
      const roundsDone = state.roundsDone + 1;
      if (roundsDone >= state.totalTurns) return { ...state, roundsDone, phase: 'finished' };
      return {
        ...state,
        roundsDone,
        turnIdx: (state.turnIdx + 1) % state.teams.length,
        phase: 'ready',
        turnResults: [],
        word: '',
        theme: undefined,
        universe: undefined,
      };
    }
  }
}

/** Classement des équipes par score décroissant. */
export function aliasRanking(state: AliasState): AliasTeam[] {
  return [...state.teams].sort((a, b) => (state.scores[b.id] ?? 0) - (state.scores[a.id] ?? 0));
}

/** Numéro du tour courant pour une équipe (1..roundsPerTeam), pour l'affichage. */
export function currentRoundForTeam(state: AliasState): number {
  return Math.floor(state.roundsDone / state.teams.length) + 1;
}

export function aliasToSessionResult(state: AliasState, startedAt: number, endedAt: number): SessionResult {
  const ranked = aliasRanking(state);
  let lastPoints: number | null = null;
  let lastRank = 0;
  const players: PlayerSessionResult[] = ranked.map((team, i) => {
    const points = state.scores[team.id] ?? 0;
    const rank = lastPoints !== null && points === lastPoints ? lastRank : i + 1;
    lastPoints = points;
    lastRank = rank;
    return {
      playerId: team.id,
      points,
      rank,
      sipsDrunk: 0,
      sipsGiven: 0,
      // Le résultat représente une ÉQUIPE : l'écran Résultats lit ces champs.
      details: { team: true, name: team.name, emoji: team.emoji, color: team.color },
    };
  });
  return { gameId: 'alias', mode: 'alias', config: { roundsPerTeam: state.config.roundsPerTeam, roundSeconds: state.config.roundSeconds }, startedAt, endedAt, players };
}
