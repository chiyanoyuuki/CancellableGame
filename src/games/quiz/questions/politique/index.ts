import type { Question } from '../../../../core/models';
import { droite } from './droite';
import { gauche } from './gauche';
import { hitler } from './hitler';
import { trump } from './trump';

/**
 * Thème Politique & Histoire, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, au moins 20 pro.
 * Le contenu se veut factuel et neutre : histoire, éducation civique, faits
 * datés. Pour ajouter un univers : créez son fichier, importez-le ici et
 * ajoutez-le au tableau.
 */
export const politiqueQuestions: Question[] = [
  ...hitler,
  ...trump,
  ...gauche,
  ...droite,
];
