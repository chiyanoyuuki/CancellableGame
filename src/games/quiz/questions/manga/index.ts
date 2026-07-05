import type { Question } from '../../../../core/models';
import { aot } from './aot';
import { berserk } from './berserk';
import { bleach } from './bleach';
import { chainsawman } from './chainsawman';
import { deathnote } from './deathnote';
import { demonslayer } from './demonslayer';
import { dragonball } from './dragonball';
import { fma } from './fma';
import { hxh } from './hxh';
import { jujutsukaisen } from './jujutsukaisen';
import { mha } from './mha';
import { mushokutensei } from './mushokutensei';
import { nana } from './nana';
import { naruto } from './naruto';
import { onepiece } from './onepiece';

/**
 * Thème Manga, organisé par univers (un fichier par univers).
 * Convention par univers : 5 faciles, 10 moyennes, 15 dures, 20 pro (= 50).
 * Pour ajouter un univers : créez son fichier (cf. naruto.ts), importez-le ici
 * et ajoutez-le au tableau.
 */
export const mangaQuestions: Question[] = [
  ...naruto,
  ...onepiece,
  ...dragonball,
  ...deathnote,
  ...aot,
  ...mha,
  ...demonslayer,
  ...bleach,
  ...hxh,
  ...fma,
  ...berserk,
  ...chainsawman,
  ...mushokutensei,
  ...jujutsukaisen,
  ...nana,
];
