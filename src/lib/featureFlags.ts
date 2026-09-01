/**
 * Interrupteurs des fonctionnalités optionnelles (toutes activées par défaut).
 * Chacune peut être désactivée depuis Réglages › Fonctionnalités. En mémoire,
 * persistées via kv, chargées au démarrage — comme les autres préférences.
 */

export type FeatureFlag = 'teamGen' | 'streakCalendar' | 'weeklyRecap' | 'jokers' | 'tiebreak';

/** Clé kv de persistance par interrupteur. */
export const FLAG_KV: Record<FeatureFlag, string> = {
  teamGen: 'ui:feat:teamGen',
  streakCalendar: 'ui:feat:streakCalendar',
  weeklyRecap: 'ui:feat:weeklyRecap',
  jokers: 'ui:feat:jokers',
  tiebreak: 'ui:feat:tiebreak',
};

export const ALL_FLAGS: FeatureFlag[] = ['teamGen', 'streakCalendar', 'weeklyRecap', 'jokers', 'tiebreak'];

const flags: Record<FeatureFlag, boolean> = {
  teamGen: true,
  streakCalendar: true,
  weeklyRecap: true,
  jokers: true,
  tiebreak: true,
};

export function setFlag(flag: FeatureFlag, on: boolean): void {
  flags[flag] = on;
}
export function getFlag(flag: FeatureFlag): boolean {
  return flags[flag];
}
