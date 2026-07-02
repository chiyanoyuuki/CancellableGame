import { BASE_POINTS, HINT_DIVISOR, helpDivisor, scoreAnswer } from './scoring';

describe('scoreAnswer', () => {
  test('wrong answers are always worth 0', () => {
    const s = scoreAnswer({
      difficulty: 3,
      correct: false,
      turnMode: 'turn',
      propsShown: 0,
      hintsUsed: 0,
    });
    expect(s.total).toBe(0);
  });

  test('a free answer (no help) is worth the full base points', () => {
    const easy = scoreAnswer({ difficulty: 1, correct: true, turnMode: 'turn', propsShown: 0, hintsUsed: 0 });
    const hard = scoreAnswer({ difficulty: 3, correct: true, turnMode: 'turn', propsShown: 0, hintsUsed: 0 });
    expect(easy.total).toBe(BASE_POINTS[1]);
    expect(hard.total).toBe(BASE_POINTS[3]);
    expect(hard.total).toBeGreaterThan(easy.total);
  });

  test('revealing 4 propositions halves the value', () => {
    const s = scoreAnswer({ difficulty: 2, correct: true, turnMode: 'turn', propsShown: 4, hintsUsed: 0 });
    expect(s.total).toBe(Math.round(BASE_POINTS[2] / 2));
  });

  test('revealing 2 propositions divides the value by 4', () => {
    const s = scoreAnswer({ difficulty: 2, correct: true, turnMode: 'turn', propsShown: 2, hintsUsed: 0 });
    expect(s.total).toBe(Math.round(BASE_POINTS[2] / 4));
  });

  test('an indice divides the value by 1.5', () => {
    const s = scoreAnswer({ difficulty: 2, correct: true, turnMode: 'turn', propsShown: 0, hintsUsed: 1 });
    expect(s.total).toBe(Math.round(BASE_POINTS[2] / HINT_DIVISOR));
  });

  test('penalties stack multiplicatively (4 props + 1 indice = ÷3)', () => {
    const s = scoreAnswer({ difficulty: 4, correct: true, turnMode: 'turn', propsShown: 4, hintsUsed: 1 });
    expect(s.total).toBe(Math.round(BASE_POINTS[4] / (2 * HINT_DIVISOR)));
  });

  test('helpDivisor reflects the combined penalty', () => {
    expect(helpDivisor(0, 0)).toBe(1);
    expect(helpDivisor(4, 0)).toBe(2);
    expect(helpDivisor(2, 0)).toBe(4);
    expect(helpDivisor(0, 1)).toBeCloseTo(1.5);
    expect(helpDivisor(2, 1)).toBeCloseTo(6);
  });

  test('speed bonus only applies in fastest mode and rewards quick answers', () => {
    const slow = scoreAnswer({
      difficulty: 2,
      correct: true,
      turnMode: 'fastest',
      propsShown: 0,
      hintsUsed: 0,
      timeMs: 20000,
      timeLimitMs: 20000,
    });
    const fast = scoreAnswer({
      difficulty: 2,
      correct: true,
      turnMode: 'fastest',
      propsShown: 0,
      hintsUsed: 0,
      timeMs: 0,
      timeLimitMs: 20000,
    });
    expect(slow.speedBonus).toBe(0);
    expect(fast.speedBonus).toBeGreaterThan(0);
    expect(fast.total).toBeGreaterThan(slow.total);
  });

  test('no speed bonus is given in turn mode even with timing', () => {
    const s = scoreAnswer({
      difficulty: 2,
      correct: true,
      turnMode: 'turn',
      propsShown: 0,
      hintsUsed: 0,
      timeMs: 0,
      timeLimitMs: 20000,
    });
    expect(s.speedBonus).toBe(0);
  });
});
