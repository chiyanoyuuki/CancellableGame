import { type Rng, shuffle } from './rng';

/**
 * Ordonne des items du MOINS vu au PLUS vu, aléatoire à égalité — comme le quiz,
 * qui épuise les questions jamais vues avant de réutiliser les autres. `seen`
 * associe la clé d'un item à son nombre de passages ; une clé absente vaut 0.
 * D'abord on mélange (aléatoire à nombre de vues égal), puis on trie de façon
 * stable par nombre de vues croissant.
 */
export function orderByLeastSeen<T>(
  items: readonly T[],
  keyOf: (x: T) => string,
  seen: Record<string, number>,
  rng: Rng,
): T[] {
  const shuffled = shuffle([...items], rng);
  return shuffled
    .map((x, i) => ({ x, i, s: seen[keyOf(x)] ?? 0 }))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((o) => o.x);
}
