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

/**
 * Score de priorité « découverte du groupe » par clé, à partir des vues PAR
 * JOUEUR (playerId → clé → nb de passages) et des joueurs de la partie en cours.
 * Deux niveaux encodés dans un seul nombre — plus il est bas, plus la clé est
 * prioritaire, donc à passer tel quel à `orderByLeastSeen` :
 *  1. le nombre de joueurs PRÉSENTS qui l'ont déjà vue (moins = prioritaire :
 *     plus de monde la découvre = plus de plaisir) — même logique que le quiz ;
 *  2. à égalité, le total de vues tous joueurs confondus, pour étaler le catalogue
 *     même quand personne de la partie ne l'a encore vue.
 * Une clé jamais vue par personne est absente du résultat (score implicite 0).
 */
export function partySeenScores(
  byPlayer: Record<string, Record<string, number>>,
  partyIds: readonly string[],
): Record<string, number> {
  const PARTY_WEIGHT = 1e6; // le nb de joueurs de la partie prime sur le total global
  const total: Record<string, number> = {};
  for (const counts of Object.values(byPlayer)) {
    for (const [k, c] of Object.entries(counts)) total[k] = (total[k] ?? 0) + c;
  }
  const out: Record<string, number> = {};
  for (const [k, tot] of Object.entries(total)) {
    let party = 0;
    for (const pid of partyIds) if ((byPlayer[pid]?.[k] ?? 0) > 0) party += 1;
    out[k] = party * PARTY_WEIGHT + Math.min(tot, PARTY_WEIGHT - 1);
  }
  return out;
}
