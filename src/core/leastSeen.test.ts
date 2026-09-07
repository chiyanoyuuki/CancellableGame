import { orderByLeastSeen, partySeenScores } from './leastSeen';
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

describe('partySeenScores (découverte du groupe)', () => {
  const byPlayer = {
    p1: { q1: 1, q2: 3, q3: 1 },
    p2: { q2: 1, q3: 1 },
    p3: { q3: 1 },
  };

  it('classe par nombre de joueurs de la partie qui ont vu, du moins vu au plus vu', () => {
    // q0 : personne ; q1 : p1 ; q2 : p1+p2 ; q3 : p1+p2+p3.
    const scores = partySeenScores(byPlayer, ['p1', 'p2', 'p3']);
    const out = orderByLeastSeen(['q0', 'q1', 'q2', 'q3'], (x) => x, scores, mulberry32(1));
    expect(out).toEqual(['q0', 'q1', 'q2', 'q3']);
  });

  it('ne compte que les joueurs présents ce soir', () => {
    // Seul p3 joue : il n'a vu que q3 → q3 en dernier, le reste à égalité (0 joueur vu).
    const scores = partySeenScores(byPlayer, ['p3']);
    expect(scores.q3).toBeGreaterThan(scores.q2 ?? 0);
    expect(scores.q3).toBeGreaterThan(scores.q1 ?? 0);
    // q1/q2 non vues par p3 → départagées par le total global (q2 vu 4×, q1 vu 1×).
    expect((scores.q1 ?? 0)).toBeLessThan(scores.q2 ?? 0);
  });

  it('à égalité de joueurs, départage par le total de vues global', () => {
    // Personne de la partie n'a rien vu → tri par total global (q2=4 > q1=1).
    const scores = partySeenScores(byPlayer, ['pX']);
    const out = orderByLeastSeen(['q1', 'q2'], (x) => x, scores, mulberry32(3));
    expect(out).toEqual(['q1', 'q2']);
  });

  it('une clé jamais vue par personne est absente (score implicite 0)', () => {
    const scores = partySeenScores(byPlayer, ['p1', 'p2', 'p3']);
    expect(scores.q0).toBeUndefined();
    expect(scores.q1).toBeGreaterThan(0);
  });
});
