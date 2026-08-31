import { BOOZE_DARES, daresFor, nextDare, SOFT_DARES } from './dares';
import { mulberry32 } from './rng';

describe('dares', () => {
  it('daresFor renvoie la bonne catégorie', () => {
    expect(daresFor('soft')).toBe(SOFT_DARES);
    expect(daresFor('alcool')).toBe(BOOZE_DARES);
  });

  it('les deux banques sont non vides et sans doublon', () => {
    for (const pool of [SOFT_DARES, BOOZE_DARES]) {
      expect(pool.length).toBeGreaterThan(10);
      expect(new Set(pool).size).toBe(pool.length);
    }
  });

  it('nextDare évite de répéter le gage courant', () => {
    const rng = mulberry32(1);
    const pool = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i += 1) {
      expect(nextDare(pool, 'a', rng)).not.toBe('a');
    }
  });

  it('nextDare gère les cas limites', () => {
    const rng = mulberry32(2);
    expect(nextDare([], null, rng)).toBe('');
    expect(nextDare(['seul'], 'seul', rng)).toBe('seul');
  });
});
