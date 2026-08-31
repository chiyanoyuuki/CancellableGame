/**
 * Préférences de découverte des univers : favoris épinglés et univers
 * récemment joués. Logique pure (sans I/O ni React) pour être testée sous jest ;
 * la persistance (kv SQLite) est faite par l'écran de configuration.
 *
 * Les favoris sont un simple ensemble ordonné (ordre d'ajout). Les récents sont
 * une pile « plus récent d'abord », dédupliquée et plafonnée — et on n'y ajoute
 * que les parties « ciblées » (peu d'univers), pour ne pas la noyer quand l'hôte
 * joue tous les thèmes.
 */

/** Nombre d'univers récents conservés / affichés. */
export const RECENT_UNIVERSES_CAP = 12;

/**
 * Au-delà de ce nombre d'univers effectivement jouables dans une partie, on
 * considère la sélection « large » et on n'enregistre PAS de récents (sinon la
 * liste se remplit de tout le catalogue et perd son intérêt de raccourci).
 */
export const RECENT_RECORD_MAX = 12;

/** Ajoute ou retire un univers des favoris (bascule). */
export function toggleFavorite(favorites: readonly string[], universe: string): string[] {
  return favorites.includes(universe)
    ? favorites.filter((u) => u !== universe)
    : [...favorites, universe];
}

/**
 * Empile des univers joués en tête de la liste des récents, dédupliqués et
 * plafonnés. `played` est ignoré s'il est vide ou trop large (voir
 * `RECENT_RECORD_MAX`) : dans ce cas la liste existante est renvoyée telle quelle.
 */
export function pushRecent(
  recent: readonly string[],
  played: readonly string[],
  cap = RECENT_UNIVERSES_CAP,
): string[] {
  if (played.length === 0 || played.length > RECENT_RECORD_MAX) return [...recent];
  const out: string[] = [];
  for (const u of [...played, ...recent]) {
    if (!out.includes(u)) out.push(u);
  }
  return out.slice(0, cap);
}

/** Minuscules sans accents ni diacritiques — pour une recherche tolérante. */
export function normalizeSearch(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Vrai si `name` correspond à la requête (sous-chaîne, insensible aux accents). */
export function matchesQuery(name: string, query: string): boolean {
  const q = normalizeSearch(query);
  return q.length === 0 || normalizeSearch(name).includes(q);
}

/**
 * Conserve, dans l'ordre donné, les entrées de `pinned` qui existent dans le
 * catalogue courant `available` (un favori/récent d'un thème non sélectionné ou
 * d'un univers disparu ne doit pas s'afficher).
 */
export function presentPinned(pinned: readonly string[], available: ReadonlySet<string>): string[] {
  return pinned.filter((u) => available.has(u));
}
