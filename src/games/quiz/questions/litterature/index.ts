import type { Question } from '../../../../core/models';
import { bandedessinee } from './bandedessinee';
import { classiques } from './classiques';
import { dahl } from './dahl';
import { dumas } from './dumas';
import { fantasy } from './fantasy';
import { hugo } from './hugo';
import { king } from './king';
import { moliere } from './moliere';
import { policier } from './policier';
import { sciencefiction } from './sciencefiction';
import { shakespeare } from './shakespeare';
import { verne } from './verne';
import { zola } from './zola';

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
  ...classiques,
  ...hugo,
  ...moliere,
  ...zola,
  ...shakespeare,
  ...verne,
  ...dumas,
  ...king,
  ...fantasy,
  ...dahl,
];
