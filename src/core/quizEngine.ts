import { type DrinkChallenge, type DrinkOutcome, DRINK_CHALLENGES, maybeChallenge, rollAnswerDrink } from './drinks';
import type {
  GameEvent,
  Player,
  PlayerSessionResult,
  Question,
  QuizConfig,
  SessionResult,
  Theme,
} from './models';
import { mulberry32, type Rng, shuffle } from './rng';
import { scoreAnswer, type ScoreBreakdown } from './scoring';

/**
 * The quiz as a pure state machine.
 *
 * The React Native screen owns NO game logic: it renders `QuizState`, measures
 * answer time, and dispatches actions. Everything else — option shuffling, turn
 * rotation, scoring, gorgées, challenges, ranking — lives here and is unit
 * tested. Randomness is derived from `seed` + `step`, so the state stays
 * serialisable and a fixed seed replays identically.
 */

export type QuizPhase = 'question' | 'reveal' | 'challenge' | 'finished';

export interface QuizPlayerScore {
  playerId: string;
  points: number;
  correct: number;
  wrong: number;
  sipsDrunk: number;
  sipsGiven: number;
}

export interface QuizAnswerPayload {
  playerId: string;
  questionId: string;
  theme: Theme;
  difficulty: number;
  correct: boolean;
  hintsUsed: number;
  timeMs: number | null;
  points: number;
  sipsDrunk: number;
  sipsGiven: number;
}

export interface AnswerOutcome {
  correct: boolean;
  correctAnswer: string;
  score: ScoreBreakdown;
  drink: DrinkOutcome;
}

export interface QuizState {
  config: QuizConfig;
  players: Player[];
  /** Player ids in the (shuffled) turn order. */
  order: string[];
  questions: Question[];
  index: number;
  phase: QuizPhase;
  seed: number;
  step: number;
  /** Shuffled options for the current question (QCM); empty in open mode. */
  currentOptions: string[];
  hintsRevealed: number;
  /** Whose turn (turn mode) or who buzzed (fastest); null until resolved. */
  activePlayerId: string | null;
  lastOutcome: AnswerOutcome | null;
  pendingChallenge: DrinkChallenge | null;
  scores: Record<string, QuizPlayerScore>;
  answers: QuizAnswerPayload[];
  /** Pool of drink challenges (built-in + custom). */
  challenges: DrinkChallenge[];
}

export type QuizAction =
  | { type: 'REVEAL_HINT' }
  | { type: 'SUBMIT'; playerId: string; correct: boolean; timeMs?: number | null }
  | { type: 'SKIP' } // nobody found the answer (fastest mode)
  | { type: 'CONTINUE' };

function emptyScore(playerId: string): QuizPlayerScore {
  return { playerId, points: 0, correct: 0, wrong: 0, sipsDrunk: 0, sipsGiven: 0 };
}

/** Derive a fresh rng for the next random step (keeps state serialisable). */
function stepRng(state: QuizState): { rng: Rng; step: number } {
  const rng = mulberry32((state.seed ^ Math.imul(state.step + 1, 0x9e3779b1)) >>> 0);
  return { rng, step: state.step + 1 };
}

/** Number of hints available for the current question, honouring the config. */
export function availableHints(state: QuizState): number {
  if (!state.config.hintsEnabled) return 0;
  return state.questions[state.index]?.hints?.length ?? 0;
}

function setupQuestion(state: QuizState): QuizState {
  const q = state.questions[state.index];
  if (!q) return { ...state, phase: 'finished' };

  const { rng, step } = stepRng(state);
  const currentOptions =
    state.config.answerFormat === 'choices' ? shuffle([q.answer, ...q.distractors.slice(0, 3)], rng) : [];

  const activePlayerId =
    state.config.turnMode === 'turn' && state.order.length > 0
      ? (state.order[state.index % state.order.length] ?? null)
      : null;

  return {
    ...state,
    step,
    phase: 'question',
    currentOptions,
    hintsRevealed: 0,
    activePlayerId,
    lastOutcome: null,
    pendingChallenge: null,
  };
}

export function createQuizState(args: {
  config: QuizConfig;
  players: Player[];
  questions: Question[];
  seed: number;
  challenges?: DrinkChallenge[];
}): QuizState {
  const order = shuffle(args.players, mulberry32(args.seed >>> 0)).map((p) => p.id);
  const scores: Record<string, QuizPlayerScore> = {};
  for (const p of args.players) scores[p.id] = emptyScore(p.id);

  const base: QuizState = {
    config: args.config,
    players: args.players,
    order,
    questions: args.questions,
    index: 0,
    phase: 'question',
    seed: args.seed >>> 0,
    step: 0,
    currentOptions: [],
    hintsRevealed: 0,
    activePlayerId: null,
    lastOutcome: null,
    pendingChallenge: null,
    scores,
    answers: [],
    challenges: args.challenges && args.challenges.length > 0 ? args.challenges : DRINK_CHALLENGES,
  };

  if (args.questions.length === 0) return { ...base, phase: 'finished' };
  return setupQuestion(base);
}

function advance(state: QuizState): QuizState {
  const nextIndex = state.index + 1;
  if (nextIndex >= state.questions.length) {
    return { ...state, index: state.questions.length, phase: 'finished' };
  }
  return setupQuestion({ ...state, index: nextIndex });
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'REVEAL_HINT': {
      if (state.phase !== 'question') return state;
      if (state.hintsRevealed >= availableHints(state)) return state;
      return { ...state, hintsRevealed: state.hintsRevealed + 1 };
    }

    case 'SUBMIT': {
      if (state.phase !== 'question') return state;
      const q = state.questions[state.index];
      if (!q) return state;

      const { rng, step } = stepRng(state);

      const score = scoreAnswer({
        difficulty: q.difficulty,
        correct: action.correct,
        answerFormat: state.config.answerFormat,
        turnMode: state.config.turnMode,
        hintsUsed: state.hintsRevealed,
        timeMs: action.timeMs ?? null,
        timeLimitMs: state.config.fastestTimeLimitMs,
      });

      const drink: DrinkOutcome = state.config.drinksEnabled
        ? rollAnswerDrink({
            correct: action.correct,
            difficulty: q.difficulty,
            turnMode: state.config.turnMode,
            hintsUsed: state.hintsRevealed,
            intensity: state.config.drinkIntensity,
            rng,
          })
        : { sipsDrunk: 0, sipsGiven: 0, reason: '' };

      const prev = state.scores[action.playerId] ?? emptyScore(action.playerId);
      const updated: QuizPlayerScore = {
        playerId: action.playerId,
        points: prev.points + score.total,
        correct: prev.correct + (action.correct ? 1 : 0),
        wrong: prev.wrong + (action.correct ? 0 : 1),
        sipsDrunk: prev.sipsDrunk + drink.sipsDrunk,
        sipsGiven: prev.sipsGiven + drink.sipsGiven,
      };

      const answer: QuizAnswerPayload = {
        playerId: action.playerId,
        questionId: q.id,
        theme: q.theme,
        difficulty: q.difficulty,
        correct: action.correct,
        hintsUsed: state.hintsRevealed,
        timeMs: action.timeMs ?? null,
        points: score.total,
        sipsDrunk: drink.sipsDrunk,
        sipsGiven: drink.sipsGiven,
      };

      return {
        ...state,
        step,
        phase: 'reveal',
        activePlayerId: action.playerId,
        lastOutcome: { correct: action.correct, correctAnswer: q.answer, score, drink },
        scores: { ...state.scores, [action.playerId]: updated },
        answers: [...state.answers, answer],
      };
    }

    case 'SKIP': {
      if (state.phase !== 'question') return state;
      const q = state.questions[state.index];
      if (!q) return state;
      return {
        ...state,
        phase: 'reveal',
        activePlayerId: null,
        lastOutcome: {
          correct: false,
          correctAnswer: q.answer,
          score: { base: 0, afterFormat: 0, afterHints: 0, speedBonus: 0, total: 0 },
          drink: { sipsDrunk: 0, sipsGiven: 0, reason: 'Personne n\'a trouvé 🤷' },
        },
      };
    }

    case 'CONTINUE': {
      if (state.phase === 'reveal') {
        const { rng, step } = stepRng(state);
        const challenge = state.config.drinksEnabled
          ? maybeChallenge(rng, state.config.drinkIntensity, state.challenges)
          : null;
        if (challenge) return { ...state, step, phase: 'challenge', pendingChallenge: challenge };
        return advance({ ...state, step });
      }
      if (state.phase === 'challenge') return advance(state);
      return state;
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function getRanking(state: QuizState): QuizPlayerScore[] {
  return Object.values(state.scores).sort((a, b) => b.points - a.points || b.correct - a.correct);
}

export function currentQuestion(state: QuizState): Question | null {
  return state.questions[state.index] ?? null;
}

export function progress(state: QuizState): { current: number; total: number } {
  return { current: Math.min(state.index + 1, state.questions.length), total: state.questions.length };
}

/** Convert a finished game into the generic, persistable SessionResult. */
export function toSessionResult(state: QuizState, startedAt: number, endedAt: number): SessionResult {
  const ranking = getRanking(state);
  const players: PlayerSessionResult[] = ranking.map((s, i) => ({
    playerId: s.playerId,
    points: s.points,
    rank: i + 1,
    sipsDrunk: s.sipsDrunk,
    sipsGiven: s.sipsGiven,
    details: { correct: s.correct, wrong: s.wrong },
  }));

  const events: GameEvent[] = state.answers.map((a) => ({
    type: 'answer',
    playerId: a.playerId,
    at: 0,
    payload: { ...a },
  }));

  return {
    gameId: 'quiz',
    mode: `${state.config.turnMode}/${state.config.answerFormat}`,
    config: { ...state.config },
    startedAt,
    endedAt,
    players,
    events,
  };
}
