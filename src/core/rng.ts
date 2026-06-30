/**
 * Seeded pseudo-random number generation.
 *
 * The whole "chaque partie est différente de la dernière" requirement is built
 * on top of this: a game is created with a fresh random seed, but everything
 * derived from that seed is deterministic, which makes the engine fully
 * testable (a fixed seed always yields the same sequence).
 */

export type Rng = () => number; // returns a float in [0, 1)

/** Mulberry32: tiny, fast, good-enough PRNG for a party game. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A non-deterministic seed for real gameplay. */
export function randomSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0x100000000)) >>> 0;
}

/** Fisher–Yates shuffle producing a NEW array (input is not mutated). */
export function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

/** Pick one element at random. Throws on an empty array. */
export function pick<T>(arr: readonly T[], rng: Rng): T {
  if (arr.length === 0) throw new Error('pick() called on an empty array');
  return arr[Math.floor(rng() * arr.length)] as T;
}

/** Random integer in [minInclusive, maxInclusive]. */
export function rngInt(rng: Rng, minInclusive: number, maxInclusive: number): number {
  return minInclusive + Math.floor(rng() * (maxInclusive - minInclusive + 1));
}

/** True with the given probability (0..1). */
export function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}
