import type { Question } from '../../../../core/models';
import { cyberpunk } from './cyberpunk';
import { dofus } from './dofus';
import { farmingsimulator } from './farmingsimulator';
import { gta } from './gta';
import { halo } from './halo';
import { lessims } from './lessims';
import { lol } from './lol';
import { mario } from './mario';
import { minecraft } from './minecraft';
import { pokemon } from './pokemon';
import { skyrim } from './skyrim';
import { stardewvalley } from './stardewvalley';
import { worldofwarcraft } from './worldofwarcraft';
import { zelda } from './zelda';

/**
 * Thème Jeux vidéo, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, au moins 20 pro.
 * La plupart des univers en ont 20 ; certains, plus riches (World of Warcraft),
 * en proposent davantage. Pour ajouter un univers : créez son fichier (cf.
 * halo.ts), importez-le ici et ajoutez-le au tableau.
 */
export const jeuxvideoQuestions: Question[] = [
  ...halo,
  ...lol,
  ...pokemon,
  ...cyberpunk,
  ...skyrim,
  ...mario,
  ...zelda,
  ...minecraft,
  ...gta,
  ...dofus,
  ...farmingsimulator,
  ...lessims,
  ...stardewvalley,
  ...worldofwarcraft,
];
