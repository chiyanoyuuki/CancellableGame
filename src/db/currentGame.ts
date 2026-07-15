import type { Player } from '../core/models';
import { kvDelete, kvGet, kvSetJSON } from './kv';

/**
 * Sauvegarde de LA partie en cours (une seule à la fois).
 *
 * L'état complet du jeu est sérialisable ; on le persiste à chaque changement
 * pour pouvoir reprendre automatiquement la partie même après avoir quitté
 * l'appli ou fait « retour ». Lancer une nouvelle partie écrase celle-ci, et on
 * l'efface quand la partie se termine (toutes les questions jouées) ou via le
 * bouton « Terminer la partie ».
 */

const CURRENT_GAME_KEY = 'game:current';

export interface SavedGame {
  gameId: string;
  players: Player[];
  /** Mini-game config (opaque here). */
  config: unknown;
  /** Serialised game state (e.g. a QuizState). */
  state: unknown;
  startedAt: number;
  savedAt: number;
}

export async function saveCurrentGame(g: Omit<SavedGame, 'savedAt'>): Promise<void> {
  await kvSetJSON(CURRENT_GAME_KEY, { ...g, savedAt: Date.now() });
}

export async function loadCurrentGame(): Promise<SavedGame | null> {
  const raw = await kvGet(CURRENT_GAME_KEY);
  if (raw == null) return null;
  try {
    const g = JSON.parse(raw) as SavedGame;
    if (!g || typeof g !== 'object' || !g.gameId || g.state == null) return null;
    return g;
  } catch {
    return null;
  }
}

export async function clearCurrentGame(): Promise<void> {
  await kvDelete(CURRENT_GAME_KEY);
}
