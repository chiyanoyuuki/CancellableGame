import type { Question } from '../../../../core/models';
import { animes90 } from './animes90';
import { aot } from './aot';
import { berserk } from './berserk';
import { bleach } from './bleach';
import { bluelock } from './bluelock';
import { chainsawman } from './chainsawman';
import { deathnote } from './deathnote';
import { demonslayer } from './demonslayer';
import { dragonball } from './dragonball';
import { drstone } from './drstone';
import { eightysix } from './eightysix';
import { fma } from './fma';
import { gto } from './gto';
import { haikyuu } from './haikyuu';
import { hxh } from './hxh';
import { jojo } from './jojo';
import { jujutsukaisen } from './jujutsukaisen';
import { fairytail } from './fairytail';
import { mha } from './mha';
import { mushokutensei } from './mushokutensei';
import { nana } from './nana';
import { naruto } from './naruto';
import { onepiece } from './onepiece';
import { opm } from './opm';
import { promisedneverland } from './promisedneverland';
import { slime } from './slime';
import { sololeveling } from './sololeveling';
import { sao } from './sao';
import { spyfamily } from './spyfamily';
import { tokyoghoul } from './tokyoghoul';
import { vinland } from './vinland';

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
  ...animes90,
  ...eightysix,
  ...spyfamily,
  ...promisedneverland,
  ...tokyoghoul,
  ...slime,
  ...drstone,
  ...haikyuu,
  ...bluelock,
  ...sololeveling,
  ...opm,
  ...jojo,
  ...fairytail,
  ...vinland,
  ...sao,
  ...gto,
];
