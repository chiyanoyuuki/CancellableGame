import type { Question } from '../../../../core/models';
import { culturetcheque } from './culturetcheque';
import { gastronomietcheque } from './gastronomietcheque';
import { histoiredeprague } from './histoiredeprague';

/**
 * Thème République tchèque, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro (= 50).
 */
export const tchequeQuestions: Question[] = [
  ...culturetcheque,
  ...gastronomietcheque,
  ...histoiredeprague,
];
