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
