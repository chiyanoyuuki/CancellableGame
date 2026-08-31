import type { MiniGameDefinition } from '../types';
import { AliasConfigComponent } from './AliasConfig';
import { AliasPlayComponent } from './AliasPlay';

export const aliasGame: MiniGameDefinition = {
  id: 'alias',
  title: 'Fais deviner',
  emoji: '🗣️',
  description:
    "En équipes, fais deviner un maximum de mots aux tiens sans les prononcer, contre le chrono. Chaque mot trouvé rapporte un point. Rires et cris garantis.",
  minPlayers: 4,
  available: true,
  ConfigComponent: AliasConfigComponent,
  PlayComponent: AliasPlayComponent,
};
