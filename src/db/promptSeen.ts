import { kvGetJSON, kvSetJSON } from './kv';

/**
 * Compteur « déjà vu » des banques de prompts (Tu préfères, Qui de nous),
 * l'équivalent léger de `question_history` du quiz : on retient combien de fois
 * chaque item a été montré, pour resservir en priorité les moins vus.
 */
export type PromptGame = 'tupreferes' | 'quidenous';

const KV_KEY: Record<PromptGame, string> = {
  tupreferes: 'seen:tupreferes',
  quidenous: 'seen:quidenous',
};

/** Nombre de passages par clé d'item (clé absente = jamais vu). */
export async function getPromptSeen(game: PromptGame): Promise<Record<string, number>> {
  return kvGetJSON<Record<string, number>>(KV_KEY[game], {});
}

/** Incrémente le compteur des items montrés pendant une partie (un seul write). */
export async function recordPromptSeen(game: PromptGame, keys: readonly string[]): Promise<void> {
  if (keys.length === 0) return;
  const cur = await kvGetJSON<Record<string, number>>(KV_KEY[game], {});
  for (const k of keys) cur[k] = (cur[k] ?? 0) + 1;
  await kvSetJSON(KV_KEY[game], cur);
}
