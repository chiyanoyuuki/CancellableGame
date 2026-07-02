import type { Difficulty, TurnMode } from './models';

/**
 * Points awarded for a single quiz answer.
 *
 * Every question starts as a FREE answer worth its full value. During the
 * question the player may ask for help, and each kind of help divides the
 * value (penalties stack, multiplicatively):
 *   - 4 propositions  → value ÷ 2
 *   - 2 propositions  → value ÷ 4
 *   - un indice       → value ÷ 1,5 (par indice révélé)
 * Answering fast in "au plus rapide" adds a speed bonus on top. Wrong answers
 * are worth nothing (but usually cost a gorgée — see drinks.ts).
 */

export const BASE_POINTS: Record<Difficulty, number> = { 1: 100, 2: 200, 3: 300, 4: 500 };

/** How many propositions are currently shown (0 = réponse libre). */
export type PropsShown = 0 | 2 | 4;

/** Revealing propositions divides the value: 4 props → ÷2, 2 props → ÷4. */
export const PROPS_DIVISOR: Record<PropsShown, number> = { 0: 1, 4: 2, 2: 4 };

/** Each hint revealed divides the value by this factor. */
export const HINT_DIVISOR = 1.5;

/** Maximum speed bonus, as a fraction of the question value, in fastest mode. */
export const MAX_SPEED_BONUS = 0.5;

export interface ScoreInput {
  difficulty: Difficulty;
  correct: boolean;
  turnMode: TurnMode;
  /** Propositions revealed for this question (0 = free answer). */
  propsShown: PropsShown;
  /** Number of hints revealed for this question. */
  hintsUsed: number;
  /** Answer time in ms (fastest mode only). */
  timeMs?: number | null;
  /** Per-question time limit in ms (fastest mode only). */
  timeLimitMs?: number | null;
}

export interface ScoreBreakdown {
  base: number;
  afterProps: number;
  afterHints: number;
  speedBonus: number;
  total: number;
}

/** Combined help divisor (propositions × indices), for display and scoring. */
export function helpDivisor(propsShown: PropsShown, hintsUsed: number): number {
  return PROPS_DIVISOR[propsShown] * Math.pow(HINT_DIVISOR, Math.max(0, hintsUsed));
}

export function scoreAnswer(input: ScoreInput): ScoreBreakdown {
  if (!input.correct) {
    return { base: 0, afterProps: 0, afterHints: 0, speedBonus: 0, total: 0 };
  }

  const base = BASE_POINTS[input.difficulty];
  const afterProps = base / PROPS_DIVISOR[input.propsShown];
  const afterHints = Math.round(afterProps / Math.pow(HINT_DIVISOR, Math.max(0, input.hintsUsed)));

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

  return { base, afterProps: Math.round(afterProps), afterHints, speedBonus, total: afterHints + speedBonus };
}
