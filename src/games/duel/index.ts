import type { MiniGameDefinition } from '../types';
import { DuelConfigComponent } from './DuelConfig';
import { DuelPlayComponent } from './DuelPlay';

export const duelGame: MiniGameDefinition = {
  id: 'duel',
  title: 'Duel',
  emoji: '⚔️',
  description: 'Élimination ! Chacun sur son thème, difficulté croissante. Une erreur et tu es éliminé. Dernier debout gagne.',
  minPlayers: 2,
  available: true,
  ConfigComponent: DuelConfigComponent,
  PlayComponent: DuelPlayComponent,
};
