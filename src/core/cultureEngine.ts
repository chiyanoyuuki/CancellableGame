/**
 * « Culture ou gage » — moteur pur et testable.
 *
 * Téléphone qui tourne : à tour de rôle, un joueur reçoit une question éclair à
 * choix multiple. Bonne réponse → +1 point, il s'en sort. Mauvaise réponse → il
 * pioche un gage (et, en option, des gorgées). Chaque joueur répond au même
 * nombre de questions, puis classement final par bonnes réponses.
 */
import { type DareCategory } from './dares';
import type { DrinkIntensity, Player, PlayerSessionResult, SessionResult } from './models';
import { mulberry32, pick, type Rng, shuffle } from './rng';

/** Question minimale (indépendante du type Question complet). */
export interface QCard {
  id: string;
  text: string;
  options: string[];
  answer: string;
}

export interface CultureConfig {
  /** Questions posées à CHAQUE joueur. */
  questionsPerPlayer: number;
  drinksEnabled: boolean;
  drinkIntensity: DrinkIntensity;
  /** Catégorie de gage piochée sur une mauvaise réponse. */
  dareCategory: DareCategory;
  /** Thèmes d'où viennent les questions ([] ou absent = tous). Filtré par l'écran. */
  themes?: string[];
  /** Univers exclus au sein des thèmes retenus. Filtré par l'écran. */
  excludedUniverses?: string[];
}

export type CulturePhase = 'question' | 'result' | 'finished';

export interface CultureOutcome {
  correct: boolean;
  answer: string;
  picked: string;
  /** Gage à faire (mauvaise réponse) ; '' si bonne réponse. */
  dare: string;
  sips: number;
}

export interface CultureState {
  config: CultureConfig;
  players: Player[];
  order: string[];
  turnIdx: number; // index dans order du joueur courant
  asked: number; // nombre total de questions déjà posées
  totalQuestions: number;
  phase: CulturePhase;
  card: QCard;
  selected: string | null;
  lastOutcome: CultureOutcome | null;
  scores: Record<string, number>;
  sipsById: Record<string, number>;
  deck: QCard[];
  deckIdx: number;
  dares: string[];
  seed: number;
  step: number;
}

export type CultureAction = { type: 'ANSWER'; choice: string } | { type: 'NEXT' };

const SIPS_BY_INTENSITY: Record<DrinkIntensity, number> = { soft: 1, normal: 2, hardcore: 3 };

function stepRng(state: CultureState): { rng: Rng; step: number } {
  const step = state.step + 1;
  return { rng: mulberry32((state.seed ^ Math.imul(step, 0x9e3779b1)) >>> 0), step };
}

function loadCard(state: CultureState): CultureState {
  const card =
    state.deck.length > 0
      ? (state.deck[state.deckIdx % state.deck.length] as QCard)
      : { id: '?', text: '???', options: ['?'], answer: '?' };
  return { ...state, card, deckIdx: state.deckIdx + 1, selected: null, phase: 'question' };
}

export function createCultureState(args: {
  config: CultureConfig;
  players: Player[];
  deck: readonly QCard[];
  dares: readonly string[];
  seed: number;
  order?: string[];
}): CultureState {
  const order = args.order ?? args.players.map((p) => p.id);
  const rng = mulberry32(args.seed >>> 0);
  const deck = shuffle([...args.deck], rng);
  const perPlayer = Math.max(1, args.config.questionsPerPlayer);
  const base: CultureState = {
    config: args.config,
    players: args.players,
    order,
    turnIdx: 0,
    asked: 0,
    totalQuestions: order.length * perPlayer,
    phase: 'question',
    card: { id: '', text: '', options: [], answer: '' },
    selected: null,
    lastOutcome: null,
    scores: {},
    sipsById: {},
    deck,
    deckIdx: 0,
    dares: [...args.dares],
    seed: args.seed >>> 0,
    step: 0,
  };
  if (order.length < 1 || deck.length === 0) return { ...base, phase: 'finished' };
  return loadCard(base);
}

export function cultureReducer(state: CultureState, action: CultureAction): CultureState {
  if (state.phase === 'finished') return state;
  switch (action.type) {
    case 'ANSWER': {
      if (state.phase !== 'question') return state;
      const player = state.order[state.turnIdx];
      if (!player) return state;
      const correct = action.choice === state.card.answer;
      const scores = { ...state.scores };
      const sipsById = { ...state.sipsById };
      let dare = '';
      let sips = 0;
      if (correct) {
        scores[player] = (scores[player] ?? 0) + 1;
      } else {
        const { rng, step: st } = stepRng(state);
        dare = state.dares.length > 0 ? pick(state.dares, rng) : '';
        if (state.config.drinksEnabled) {
          sips = SIPS_BY_INTENSITY[state.config.drinkIntensity];
          sipsById[player] = (sipsById[player] ?? 0) + sips;
        }
        return {
          ...state,
          step: st,
          phase: 'result',
          selected: action.choice,
          scores,
          sipsById,
          lastOutcome: { correct, answer: state.card.answer, picked: action.choice, dare, sips },
        };
      }
      return {
        ...state,
        phase: 'result',
        selected: action.choice,
        scores,
        sipsById,
        lastOutcome: { correct, answer: state.card.answer, picked: action.choice, dare, sips },
      };
    }
    case 'NEXT': {
      if (state.phase !== 'result') return state;
      const asked = state.asked + 1;
      if (asked >= state.totalQuestions) return { ...state, asked, phase: 'finished' };
      const turnIdx = (state.turnIdx + 1) % state.order.length;
      return loadCard({ ...state, asked, turnIdx });
    }
  }
}

export function currentPlayerId(state: CultureState): string | null {
  return state.order[state.turnIdx] ?? null;
}

/** Classement : plus de bonnes réponses d'abord ; égalité = même rang. */
export function cultureRanking(state: CultureState): string[] {
  return [...state.order].sort((a, b) => (state.scores[b] ?? 0) - (state.scores[a] ?? 0));
}

export function cultureToSessionResult(state: CultureState, startedAt: number, endedAt: number): SessionResult {
  const ranked = cultureRanking(state);
  let lastPoints: number | null = null;
  let lastRank = 0;
  const players: PlayerSessionResult[] = ranked.map((id, i) => {
    const points = state.scores[id] ?? 0;
    const rank = lastPoints !== null && points === lastPoints ? lastRank : i + 1;
    lastPoints = points;
    lastRank = rank;
    return { playerId: id, points, rank, sipsDrunk: state.sipsById[id] ?? 0, sipsGiven: 0 };
  });
  return { gameId: 'cultureougage', mode: 'cultureougage', config: { ...state.config }, startedAt, endedAt, players };
}
