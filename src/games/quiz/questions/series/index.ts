import type { Question } from '../../../../core/models';
import { arcane } from './arcane';
import { breakingbad } from './breakingbad';
import { casadepapel } from './casadepapel';
import { friends } from './friends';
import { got } from './got';
import { netflix } from './netflix';
import { peakyblinders } from './peakyblinders';
import { prisonbreak } from './prisonbreak';
import { sexandthecity } from './sexandthecity';
import { squidgame } from './squidgame';
import { strangerthings } from './strangerthings';
import { theboys } from './theboys';
import { theoffice } from './theoffice';

/**
 * Thème Séries, organisé par univers (une série = un fichier).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro (= 50).
 * Pour ajouter une série : créez son fichier (cf. breakingbad.ts), importez-le
 * ici et ajoutez-le au tableau.
 */
export const seriesQuestions: Question[] = [
  ...breakingbad,
  ...got,
  ...strangerthings,
  ...theoffice,
  ...friends,
  ...peakyblinders,
  ...casadepapel,
  ...prisonbreak,
  ...theboys,
  ...arcane,
  ...squidgame,
  ...sexandthecity,
  ...netflix,
];
