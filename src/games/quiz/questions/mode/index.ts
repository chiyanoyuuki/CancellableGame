import type { Question } from '../../../../core/models';
import { grandscouturiers } from './grandscouturiers';
import { maisonsdeluxe } from './maisonsdeluxe';
import { streetwear } from './streetwear';

/**
 * Thème Mode, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro (= 50).
 */
export const modeQuestions: Question[] = [
  ...grandscouturiers,
  ...maisonsdeluxe,
  ...streetwear,
];
