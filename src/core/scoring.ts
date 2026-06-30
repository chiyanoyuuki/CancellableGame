import type { AnswerFormat, Difficulty, TurnMode } from './models';

/**
 * Points awarded for a single quiz answer.
 *
 * Harder questions and the (riskier) open-answer format are worth more; using
 * hints chips away at the value; answering fast in "au plus rapide" adds a
 * speed bonus. Wrong answers are worth nothing (but usually cost a gorgée — see
 * drinks.ts).
 */

export const BASE_POINTS: Record<Difficulty, number> = { 1: 100, 2: 200, 3: 300, 4: 500 };

/** Open answer is harder than a QCM, so it is rewarded more. */
export const OPEN_ANSWER_MULTIPLIER = 1.5;

/** Each hint revealed removes this fraction of the question value. */
export const HINT_PENALTY_PER_HINT = 0.25;

/** A question never drops below this fraction of its value because of hints. */
export const MIN_HINT_FACTOR = 0.25;

/** Maximum speed bonus, as a fraction of the question value, in fastest mode. */
export const MAX_SPEED_BONUS = 0.5;

export interface ScoreInput {
  difficulty: Difficulty;
  correct: boolean;
  answerFormat: AnswerFormat;
  turnMode: TurnMode;
  hintsUsed: number;
  /** Answer time in ms (fastest mode only). */
  timeMs?: number | null;
  /** Per-question time limit in ms (fastest mode only). */
  timeLimitMs?: number | null;
}

export interface ScoreBreakdown {
  base: number;
  afterFormat: number;
  afterHints: number;
  speedBonus: number;
  total: number;
}

export function scoreAnswer(input: ScoreInput): ScoreBreakdown {
  if (!input.correct) {
    return { base: 0, afterFormat: 0, afterHints: 0, speedBonus: 0, total: 0 };
  }

  const base = BASE_POINTS[input.difficulty];
  const afterFormat =
    input.answerFormat === 'open' ? Math.round(base * OPEN_ANSWER_MULTIPLIER) : base;

  const hintFactor = Math.max(MIN_HINT_FACTOR, 1 - HINT_PENALTY_PER_HINT * input.hintsUsed);
  const afterHints = Math.round(afterFormat * hintFactor);

  let speedBonus = 0;
  if (
    input.turnMode === 'fastest' &&
    input.timeMs != null &&
    input.timeLimitMs != null &&
    input.timeLimitMs > 0
  ) {
    const remaining = Math.max(0, input.timeLimitMs - input.timeMs);
    const ratio = Math.min(1, remaining / input.timeLimitMs);
    speedBonus = Math.round(afterHints * MAX_SPEED_BONUS * ratio);
  }

  return { base, afterFormat, afterHints, speedBonus, total: afterHints + speedBonus };
}
