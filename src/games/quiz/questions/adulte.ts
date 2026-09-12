import type { Question } from '../../../core/models';

/**
 * Contenu « cancellable » du quiz (échantillon démonstratif). Ce sont de vraies
 * questions de culture (avec bonne réponse), mais sur des sujets adultes : elles
 * portent un `cancelLevel` (2 épicé · 3 +18 · 4 trash) et sont rangées dans des
 * univers dédiés (🔞 / ☠️). Le pool grand public les exclut par défaut ; seuls
 * les modes de soirée les incluent selon le plafond choisi.
 *
 * On garde le format d'un vrai quiz : sujets adultes, coquins ou tabous, mais des
 * faits — jamais de contenu qui vise ou rabaisse un groupe. Elles sont rangées
 * dans des thèmes existants pour suivre naturellement les filtres de thème.
 */
export const adulteQuestions: Question[] = [
  // ===== Niveau 2 · Épicé 🌶️ ================================================
  {
    id: 'adl-201', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 1, cancelLevel: 2,
    text: "Quel alcool entre dans la composition d'un mojito ?", answer: 'Le rhum',
    distractors: ['La vodka', 'Le gin', 'Le whisky'],
  },
  {
    id: 'adl-202', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: "Quel est le degré d'alcool typique d'une vodka ?", answer: '40 %',
    distractors: ['12 %', '25 %', '60 %'],
  },
  {
    id: 'adl-203', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: 'De quel pays est originaire la tequila ?', answer: 'Le Mexique',
    distractors: ["L'Espagne", 'Le Brésil', 'Le Portugal'],
  },
  {
    id: 'adl-204', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on le spécialiste des vins qui te conseille au restaurant ?', answer: 'Le sommelier',
    distractors: ['Le barista', 'Le mixologue', 'Le caviste'],
  },
  {
    id: 'adl-205', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quelle hormone est surnommée « hormone de l'attachement » ?", answer: "L'ocytocine",
    distractors: ["L'adrénaline", "L'insuline", 'La mélatonine'],
  },
  {
    id: 'adl-206', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel moyen de contraception en latex est le plus vendu au monde ?', answer: 'Le préservatif',
    distractors: ['La pilule', 'Le stérilet', 'Le patch'],
  },
  {
    id: 'adl-207', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 2, cancelLevel: 2,
    text: "Comment nomme-t-on la période idéalisée du tout début d'une relation ?", answer: 'La lune de miel',
    distractors: ['La routine', 'La crise', 'Le divorce'],
  },

  // ===== Niveau 3 · +18 🔞 ==================================================
  {
    id: 'adl-301', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel est le seul organe du corps humain dédié uniquement au plaisir ?', answer: 'Le clitoris',
    distractors: ['Le cerveau', 'La peau', 'La langue'],
  },
  {
    id: 'adl-302', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: "Le Kâma-Sûtra, célèbre traité sur l'art d'aimer, vient de quel pays ?", answer: "L'Inde",
    distractors: ['La Chine', 'Le Japon', 'La Grèce'],
  },
  {
    id: 'adl-303', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelle ville néerlandaise est mondialement connue pour son quartier rouge ?', answer: 'Amsterdam',
    distractors: ['Rotterdam', 'La Haye', 'Utrecht'],
  },
  {
    id: 'adl-304', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Combien de temps un spermatozoïde peut-il survivre dans le corps féminin ?', answer: "Jusqu'à 5 jours",
    distractors: ['Quelques minutes', 'Une heure', 'Un mois'],
  },
  {
    id: 'adl-305', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'En France, quelle mention classe un film comme strictement réservé aux adultes ?', answer: 'La mention X',
    distractors: ['La mention -12', 'La mention Art et Essai', 'La mention VF'],
  },
  {
    id: 'adl-306', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel chanteur a fait scandale avec le titre langoureux « Je t’aime… moi non plus » ?', answer: 'Serge Gainsbourg',
    distractors: ['Jacques Brel', 'Charles Aznavour', 'Michel Sardou'],
  },
  {
    id: 'adl-307', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle hormone, produite surtout par les testicules, gouverne la libido masculine ?', answer: 'La testostérone',
    distractors: ["L'œstrogène", "L'insuline", 'La dopamine'],
  },

  // ===== Niveau 4 · Cancellable ☠️ ==========================================
  {
    id: 'adl-401', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Dans quel pays européen la prostitution est-elle légale et réglementée depuis 2002 ?', answer: "L'Allemagne",
    distractors: ['La France', 'La Pologne', "L'Irlande"],
  },
  {
    id: 'adl-402', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Quel empereur romain, réputé pour ses excès, aurait voulu nommer son cheval sénateur ?', answer: 'Caligula',
    distractors: ['Néron', 'Auguste', 'Trajan'],
  },
  {
    id: 'adl-403', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Quel aristocrate écrivain a donné son nom au mot « sadisme » ?', answer: 'Le marquis de Sade',
    distractors: ['Casanova', 'Rabelais', 'Voltaire'],
  },
  {
    id: 'adl-404', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Quelle activité est surnommée « le plus vieux métier du monde » ?', answer: 'La prostitution',
    distractors: ["L'agriculture", 'La chasse', 'La médecine'],
  },
  {
    id: 'adl-405', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 4,
    text: "Comment nomme-t-on l'attirance sexuelle malsaine envers les cadavres ?", answer: 'La nécrophilie',
    distractors: ['La xénophilie', 'La bibliophilie', 'La claustrophilie'],
  },
  {
    id: 'adl-406', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel film de 1972 avec Marlon Brando fut censuré pour ses scènes explicites ?', answer: 'Le Dernier Tango à Paris',
    distractors: ['Le Parrain', 'Orange mécanique', "L'Exorciste"],
  },
  {
    id: 'adl-407', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quelle star a embrassé Britney Spears sur scène aux MTV Video Music Awards 2003 ?', answer: 'Madonna',
    distractors: ['Lady Gaga', 'Beyoncé', 'Rihanna'],
  },
  {
    id: 'adl-408', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quelle substance festive était surnommée « la poudre » dans les nuits des années 80 ?', answer: 'La cocaïne',
    distractors: ["L'héroïne", 'Le cannabis', "L'ecstasy"],
  },
];
