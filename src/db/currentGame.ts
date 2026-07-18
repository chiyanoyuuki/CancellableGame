import { uid } from '../core/id';
import type { Player } from '../core/models';
import { kvGetJSON, kvSetJSON } from './kv';

/**
 * Parties sauvegardées (plusieurs à la fois).
 *
 * Chaque partie lancée occupe un « slot » identifié par `slotId`. Son état
 * complet, sérialisable, est persisté à chaque changement : on peut donc
 * lancer et sauvegarder autant de parties qu'on veut, les reprendre plus tard,
 * et l'appli rouvre automatiquement la plus récente. Un slot est effacé quand
 * la partie se termine (toutes les questions jouées) ou via « Terminer ».
 */

const SAVED_GAMES_KEY = 'game:saved';

export interface SavedGame {
  slotId: string;
  gameId: string;
  /** Nom lisible (joueurs + date) affiché dans la liste. */
  name: string;
  players: Player[];
  /** Mini-game config (opaque ici). */
  config: unknown;
  /** État de jeu sérialisé (ex. un QuizState). */
  state: unknown;
  startedAt: number;
  savedAt: number;
}

export function newSlotId(): string {
  return uid();
}

function defaultName(players: Player[]): string {
  const names = players.map((p) => p.name).join(', ');
  const short = names.length > 32 ? `${names.slice(0, 31).trimEnd()}…` : names;
  const d = new Date();
  const p2 = (n: number) => String(n).padStart(2, '0');
  const when = `${p2(d.getDate())}/${p2(d.getMonth() + 1)} ${p2(d.getHours())}h${p2(d.getMinutes())}`;
  return short ? `${short} · ${when}` : `Partie · ${when}`;
}

export async function listSavedGames(): Promise<SavedGame[]> {
  const list = await kvGetJSON<SavedGame[]>(SAVED_GAMES_KEY, []);
  if (!Array.isArray(list)) return [];
  return [...list].filter((g) => g && g.slotId && g.state != null).sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
}

export async function getSavedGame(slotId: string): Promise<SavedGame | null> {
  const list = await listSavedGames();
  return list.find((g) => g.slotId === slotId) ?? null;
}

export async function mostRecentSavedGame(): Promise<SavedGame | null> {
  const list = await listSavedGames();
  return list[0] ?? null;
}

export async function saveGame(g: Omit<SavedGame, 'savedAt' | 'name'> & { name?: string }): Promise<void> {
  const list = await listSavedGames();
  const existing = list.find((x) => x.slotId === g.slotId);
  const name = g.name ?? existing?.name ?? defaultName(g.players);
  const next: SavedGame = { ...g, name, savedAt: Date.now() };
  const others = list.filter((x) => x.slotId !== g.slotId);
  await kvSetJSON(SAVED_GAMES_KEY, [next, ...others]);
}

export async function deleteSavedGame(slotId: string): Promise<void> {
  const list = await listSavedGames();
  await kvSetJSON(SAVED_GAMES_KEY, list.filter((g) => g.slotId !== slotId));
}
