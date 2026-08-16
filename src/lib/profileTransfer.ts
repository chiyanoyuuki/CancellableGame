import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { Player } from '../core/models';
import {
  addSeenQuestionsForPlayer,
  createPlayer,
  getPlayer,
  getPlayerUnwantedUniverses,
  getQuestionHistoryByPlayer,
  setPlayerUnwantedUniverses,
} from '../db';

/**
 * Transfert d'UN profil complet entre téléphones : pseudo, avatar (emoji ou
 * photo), univers évités ET questions déjà vues. Passe par un fichier JSON
 * partagé (les questions vues peuvent être nombreuses : impossible via un QR).
 */

const KIND = 'cancellable-profile';
const VERSION = 1;

interface ProfileFile {
  kind: string;
  version: number;
  name: string;
  emoji: string;
  color: string;
  /** Photo de profil encodée en base64 (JPEG), si le profil en a une. */
  photoBase64?: string;
  /** Univers/catégories évités. */
  unwanted: string[];
  /** Questions déjà vues : id + date de dernière apparition. */
  seen: { id: string; at: number }[];
}

/** Exporte le profil dans un fichier JSON et ouvre la feuille de partage. */
export async function exportProfile(playerId: string): Promise<void> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error('Profil introuvable');

  const [unwantedMap, historyMap] = await Promise.all([
    getPlayerUnwantedUniverses(),
    getQuestionHistoryByPlayer(),
  ]);
  const hist = historyMap[playerId] ?? {};
  const seen = Object.entries(hist).map(([id, h]) => ({ id, at: h.lastUsedAt }));

  let photoBase64: string | undefined;
  if (player.photoUri) {
    try {
      photoBase64 = await FileSystem.readAsStringAsync(player.photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch {
      // photo illisible : on exporte sans
    }
  }

  const data: ProfileFile = {
    kind: KIND,
    version: VERSION,
    name: player.name,
    emoji: player.emoji,
    color: player.color,
    photoBase64,
    unwanted: unwantedMap[playerId] ?? [],
    seen,
  };

  const safe = player.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'profil';
  const uri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}cancellable-profil-${safe}-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(data));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: `Profil de ${player.name}` });
  }
}

/**
 * Laisse choisir un fichier de profil et l'importe comme NOUVEAU joueur
 * (nouvel identifiant, jamais d'écrasement). Renvoie le joueur créé, ou null
 * si l'utilisateur annule.
 */
export async function importProfile(): Promise<Player | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (res.canceled || !res.assets?.[0]) return null;

  const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
  const data = JSON.parse(text) as ProfileFile;
  if (data.kind !== KIND || !data.name) throw new Error('Fichier de profil non reconnu');

  // Photo : réécrite dans le dossier de l'app (pour survivre au redémarrage).
  let photoUri: string | undefined;
  if (data.photoBase64) {
    try {
      const dir = `${FileSystem.documentDirectory}avatars`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => undefined);
      const dest = `${dir}/${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(dest, data.photoBase64, { encoding: FileSystem.EncodingType.Base64 });
      photoUri = dest;
    } catch {
      // photo illisible : on importe sans
    }
  }

  const player = await createPlayer({ name: data.name, emoji: data.emoji, color: data.color, photoUri });

  if (Array.isArray(data.unwanted) && data.unwanted.length > 0) {
    const map = await getPlayerUnwantedUniverses();
    map[player.id] = data.unwanted.filter((u) => typeof u === 'string');
    await setPlayerUnwantedUniverses(map);
  }

  if (Array.isArray(data.seen) && data.seen.length > 0) {
    const seen = data.seen
      .filter((s) => s && typeof s.id === 'string')
      .map((s) => ({ id: s.id, at: Number(s.at) || Date.now() }));
    await addSeenQuestionsForPlayer(player.id, seen);
  }

  return player;
}
