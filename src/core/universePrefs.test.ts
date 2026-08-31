import {
  toggleFavorite,
  pushRecent,
  matchesQuery,
  normalizeSearch,
  presentPinned,
  RECENT_RECORD_MAX,
} from './universePrefs';

describe('universePrefs', () => {
  test('toggleFavorite ajoute puis retire', () => {
    expect(toggleFavorite([], 'Naruto')).toEqual(['Naruto']);
    expect(toggleFavorite(['Naruto', 'One Piece'], 'Naruto')).toEqual(['One Piece']);
  });

  test('pushRecent met en tête, déduplique et plafonne', () => {
    expect(pushRecent(['A', 'B'], ['C'])).toEqual(['C', 'A', 'B']);
    // déjà présent -> remonte en tête sans doublon
    expect(pushRecent(['A', 'B', 'C'], ['C'])).toEqual(['C', 'A', 'B']);
    // plafond
    const long = pushRecent([], ['a', 'b', 'c'], 2);
    expect(long).toEqual(['a', 'b']);
  });

  test('pushRecent ignore les sélections vides ou trop larges', () => {
    expect(pushRecent(['A'], [])).toEqual(['A']);
    const tooMany = Array.from({ length: RECENT_RECORD_MAX + 1 }, (_, i) => `u${i}`);
    expect(pushRecent(['A'], tooMany)).toEqual(['A']);
  });

  test('recherche insensible aux accents et à la casse', () => {
    expect(normalizeSearch('  Pokémon ')).toBe('pokemon');
    expect(matchesQuery('Pokémon en images', 'pokemon')).toBe(true);
    expect(matchesQuery('Studio Ghibli', 'GHIB')).toBe(true);
    expect(matchesQuery('Naruto', '')).toBe(true);
    expect(matchesQuery('Naruto', 'zelda')).toBe(false);
  });

  test('presentPinned ne garde que les univers du catalogue courant', () => {
    expect(presentPinned(['A', 'X', 'B'], new Set(['A', 'B', 'C']))).toEqual(['A', 'B']);
  });
});
