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

  // ===== Vague 2 ============================================================
  // --- Niveau 2 · Épicé 🌶️ --------------------------------------------------
  {
    id: 'adl-208', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: "Quel cocktail mélange vodka et jus d'orange ?", answer: 'Le Screwdriver',
    distractors: ['La Margarita', 'Le Mojito', 'Le Cosmopolitan'],
  },
  {
    id: 'adl-209', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: "Quelle boisson pétillante italienne est la base d'un Spritz ?", answer: 'Le prosecco',
    distractors: ['Le champagne', 'Le cidre', 'Le crémant'],
  },
  {
    id: 'adl-210', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 2,
    text: 'Quel apéritif italien amer et orangé donne sa couleur au Spritz ?', answer: "L'Aperol",
    distractors: ['Le Martini', 'Le Limoncello', 'La Grappa'],
  },
  {
    id: 'adl-211', theme: 'culture', universe: 'Sexo 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Quelle fleur rouge est le symbole universel de la passion ?', answer: 'La rose',
    distractors: ['La tulipe', 'Le lys', 'Le tournesol'],
  },
  {
    id: 'adl-212', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quel dieu romain de l'amour décoche des flèches sur les cœurs ?", answer: 'Cupidon',
    distractors: ['Mars', 'Jupiter', 'Neptune'],
  },
  {
    id: 'adl-213', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 2, cancelLevel: 2,
    text: "Comment appelle-t-on l'anniversaire des 50 ans de mariage ?", answer: "Les noces d'or",
    distractors: ["Les noces d'argent", 'Les noces de diamant', 'Les noces de perle'],
  },
  {
    id: 'adl-214', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 1, cancelLevel: 2,
    text: 'Quel bijou symbolise une demande en mariage ?', answer: 'La bague',
    distractors: ['Le collier', 'La montre', 'Le bracelet'],
  },
  {
    id: 'adl-215', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 2,
    text: "En France, en quelle unité mesure-t-on l'alcoolémie au volant ?", answer: 'Le gramme par litre de sang',
    distractors: ['Le degré', 'Le millilitre', 'Le pourcentage'],
  },
  {
    id: 'adl-216', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: 'De quelle céréale la bière est-elle principalement issue ?', answer: "L'orge",
    distractors: ['Le blé', 'Le maïs', 'Le riz'],
  },
  {
    id: 'adl-217', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel fruit de mer, cher à Casanova, est réputé aphrodisiaque ?', answer: "L'huître",
    distractors: ['La moule', 'La crevette', "L'oursin"],
  },

  // --- Niveau 3 · +18 🔞 ----------------------------------------------------
  {
    id: 'adl-308', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel roman érotique de E. L. James a battu des records de ventes ?', answer: 'Cinquante nuances de Grey',
    distractors: ['Emmanuelle', "Histoire d'O", 'Belle du Seigneur'],
  },
  {
    id: 'adl-309', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel sigle désigne les pratiques de domination et de soumission consenties ?', answer: 'BDSM',
    distractors: ['ASMR', 'LGBT', 'BCBG'],
  },
  {
    id: 'adl-310', theme: 'culture', universe: 'Sexo 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quelle molécule du plaisir inonde le cerveau lors d'un coup de foudre ?", answer: 'La dopamine',
    distractors: ['La kératine', 'La créatine', "L'hémoglobine"],
  },
  {
    id: 'adl-311', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Comment nomme-t-on les toutes premières règles chez la femme ?', answer: 'Les ménarches',
    distractors: ['La ménopause', "L'ovulation", 'La nidation'],
  },
  {
    id: 'adl-312', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel organe masculin produit les spermatozoïdes ?', answer: 'Les testicules',
    distractors: ['La prostate', 'La vessie', 'Les reins'],
  },
  {
    id: 'adl-313', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel virus est responsable du sida ?', answer: 'Le VIH',
    distractors: ['Le HPV', "L'hépatite B", "L'herpès"],
  },
  {
    id: 'adl-314', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quelle actrice incarne l'héroïne fatale de « Basic Instinct » (1992) ?", answer: 'Sharon Stone',
    distractors: ['Kim Basinger', 'Demi Moore', 'Michelle Pfeiffer'],
  },
  {
    id: 'adl-315', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel film érotique de 1974 révéla Sylvia Kristel ?', answer: 'Emmanuelle',
    distractors: ['9 Semaines ½', 'Lolita', 'Le Dernier Tango à Paris'],
  },
  {
    id: 'adl-316', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quelle chanteuse a fait scandale avec sa robe en viande crue ?', answer: 'Lady Gaga',
    distractors: ['Madonna', 'Rihanna', 'Miley Cyrus'],
  },
  {
    id: 'adl-317', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelle ville américaine du jeu et de la fête est surnommée « Sin City » ?', answer: 'Las Vegas',
    distractors: ['Atlantic City', 'Reno', 'Miami'],
  },

  // --- Niveau 4 · Cancellable ☠️ --------------------------------------------
  {
    id: 'adl-409', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Quel pays fut le premier à légaliser le cannabis récréatif au niveau national, en 2013 ?', answer: "L'Uruguay",
    distractors: ['Les Pays-Bas', 'Le Canada', 'Le Portugal'],
  },
  {
    id: 'adl-410', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Quelle pratique de fin de vie médicalisée est légale en Belgique depuis 2002 ?', answer: "L'euthanasie",
    distractors: ['La trépanation', 'La lobotomie', 'La dialyse'],
  },
  {
    id: 'adl-411', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 4, cancelLevel: 4,
    text: "Comment qualifie-t-on l'argent d'origine illégale rendu « propre » ?", answer: "De l'argent blanchi",
    distractors: ["De l'argent liquide", "De l'argent de poche", 'De la petite monnaie'],
  },
  {
    id: 'adl-412', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 4,
    text: "Quelle reine d'Égypte séduisit à la fois César et Marc Antoine ?", answer: 'Cléopâtre',
    distractors: ['Néfertiti', 'Hatchepsout', 'Livie'],
  },
  {
    id: 'adl-413', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 4,
    text: "Quel médecin viennois a fondé la psychanalyse et théorisé le complexe d'Œdipe ?", answer: 'Sigmund Freud',
    distractors: ['Carl Jung', 'Jacques Lacan', 'Alfred Adler'],
  },
  {
    id: 'adl-414', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Quel groupe fut marqué par le suicide collectif de Jonestown en 1978 ?', answer: 'Le Temple du Peuple',
    distractors: ["L'Ordre du Temple solaire", 'Les Davidiens', "Heaven's Gate"],
  },
  {
    id: 'adl-415', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quelle drogue de synthèse festive est surnommée « ecstasy » ?', answer: 'La MDMA',
    distractors: ['Le LSD', 'La kétamine', 'Le GHB'],
  },
  {
    id: 'adl-416', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel cinéaste a scandalisé avec « Salò ou les 120 Journées de Sodome » ?', answer: 'Pier Paolo Pasolini',
    distractors: ['Lars von Trier', 'Gaspar Noé', 'Stanley Kubrick'],
  },
  {
    id: 'adl-417', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel chanteur des Doors fut arrêté sur scène pour outrage à la pudeur en 1969 ?', answer: 'Jim Morrison',
    distractors: ['Mick Jagger', 'Iggy Pop', 'Freddie Mercury'],
  },
  {
    id: 'adl-418', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Dans quelle ville se dresse le célèbre cabaret du Moulin Rouge ?', answer: 'Paris',
    distractors: ['Londres', 'Berlin', 'Madrid'],
  },

  // ===== Vague 3 ============================================================
  // --- Niveau 2 · Épicé 🌶️ --------------------------------------------------
  {
    id: 'adl-218', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: "Quel alcool anisé se trouble au contact de l'eau ?", answer: 'Le pastis',
    distractors: ['Le rhum', 'La vodka', 'Le whisky'],
  },
  {
    id: 'adl-219', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 2,
    text: 'Quelle région française est mondialement réputée pour ses grands vins rouges classés ?', answer: 'Le Bordelais',
    distractors: ['La Bretagne', 'La Normandie', 'La Corse'],
  },
  {
    id: 'adl-220', theme: 'culture', universe: 'Sexo 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Quel mois célèbre la fête des amoureux, la Saint-Valentin ?', answer: 'Février',
    distractors: ['Janvier', 'Mars', 'Juin'],
  },
  {
    id: 'adl-221', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 3, cancelLevel: 2,
    text: "Comment appelle-t-on l'anniversaire des 25 ans de mariage ?", answer: "Les noces d'argent",
    distractors: ["Les noces d'or", 'Les noces de bois', 'Les noces de coton'],
  },
  {
    id: 'adl-222', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quelle déesse grecque incarne l'amour et la beauté ?", answer: 'Aphrodite',
    distractors: ['Athéna', 'Héra', 'Artémis'],
  },
  {
    id: 'adl-223', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: "Comment nomme-t-on le mal de crâne du lendemain d'une soirée trop arrosée ?", answer: 'La gueule de bois',
    distractors: ["L'insomnie", 'La migraine', 'Le vertige'],
  },

  // --- Niveau 3 · +18 🔞 ----------------------------------------------------
  {
    id: 'adl-318', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quel mot grec antique désigne l'amour charnel et passionné ?", answer: 'Éros',
    distractors: ['Philia', 'Agapè', 'Storgê'],
  },
  {
    id: 'adl-319', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Selon les études, combien de temps dure en moyenne un rapport, hors préliminaires ?', answer: 'Environ 5 minutes',
    distractors: ['Environ 30 secondes', 'Environ 30 minutes', 'Environ 2 heures'],
  },
  {
    id: 'adl-320', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel film érotique de 1986 réunit Mickey Rourke et Kim Basinger ?', answer: '9 Semaines ½',
    distractors: ['Basic Instinct', 'Body', 'Eyes Wide Shut'],
  },
  {
    id: 'adl-321', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle chanteuse a fait polémique en twerkant aux MTV VMA 2013 ?', answer: 'Miley Cyrus',
    distractors: ['Katy Perry', 'Taylor Swift', 'Ariana Grande'],
  },
  {
    id: 'adl-322', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel quartier de Paris est historiquement lié à la vie nocturne et au Moulin Rouge ?', answer: 'Pigalle',
    distractors: ['Le Marais', 'Montparnasse', 'La Défense'],
  },
  {
    id: 'adl-323', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel séducteur vénitien du XVIIIᵉ siècle a donné son nom aux dragueurs invétérés ?', answer: 'Casanova',
    distractors: ['Cyrano', 'Roméo', 'Machiavel'],
  },

  // --- Niveau 4 · Cancellable ☠️ --------------------------------------------
  {
    id: 'adl-419', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Comment appelle-t-on un pot-de-vin versé pour obtenir une faveur illégale ?', answer: 'Un bakchich',
    distractors: ['Un acompte', 'Un pourboire', 'Une caution'],
  },
  {
    id: 'adl-420', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Quel tsar de Russie est resté célèbre sous le surnom « le Terrible » ?', answer: 'Ivan IV',
    distractors: ['Pierre Ier', 'Nicolas II', 'Alexandre III'],
  },
  {
    id: 'adl-421', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quelle infection sexuellement transmissible est causée par la bactérie Treponema pallidum ?', answer: 'La syphilis',
    distractors: ['Le sida', "L'herpès génital", "L'hépatite B"],
  },
  {
    id: 'adl-422', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel réalisateur a signé le sulfureux « Eyes Wide Shut » avec Tom Cruise ?', answer: 'Stanley Kubrick',
    distractors: ['Roman Polanski', 'David Lynch', 'Brian De Palma'],
  },
  {
    id: 'adl-423', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 4,
    text: "Quel groupe de hard rock a raconté ses excès dans l'autobiographie « The Dirt » ?", answer: 'Mötley Crüe',
    distractors: ['Kiss', 'Aerosmith', 'Bon Jovi'],
  },
  {
    id: 'adl-424', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quelle ville allemande est connue pour la Reeperbahn, son célèbre quartier chaud ?', answer: 'Hambourg',
    distractors: ['Munich', 'Cologne', 'Francfort'],
  },
];
