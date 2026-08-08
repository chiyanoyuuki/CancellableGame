import type { MiniGameDefinition } from '../types';
import { DuelUltimeConfigComponent } from './DuelUltimeConfig';
import { DuelUltimePlayComponent } from './DuelUltimePlay';

export const duelUltimeGame: MiniGameDefinition = {
  id: 'duelultime',
  title: 'Duel Ultime',
  emoji: '🥊',
  description: "Chacun choisit son univers et affronte 10 questions pro dessus. Meilleur score gagne. Jouable en solo.",
  minPlayers: 1,
  available: true,
  ConfigComponent: DuelUltimeConfigComponent,
  PlayComponent: DuelUltimePlayComponent,
};
