import type { MiniGameDefinition } from '../types';
import { CultureConfigComponent } from './CultureConfig';
import { CulturePlayComponent } from './CulturePlay';

export const cultureOuGageGame: MiniGameDefinition = {
  id: 'cultureougage',
  title: 'Culture ou gage',
  emoji: '🎲',
  description:
    "Une question éclair à ton tour : bonne réponse, +1 point ; mauvaise réponse, tu piges un gage (et des gorgées si tu veux). Le quiz qui pimente la soirée.",
  minPlayers: 2,
  available: true,
  ConfigComponent: CultureConfigComponent,
  PlayComponent: CulturePlayComponent,
};
