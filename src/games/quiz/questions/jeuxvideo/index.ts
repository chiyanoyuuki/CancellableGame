import type { Question } from '../../../../core/models';
import { acreed } from './acreed';
import { baldursgate } from './baldursgate';
import { clairobscur } from './clairobscur';
import { cod } from './cod';
import { overwatch } from './overwatch';
import { reddead } from './reddead';
import { cyberpunk } from './cyberpunk';
import { devilmaycry } from './devilmaycry';
import { dofus } from './dofus';
import { eldenring } from './eldenring';
import { farcry } from './farcry';
import { farmingsimulator } from './farmingsimulator';
import { finalfantasy } from './finalfantasy';
import { fortnite } from './fortnite';
import { genshin } from './genshin';
import { gta } from './gta';
import { hades } from './hades';
import { halo } from './halo';
import { kingdomcome } from './kingdomcome';
import { phasmophobia } from './phasmophobia';
import { lessims } from './lessims';
import { lol } from './lol';
import { mario } from './mario';
import { minecraft } from './minecraft';
import { pokemon } from './pokemon';
import { residentevil } from './residentevil';
import { skyrim } from './skyrim';
import { stardewvalley } from './stardewvalley';
import { thewitcher } from './thewitcher';
import { tlou } from './tlou';
import { darksouls } from './darksouls';
import { godofwar } from './godofwar';
import { worldofwarcraft } from './worldofwarcraft';
import { yakuza } from './yakuza';
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
  ...thewitcher,
  ...residentevil,
  ...kingdomcome,
  ...phasmophobia,
  ...farcry,
  ...hades,
  ...baldursgate,
  ...finalfantasy,
  ...yakuza,
  ...clairobscur,
  ...devilmaycry,
  ...eldenring,
  ...fortnite,
  ...tlou,
  ...cod,
  ...acreed,
  ...genshin,
  ...darksouls,
  ...godofwar,
  ...reddead,
  ...overwatch,
];
