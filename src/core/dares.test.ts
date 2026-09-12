import { BOOZE_DARES, daresFor, daresForLevel, HOT_DARES, nextDare, SOFT_DARES } from './dares';
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

  it('daresForLevel : niveau 1 = banque de base inchangée', () => {
    expect(daresForLevel('soft', 1)).toBe(SOFT_DARES);
    expect(daresForLevel('alcool', 1)).toBe(BOOZE_DARES);
  });

  it('daresForLevel : les paliers osés ajoutent du contenu, de façon cumulative', () => {
    const soft2 = daresForLevel('soft', 2);
    const soft3 = daresForLevel('soft', 3);
    const soft4 = daresForLevel('soft', 4);
    expect(soft2.length).toBeGreaterThan(SOFT_DARES.length); // du contenu osé est ajouté
    expect(soft3.length).toBeGreaterThanOrEqual(soft2.length); // cumulatif
    expect(soft4.length).toBeGreaterThanOrEqual(soft3.length);
    expect(SOFT_DARES.every((d) => soft4.includes(d))).toBe(true); // la base reste présente
  });

  it('daresForLevel : respecte la catégorie (un gage alcool ne fuit pas dans soft)', () => {
    const soft4 = daresForLevel('soft', 4);
    const boozeHot = HOT_DARES.filter((d) => d.category === 'alcool').map((d) => d.text);
    expect(boozeHot.some((d) => soft4.includes(d))).toBe(false);
  });
});
