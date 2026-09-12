import type { CancelLevel, Question } from './models';
import { type Rng, shuffle } from './rng';

/**
 * Filtrage du contenu par niveaux de « cancellabilité » ACTIFS. Chaque banque
 * garde un contenu de BASE (grand public, niveau 1) et un contenu OSÉ tagué de
 * son niveau (`lvl` ∈ {2,3,4}). Les niveaux sont INDÉPENDANTS : `filterHot`
 * renvoie les items osés dont le niveau fait partie des niveaux actifs (le
 * contenu de base niveau 1 est géré à part par chaque banque).
 */

/** Tout item osé porte son niveau de « cancellabilité ». */
export interface Leveled {
  lvl: CancelLevel;
}

/** Items osés dont le niveau est actif. */
export function filterHot<H extends Leveled>(hot: readonly H[], levels: readonly CancelLevel[]): H[] {
  const set = new Set(levels);
  return hot.filter((h) => set.has(h.lvl));
}

/** Part visée par PALIER osé dans le paquet servi (le reste va au chill). */
export const SPICY_TARGET_SHARE = 0.1;

/**
 * Recompose un pool DÉJÀ filtré sur les niveaux actifs pour éviter que l'énorme
 * banque chill ne noie le contenu osé : chaque palier osé présent vise ~10 % du
 * paquet, le chill prend le reste (ex. chill + 3 paliers → 70/10/10/10 ;
 * chill + 1 palier → 90/10).
 *
 * Sûr par construction : s'il n'y a pas de contenu osé, OU pas de chill (niveau 1
 * désactivé), le pool est renvoyé tel quel — aucun plafonnement, donc aucun
 * risque de manquer de questions. À appliquer sur le pool déjà filtré (niveaux,
 * thèmes, univers, droits) pour que le ratio vaille dans ce que le mode tire.
 */
export function blendByCancelLevel(pool: readonly Question[], rng: Rng): Question[] {
  const chill: Question[] = [];
  const spicy: Question[] = [];
  for (const q of pool) ((q.cancelLevel ?? 1) > 1 ? spicy : chill).push(q);
  if (spicy.length === 0 || chill.length === 0) return [...pool];
  const tiers = new Set(spicy.map((q) => q.cancelLevel ?? 1)).size; // paliers osés présents
  const spicyShare = Math.min(0.9, SPICY_TARGET_SHARE * tiers); // ex. 3 paliers = 0.30
  // total × spicyShare = spicy.length  ⇒  chill visé = total × (1 − spicyShare)
  const total = spicy.length / spicyShare;
  const chillNeeded = Math.min(chill.length, Math.round(total * (1 - spicyShare)));
  const chillPick = shuffle([...chill], rng).slice(0, chillNeeded);
  return shuffle([...chillPick, ...spicy], rng);
}
