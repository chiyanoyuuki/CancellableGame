import type { CancelLevel } from '../core/models';
import { FREE_CANCEL_LEVEL } from '../store/products';

/**
 * Niveau de « cancellabilité » global (Réglages / config des modes). Simple
 * préférence en mémoire, persistée en base via la clé kv `ui:cancelLevel` et
 * chargée au démarrage — même schéma que « Sans alcool » (`drinkMode`).
 *
 * Deux valeurs : le niveau CHOISI par l'utilisateur (`chosen`) et le fait que le
 * pack « Cancellable » soit possédé (`owned`, tenu à jour par le StoreProvider).
 * `getCancelLevel()` renvoie le niveau EFFECTIF, borné au gratuit tant que le
 * pack n'est pas acheté — c'est la barrière centrale : même si un mode est lancé
 * sans passer par le sélecteur, le contenu osé reste verrouillé.
 */

export const CANCEL_KV = 'ui:cancelLevel';

let chosen: CancelLevel = 1;
let owned = false;

export function setCancelLevel(l: CancelLevel): void {
  chosen = l;
}

/** Niveau tel que choisi (non borné) — pour l'affichage du sélecteur. */
export function getChosenCancelLevel(): CancelLevel {
  return chosen;
}

/** Le StoreProvider synchronise ici la possession du pack « Cancellable ». */
export function setCancelOwned(o: boolean): void {
  owned = o;
}

export function isCancelOwned(): boolean {
  return owned;
}

/** Niveau EFFECTIF appliqué au contenu : borné au gratuit sans le pack. */
export function getCancelLevel(): CancelLevel {
  return owned ? chosen : (Math.min(chosen, FREE_CANCEL_LEVEL) as CancelLevel);
}
