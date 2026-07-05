import type { Question, QuestionMedia } from '../../../core/models';

/**
 * Thème « Image mystère » — 100 % questions à base d'images tirées d'internet,
 * niveau difficile / pro, pensées pour des connaisseurs.
 *
 * ⚠️ Ces questions ont besoin d'une connexion : l'image est chargée à la volée.
 * C'est pourquoi ce thème est DÉSACTIVÉ par défaut (comme le blind test) et se
 * choisit explicitement sur l'écran de configuration.
 *
 * Source d'images : l'artwork officiel des Pokémon hébergé par le projet
 * PokeAPI sur GitHub — fiable et vérifié sur l'appareil. Les photos de
 * personnalités issues de Wikimedia ont été retirées : elles ne se chargeaient
 * pas dans l'application.
 *
 * Si une image ne se charge malgré tout pas (fichier renommé, hors-ligne…),
 * deux filets de sécurité : en jeu, la question est automatiquement remplacée
 * (même joueur, +1 au total) ; et l'écran « Vérifier les images » (Réglages)
 * liste d'un coup d'œil celles qui ne s'affichent pas.
 *
 * Règles maison respectées : aucune parenthèse dans les intitulés / réponses ;
 * les propositions d'une même question sont homogènes (ici : soit des noms de
 * créatures, soit des pseudos, soit des noms complets de personnes).
 */

/** Artwork officiel d'un Pokémon par numéro national (PokeAPI, hébergé GitHub). */
const poke = (n: number): QuestionMedia => ({
  type: 'image',
  uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${n}.png`,
});

const POKE = 'Quel est ce Pokémon ?';

export const imagesQuestions: Question[] = [
  // ---------------------------------------------------------------------------
  // Pokémon — artwork officiel (source fiable). 40 questions.
  // ---------------------------------------------------------------------------
  { id: 'img-1', theme: 'images', difficulty: 3, text: POKE, answer: 'Absol', distractors: ['Mangriff', 'Séviper', 'Démolosse'], media: poke(359) },
  { id: 'img-2', theme: 'images', difficulty: 3, text: POKE, answer: 'Spiritomb', distractors: ['Sinistrail', 'Tutétékri', 'Magirêve'], media: poke(442) },
  { id: 'img-3', theme: 'images', difficulty: 3, text: POKE, answer: 'Mimiqui', distractors: ['Bekaglaçon', 'Morpeko', 'Trousselin'], media: poke(778) },
  { id: 'img-4', theme: 'images', difficulty: 3, text: POKE, answer: 'Zorua', distractors: ['Zoroark', 'Noctali', 'Magirêve'], media: poke(570) },
  { id: 'img-5', theme: 'images', difficulty: 3, text: POKE, answer: 'Nymphali', distractors: ['Noctali', 'Charmilly', 'Mysdibule'], media: poke(700) },
  { id: 'img-6', theme: 'images', difficulty: 3, text: POKE, answer: 'Métalosse', distractors: ['Drattak', 'Trioxhydre', 'Carchacrok'], media: poke(376) },
  { id: 'img-7', theme: 'images', difficulty: 3, text: POKE, answer: 'Carchacrok', distractors: ['Drattak', 'Hydragon', 'Tyranocif'], media: poke(445) },
  { id: 'img-8', theme: 'images', difficulty: 3, text: POKE, answer: 'Tyranocif', distractors: ['Démolosse', 'Métalosse', 'Golemastoc'], media: poke(248) },
  { id: 'img-9', theme: 'images', difficulty: 3, text: POKE, answer: 'Noctali', distractors: ['Nymphali', 'Zorua', 'Dimoret'], media: poke(197) },
  { id: 'img-10', theme: 'images', difficulty: 3, text: POKE, answer: 'Ectoplasma', distractors: ['Sinistrail', 'Noctunoir', 'Magirêve'], media: poke(94) },
  { id: 'img-11', theme: 'images', difficulty: 3, text: POKE, answer: 'Lucario', distractors: ['Cizayox', 'Scalpereur', 'Berserkatt'], media: poke(448) },
  { id: 'img-12', theme: 'images', difficulty: 3, text: POKE, answer: 'Dimoret', distractors: ['Noctali', 'Berserkatt', 'Mangriff'], media: poke(461) },
  { id: 'img-13', theme: 'images', difficulty: 4, text: POKE, answer: 'Girafarig', distractors: ['Farigiraf', 'Cerfrousse', 'Cadoizo'], media: poke(203) },
  { id: 'img-14', theme: 'images', difficulty: 4, text: POKE, answer: 'Caratroc', distractors: ['Corayon', 'Relicanth', 'Tropius'], media: poke(213) },
  { id: 'img-15', theme: 'images', difficulty: 4, text: POKE, answer: 'Corayon', distractors: ['Caratroc', 'Relicanth', 'Cadoizo'], media: poke(222) },
  { id: 'img-16', theme: 'images', difficulty: 4, text: POKE, answer: 'Cadoizo', distractors: ['Pijako', 'Corayon', 'Cerfrousse'], media: poke(225) },
  { id: 'img-17', theme: 'images', difficulty: 4, text: POKE, answer: 'Cerfrousse', distractors: ['Girafarig', 'Tropius', 'Mangriff'], media: poke(234) },
  { id: 'img-18', theme: 'images', difficulty: 4, text: POKE, answer: 'Queulorior', distractors: ['Pijako', 'Vortente', 'Relicanth'], media: poke(235) },
  { id: 'img-19', theme: 'images', difficulty: 4, text: POKE, answer: 'Ténéfix', distractors: ['Mysdibule', 'Magirêve', 'Berserkatt'], media: poke(302) },
  { id: 'img-20', theme: 'images', difficulty: 4, text: POKE, answer: 'Mysdibule', distractors: ['Ténéfix', 'Mangriff', 'Charmilly'], media: poke(303) },
  { id: 'img-21', theme: 'images', difficulty: 4, text: POKE, answer: 'Mangriff', distractors: ['Séviper', 'Ténéfix', 'Cerfrousse'], media: poke(335) },
  { id: 'img-22', theme: 'images', difficulty: 4, text: POKE, answer: 'Séviper', distractors: ['Mangriff', 'Venalgue', 'Kravarech'], media: poke(336) },
  { id: 'img-23', theme: 'images', difficulty: 4, text: POKE, answer: 'Tropius', distractors: ['Caratroc', 'Relicanth', 'Corayon'], media: poke(357) },
  { id: 'img-24', theme: 'images', difficulty: 4, text: POKE, answer: 'Relicanth', distractors: ['Caratroc', 'Corayon', 'Tropius'], media: poke(369) },
  { id: 'img-25', theme: 'images', difficulty: 4, text: POKE, answer: 'Magirêve', distractors: ['Sinistrail', 'Tutétékri', 'Noctunoir'], media: poke(429) },
  { id: 'img-26', theme: 'images', difficulty: 4, text: POKE, answer: 'Pijako', distractors: ['Cadoizo', 'Queulorior', 'Vortente'], media: poke(441) },
  { id: 'img-27', theme: 'images', difficulty: 4, text: POKE, answer: 'Vortente', distractors: ['Venalgue', 'Kravarech', 'Queulorior'], media: poke(455) },
  { id: 'img-28', theme: 'images', difficulty: 4, text: POKE, answer: 'Fragilady', distractors: ['Charmilly', 'Mysdibule', 'Nymphali'], media: poke(549) },
  { id: 'img-29', theme: 'images', difficulty: 4, text: POKE, answer: 'Golemastoc', distractors: ['Ferdeter', 'Tomberro', 'Scalpereur'], media: poke(623) },
  { id: 'img-30', theme: 'images', difficulty: 4, text: POKE, answer: 'Golgopathe', distractors: ['Corvaillus', 'Kravarech', 'Venalgue'], media: poke(689) },
  { id: 'img-31', theme: 'images', difficulty: 4, text: POKE, answer: 'Kravarech', distractors: ['Venalgue', 'Hydragon', 'Séviper'], media: poke(691) },
  { id: 'img-32', theme: 'images', difficulty: 4, text: POKE, answer: 'Trousselin', distractors: ['Charmilly', 'Mimiqui', 'Morpeko'], media: poke(707) },
  { id: 'img-33', theme: 'images', difficulty: 4, text: POKE, answer: 'Sinistrail', distractors: ['Magirêve', 'Tutétékri', 'Noctunoir'], media: poke(781) },
  { id: 'img-34', theme: 'images', difficulty: 4, text: POKE, answer: 'Berserkatt', distractors: ['Dimoret', 'Mangriff', 'Scalpereur'], media: poke(863) },
  { id: 'img-35', theme: 'images', difficulty: 4, text: POKE, answer: 'Tutétékri', distractors: ['Sinistrail', 'Magirêve', 'Spiritomb'], media: poke(867) },
  { id: 'img-36', theme: 'images', difficulty: 4, text: POKE, answer: 'Bekaglaçon', distractors: ['Morpeko', 'Mimiqui', 'Bargantua'], media: poke(875) },
  { id: 'img-37', theme: 'images', difficulty: 4, text: POKE, answer: 'Morpeko', distractors: ['Bekaglaçon', 'Trousselin', 'Mimiqui'], media: poke(877) },
  { id: 'img-38', theme: 'images', difficulty: 4, text: POKE, answer: 'Galvagon', distractors: ['Hydragon', 'Gigansel', 'Nigirigon'], media: poke(880) },
  { id: 'img-39', theme: 'images', difficulty: 4, text: POKE, answer: 'Gigansel', distractors: ['Forgelina', 'Ferdeter', 'Golemastoc'], media: poke(934) },
  { id: 'img-40', theme: 'images', difficulty: 4, text: POKE, answer: 'Farigiraf', distractors: ['Girafarig', 'Cerfrousse', 'Deusolourdo'], media: poke(981) },

  // ---------------------------------------------------------------------------
  // Pokémon (suite) — artwork officiel PokeAPI, fiable. 66 questions.
  // ---------------------------------------------------------------------------
  { id: 'img-41', theme: 'images', difficulty: 3, text: POKE, answer: 'Florizarre', distractors: ['Tutétékri', 'Pingoléon', 'Giratina'], media: poke(3) },
  { id: 'img-42', theme: 'images', difficulty: 2, text: POKE, answer: 'Dracaufeu', distractors: ['Gardevoir', 'Trioxhydre', 'Spiritomb'], media: poke(6) },
  { id: 'img-43', theme: 'images', difficulty: 2, text: POKE, answer: 'Tortank', distractors: ['Nostenfer', 'Galvagon', 'Galeking'], media: poke(9) },
  { id: 'img-44', theme: 'images', difficulty: 2, text: POKE, answer: 'Pikachu', distractors: ['Latios', 'Scarhino', 'Deoxys'], media: poke(25) },
  { id: 'img-45', theme: 'images', difficulty: 3, text: POKE, answer: 'Raichu', distractors: ['Ténéfix', 'Aquali', 'Braségali'], media: poke(26) },
  { id: 'img-46', theme: 'images', difficulty: 3, text: POKE, answer: 'Arcanin', distractors: ['Absol', 'Libégon', 'Mew'], media: poke(59) },
  { id: 'img-47', theme: 'images', difficulty: 3, text: POKE, answer: 'Alakazam', distractors: ['Arcanin', 'Aquali', 'Élekable'], media: poke(65) },
  { id: 'img-48', theme: 'images', difficulty: 3, text: POKE, answer: 'Mackogneur', distractors: ['Mimiqui', 'Zorua', 'Aquali'], media: poke(68) },
  { id: 'img-49', theme: 'images', difficulty: 4, text: POKE, answer: 'Rhinoféros', distractors: ['Bekaglaçon', 'Simiabraz', 'Kravarech'], media: poke(112) },
  { id: 'img-50', theme: 'images', difficulty: 4, text: POKE, answer: 'Kangourex', distractors: ['Relicanth', 'Magirêve', 'Morpeko'], media: poke(115) },
  { id: 'img-51', theme: 'images', difficulty: 4, text: POKE, answer: 'Insécateur', distractors: ['Lugia', 'Queulorior', 'Tropius'], media: poke(123) },
  { id: 'img-52', theme: 'images', difficulty: 4, text: POKE, answer: 'Scarabrute', distractors: ['Méganium', 'Insécateur', 'Corayon'], media: poke(127) },
  { id: 'img-53', theme: 'images', difficulty: 2, text: POKE, answer: 'Léviator', distractors: ['Drattak', 'Noarfang', 'Trousselin'], media: poke(130) },
  { id: 'img-54', theme: 'images', difficulty: 3, text: POKE, answer: 'Lokhlass', distractors: ['Kangourex', 'Caratroc', 'Braségali'], media: poke(131) },
  { id: 'img-55', theme: 'images', difficulty: 2, text: POKE, answer: 'Évoli', distractors: ['Celebi', 'Arceus', 'Galeking'], media: poke(133) },
  { id: 'img-56', theme: 'images', difficulty: 3, text: POKE, answer: 'Aquali', distractors: ['Spiritomb', 'Gardevoir', 'Évoli'], media: poke(134) },
  { id: 'img-57', theme: 'images', difficulty: 3, text: POKE, answer: 'Voltali', distractors: ['Scarabrute', 'Cerfrousse', 'Drattak'], media: poke(135) },
  { id: 'img-58', theme: 'images', difficulty: 3, text: POKE, answer: 'Pyroli', distractors: ['Trousselin', 'Reshiram', 'Corayon'], media: poke(136) },
  { id: 'img-59', theme: 'images', difficulty: 4, text: POKE, answer: 'Ptéra', distractors: ['Zekrom', 'Girafarig', 'Démolosse'], media: poke(142) },
  { id: 'img-60', theme: 'images', difficulty: 2, text: POKE, answer: 'Ronflex', distractors: ['Pijako', 'Florizarre', 'Kangourex'], media: poke(143) },
  { id: 'img-61', theme: 'images', difficulty: 3, text: POKE, answer: 'Dracolosse', distractors: ['Latias', 'Magirêve', 'Rhinoféros'], media: poke(149) },
  { id: 'img-62', theme: 'images', difficulty: 2, text: POKE, answer: 'Mewtwo', distractors: ['Sinistrail', 'Nostenfer', 'Mysdibule'], media: poke(150) },
  { id: 'img-63', theme: 'images', difficulty: 2, text: POKE, answer: 'Mew', distractors: ['Mangriff', 'Reshiram', 'Kravarech'], media: poke(151) },
  { id: 'img-64', theme: 'images', difficulty: 4, text: POKE, answer: 'Méganium', distractors: ['Scarabrute', 'Reshiram', 'Tropius'], media: poke(154) },
  { id: 'img-65', theme: 'images', difficulty: 3, text: POKE, answer: 'Héricendre', distractors: ['Kangourex', 'Gigansel', 'Victini'], media: poke(155) },
  { id: 'img-66', theme: 'images', difficulty: 4, text: POKE, answer: 'Typhlosion', distractors: ['Torterra', 'Arcanin', 'Scarhino'], media: poke(157) },
  { id: 'img-67', theme: 'images', difficulty: 4, text: POKE, answer: 'Aligatueur', distractors: ['Dimoret', 'Mew', 'Arceus'], media: poke(160) },
  { id: 'img-68', theme: 'images', difficulty: 4, text: POKE, answer: 'Noarfang', distractors: ['Bekaglaçon', 'Gigansel', 'Simiabraz'], media: poke(164) },
  { id: 'img-69', theme: 'images', difficulty: 4, text: POKE, answer: 'Nostenfer', distractors: ['Mysdibule', 'Bekaglaçon', 'Dracolosse'], media: poke(169) },
  { id: 'img-70', theme: 'images', difficulty: 4, text: POKE, answer: 'Pharamp', distractors: ['Reshiram', 'Ho-Oh', 'Absol'], media: poke(181) },
  { id: 'img-71', theme: 'images', difficulty: 3, text: POKE, answer: 'Mentali', distractors: ['Typhlosion', 'Tutétékri', 'Gigansel'], media: poke(196) },
  { id: 'img-72', theme: 'images', difficulty: 4, text: POKE, answer: 'Cizayox', distractors: ['Celebi', 'Laggron', 'Aligatueur'], media: poke(212) },
  { id: 'img-73', theme: 'images', difficulty: 4, text: POKE, answer: 'Scarhino', distractors: ['Laggron', 'Golemastoc', 'Fragilady'], media: poke(214) },
  { id: 'img-74', theme: 'images', difficulty: 4, text: POKE, answer: 'Démolosse', distractors: ['Métalosse', 'Absol', 'Aligatueur'], media: poke(229) },
  { id: 'img-75', theme: 'images', difficulty: 2, text: POKE, answer: 'Lugia', distractors: ['Scarabrute', 'Braségali', 'Spiritomb'], media: poke(249) },
  { id: 'img-76', theme: 'images', difficulty: 3, text: POKE, answer: 'Ho-Oh', distractors: ['Tyranocif', 'Golemastoc', 'Corayon'], media: poke(250) },
  { id: 'img-77', theme: 'images', difficulty: 4, text: POKE, answer: 'Celebi', distractors: ['Simiabraz', 'Mew', 'Lugia'], media: poke(251) },
  { id: 'img-78', theme: 'images', difficulty: 4, text: POKE, answer: 'Jungko', distractors: ['Ronflex', 'Élekable', 'Cizayox'], media: poke(254) },
  { id: 'img-79', theme: 'images', difficulty: 4, text: POKE, answer: 'Braségali', distractors: ['Mewtwo', 'Ronflex', 'Métalosse'], media: poke(257) },
  { id: 'img-80', theme: 'images', difficulty: 4, text: POKE, answer: 'Laggron', distractors: ['Ectoplasma', 'Mew', 'Kravarech'], media: poke(260) },
  { id: 'img-81', theme: 'images', difficulty: 3, text: POKE, answer: 'Gardevoir', distractors: ['Mysdibule', 'Pijako', 'Caratroc'], media: poke(282) },
  { id: 'img-82', theme: 'images', difficulty: 4, text: POKE, answer: 'Monaflèmit', distractors: ['Nymphali', 'Scarhino', 'Aquali'], media: poke(289) },
  { id: 'img-83', theme: 'images', difficulty: 4, text: POKE, answer: 'Galeking', distractors: ['Démolosse', 'Monaflèmit', 'Libégon'], media: poke(306) },
  { id: 'img-84', theme: 'images', difficulty: 4, text: POKE, answer: 'Sharpedo', distractors: ['Séviper', 'Laggron', 'Gigansel'], media: poke(319) },
  { id: 'img-85', theme: 'images', difficulty: 4, text: POKE, answer: 'Libégon', distractors: ['Aligatueur', 'Ptéra', 'Drattak'], media: poke(330) },
  { id: 'img-86', theme: 'images', difficulty: 4, text: POKE, answer: 'Drattak', distractors: ['Gigansel', 'Pijako', 'Élekable'], media: poke(373) },
  { id: 'img-87', theme: 'images', difficulty: 4, text: POKE, answer: 'Latias', distractors: ['Kravarech', 'Zorua', 'Tortank'], media: poke(380) },
  { id: 'img-88', theme: 'images', difficulty: 4, text: POKE, answer: 'Latios', distractors: ['Tyranocif', 'Scarhino', 'Mysdibule'], media: poke(381) },
  { id: 'img-89', theme: 'images', difficulty: 2, text: POKE, answer: 'Rayquaza', distractors: ['Dracolosse', 'Simiabraz', 'Mew'], media: poke(384) },
  { id: 'img-90', theme: 'images', difficulty: 4, text: POKE, answer: 'Jirachi', distractors: ['Golgopathe', 'Ho-Oh', 'Pharamp'], media: poke(385) },
  { id: 'img-91', theme: 'images', difficulty: 4, text: POKE, answer: 'Deoxys', distractors: ['Phyllali', 'Vortente', 'Démolosse'], media: poke(386) },
  { id: 'img-92', theme: 'images', difficulty: 4, text: POKE, answer: 'Torterra', distractors: ['Girafarig', 'Victini', 'Arceus'], media: poke(389) },
  { id: 'img-93', theme: 'images', difficulty: 4, text: POKE, answer: 'Simiabraz', distractors: ['Vortente', 'Ténéfix', 'Braségali'], media: poke(392) },
  { id: 'img-94', theme: 'images', difficulty: 4, text: POKE, answer: 'Pingoléon', distractors: ['Zekrom', 'Carchacrok', 'Jungko'], media: poke(395) },
  { id: 'img-95', theme: 'images', difficulty: 4, text: POKE, answer: 'Élekable', distractors: ['Sinistrail', 'Deoxys', 'Arcanin'], media: poke(466) },
  { id: 'img-96', theme: 'images', difficulty: 4, text: POKE, answer: 'Phyllali', distractors: ['Dimoret', 'Pyroli', 'Libégon'], media: poke(470) },
  { id: 'img-97', theme: 'images', difficulty: 4, text: POKE, answer: 'Givrali', distractors: ['Élekable', 'Zoroark', 'Sinistrail'], media: poke(471) },
  { id: 'img-98', theme: 'images', difficulty: 3, text: POKE, answer: 'Dialga', distractors: ['Pijako', 'Vortente', 'Pyroli'], media: poke(483) },
  { id: 'img-99', theme: 'images', difficulty: 3, text: POKE, answer: 'Palkia', distractors: ['Zorua', 'Vortente', 'Lokhlass'], media: poke(484) },
  { id: 'img-100', theme: 'images', difficulty: 4, text: POKE, answer: 'Giratina', distractors: ['Florizarre', 'Alakazam', 'Golgopathe'], media: poke(487) },
  { id: 'img-101', theme: 'images', difficulty: 4, text: POKE, answer: 'Arceus', distractors: ['Jirachi', 'Mysdibule', 'Aligatueur'], media: poke(493) },
  { id: 'img-102', theme: 'images', difficulty: 4, text: POKE, answer: 'Victini', distractors: ['Voltali', 'Héricendre', 'Palkia'], media: poke(494) },
  { id: 'img-103', theme: 'images', difficulty: 4, text: POKE, answer: 'Zoroark', distractors: ['Farigiraf', 'Mimiqui', 'Celebi'], media: poke(571) },
  { id: 'img-104', theme: 'images', difficulty: 4, text: POKE, answer: 'Trioxhydre', distractors: ['Arceus', 'Héricendre', 'Fragilady'], media: poke(635) },
  { id: 'img-105', theme: 'images', difficulty: 4, text: POKE, answer: 'Reshiram', distractors: ['Élekable', 'Pingoléon', 'Caratroc'], media: poke(643) },
  { id: 'img-106', theme: 'images', difficulty: 4, text: POKE, answer: 'Zekrom', distractors: ['Mangriff', 'Évoli', 'Caratroc'], media: poke(644) },
];
