import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

import { type Note, sequenceToWavBase64 } from './wav';

/**
 * Effets sonores sémantiques, centralisés (comme `haptics`). On appelle
 * `sounds.correct()` plutôt que d'éparpiller de l'audio dans les écrans, et un
 * interrupteur global (Réglages) coupe tout. Les sons sont SYNTHÉTISÉS au
 * premier usage (aucun fichier embarqué) : on écrit un petit WAV dans le cache
 * puis on le joue. Tout est « best-effort » — jamais d'erreur remontée.
 */

let enabled = false; // désactivé par défaut (comme la lecture vocale)

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  if (on) void ensureAudioMode();
}
export function isSoundEnabled(): boolean {
  return enabled;
}

let audioModeSet = false;
async function ensureAudioMode(): Promise<void> {
  if (audioModeSet) return;
  audioModeSet = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {
    // best-effort
  }
}

const SR = 22050;

/** Recettes de chaque effet : une séquence de notes (voir wav.ts). */
const RECIPES: Record<string, Note[]> = {
  // Ding montant, timbre clair « bonne réponse ».
  correct: [
    { freq: 784, start: 0, dur: 0.12, gain: 0.28 },
    { freq: 1175, start: 0.09, dur: 0.22, gain: 0.3 },
  ],
  // Buzz grave « raté », timbre carré (harmoniques impaires).
  wrong: [
    { freq: 160, start: 0, dur: 0.28, gain: 0.32, partials: [1, 0, 0.5, 0, 0.3], decay: 5 },
  ],
  // Petit tic sec (compte à rebours, sélection).
  tick: [{ freq: 1300, start: 0, dur: 0.05, gain: 0.22, partials: [1], decay: 40 }],
  // Fanfare de victoire : arpège majeur do-mi-sol-do.
  win: [
    { freq: 523, start: 0, dur: 0.5, gain: 0.24 },
    { freq: 659, start: 0.11, dur: 0.5, gain: 0.24 },
    { freq: 784, start: 0.22, dur: 0.5, gain: 0.24 },
    { freq: 1046, start: 0.33, dur: 0.6, gain: 0.28 },
  ],
  // Chime doux « révélation ».
  reveal: [
    { freq: 660, start: 0, dur: 0.16, gain: 0.24 },
    { freq: 990, start: 0.1, dur: 0.28, gain: 0.26 },
  ],
};

const players: Partial<Record<string, AudioPlayer>> = {};
const building: Partial<Record<string, Promise<AudioPlayer | null>>> = {};

/** Crée (une fois) le lecteur d'un effet en écrivant son WAV dans le cache. */
async function getPlayer(key: string): Promise<AudioPlayer | null> {
  if (players[key]) return players[key] as AudioPlayer;
  if (building[key]) return building[key] as Promise<AudioPlayer | null>;
  const notes = RECIPES[key];
  if (!notes) return null;
  const task = (async () => {
    try {
      const dir = FileSystem.cacheDirectory;
      if (!dir) return null;
      const uri = `${dir}sfx-${key}.wav`;
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) {
        const b64 = sequenceToWavBase64(notes, SR);
        await FileSystem.writeAsStringAsync(uri, b64, { encoding: FileSystem.EncodingType.Base64 });
      }
      const player = createAudioPlayer({ uri });
      players[key] = player;
      return player;
    } catch {
      return null;
    }
  })();
  building[key] = task;
  return task;
}

function play(key: string): void {
  if (!enabled) return;
  void (async () => {
    try {
      await ensureAudioMode();
      const player = await getPlayer(key);
      if (!player) return;
      try {
        await player.seekTo(0);
      } catch {
        // premier lancement : pas besoin de rembobiner
      }
      player.play();
    } catch {
      // best-effort
    }
  })();
}

export const sounds = {
  /** Bonne réponse / réussite. */
  correct: () => play('correct'),
  /** Mauvaise réponse / échec. */
  wrong: () => play('wrong'),
  /** Petit tic (compte à rebours, sélection). */
  tick: () => play('tick'),
  /** Victoire / fin de partie. */
  win: () => play('win'),
  /** Révélation (résultat de manche, retournement). */
  reveal: () => play('reveal'),
};
