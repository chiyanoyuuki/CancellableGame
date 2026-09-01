/**
 * Préférence « Animations réduites » (accessibilité + confort sur vieux
 * téléphones). En mémoire, persistée via la clé kv `ui:reduceMotion`, chargée au
 * démarrage — comme les vibrations/sons. Quand elle est active, les écrans
 * sautent les animations non essentielles (splash, transitions, roue…).
 */

let reduce = false;

export function setReduceMotion(on: boolean): void {
  reduce = on;
}
export function isReduceMotion(): boolean {
  return reduce;
}
