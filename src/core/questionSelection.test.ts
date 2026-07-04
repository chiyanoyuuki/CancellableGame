import type { Difficulty, Question, Theme } from './models';
import { recordUsage, selectQuestions } from './questionSelection';
import { mulberry32 } from './rng';

function q(id: string, theme: Theme, difficulty: Difficulty): Question {
  return { id, theme, difficulty, text: id, answer: 'a', distractors: ['b', 'c', 'd'] };
}

const pool: Question[] = [
  q('m1', 'manga', 1),
  q('m2', 'manga', 2),
  q('m3', 'manga', 3),
  q('v1', 'jeuxvideo', 1),
  q('v2', 'jeuxvideo', 2),
  q('c1', 'culture', 1),
  q('c2', 'culture', 2),
  q('c3', 'culture', 3),
];

describe('selectQuestions', () => {
  test('respects theme and difficulty filters', () => {
    const out = selectQuestions(
      pool,
      { themes: ['manga'], difficulties: [1, 2], count: 10 },
      {},
      mulberry32(1),
    );
    expect(out.map((x) => x.id).sort()).toEqual(['m1', 'm2']);
  });

  test('respects the requested count', () => {
    const out = selectQuestions(
      pool,
      { themes: ['manga', 'jeuxvideo', 'culture'], difficulties: [1, 2, 3], count: 3 },
      {},
      mulberry32(5),
    );
    expect(out).toHaveLength(3);
  });

  test('never returns duplicates within a round', () => {
    const out = selectQuestions(
      pool,
      { themes: ['manga', 'jeuxvideo', 'culture'], difficulties: [1, 2, 3], count: 8 },
      {},
      mulberry32(8),
    );
    expect(new Set(out.map((x) => x.id)).size).toBe(out.length);
  });

  test('excludes disabled universes but keeps questions without a universe', () => {
    const withUni: Question[] = [
      { id: 'n1', theme: 'manga', difficulty: 1, universe: 'Naruto', text: 'x', answer: 'a', distractors: ['b', 'c', 'd'] },
      { id: 'o1', theme: 'manga', difficulty: 1, universe: 'One Piece', text: 'x', answer: 'a', distractors: ['b', 'c', 'd'] },
      { id: 'noUni', theme: 'manga', difficulty: 1, text: 'x', answer: 'a', distractors: ['b', 'c', 'd'] },
    ];
    const out = selectQuestions(
      withUni,
      { themes: ['manga'], difficulties: [1], count: 10, excludedUniverses: ['One Piece'] },
      {},
      mulberry32(1),
    );
    const ids = out.map((x) => x.id);
    expect(ids).toContain('n1');
    expect(ids).toContain('noUni');
    expect(ids).not.toContain('o1');
  });

  test('prefers the least-used questions (anti-repeat)', () => {
    // Mark every manga question used except m3; m3 must be picked first.
    const history = {
      m1: { timesUsed: 5, lastUsedAt: 100 },
      m2: { timesUsed: 5, lastUsedAt: 100 },
      m3: { timesUsed: 0, lastUsedAt: 0 },
    };
    const out = selectQuestions(
      pool,
      { themes: ['manga'], difficulties: [1, 2, 3], count: 1 },
      history,
      mulberry32(2),
    );
    expect(out.map((x) => x.id)).toEqual(['m3']);
  });

  test('recordUsage increments counts immutably', () => {
    const h0 = {};
    const h1 = recordUsage(h0, ['m1', 'm2'], 1000);
    const h2 = recordUsage(h1, ['m1'], 2000);
    expect(h0).toEqual({});
    expect(h1.m1).toEqual({ timesUsed: 1, lastUsedAt: 1000 });
    expect(h2.m1).toEqual({ timesUsed: 2, lastUsedAt: 2000 });
    expect(h2.m2).toEqual({ timesUsed: 1, lastUsedAt: 1000 });
  });
});

describe('per-player universe avoidance', () => {
  function uq(id: string, universe: string): Question {
    return { id, theme: 'manga', difficulty: 1, universe, text: id, answer: 'a', distractors: ['b', 'c', 'd'] };
  }
  // 40 questions in universe A, 40 in universe B.
  const bigPool: Question[] = [
    ...Array.from({ length: 40 }, (_, i) => uq(`A${i}`, 'Alpha')),
    ...Array.from({ length: 40 }, (_, i) => uq(`B${i}`, 'Beta')),
  ];
  const count = (qs: Question[], u: string) => qs.filter((q) => q.universe === u).length;
  // Aggregate over many seeds so the assertion is robust (not seed-dependent).
  function totals(opts: Parameters<typeof selectQuestions>[4]) {
    let a = 0, b = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const out = selectQuestions(bigPool, { themes: ['manga'], difficulties: [1], count: 40 }, {}, mulberry32(seed), opts);
      a += count(out, 'Alpha');
      b += count(out, 'Beta');
    }
    return { a, b };
  }

  test('turn mode: an avoided universe is under-represented for that player (but not excluded)', () => {
    const single = selectQuestions(
      bigPool,
      { themes: ['manga'], difficulties: [1], count: 40 },
      {},
      mulberry32(7),
      { order: ['p1'], avoidByPlayer: { p1: ['Beta'] }, turnMode: 'turn' },
    );
    expect(single).toHaveLength(40);
    expect(count(single, 'Beta')).toBeGreaterThan(0); // soft, not a hard exclusion

    const { a, b } = totals({ order: ['p1'], avoidByPlayer: { p1: ['Beta'] }, turnMode: 'turn' });
    expect(a).toBeGreaterThan(b * 1.4); // ~2x fewer Beta on average
  });

  test('fastest mode: a universe avoided by any player is under-represented for everyone', () => {
    const { a, b } = totals({ order: ['p1', 'p2'], avoidByPlayer: { p2: ['Beta'] }, turnMode: 'fastest' });
    expect(a).toBeGreaterThan(b * 1.4);
  });

  test('no avoidance configured falls back to the default selection', () => {
    const out = selectQuestions(
      bigPool,
      { themes: ['manga'], difficulties: [1], count: 20 },
      {},
      mulberry32(1),
      { order: ['p1'], avoidByPlayer: { p1: [] }, turnMode: 'turn' },
    );
    expect(out).toHaveLength(20);
    expect(new Set(out.map((q) => q.id)).size).toBe(20);
  });
});

describe('preferred themes boost', () => {
  function tq(id: string, theme: Theme): Question {
    return { id, theme, difficulty: 1, text: id, answer: 'a', distractors: ['b', 'c', 'd'] };
  }
  // Equal-sized pools so the bias comes only from the preference weight.
  const bigPool: Question[] = [
    ...Array.from({ length: 40 }, (_, i) => tq(`M${i}`, 'manga')),
    ...Array.from({ length: 40 }, (_, i) => tq(`C${i}`, 'culture')),
  ];
  const count = (qs: Question[], t: Theme) => qs.filter((q) => q.theme === t).length;

  test('a preferred theme is over-represented in the draw', () => {
    let m = 0, c = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const out = selectQuestions(
        bigPool,
        { themes: ['manga', 'culture'], difficulties: [1], count: 30 },
        {},
        mulberry32(seed),
        { preferredThemes: ['manga'] },
      );
      m += count(out, 'manga');
      c += count(out, 'culture');
    }
    expect(m).toBeGreaterThan(c * 1.25); // ~1.5x more of the preferred theme
  });

  test('still respects the count and returns no duplicates', () => {
    const out = selectQuestions(
      bigPool,
      { themes: ['manga', 'culture'], difficulties: [1], count: 30 },
      {},
      mulberry32(3),
      { preferredThemes: ['manga'] },
    );
    expect(out).toHaveLength(30);
    expect(new Set(out.map((q) => q.id)).size).toBe(30);
  });
});
