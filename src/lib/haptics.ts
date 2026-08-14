import * as Haptics from 'expo-haptics';

/**
 * Vibrations sémantiques, centralisées. On appelle `haptics.correct()` plutôt
 * que d'éparpiller les types Expo dans chaque écran : un seul endroit décide du
 * ressenti, et un interrupteur global (Réglages) peut tout couper. Chaque appel
 * est « best-effort » — jamais d'erreur remontée à l'appelant.
 *
 * (Les sons sont volontairement laissés en option : déposer des fichiers audio
 * dans assets/audio/ et les jouer ici suffira à ajouter une couche sonore.)
 */

let enabled = true;

/** Active/désactive toutes les vibrations (préférence utilisateur). */
export function setHapticsEnabled(on: boolean): void {
  enabled = on;
}
export function areHapticsEnabled(): boolean {
  return enabled;
}

const run = (fn: () => Promise<unknown>): void => {
  if (enabled) void fn().catch(() => undefined);
};

export const haptics = {
  /** Bonne réponse / bombe passée. */
  correct: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Mauvaise réponse (avertissement doux). */
  wrong: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  /** Échec net : élimination, explosion. */
  fail: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  /** Petit tic (compte à rebours). */
  tick: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Alerte moyenne (mèche qui raccourcit). */
  warn: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Impact fort (lancement, gros moment). */
  heavy: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  /** Sélection légère (changement d'option). */
  select: () => run(() => Haptics.selectionAsync()),
  /** Petite salve festive de victoire. */
  win: () => {
    if (!enabled) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined), 160);
    setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined), 320);
  },
};
