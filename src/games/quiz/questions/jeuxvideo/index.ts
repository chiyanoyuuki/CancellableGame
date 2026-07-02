import type { Question } from '../../../../core/models';
import { cyberpunk } from './cyberpunk';
import { halo } from './halo';
import { lol } from './lol';
import { pokemon } from './pokemon';
import { skyrim } from './skyrim';

/**
 * Thème Jeux vidéo, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro (= 50).
 * Pour ajouter un univers : créez son fichier (cf. halo.ts), importez-le ici
 * et ajoutez-le au tableau.
 */
export const jeuxvideoQuestions: Question[] = [
  ...halo,
  ...lol,
  ...pokemon,
  ...cyberpunk,
  ...skyrim,
];
