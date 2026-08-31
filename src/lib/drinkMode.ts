/**
 * Préférence globale « Sans alcool ». Quand elle est active, les nouveaux modes
 * proposent par défaut de jouer sans gorgées, et la Roue des gages s'ouvre sur
 * les gages soft. C'est une simple préférence en mémoire (persistée en base via
 * la clé kv `ui:noAlcohol`), chargée au démarrage — comme les vibrations/sons.
 */

let noAlcohol = false;

export function setNoAlcohol(on: boolean): void {
  noAlcohol = on;
}
export function isNoAlcohol(): boolean {
  return noAlcohol;
}
