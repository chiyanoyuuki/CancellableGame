import type { Question, QuestionMedia } from '../../../core/models';

/**
 * Thème « Image mystère » — 100 % questions à base d'images tirées d'internet,
 * niveau difficile / pro, pensées pour des connaisseurs.
 *
 * ⚠️ Ces questions ont besoin d'une connexion : l'image est chargée à la volée.
 * C'est pourquoi ce thème est DÉSACTIVÉ par défaut (comme le blind test) et se
 * choisit explicitement sur l'écran de configuration.
 *
 * Deux sources d'images :
 *  - Pokémon : l'artwork officiel hébergé par le projet PokeAPI sur GitHub —
 *    fiable et vérifié.
 *  - Personnalités (acteurs, chanteurs, scientifiques, mangakas, réalisateurs,
 *    créateurs) : de vraies photos hébergées sur Wikimedia Commons via
 *    `Special:FilePath`, qui ne réclame que le nom exact du fichier et redirige
 *    vers l'image. Les noms de fichiers ont été vérifiés un par un.
 *
 * Si une image ne se charge malgré tout pas (fichier renommé, hors-ligne…),
 * l'écran « Vérifier les images » (Réglages) la signale d'un coup d'œil.
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

/** Vraie photo depuis Wikimedia Commons (nom de fichier exact, sans « File: »). */
const wiki = (file: string): QuestionMedia => ({
  type: 'image',
  uri: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=500`,
});

const POKE = 'Quel est ce Pokémon ?';
const ACTEUR = 'Quel acteur est-ce ?';
const ACTRICE = 'Quelle actrice est-ce ?';
const REAL = 'Quel réalisateur est-ce ?';
const REAL_ANIME = 'Quel réalisateur d’animation est-ce ?';
const ARTISTE = 'Quel artiste est-ce ?';
const SAVANT = 'Quelle personnalité est-ce ?';
const CREATEUR = 'Quel créateur de contenu est-ce ?';
const MANGAKA = 'Quel mangaka est-ce ?';

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
  // Séries — vraies photos (Wikimedia Commons). 12 questions.
  // ---------------------------------------------------------------------------
  { id: 'img-41', theme: 'images', difficulty: 3, text: ACTEUR, answer: 'Bryan Cranston', distractors: ['Aaron Paul', 'Bob Odenkirk', 'Giancarlo Esposito'], media: wiki('Bryan_Cranston_by_Gage_Skidmore_2.jpg') },
  { id: 'img-42', theme: 'images', difficulty: 3, text: ACTEUR, answer: 'Aaron Paul', distractors: ['Bryan Cranston', 'Bob Odenkirk', 'Giancarlo Esposito'], media: wiki('Aaron_Paul_by_Gage_Skidmore_3.jpg') },
  { id: 'img-43', theme: 'images', difficulty: 4, text: ACTEUR, answer: 'Giancarlo Esposito', distractors: ['Bob Odenkirk', 'Bryan Cranston', 'Aaron Paul'], media: wiki('Giancarlo_Esposito_by_Gage_Skidmore.jpg') },
  { id: 'img-44', theme: 'images', difficulty: 4, text: ACTEUR, answer: 'Bob Odenkirk', distractors: ['Bryan Cranston', 'Aaron Paul', 'Giancarlo Esposito'], media: wiki('Bob_Odenkirk_by_Gage_Skidmore.jpg') },
  { id: 'img-45', theme: 'images', difficulty: 3, text: ACTEUR, answer: 'Peter Dinklage', distractors: ['Kit Harington', 'Pedro Pascal', 'Henry Cavill'], media: wiki('Peter_Dinklage_by_Gage_Skidmore.jpg') },
  { id: 'img-46', theme: 'images', difficulty: 3, text: ACTRICE, answer: 'Emilia Clarke', distractors: ['Millie Bobby Brown', 'Anya Taylor-Joy', 'Florence Pugh'], media: wiki('Emilia_Clarke_by_Gage_Skidmore_2.jpg') },
  { id: 'img-47', theme: 'images', difficulty: 4, text: ACTEUR, answer: 'Kit Harington', distractors: ['Peter Dinklage', 'Pedro Pascal', 'Henry Cavill'], media: wiki('Kit_Harrington_(9350745314)_(cropped).jpg') },
  { id: 'img-48', theme: 'images', difficulty: 3, text: ACTRICE, answer: 'Millie Bobby Brown', distractors: ['Emilia Clarke', 'Anya Taylor-Joy', 'Florence Pugh'], media: wiki('Millie_Bobby_Brown_by_Gage_Skidmore_2.jpg') },
  { id: 'img-49', theme: 'images', difficulty: 4, text: ACTEUR, answer: 'David Harbour', distractors: ['Bob Odenkirk', 'Giancarlo Esposito', 'Pedro Pascal'], media: wiki('David_Harbour_by_Gage_Skidmore_2.jpg') },
  { id: 'img-50', theme: 'images', difficulty: 3, text: ACTEUR, answer: 'Pedro Pascal', distractors: ['Henry Cavill', 'Kit Harington', 'Peter Dinklage'], media: wiki('Pedro_Pascal_by_Gage_Skidmore.jpg') },
  { id: 'img-51', theme: 'images', difficulty: 3, text: ACTEUR, answer: 'Henry Cavill', distractors: ['Pedro Pascal', 'Kit Harington', 'Cillian Murphy'], media: wiki('Henry_Cavill_SDCC_2014.jpg') },
  { id: 'img-52', theme: 'images', difficulty: 4, text: ACTEUR, answer: 'Cillian Murphy', distractors: ['Henry Cavill', 'Pedro Pascal', 'Kit Harington'], media: wiki('Cillian_Murphy-2014.jpg') },

  // ---------------------------------------------------------------------------
  // Films — acteurs & réalisateurs, vraies photos. 10 questions.
  // ---------------------------------------------------------------------------
  { id: 'img-53', theme: 'images', difficulty: 3, text: ACTEUR, answer: 'Leonardo DiCaprio', distractors: ['Joaquin Phoenix', 'Tom Hardy', 'Timothée Chalamet'], media: wiki('Leonardo_DiCaprio_2010.jpg') },
  { id: 'img-54', theme: 'images', difficulty: 3, text: ACTEUR, answer: 'Joaquin Phoenix', distractors: ['Leonardo DiCaprio', 'Tom Hardy', 'Willem Dafoe'], media: wiki('Joaquin_Phoenix_2014.jpg') },
  { id: 'img-55', theme: 'images', difficulty: 3, text: ACTRICE, answer: 'Margot Robbie', distractors: ['Florence Pugh', 'Anya Taylor-Joy', 'Emilia Clarke'], media: wiki('Margot_Robbie_by_Gage_Skidmore.jpg') },
  { id: 'img-56', theme: 'images', difficulty: 3, text: ACTEUR, answer: 'Timothée Chalamet', distractors: ['Leonardo DiCaprio', 'Tom Hardy', 'Joaquin Phoenix'], media: wiki('Timothée_Chalamet_2024.jpg') },
  { id: 'img-57', theme: 'images', difficulty: 4, text: ACTEUR, answer: 'Tom Hardy', distractors: ['Joaquin Phoenix', 'Willem Dafoe', 'Leonardo DiCaprio'], media: wiki('Tom_Hardy_by_Gage_Skidmore.jpg') },
  { id: 'img-58', theme: 'images', difficulty: 4, text: ACTEUR, answer: 'Willem Dafoe', distractors: ['Tom Hardy', 'Joaquin Phoenix', 'Christoph Waltz'], media: wiki('Willem_Dafoe_Cannes_2019.jpg') },
  { id: 'img-59', theme: 'images', difficulty: 4, text: ACTRICE, answer: 'Florence Pugh', distractors: ['Margot Robbie', 'Anya Taylor-Joy', 'Emilia Clarke'], media: wiki('Florence_Pugh_by_Gage_Skidmore.jpg') },
  { id: 'img-60', theme: 'images', difficulty: 3, text: REAL, answer: 'Christopher Nolan', distractors: ['Quentin Tarantino', 'Denis Villeneuve', 'Guillermo del Toro'], media: wiki('Christopher_Nolan_Cannes_2018.jpg') },
  { id: 'img-61', theme: 'images', difficulty: 3, text: REAL, answer: 'Quentin Tarantino', distractors: ['Christopher Nolan', 'Denis Villeneuve', 'Martin Scorsese'], media: wiki('Quentin_Tarantino_by_Gage_Skidmore.jpg') },
  { id: 'img-62', theme: 'images', difficulty: 4, text: REAL, answer: 'Denis Villeneuve', distractors: ['Christopher Nolan', 'Quentin Tarantino', 'Guillermo del Toro'], media: wiki('Denis_Villeneuve_by_Gage_Skidmore.jpg') },

  // ---------------------------------------------------------------------------
  // Films d'horreur — vraies photos. 5 questions.
  // ---------------------------------------------------------------------------
  { id: 'img-63', theme: 'images', difficulty: 3, text: ACTRICE, answer: 'Jamie Lee Curtis', distractors: ['Toni Collette', 'Anya Taylor-Joy', 'Vera Farmiga'], media: wiki('Jamie_Lee_Curtis_by_Gage_Skidmore.jpg') },
  { id: 'img-64', theme: 'images', difficulty: 3, text: ACTRICE, answer: 'Anya Taylor-Joy', distractors: ['Jamie Lee Curtis', 'Toni Collette', 'Florence Pugh'], media: wiki('Anya_Taylor-Joy_by_Gage_Skidmore.jpg') },
  { id: 'img-65', theme: 'images', difficulty: 4, text: ACTEUR, answer: 'Bill Skarsgård', distractors: ['Robert Englund', 'Bill Hader', 'Ethan Hawke'], media: wiki('Bill_Skarsgård.jpg') },
  { id: 'img-66', theme: 'images', difficulty: 4, text: ACTRICE, answer: 'Toni Collette', distractors: ['Jamie Lee Curtis', 'Vera Farmiga', 'Anya Taylor-Joy'], media: wiki('Toni_Collette_by_Gage_Skidmore.jpg') },
  { id: 'img-67', theme: 'images', difficulty: 4, text: REAL, answer: 'Jordan Peele', distractors: ['Ari Aster', 'Wes Craven', 'John Carpenter'], media: wiki('Jordan_Peele_2012.jpg') },

  // ---------------------------------------------------------------------------
  // Musique / Pop — vraies photos. 10 questions.
  // ---------------------------------------------------------------------------
  { id: 'img-68', theme: 'images', difficulty: 3, text: ARTISTE, answer: 'Billie Eilish', distractors: ['Olivia Rodrigo', 'Dua Lipa', 'Lana Del Rey'], media: wiki('Billie_Eilish_portrait.jpg') },
  { id: 'img-69', theme: 'images', difficulty: 3, text: ARTISTE, answer: 'Lana Del Rey', distractors: ['Billie Eilish', 'Olivia Rodrigo', 'Ariana Grande'], media: wiki('Lana_Del_Rey_2013.jpg') },
  { id: 'img-70', theme: 'images', difficulty: 3, text: ARTISTE, answer: 'Dua Lipa', distractors: ['Ariana Grande', 'Olivia Rodrigo', 'Selena Gomez'], media: wiki('Dua_Lipa.jpg') },
  { id: 'img-71', theme: 'images', difficulty: 3, text: ARTISTE, answer: 'Olivia Rodrigo', distractors: ['Billie Eilish', 'Dua Lipa', 'Selena Gomez'], media: wiki('Olivia_Rodrigo_in_2021.jpg') },
  { id: 'img-72', theme: 'images', difficulty: 4, text: ARTISTE, answer: 'Ariana Grande', distractors: ['Selena Gomez', 'Dua Lipa', 'Lana Del Rey'], media: wiki('Ariana_Grande.jpg') },
  { id: 'img-73', theme: 'images', difficulty: 3, text: ARTISTE, answer: 'Harry Styles', distractors: ['Ed Sheeran', 'Shawn Mendes', 'Justin Bieber'], media: wiki('Harry_Styles,_2012.jpg') },
  { id: 'img-74', theme: 'images', difficulty: 3, text: ARTISTE, answer: 'Ed Sheeran', distractors: ['Harry Styles', 'Shawn Mendes', 'Sam Smith'], media: wiki('Ed_Sheeran.jpg') },
  { id: 'img-75', theme: 'images', difficulty: 4, text: ARTISTE, answer: 'Bruno Mars', distractors: ['Harry Styles', 'Ed Sheeran', 'Justin Bieber'], media: wiki('Bruno_Mars_Super_Bowl_50.jpg') },
  { id: 'img-76', theme: 'images', difficulty: 4, text: ARTISTE, answer: 'Selena Gomez', distractors: ['Ariana Grande', 'Dua Lipa', 'Olivia Rodrigo'], media: wiki('Selena_Gomez_2011.jpg') },
  { id: 'img-77', theme: 'images', difficulty: 3, text: ARTISTE, answer: 'Taylor Swift', distractors: ['Lana Del Rey', 'Ariana Grande', 'Selena Gomez'], media: wiki('Taylor_Swift_2018.jpg') },

  // ---------------------------------------------------------------------------
  // Culture — scientifiques, dirigeants, artistes ; vraies photos. 12 questions.
  // ---------------------------------------------------------------------------
  { id: 'img-78', theme: 'images', difficulty: 3, text: SAVANT, answer: 'Albert Einstein', distractors: ['Nikola Tesla', 'Niels Bohr', 'Max Planck'], media: wiki('Einstein_1921_by_F_Schmutzer_-_restoration.jpg') },
  { id: 'img-79', theme: 'images', difficulty: 4, text: SAVANT, answer: 'Alan Turing', distractors: ['John von Neumann', 'Nikola Tesla', 'Claude Shannon'], media: wiki('Alan_Turing_Aged_16.jpg') },
  { id: 'img-80', theme: 'images', difficulty: 3, text: SAVANT, answer: 'Nikola Tesla', distractors: ['Thomas Edison', 'Albert Einstein', 'Guglielmo Marconi'], media: wiki('Nikola_Tesla.jpg') },
  { id: 'img-81', theme: 'images', difficulty: 3, text: SAVANT, answer: 'Marie Curie', distractors: ['Rosalind Franklin', 'Ada Lovelace', 'Lise Meitner'], media: wiki('Marie_Curie_c._1920s.jpg') },
  { id: 'img-82', theme: 'images', difficulty: 4, text: SAVANT, answer: 'Charles Darwin', distractors: ['Alfred Wallace', 'Gregor Mendel', 'Louis Pasteur'], media: wiki('Charles_Darwin_01.jpg') },
  { id: 'img-83', theme: 'images', difficulty: 4, text: SAVANT, answer: 'Rosalind Franklin', distractors: ['Marie Curie', 'Ada Lovelace', 'Lise Meitner'], media: wiki('Rosalind_Franklin.jpg') },
  { id: 'img-84', theme: 'images', difficulty: 3, text: SAVANT, answer: 'Stephen Hawking', distractors: ['Roger Penrose', 'Richard Feynman', 'Carl Sagan'], media: wiki('Stephen_Hawking.StarChild.jpg') },
  { id: 'img-85', theme: 'images', difficulty: 3, text: SAVANT, answer: 'Frida Kahlo', distractors: ['Georgia O’Keeffe', 'Tamara Lempicka', 'Camille Claudel'], media: wiki('Frida_Kahlo,_by_Guillermo_Kahlo.jpg') },
  { id: 'img-86', theme: 'images', difficulty: 3, text: SAVANT, answer: 'Barack Obama', distractors: ['Bill Clinton', 'George Bush', 'Joe Biden'], media: wiki('President_Barack_Obama.jpg') },
  { id: 'img-87', theme: 'images', difficulty: 4, text: SAVANT, answer: 'Nelson Mandela', distractors: ['Kofi Annan', 'Desmond Tutu', 'Barack Obama'], media: wiki('Nelson_Mandela_1994.jpg') },
  { id: 'img-88', theme: 'images', difficulty: 3, text: SAVANT, answer: 'Elon Musk', distractors: ['Jeff Bezos', 'Mark Zuckerberg', 'Bill Gates'], media: wiki('Elon_Musk_Royal_Society_crop.jpg') },
  { id: 'img-89', theme: 'images', difficulty: 4, text: SAVANT, answer: 'Greta Thunberg', distractors: ['Malala Yousafzai', 'Emma Watson', 'Amanda Gorman'], media: wiki('Greta_Thunberg_4.jpg') },

  // ---------------------------------------------------------------------------
  // Internet — créateurs de contenu, vraies photos. 5 questions.
  // ---------------------------------------------------------------------------
  { id: 'img-90', theme: 'images', difficulty: 3, text: CREATEUR, answer: 'MrBeast', distractors: ['PewDiePie', 'Ninja', 'KSI'], media: wiki('MrBeast_2023.jpg') },
  { id: 'img-91', theme: 'images', difficulty: 3, text: CREATEUR, answer: 'PewDiePie', distractors: ['MrBeast', 'Markiplier', 'Ninja'], media: wiki('Pewdiepie_head_shot.jpg') },
  { id: 'img-92', theme: 'images', difficulty: 4, text: CREATEUR, answer: 'Ninja', distractors: ['Pokimane', 'KSI', 'MrBeast'], media: wiki('Tyler_Ninja_Blevins.jpg') },
  { id: 'img-93', theme: 'images', difficulty: 4, text: CREATEUR, answer: 'KSI', distractors: ['MrBeast', 'PewDiePie', 'Ninja'], media: wiki('KSI_in_2024_(cropped).jpg') },
  { id: 'img-94', theme: 'images', difficulty: 4, text: CREATEUR, answer: 'Pokimane', distractors: ['Ninja', 'KSI', 'MrBeast'], media: wiki('Pokimane_2019.jpg') },

  // ---------------------------------------------------------------------------
  // Manga & anime — mangakas et réalisateurs, vraies photos. 8 questions.
  // ---------------------------------------------------------------------------
  { id: 'img-95', theme: 'images', difficulty: 3, text: REAL_ANIME, answer: 'Hayao Miyazaki', distractors: ['Isao Takahata', 'Makoto Shinkai', 'Mamoru Hosoda'], media: wiki('Hayao_Miyazaki.jpg') },
  { id: 'img-96', theme: 'images', difficulty: 3, text: REAL_ANIME, answer: 'Makoto Shinkai', distractors: ['Mamoru Hosoda', 'Hayao Miyazaki', 'Satoshi Kon'], media: wiki('Makoto_Shinkai,_2023.jpg') },
  { id: 'img-97', theme: 'images', difficulty: 4, text: REAL_ANIME, answer: 'Hideaki Anno', distractors: ['Mamoru Oshii', 'Satoshi Kon', 'Makoto Shinkai'], media: wiki('Hideaki_Anno.jpg') },
  { id: 'img-98', theme: 'images', difficulty: 4, text: MANGAKA, answer: 'Naoki Urasawa', distractors: ['Takehiko Inoue', 'Katsuhiro Otomo', 'Kentaro Miura'], media: wiki('Naoki_Urasawa_in_2012_(cropped).jpg') },
  { id: 'img-99', theme: 'images', difficulty: 4, text: MANGAKA, answer: 'Junji Ito', distractors: ['Hirohiko Araki', 'Kazuo Umezu', 'Naoki Urasawa'], media: wiki('Junji_Ito_-_Lucca_Comics_&_Games_2018_02.jpg') },
  { id: 'img-100', theme: 'images', difficulty: 4, text: MANGAKA, answer: 'Hirohiko Araki', distractors: ['Naoki Urasawa', 'Eiichiro Oda', 'Masashi Kishimoto'], media: wiki('Hirohiko_Araki_2013_-_cropped.jpg') },
  { id: 'img-101', theme: 'images', difficulty: 4, text: MANGAKA, answer: 'Katsuhiro Otomo', distractors: ['Naoki Urasawa', 'Osamu Tezuka', 'Go Nagai'], media: wiki('Katsuhiro_Otomo.jpg') },
  { id: 'img-102', theme: 'images', difficulty: 3, text: MANGAKA, answer: 'Osamu Tezuka', distractors: ['Go Nagai', 'Leiji Matsumoto', 'Shotaro Ishinomori'], media: wiki('Tezuka_Osamu.JPG') },
];
