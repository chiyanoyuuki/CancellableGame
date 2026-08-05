import type { Question } from '../../../core/models';
import { cultureQuestions, sciencesQuestions, societeQuestions } from './culture';
import { enigmesQuestions } from './enigmes';
import { filmsQuestions } from './films';
import { franceQuestions } from './france';
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
import { religionsQuestions } from './religions';
import { seriesQuestions } from './series';
import { tchequeQuestions } from './tcheque';

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
  ...franceQuestions,
  ...tchequeQuestions,
  ...modeQuestions,
  ...cultureQuestions,
  ...sciencesQuestions,
  ...societeQuestions,
  ...internetQuestions,
  ...mythologieQuestions,
  ...religionsQuestions,
  ...enigmesQuestions,
  ...rebusQuestions,
  ...imagesQuestions,
  ...imageCharsQuestions,
];

/**
 * Ordre d'ajout des univers les plus récents, du plus ancien au plus récent.
 * La banque est concaténée par thème, donc l'ordre du pool ne reflète pas la
 * chronologie réelle ; cette liste sert à trier « par date d'ajout » (ex. dans
 * l'écran Joueurs). Les univers absents sont considérés comme anciens.
 *
 * À METTRE À JOUR en ajoutant tout nouvel univers : ajoutez sa clé à la fin.
 */
export const UNIVERSE_ADD_ORDER: string[] = [
  'Astrologie', 'Insectes', 'Animaux', 'Alcool', 'Astronomie',
  'Arbres', 'Voitures', 'Culture tchèque', 'Gastronomie tchèque', 'Histoire de Prague',
  'SVT', 'Célébrités', 'Sexe',
  'Kingdom Come Deliverance', 'Bouddhisme', 'Catholicisme', 'Chrétienté', 'Latin', 'Kim Jong-un',
  'Phasmophobia', 'Far Cry', 'Hades', "Baldur's Gate", 'Final Fantasy', 'The Walking Dead',
  '86', 'Spy x Family', 'The Promised Neverland', 'Tokyo Ghoul',
  'Moi quand je me réincarne en slime', 'Dr. Stone', 'Haikyu',
];
