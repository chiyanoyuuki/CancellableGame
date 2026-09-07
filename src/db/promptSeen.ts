import { kvGetJSON, kvSetJSON } from './kv';

/**
 * Suivi « déjà vu » des banques de prompts (Tu préfères, Qui de nous), PAR
 * JOUEUR — l'équivalent léger de l'historique par joueur du quiz. Pour chaque
 * joueur on retient combien de fois il a vu chaque item ; on peut alors, pour la
 * partie en cours, prioriser les prompts que le MOINS de joueurs présents ont
 * déjà vus (plus de découverte pour le groupe), exactement comme le quiz.
 */
export type PromptGame = 'tupreferes' | 'quidenous';

/** Vues par joueur : playerId → (clé d'item → nombre de passages). */
export type PromptSeenByPlayer = Record<string, Record<string, number>>;

const KV_KEY: Record<PromptGame, string> = {
  tupreferes: 'seen:tupreferes:byplayer',
  quidenous: 'seen:quidenous:byplayer',
};

/** Vues par joueur (map vide si rien encore). */
export async function getPromptSeenByPlayer(game: PromptGame): Promise<PromptSeenByPlayer> {
  return kvGetJSON<PromptSeenByPlayer>(KV_KEY[game], {});
}

/**
 * Incrémente, pour chacun des joueurs de la partie, le compteur des items qu'ils
 * viennent de voir (un seul write). Tous les joueurs présents voient les mêmes
 * prompts (activité de groupe sur un téléphone partagé).
 */
export async function recordPromptSeen(
  game: PromptGame,
  playerIds: readonly string[],
  keys: readonly string[],
): Promise<void> {
  if (playerIds.length === 0 || keys.length === 0) return;
  const cur = await kvGetJSON<PromptSeenByPlayer>(KV_KEY[game], {});
  for (const pid of playerIds) {
    const counts = cur[pid] ?? {};
    for (const k of keys) counts[k] = (counts[k] ?? 0) + 1;
    cur[pid] = counts;
  }
  await kvSetJSON(KV_KEY[game], cur);
}
