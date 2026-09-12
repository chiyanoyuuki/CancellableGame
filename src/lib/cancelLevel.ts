import type { CancelLevel } from '../core/models';

/**
 * Niveau de « cancellabilité » global (Réglages / config des modes). Simple
 * préférence en mémoire, persistée en base via la clé kv `ui:cancelLevel` et
 * chargée au démarrage — même schéma que « Sans alcool » (`drinkMode`). Les
 * banques de contenu tagué (Tu préfères, Qui de nous…) ne servent que les items
 * dont le niveau requis est ≤ à ce plafond.
 */

export const CANCEL_KV = 'ui:cancelLevel';

let level: CancelLevel = 1;

export function setCancelLevel(l: CancelLevel): void {
  level = l;
}

export function getCancelLevel(): CancelLevel {
  return level;
}
