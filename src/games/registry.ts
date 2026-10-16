import { aliasGame } from './alias';
import { bombeGame } from './bombe';
import { cultureOuGageGame } from './cultureougage';
import { donjonsGame } from './donjons';
import { duelGame } from './duel';
import { duelUltimeGame } from './duelultime';
import { imposteurGame } from './imposteur';
import { quiDeNousGame } from './quidenous';
import { quizGame } from './quiz';
import { tuPreferesGame } from './tupreferes';
import type { MiniGameDefinition } from './types';

/**
 * Modes temporairement masqués : on garde tout leur code pour pouvoir les
 * réactiver à l'occasion — il suffit de retirer leur id de cette liste.
 * Duel, La Bombe, Fais deviner (alias) et Donjons & Gorgées.
 */
const HIDDEN_GAME_IDS = new Set(['duel', 'bombe', 'alias', 'donjons']);

/**
 * The catalogue of mini-games. Register new games here; the rest of the app
 * (selection screen, config, play, stats) is generic and needs no other change.
 * Les modes listés dans `HIDDEN_GAME_IDS` restent dans le catalogue (pour que
 * `getGame` les résolve) mais sont marqués `hidden` et filtrés de l'affichage.
 */
export const MINI_GAMES: MiniGameDefinition[] = [
  quizGame,
  bombeGame,
  duelGame,
  duelUltimeGame,
  imposteurGame,
  tuPreferesGame,
  quiDeNousGame,
  cultureOuGageGame,
  aliasGame,
  donjonsGame,
].map((g) => (HIDDEN_GAME_IDS.has(g.id) ? { ...g, hidden: true } : g));

export function getGame(id: string): MiniGameDefinition | null {
  return MINI_GAMES.find((g) => g.id === id) ?? null;
}
