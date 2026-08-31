import type { MiniGameDefinition } from '../types';
import { QuiDeNousConfigComponent } from './QuiDeNousConfig';
import { QuiDeNousPlayComponent } from './QuiDeNousPlay';

export const quiDeNousGame: MiniGameDefinition = {
  id: 'quidenous',
  title: 'Qui de nous… ?',
  emoji: '🙋',
  description:
    "Une affirmation, tout le monde désigne un joueur en secret. Le plus pointé du doigt trinque et devient la vedette de la manche. Fous rires garantis.",
  minPlayers: 3,
  available: true,
  ConfigComponent: QuiDeNousConfigComponent,
  PlayComponent: QuiDeNousPlayComponent,
};
