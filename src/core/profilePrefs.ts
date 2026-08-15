/**
 * Préférences de profil : garde-fous partagés entre l'app et le formulaire web.
 *
 * Un joueur peut « éviter » des univers, mais on lui en garde toujours un minimum
 * de non exclus, sinon il n'y a plus rien à tirer pour lui. Les entrées de type
 * « #thème » (rébus, énigmes… sans univers) ne comptent PAS comme des univers.
 */

/** Nombre minimum d'univers qu'un profil doit garder non exclus. */
export const MIN_KEPT_UNIVERSES = 10;

/** Nombre d'univers (hors thèmes « #… ») présents dans une liste d'évitement. */
export function countExcludedUniverses(unwanted: readonly string[]): number {
  return unwanted.reduce((n, u) => (u.startsWith('#') ? n : n + 1), 0);
}

/** Univers restant non exclus, étant donné le total d'univers du catalogue. */
export function keptUniverses(totalUniverses: number, unwanted: readonly string[]): number {
  return Math.max(0, totalUniverses - countExcludedUniverses(unwanted));
}

/** Vrai si le choix laisse au moins `MIN_KEPT_UNIVERSES` univers non exclus. */
export function keepsEnoughUniverses(totalUniverses: number, unwanted: readonly string[]): boolean {
  return keptUniverses(totalUniverses, unwanted) >= MIN_KEPT_UNIVERSES;
}
