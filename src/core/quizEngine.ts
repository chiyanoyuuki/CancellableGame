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
import { type PropsShown, scoreAnswer, type ScoreBreakdown } from './scoring';

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
  propsShown: PropsShown;
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
  /** Spare questions used to replace a broken-image question mid-round. */
  reserve: Question[];
  index: number;
  /** How many questions were voided (e.g. broken image). Informational. */
  voids: number;
  /** Rotation cursor over `order` (turn mode) — advances one step per question. */
  turnPos: number;
  /** Players currently paused ("standby"): the rotation skips them. */
  standby: string[];
  /** Missed turns owed to each player (accrue while on standby, spent on return). */
  owed: Record<string, number>;
  /** True when the current question is a returning player's catch-up burst. */
  activeCatchUp: boolean;
  phase: QuizPhase;
  seed: number;
  step: number;
  /** The four shuffled options for the current question (answer + 3 distractors). */
  currentOptions: string[];
  /** A two-option subset (answer + one distractor) shown for the "2 propositions" help. */
  pairOptions: string[];
  /** Propositions currently revealed for this question: 0 (libre), 2 or 4. */
  propsShown: PropsShown;
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
  | { type: 'REVEAL_PROPS'; count: 2 | 4 }
  | { type: 'SUBMIT'; playerId: string; correct: boolean; timeMs?: number | null }
  | { type: 'SKIP' } // nobody found the answer (fastest mode)
  | { type: 'IMAGE_FAILED' } // the current question's image won't load → void it
  | { type: 'TOGGLE_STANDBY'; playerId: string } // pause/resume a player mid-game
  | { type: 'CONTINUE' };

function emptyScore(playerId: string): QuizPlayerScore {
  return { playerId, points: 0, correct: 0, wrong: 0, sipsDrunk: 0, sipsGiven: 0 };
}

/** Derive a fresh rng for the next random step (keeps state serialisable). */
function stepRng(state: QuizState): { rng: Rng; step: number } {
  const rng = mulberry32((state.seed ^ Math.imul(state.step + 1, 0x9e3779b1)) >>> 0);
  return { rng, step: state.step + 1 };
}

/** Number of hints available for the current question. */
export function availableHints(state: QuizState): number {
  return state.questions[state.index]?.hints?.length ?? 0;
}

/**
 * Whose turn is the next question (turn mode) :
 *  - Priorité au rattrapage : un joueur revenu de pause avec des tours en
 *    retard répond d'abord, jusqu'à épuiser sa dette (« toutes ses questions
 *    d'un coup »).
 *  - Sinon rotation normale : on avance sur `order` en sautant les joueurs en
 *    pause, dont chaque tour manqué est comptabilisé dans `owed`.
 */
function assignTurn(state: QuizState): {
  activePlayerId: string | null;
  turnPos: number;
  owed: Record<string, number>;
  catchUp: boolean;
} {
  const order = state.order;
  const N = order.length;
  const standby = new Set(state.standby ?? []);
  const owed = { ...(state.owed ?? {}) };

  // Catch-up : un joueur de nouveau présent rattrape ses tours manqués.
  for (const pid of order) {
    if (!standby.has(pid) && (owed[pid] ?? 0) > 0) {
      owed[pid] = (owed[pid] ?? 0) - 1;
      return { activePlayerId: pid, turnPos: state.turnPos ?? 0, owed, catchUp: true };
    }
  }

  // Rotation normale, en sautant les joueurs en pause.
  let pos = state.turnPos ?? 0;
  for (let steps = 0; steps < N; steps++) {
    const pid = order[((pos % N) + N) % N] as string;
    pos += 1;
    if (standby.has(pid)) {
      owed[pid] = (owed[pid] ?? 0) + 1;
      continue;
    }
    return { activePlayerId: pid, turnPos: pos, owed, catchUp: false };
  }
  // Tout le monde en pause : personne ne répond.
  return { activePlayerId: null, turnPos: pos, owed, catchUp: false };
}

function setupQuestion(state: QuizState, keepTurn = false): QuizState {
  const q = state.questions[state.index];
  if (!q) return { ...state, phase: 'finished' };

  const { rng, step } = stepRng(state);
  // The full QCM (4 options) and a 2-option subset (answer + one distractor)
  // are always prepared; they are only *revealed* on demand during the round.
  const currentOptions = shuffle([q.answer, ...q.distractors.slice(0, 3)], rng);
  const pairOptions = shuffle([q.answer, q.distractors[0] ?? '???'], rng);

  // keepTurn : le même joueur reste (remplacement après une image cassée).
  let activePlayerId = state.activePlayerId;
  let turnPos = state.turnPos ?? 0;
  let owed = state.owed ?? {};
  let activeCatchUp = false;
  if (!keepTurn) {
    if (state.config.turnMode === 'turn' && state.order.length > 0) {
      const t = assignTurn(state);
      activePlayerId = t.activePlayerId;
      turnPos = t.turnPos;
      owed = t.owed;
      activeCatchUp = t.catchUp;
    } else {
      activePlayerId = null;
    }
  }

  return {
    ...state,
    step,
    phase: 'question',
    currentOptions,
    pairOptions,
    propsShown: 0,
    hintsRevealed: 0,
    activePlayerId,
    turnPos,
    owed,
    activeCatchUp,
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
  /** Precomputed turn order (player ids). Defaults to a seeded shuffle. */
  order?: string[];
  /** Spare questions to swap in when a question's image fails to load. */
  reserve?: Question[];
}): QuizState {
  const order = args.order ?? shuffle(args.players, mulberry32(args.seed >>> 0)).map((p) => p.id);
  const scores: Record<string, QuizPlayerScore> = {};
  for (const p of args.players) scores[p.id] = emptyScore(p.id);

  const base: QuizState = {
    config: args.config,
    players: args.players,
    order,
    questions: args.questions,
    reserve: args.reserve ?? [],
    index: 0,
    voids: 0,
    turnPos: 0,
    standby: [],
    owed: {},
    activeCatchUp: false,
    phase: 'question',
    seed: args.seed >>> 0,
    step: 0,
    currentOptions: [],
    pairOptions: [],
    propsShown: 0,
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

    case 'REVEAL_PROPS': {
      if (state.phase !== 'question') return state;
      // 2 propositions is the bigger help (÷4) and supersedes 4 (÷2); once at 2
      // there is nothing more to reveal, and 4 only applies from "libre" (0).
      if (state.propsShown === 2) return state;
      if (action.count === 4 && state.propsShown !== 0) return state;
      return { ...state, propsShown: action.count };
    }

    case 'SUBMIT': {
      if (state.phase !== 'question') return state;
      const q = state.questions[state.index];
      if (!q) return state;

      const { rng, step } = stepRng(state);

      const score = scoreAnswer({
        difficulty: q.difficulty,
        correct: action.correct,
        turnMode: state.config.turnMode,
        propsShown: state.propsShown,
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
        propsShown: state.propsShown,
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
          score: { base: 0, afterProps: 0, afterHints: 0, speedBonus: 0, total: 0 },
          drink: { sipsDrunk: 0, sipsGiven: 0, reason: 'Personne n\'a trouvé 🤷' },
        },
      };
    }

    case 'IMAGE_FAILED': {
      // The current question's image won't load: void it (no score), keep the
      // SAME player up, and — when a spare is available — slot a replacement in
      // right after so the round doesn't lose a question ("+1 au total").
      if (state.phase !== 'question') return state;
      if (!state.questions[state.index]) return state;

      const [replacement, ...restReserve] = state.reserve;
      if (replacement) {
        const questions = [
          ...state.questions.slice(0, state.index + 1),
          replacement,
          ...state.questions.slice(state.index + 1),
        ];
        return setupQuestion(
          {
            ...state,
            questions,
            reserve: restReserve,
            index: state.index + 1,
            voids: state.voids + 1,
          },
          true, // keep the same player up on the replacement
        );
      }

      // No spare left: just move past the broken question, same player next.
      const nextIndex = state.index + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, index: state.questions.length, phase: 'finished' };
      }
      return setupQuestion({ ...state, index: nextIndex, voids: state.voids + 1 }, true);
    }

    case 'TOGGLE_STANDBY': {
      // Mettre un joueur en pause (ou le faire revenir). La rotation en tient
      // compte dès la question suivante ; sa dette de tours se règle au retour.
      const paused = (state.standby ?? []).includes(action.playerId);
      const standby = paused
        ? (state.standby ?? []).filter((id) => id !== action.playerId)
        : [...(state.standby ?? []), action.playerId];
      return { ...state, standby };
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

/**
 * Points the current question is worth right now, given the help already
 * revealed (propositions + indices), excluding the fastest-mode speed bonus.
 * Used to show the live "cost" of asking for help.
 */
export function potentialPoints(state: QuizState): number {
  const q = state.questions[state.index];
  if (!q) return 0;
  return scoreAnswer({
    difficulty: q.difficulty,
    correct: true,
    turnMode: state.config.turnMode,
    propsShown: state.propsShown,
    hintsUsed: state.hintsRevealed,
  }).total;
}

/** Options to display for the current help level (empty when in free-answer mode). */
export function visibleOptions(state: QuizState): string[] {
  if (state.propsShown === 4) return state.currentOptions;
  if (state.propsShown === 2) return state.pairOptions;
  return [];
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
    mode: state.config.turnMode,
    config: { ...state.config },
    startedAt,
    endedAt,
    players,
    events,
  };
}
