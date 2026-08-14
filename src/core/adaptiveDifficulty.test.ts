import { accuracyRatio, adaptiveDifficulties, difficultiesForPlayer } from './adaptiveDifficulty';

describe('adaptiveDifficulty', () => {
  test('échantillon trop faible → ratio null', () => {
    expect(accuracyRatio(undefined)).toBeNull();
    expect(accuracyRatio({ correct: 2, total: 3 })).toBeNull(); // < 5 réponses
    expect(accuracyRatio({ correct: 4, total: 8 })).toBeCloseTo(0.5);
  });

  test('profil neutre (pas d’historique) : facile à dur, sans pro', () => {
    expect(adaptiveDifficulties(null)).toEqual([1, 2, 3]);
  });

  test('la fenêtre de difficulté monte avec le taux de réussite', () => {
    expect(adaptiveDifficulties(0.2)).toEqual([1, 2]); // en difficulté
    expect(adaptiveDifficulties(0.45)).toEqual([1, 2, 3]);
    expect(adaptiveDifficulties(0.65)).toEqual([2, 3, 4]);
    expect(adaptiveDifficulties(0.9)).toEqual([3, 4]); // expert
  });

  test('toujours au moins deux paliers (variété)', () => {
    for (const r of [null, 0, 0.3, 0.5, 0.7, 1]) {
      expect(adaptiveDifficulties(r).length).toBeGreaterThanOrEqual(2);
    }
  });

  test('difficultiesForPlayer combine le calcul du ratio et le mapping', () => {
    expect(difficultiesForPlayer(undefined)).toEqual([1, 2, 3]); // neutre
    expect(difficultiesForPlayer({ correct: 9, total: 10 })).toEqual([3, 4]); // 0.9 → expert
    expect(difficultiesForPlayer({ correct: 1, total: 10 })).toEqual([1, 2]); // 0.1 → facile
  });
});
