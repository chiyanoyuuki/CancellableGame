import { orderByLeastSeen } from './leastSeen';
import { mulberry32 } from './rng';

describe('orderByLeastSeen', () => {
  it('place les items jamais vus avant les déjà vus, du moins vu au plus vu', () => {
    const items = ['a', 'b', 'c', 'd'];
    const seen = { a: 3, c: 1 }; // b et d jamais vus (0)
    const out = orderByLeastSeen(items, (x) => x, seen, mulberry32(1));
    expect(new Set(out.slice(0, 2))).toEqual(new Set(['b', 'd'])); // les inédits d'abord
    expect(out[2]).toBe('c'); // vu 1 fois
    expect(out[3]).toBe('a'); // vu 3 fois
  });

  it('conserve tous les items (permutation)', () => {
    const items = Array.from({ length: 8 }, (_, i) => `i${i}`);
    const out = orderByLeastSeen(items, (x) => x, {}, mulberry32(7));
    expect([...out].sort()).toEqual([...items].sort());
    expect(out).toHaveLength(items.length);
  });

  it('mélange à nombre de vues égal (ordre non trivial selon la graine)', () => {
    const items = Array.from({ length: 20 }, (_, i) => `i${i}`);
    const a = orderByLeastSeen(items, (x) => x, {}, mulberry32(1));
    const b = orderByLeastSeen(items, (x) => x, {}, mulberry32(42));
    expect(a).not.toEqual(b); // deux graines → deux ordres (quasi certain sur 20 items)
  });
});
