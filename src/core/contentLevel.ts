import type { CancelLevel } from './models';

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
