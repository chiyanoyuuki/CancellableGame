import type { MiniGameDefinition } from '../types';
import { BombeConfigComponent } from './BombeConfig';
import { BombePlayComponent } from './BombePlay';

export const bombeGame: MiniGameDefinition = {
  id: 'bombe',
  title: 'La Bombe',
  emoji: '💣',
  description: 'Élimination ! Réponds juste pour refiler la bombe. Celui qui la tient quand elle explose est éliminé.',
  minPlayers: 2,
  available: true,
  ConfigComponent: BombeConfigComponent,
  PlayComponent: BombePlayComponent,
};
