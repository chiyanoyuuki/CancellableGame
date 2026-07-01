import type { Question } from '../../../../core/models';
import { breakingbad } from './breakingbad';
import { got } from './got';
import { strangerthings } from './strangerthings';
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
  // À venir : Peaky Blinders, La Casa de Papel, Friends, Prison Break…
];
