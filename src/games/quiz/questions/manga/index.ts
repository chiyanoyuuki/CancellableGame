import type { Question } from '../../../../core/models';
import { naruto } from './naruto';
import { onepiece } from './onepiece';

/**
 * Thème Manga, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro.
 * Pour ajouter un univers : créez son fichier (cf. naruto.ts), importez-le ici
 * et ajoutez-le au tableau.
 */
export const mangaQuestions: Question[] = [
  ...naruto,
  ...onepiece,
  // ...dragonball, ...deathnote, ...aot, ... (à venir)
];
