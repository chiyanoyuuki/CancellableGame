import type { Question } from '../../../../core/models';
import { cinemajaponais } from './cinemajaponais';
import { culturejaponaise } from './culturejaponaise';
import { gastronomiejaponaise } from './gastronomiejaponaise';
import { musiquejaponaise } from './musiquejaponaise';
import { seriesjaponaises } from './seriesjaponaises';

/**
 * Thème Japon, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro (= 50).
 */
export const japonQuestions: Question[] = [
  ...culturejaponaise,
  ...cinemajaponais,
  ...seriesjaponaises,
  ...musiquejaponaise,
  ...gastronomiejaponaise,
];
