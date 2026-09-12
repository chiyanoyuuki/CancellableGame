import type { CancelLevel } from '../core/models';
import { FREE_CANCEL_LEVEL } from '../store/products';

/**
 * Niveaux de « cancellabilité » ACTIFS (Chill 1, Épicé 2, +18 3, Cancellable 4).
 * Sélection INDÉPENDANTE : chaque niveau s'active/se désactive séparément — on
 * peut par exemple ne garder que 1 et 4. Réglage global, persisté en base
 * (`ui:cancelLevels`) et chargé au démarrage.
 *
 * Deux vues : les niveaux CHOISIS par l'utilisateur (`chosen`) et le fait que le
 * pack « Cancellable » soit possédé (`owned`, tenu à jour par le StoreProvider).
 * `getActiveCancelLevels()` renvoie les niveaux EFFECTIFS : les niveaux osés (>1)
 * sont retirés tant que le pack n'est pas acheté — barrière centrale, même si un
 * mode est lancé sans passer par le sélecteur.
 */

export const CANCEL_KV = 'ui:cancelLevels';

let chosen: CancelLevel[] = [1];
let owned = false;

function sanitize(levels: readonly CancelLevel[]): CancelLevel[] {
  const uniq = [...new Set(levels)].filter((l): l is CancelLevel => l >= 1 && l <= 4);
  return uniq.length > 0 ? uniq.sort((a, b) => a - b) : [1];
}

export function setActiveCancelLevels(levels: readonly CancelLevel[]): void {
  chosen = sanitize(levels);
}

/** Niveaux tels que choisis (non filtrés par la possession) — pour le sélecteur. */
export function getChosenCancelLevels(): CancelLevel[] {
  return [...chosen];
}

/** Le StoreProvider synchronise ici la possession du pack « Cancellable ». */
export function setCancelOwned(o: boolean): void {
  owned = o;
}

export function isCancelOwned(): boolean {
  return owned;
}

/** Niveaux EFFECTIFS appliqués au contenu : les niveaux osés exigent le pack. */
export function getActiveCancelLevels(): CancelLevel[] {
  const eff = chosen.filter((l) => l <= FREE_CANCEL_LEVEL || owned);
  return eff.length > 0 ? eff : [1];
}
