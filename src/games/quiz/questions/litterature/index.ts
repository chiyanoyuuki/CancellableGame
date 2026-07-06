import type { Question } from '../../../../core/models';
import { bandedessinee } from './bandedessinee';
import { policier } from './policier';
import { sciencefiction } from './sciencefiction';

/**
 * Thème Littérature, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro (= 50).
 * Pour ajouter un univers : créez son fichier (cf. policier.ts), importez-le ici
 * et ajoutez-le au tableau.
 */
export const litteratureQuestions: Question[] = [
  ...sciencefiction,
  ...policier,
  ...bandedessinee,
];
