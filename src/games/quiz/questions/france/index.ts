import type { Question } from '../../../../core/models';
import { cinemafrancais } from './cinemafrancais';
import { culturefrancaise } from './culturefrancaise';
import { gastronomiefrancaise } from './gastronomiefrancaise';
import { musiquefrancaise } from './musiquefrancaise';
import { seriesfrancaises } from './seriesfrancaises';

/**
 * Thème France, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro (= 50).
 */
export const franceQuestions: Question[] = [
  ...culturefrancaise,
  ...cinemafrancais,
  ...seriesfrancaises,
  ...musiquefrancaise,
  ...gastronomiefrancaise,
];
