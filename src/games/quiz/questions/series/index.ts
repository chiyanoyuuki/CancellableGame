import type { Question } from '../../../../core/models';
import { arcane } from './arcane';
import { breakingbad } from './breakingbad';
import { casadepapel } from './casadepapel';
import { familyguy } from './familyguy';
import { friends } from './friends';
import { enfance } from './enfance';
import { futurama } from './futurama';
import { got } from './got';
import { himym } from './himym';
import { lupin } from './lupin';
import { mercredi } from './mercredi';
import { netflix } from './netflix';
import { peakyblinders } from './peakyblinders';
import { prisonbreak } from './prisonbreak';
import { rickmorty } from './rickmorty';
import { sexandthecity } from './sexandthecity';
import { simpsons } from './simpsons';
import { squidgame } from './squidgame';
import { strangerthings } from './strangerthings';
import { theboys } from './theboys';
import { theoffice } from './theoffice';
import { walkingdead } from './walkingdead';

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
  ...enfance,
  ...walkingdead,
  ...simpsons,
  ...familyguy,
  ...futurama,
  ...mercredi,
  ...rickmorty,
  ...lupin,
  ...himym,
];
