import type { CancelLevel, Question } from './models';
import { type Rng, shuffle } from './rng';

/**
 * Filtrage du contenu par niveau de « cancellabilité ». Chaque banque de mode
 * garde un contenu de BASE (grand public, niveau 1, toujours servi) et un
 * contenu OSÉ tagué du niveau minimum requis (`lvl`). `filterHot` renvoie les
 * items osés autorisés pour un plafond donné — cumulatif : au niveau N, tout ce
 * qui est de niveau ≤ N passe ; au niveau 1, rien d'osé.
 */

/** Tout item osé porte le niveau minimum de « cancellabilité » requis. */
export interface Leveled {
  lvl: CancelLevel;
}

/** Items osés autorisés pour ce plafond (vide au niveau 1). */
export function filterHot<H extends Leveled>(hot: readonly H[], level: CancelLevel): H[] {
  return level <= 1 ? [] : hot.filter((h) => h.lvl <= level);
}

/** Part visée par PALIER osé dans le paquet servi (le reste va au chill). */
export const SPICY_TARGET_SHARE = 0.1;

/**
 * Recompose un pool de questions pour approcher la cible « ~70 % chill / ~10 %
 * par palier osé » : au niveau 4 → 70/10/10/10, niveau 3 → 80/10/10, niveau 2 →
 * 90/10. On garde TOUT le contenu osé présent et on plafonne le chill en
 * conséquence (la banque chill étant immense, elle noierait sinon le contenu osé).
 *
 * Sûr par construction : si le pool ne contient AUCUN contenu osé (p. ex. thèmes
 * sans univers adulte), il est renvoyé tel quel — aucun plafonnement, donc aucun
 * risque de manquer de questions. À appliquer sur le pool DÉJÀ filtré (thèmes,
 * univers, droits) pour que le ratio vaille dans ce que le mode va réellement tirer.
 */
export function blendByCancelLevel(pool: readonly Question[], level: CancelLevel, rng: Rng): Question[] {
  if (level <= 1) return [...pool];
  const chill: Question[] = [];
  const spicy: Question[] = [];
  for (const q of pool) ((q.cancelLevel ?? 1) > 1 ? spicy : chill).push(q);
  if (spicy.length === 0 || chill.length === 0) return [...pool];
  const tiers = new Set(spicy.map((q) => q.cancelLevel ?? 1)).size; // paliers osés présents
  const spicyShare = Math.min(0.9, SPICY_TARGET_SHARE * tiers); // ex. L4 (3 paliers) = 0.30
  // total × spicyShare = spicy.length  ⇒  chill visé = total × (1 − spicyShare)
  const total = spicy.length / spicyShare;
  const chillNeeded = Math.min(chill.length, Math.round(total * (1 - spicyShare)));
  const chillPick = shuffle([...chill], rng).slice(0, chillNeeded);
  return shuffle([...chillPick, ...spicy], rng);
}
