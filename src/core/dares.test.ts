import { BOOZE_DARES, daresFor, daresForLevels, HOT_DARES, nextDare, SOFT_DARES } from './dares';
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

  it('daresForLevels : niveau 1 seul = banque de base', () => {
    expect(daresForLevels('soft', [1])).toEqual(SOFT_DARES);
    expect(daresForLevels('alcool', [1])).toEqual(BOOZE_DARES);
  });

  it('daresForLevels : les niveaux osés ajoutent du contenu (indépendants)', () => {
    const s1 = daresForLevels('soft', [1]);
    const s14 = daresForLevels('soft', [1, 4]);
    const s124 = daresForLevels('soft', [1, 2, 4]);
    expect(s14.length).toBeGreaterThan(s1.length); // le niveau 4 ajoute des gages
    expect(s124.length).toBeGreaterThan(s14.length); // le niveau 2 en ajoute encore
    expect(SOFT_DARES.every((d) => s14.includes(d))).toBe(true); // la base reste présente
  });

  it('daresForLevels : sans niveau 1, pas de contenu de base (que l’osé)', () => {
    const only4 = daresForLevels('soft', [4]);
    expect(only4.length).toBeGreaterThan(0);
    expect(SOFT_DARES.some((d) => only4.includes(d))).toBe(false);
  });

  it('daresForLevels : respecte la catégorie (un gage alcool ne fuit pas dans soft)', () => {
    const soft = daresForLevels('soft', [2, 3, 4]);
    const boozeHot = HOT_DARES.filter((d) => d.category === 'alcool').map((d) => d.text);
    expect(boozeHot.some((d) => soft.includes(d))).toBe(false);
  });
});
