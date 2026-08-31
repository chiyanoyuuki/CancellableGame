import * as Speech from 'expo-speech';

import { currentLang } from './i18n';

/**
 * Lecture vocale (text-to-speech) des questions — pratique en soirée (tout le
 * monde entend l'énoncé) et pour l'accessibilité. Centralisé comme les
 * vibrations : un seul interrupteur global (Réglages), et chaque appel est
 * « best-effort », jamais d'erreur remontée à l'appelant. Désactivé par défaut.
 */

let enabled = false;

/** Active/désactive la lecture vocale (préférence utilisateur). */
export function setSpeechEnabled(on: boolean): void {
  enabled = on;
  if (!on) stopSpeaking();
}
export function isSpeechEnabled(): boolean {
  return enabled;
}

/** Lit un texte à voix haute dans la langue active. Coupe la lecture en cours. */
export function speak(text: string): void {
  if (!enabled || !text) return;
  try {
    Speech.stop();
    Speech.speak(text, { language: currentLang() === 'en' ? 'en-US' : 'fr-FR' });
  } catch {
    // Moteur TTS indisponible : on ignore silencieusement.
  }
}

export function stopSpeaking(): void {
  try {
    void Speech.stop();
  } catch {
    // ignore
  }
}
