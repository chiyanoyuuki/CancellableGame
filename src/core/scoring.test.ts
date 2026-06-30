import { BASE_POINTS, scoreAnswer } from './scoring';

describe('scoreAnswer', () => {
  test('wrong answers are always worth 0', () => {
    const s = scoreAnswer({
      difficulty: 3,
      correct: false,
      answerFormat: 'choices',
      turnMode: 'turn',
      hintsUsed: 0,
    });
    expect(s.total).toBe(0);
  });

  test('base points scale with difficulty', () => {
    const easy = scoreAnswer({ difficulty: 1, correct: true, answerFormat: 'choices', turnMode: 'turn', hintsUsed: 0 });
    const hard = scoreAnswer({ difficulty: 3, correct: true, answerFormat: 'choices', turnMode: 'turn', hintsUsed: 0 });
    expect(easy.total).toBe(BASE_POINTS[1]);
    expect(hard.total).toBe(BASE_POINTS[3]);
    expect(hard.total).toBeGreaterThan(easy.total);
  });

  test('open answer is worth more than a QCM', () => {
    const qcm = scoreAnswer({ difficulty: 2, correct: true, answerFormat: 'choices', turnMode: 'turn', hintsUsed: 0 });
    const open = scoreAnswer({ difficulty: 2, correct: true, answerFormat: 'open', turnMode: 'turn', hintsUsed: 0 });
    expect(open.total).toBeGreaterThan(qcm.total);
  });

  test('hints reduce the score but never below the floor', () => {
    const none = scoreAnswer({ difficulty: 2, correct: true, answerFormat: 'choices', turnMode: 'turn', hintsUsed: 0 });
    const one = scoreAnswer({ difficulty: 2, correct: true, answerFormat: 'choices', turnMode: 'turn', hintsUsed: 1 });
    const many = scoreAnswer({ difficulty: 2, correct: true, answerFormat: 'choices', turnMode: 'turn', hintsUsed: 10 });
    expect(one.total).toBeLessThan(none.total);
    expect(many.total).toBeGreaterThan(0);
    expect(many.total).toBe(Math.round(BASE_POINTS[2] * 0.25));
  });

  test('speed bonus only applies in fastest mode and rewards quick answers', () => {
    const slow = scoreAnswer({
      difficulty: 2,
      correct: true,
      answerFormat: 'choices',
      turnMode: 'fastest',
      hintsUsed: 0,
      timeMs: 20000,
      timeLimitMs: 20000,
    });
    const fast = scoreAnswer({
      difficulty: 2,
      correct: true,
      answerFormat: 'choices',
      turnMode: 'fastest',
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
      answerFormat: 'choices',
      turnMode: 'turn',
      hintsUsed: 0,
      timeMs: 0,
      timeLimitMs: 20000,
    });
    expect(s.speedBonus).toBe(0);
  });
});
