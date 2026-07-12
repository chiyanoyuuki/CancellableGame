import type { Question } from '../../../core/models';
import { blindtestQuestions } from './blindtest';
import { cultureQuestions } from './culture';
import { enigmesQuestions } from './enigmes';
import { filmsQuestions } from './films';
import { imageCharsQuestions } from './imageChars';
import { imagesQuestions } from './images';
import { internetQuestions } from './internet';
import { japonQuestions } from './japon';
import { jeuxvideoQuestions } from './jeuxvideo';
import { litteratureQuestions } from './litterature';
import { mangaQuestions } from './manga';
import { modeQuestions } from './mode';
import { musiqueQuestions } from './musique';
import { mythologieQuestions } from './mythologie';
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
  ...litteratureQuestions,
  ...japonQuestions,
  ...modeQuestions,
  ...cultureQuestions,
  ...internetQuestions,
  ...mythologieQuestions,
  ...enigmesQuestions,
  ...rebusQuestions,
  ...blindtestQuestions,
  ...imagesQuestions,
  ...imageCharsQuestions,
];
