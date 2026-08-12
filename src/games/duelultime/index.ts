import type { MiniGameDefinition } from '../types';
import { DuelUltimeConfigComponent } from './DuelUltimeConfig';
import { DuelUltimePlayComponent } from './DuelUltimePlay';

export const duelUltimeGame: MiniGameDefinition = {
  id: 'duelultime',
  title: 'Duel Ultime',
  emoji: '🥊',
  description: "Chacun choisit un ou plusieurs univers et affronte des questions pro, sans propositions. Meilleur score gagne. Jouable en solo.",
  minPlayers: 1,
  available: true,
  ConfigComponent: DuelUltimeConfigComponent,
  PlayComponent: DuelUltimePlayComponent,
};
