import type { StatAnswer } from './stats';
import { successByDifficulty, successByTheme, calibrationIssues } from './difficultyAudit';

const A = (difficulty: number, theme: string, correct: boolean): StatAnswer => ({
  gameId: 'g',
  startedAt: 0,
  playerId: 'p',
  theme,
  difficulty,
  correct,
  hintsUsed: 0,
  timeMs: null,
  points: 0,
});

const many = (n: number, difficulty: number, theme: string, correctCount: number): StatAnswer[] =>
  Array.from({ length: n }, (_, i) => A(difficulty, theme, i < correctCount));

describe('difficultyAudit', () => {
  test('successByDifficulty agrège et trie par difficulté', () => {
    const ans = [...many(10, 1, 'a', 9), ...many(10, 2, 'a', 5)];
    const s = successByDifficulty(ans);
    expect(s).toEqual([
      { key: '1', total: 10, correct: 9, rate: 0.9 },
      { key: '2', total: 10, correct: 5, rate: 0.5 },
    ]);
  });

  test('successByTheme trie du plus dur au plus facile et filtre les petits échantillons', () => {
    const ans = [...many(20, 2, 'facile', 18), ...many(20, 2, 'dur', 4), ...many(3, 2, 'rare', 0)];
    const s = successByTheme(ans, 10);
    expect(s.map((x) => x.key)).toEqual(['dur', 'facile']); // rare filtré (3 < 10)
    expect(s[0]!.rate).toBeCloseTo(0.2);
  });

  test('calibrationIssues repère une inversion', () => {
    // difficulté 2 mieux réussie que 1 -> anomalie
    const ans = [...many(30, 1, 'a', 12), ...many(30, 2, 'a', 27)];
    const issues = calibrationIssues(ans, 20);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('Difficulté 2');
  });

  test('calibrationIssues : rien à signaler si bien calibré', () => {
    const ans = [...many(30, 1, 'a', 27), ...many(30, 2, 'a', 15), ...many(30, 3, 'a', 6)];
    expect(calibrationIssues(ans, 20)).toEqual([]);
  });
});
