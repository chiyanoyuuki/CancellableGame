import { DRINK_CHALLENGES, maybeChallenge, rollAnswerDrink } from './drinks';
import type { Rng } from './rng';

const always = (v: number): Rng => () => v;

describe('rollAnswerDrink', () => {
  test('wrong answer makes the player drink', () => {
    const out = rollAnswerDrink({
      correct: false,
      difficulty: 1,
      turnMode: 'turn',
      hintsUsed: 0,
      intensity: 'normal',
      rng: always(0),
    });
    expect(out.sipsDrunk).toBeGreaterThanOrEqual(1);
    expect(out.sipsGiven).toBe(0);
    expect(out.reason).not.toBe('');
  });

  test('hardcore intensity makes wrong answers cost more', () => {
    const normal = rollAnswerDrink({ correct: false, difficulty: 1, turnMode: 'turn', hintsUsed: 0, intensity: 'normal', rng: always(0.99) });
    const hardcore = rollAnswerDrink({ correct: false, difficulty: 1, turnMode: 'turn', hintsUsed: 0, intensity: 'hardcore', rng: always(0.99) });
    expect(hardcore.sipsDrunk).toBeGreaterThan(normal.sipsDrunk);
  });

  test('clutch hard answer with no hint lets you distribute', () => {
    const out = rollAnswerDrink({
      correct: true,
      difficulty: 3,
      turnMode: 'turn',
      hintsUsed: 0,
      intensity: 'normal',
      rng: always(0), // forces the 0.6 chance to trigger
    });
    expect(out.sipsGiven).toBeGreaterThanOrEqual(1);
    expect(out.sipsDrunk).toBe(0);
  });

  test('an easy correct answer with no hint is usually free', () => {
    const out = rollAnswerDrink({
      correct: true,
      difficulty: 1,
      turnMode: 'turn',
      hintsUsed: 0,
      intensity: 'normal',
      rng: always(0.99),
    });
    expect(out.sipsDrunk).toBe(0);
    expect(out.sipsGiven).toBe(0);
  });
});

describe('maybeChallenge', () => {
  test('returns a known challenge when the roll succeeds', () => {
    const c = maybeChallenge(always(0), 'normal');
    expect(c).not.toBeNull();
    expect(DRINK_CHALLENGES.map((x) => x.id)).toContain(c?.id);
  });

  test('returns null when the roll fails', () => {
    expect(maybeChallenge(always(0.99), 'normal')).toBeNull();
  });
});
