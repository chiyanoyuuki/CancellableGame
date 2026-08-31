import { bombeGame } from './bombe';
import { cultureOuGageGame } from './cultureougage';
import { duelGame } from './duel';
import { duelUltimeGame } from './duelultime';
import { imposteurGame } from './imposteur';
import { quiDeNousGame } from './quidenous';
import { quizGame } from './quiz';
import { tuPreferesGame } from './tupreferes';
import type { MiniGameDefinition } from './types';

/**
 * The catalogue of mini-games. Register new games here; the rest of the app
 * (selection screen, config, play, stats) is generic and needs no other change.
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
];

export function getGame(id: string): MiniGameDefinition | null {
  return MINI_GAMES.find((g) => g.id === id) ?? null;
}
