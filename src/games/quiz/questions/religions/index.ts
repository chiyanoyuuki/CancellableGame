import type { Question } from '../../../../core/models';
import { bouddhisme } from './bouddhisme';
import { catholicisme } from './catholicisme';
import { chretiente } from './chretiente';

/**
 * Thème Religions, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro (= 50).
 */
export const religionsQuestions: Question[] = [
  ...bouddhisme,
  ...catholicisme,
  ...chretiente,
];
