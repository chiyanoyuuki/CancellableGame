import type { MiniGameDefinition } from '../types';
import { ImposteurConfigComponent } from './ImposteurConfig';
import { ImposteurPlayComponent } from './ImposteurPlay';

export const imposteurGame: MiniGameDefinition = {
  id: 'imposteur',
  title: "L'Imposteur",
  emoji: '🕵️',
  description:
    "Un mot secret que tout le monde connaît… sauf l'imposteur. Chacun donne un indice, on démasque le bluffeur — ou pas. Déduction, bluff et gorgées.",
  minPlayers: 3,
  available: true,
  ConfigComponent: ImposteurConfigComponent,
  PlayComponent: ImposteurPlayComponent,
};
