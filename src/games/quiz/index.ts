import type { MiniGameDefinition } from '../types';
import { QuizConfigComponent } from './QuizConfig';
import { QuizPlayComponent } from './QuizPlay';

export const quizGame: MiniGameDefinition = {
  id: 'quiz',
  title: 'Quiz',
  emoji: '🧠',
  description: 'Manga, jeux vidéo, séries, films, musique, culture G. Chacun son tour ou au plus rapide.',
  minPlayers: 1,
  available: true,
  ConfigComponent: QuizConfigComponent,
  PlayComponent: QuizPlayComponent,
};
