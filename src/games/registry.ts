import { bombeGame } from './bombe';
import { duelGame } from './duel';
import { quizGame } from './quiz';
import type { MiniGameDefinition } from './types';

/**
 * The catalogue of mini-games. Register new games here; the rest of the app
 * (selection screen, config, play, stats) is generic and needs no other change.
 */
export const MINI_GAMES: MiniGameDefinition[] = [
  quizGame,
  bombeGame,
  duelGame,
];

export function getGame(id: string): MiniGameDefinition | null {
  return MINI_GAMES.find((g) => g.id === id) ?? null;
}
