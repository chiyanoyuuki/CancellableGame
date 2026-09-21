import type { MiniGameDefinition } from '../types';
import { DonjonsConfigComponent } from './DonjonsConfig';
import { DonjonsPlayComponent } from './DonjonsPlay';

export const donjonsGame: MiniGameDefinition = {
  id: 'donjons',
  title: 'Donjons & Gorgées',
  emoji: '🎲',
  description:
    'Un quiz-RPG de soirée : choisis une race et une classe, cible tes amis avec des questions, des gages ou des duels, et laisse le d20 décider. Réussis pour monter de niveau, rate pour boire — et attention à l’ivresse qui déforme tes stats !',
  minPlayers: 3,
  available: true,
  ConfigComponent: DonjonsConfigComponent,
  PlayComponent: DonjonsPlayComponent,
};
