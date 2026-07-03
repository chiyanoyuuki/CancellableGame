import type { Question } from '../../../core/models';
import { blindtestQuestions } from './blindtest';
import { cultureQuestions } from './culture';
import { enigmesQuestions } from './enigmes';
import { filmsQuestions } from './films';
import { imagesQuestions } from './images';
import { internetQuestions } from './internet';
import { jeuxvideoQuestions } from './jeuxvideo';
import { mangaQuestions } from './manga';
import { musiqueQuestions } from './musique';
import { rebusQuestions } from './rebus';
import { seriesQuestions } from './series';

/**
 * Banque de questions complète, agrégée depuis un fichier par thème.
 *
 * Pour AJOUTER des questions : éditez le fichier du thème concerné
 * (ex. manga.ts) — le format d'un objet `Question` est défini dans
 * core/models.ts. Pour AJOUTER un thème : créez un nouveau fichier exportant
 * un `Question[]`, importez-le ici, et ajoutez le thème à THEMES/THEME_META
 * dans core/models.ts.
 */
export const QUESTIONS: Question[] = [
  ...mangaQuestions,
  ...jeuxvideoQuestions,
  ...seriesQuestions,
  ...filmsQuestions,
  ...musiqueQuestions,
  ...cultureQuestions,
  ...internetQuestions,
  ...enigmesQuestions,
  ...rebusQuestions,
  ...blindtestQuestions,
  ...imagesQuestions,
];
