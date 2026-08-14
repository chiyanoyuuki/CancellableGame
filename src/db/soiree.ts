import type { SoireeState } from '../core/soiree';
import { kvDelete, kvGetJSON, kvSetJSON } from './kv';

/**
 * Persistance de la soirée en cours (une seule à la fois) via le magasin kv.
 * Elle survit à un redémarrage de l'app, comme une partie sauvegardée.
 */

const KEY = 'soiree:active';

export async function getActiveSoiree(): Promise<SoireeState | null> {
  return kvGetJSON<SoireeState | null>(KEY, null);
}

export async function saveActiveSoiree(state: SoireeState): Promise<void> {
  await kvSetJSON(KEY, state);
}

export async function clearActiveSoiree(): Promise<void> {
  await kvDelete(KEY);
}
