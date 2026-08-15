import { countExcludedUniverses, keepsEnoughUniverses, keptUniverses, MIN_KEPT_UNIVERSES } from './profilePrefs';

describe('profilePrefs', () => {
  test('countExcludedUniverses ignore les thèmes « #… »', () => {
    expect(countExcludedUniverses(['Naruto', 'One Piece', '#rebus', '#enigmes'])).toBe(2);
    expect(countExcludedUniverses([])).toBe(0);
  });

  test('keptUniverses = total - univers exclus', () => {
    expect(keptUniverses(189, ['Naruto', 'Bleach', '#rebus'])).toBe(187);
    expect(keptUniverses(189, [])).toBe(189);
  });

  test('keptUniverses ne descend pas sous zéro', () => {
    expect(keptUniverses(3, ['a', 'b', 'c', 'd', 'e'])).toBe(0);
  });

  test('keepsEnoughUniverses applique le minimum', () => {
    const total = 189;
    // Exclure jusqu'à en garder exactement 10 → ok.
    const excludeAllBut10 = Array.from({ length: total - MIN_KEPT_UNIVERSES }, (_, i) => `U${i}`);
    expect(keepsEnoughUniverses(total, excludeAllBut10)).toBe(true);
    // Un de plus → il n'en reste que 9 → refusé.
    expect(keepsEnoughUniverses(total, [...excludeAllBut10, 'U999'])).toBe(false);
  });
});
