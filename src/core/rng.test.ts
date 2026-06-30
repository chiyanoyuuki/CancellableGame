import { chance, mulberry32, pick, rngInt, shuffle } from './rng';

describe('rng', () => {
  test('mulberry32 is deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  test('different seeds produce different sequences', () => {
    const a = mulberry32(1)();
    const b = mulberry32(2)();
    expect(a).not.toEqual(b);
  });

  test('values stay within [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test('shuffle keeps every element and does not mutate input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, mulberry32(99));
    expect(out).not.toBe(input);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  test('shuffle is deterministic for a seed', () => {
    expect(shuffle([1, 2, 3, 4, 5], mulberry32(3))).toEqual(shuffle([1, 2, 3, 4, 5], mulberry32(3)));
  });

  test('rngInt stays within bounds (inclusive)', () => {
    const r = mulberry32(123);
    for (let i = 0; i < 500; i++) {
      const v = rngInt(r, 2, 5);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThanOrEqual(5);
    }
  });

  test('pick throws on empty array', () => {
    expect(() => pick([], mulberry32(1))).toThrow();
  });

  test('chance respects extremes', () => {
    expect(chance(() => 0, 0.5)).toBe(true);
    expect(chance(() => 0.99, 0.5)).toBe(false);
    expect(chance(() => 0.5, 0)).toBe(false);
  });
});
