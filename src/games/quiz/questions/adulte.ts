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

  // ===== Vague 4 ============================================================
  // --- Niveau 2 · Épicé 🌶️ --------------------------------------------------
  {
    id: 'adl-224', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on un mélange de bière et de limonade ?', answer: 'Un panaché',
    distractors: ['Un demi', 'Une pinte', 'Un spritz'],
  },
  {
    id: 'adl-225', theme: 'culture', universe: 'Sexo 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Quelle couleur est traditionnellement associée à la passion ?', answer: 'Le rouge',
    distractors: ['Le bleu', 'Le vert', 'Le jaune'],
  },
  {
    id: 'adl-226', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 2, cancelLevel: 2,
    text: 'Comment nomme-t-on le fait de disparaître sans explication après une histoire ?', answer: 'Le ghosting',
    distractors: ['Le crushing', 'Le matching', 'Le zapping'],
  },
  {
    id: 'adl-227', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: "Quelle fête irlandaise est l'occasion de boire des bières, parfois vertes ?", answer: 'La Saint-Patrick',
    distractors: ['Halloween', 'Thanksgiving', 'Mardi gras'],
  },
  {
    id: 'adl-228', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel oiseau donne son nom aux jeunes amoureux, les « tourtereaux » ?', answer: 'La tourterelle',
    distractors: ['Le pigeon', 'La colombe', 'Le rossignol'],
  },

  // --- Niveau 3 · +18 🔞 ----------------------------------------------------
  {
    id: 'adl-324', theme: 'culture', universe: 'Sexo 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quel médicament bleu lancé en 1998 traite les troubles de l'érection ?", answer: 'Le Viagra',
    distractors: ['Le Prozac', "L'aspirine", 'Le Doliprane'],
  },
  {
    id: 'adl-325', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Combien de spermatozoïdes contient en moyenne une éjaculation ?', answer: 'Plusieurs centaines de millions',
    distractors: ['Quelques milliers', 'Environ un million', 'Une dizaine'],
  },
  {
    id: 'adl-326', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel acteur incarne Christian Grey dans « Cinquante nuances de Grey » ?', answer: 'Jamie Dornan',
    distractors: ['Robert Pattinson', 'Ian Somerhalder', 'Henry Cavill'],
  },
  {
    id: 'adl-327', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quel rappeur multiplie les provocations sous l'alias « Slim Shady » ?", answer: 'Eminem',
    distractors: ['Snoop Dogg', '50 Cent', 'Dr. Dre'],
  },
  {
    id: 'adl-328', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle île espagnole est LA capitale mondiale des clubs et de la fête ?', answer: 'Ibiza',
    distractors: ['Majorque', 'Minorque', 'Ténérife'],
  },

  // --- Niveau 4 · Cancellable ☠️ --------------------------------------------
  {
    id: 'adl-425', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 4,
    text: "Quelle comtesse hongroise est accusée d'avoir tué de nombreuses jeunes filles ?", answer: 'Élisabeth Báthory',
    distractors: ['Catherine de Médicis', 'Lucrèce Borgia', 'Mata Hari'],
  },
  {
    id: 'adl-426', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on le commerce illégal de biens et de services ?', answer: 'Le marché noir',
    distractors: ['Le marché aux puces', 'Le marché bio', 'La bourse'],
  },
  {
    id: 'adl-427', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel gaz hilarant détourné en soirée est aussi un anesthésique médical ?', answer: "Le protoxyde d'azote",
    distractors: ['Le dioxyde de carbone', "L'hélium", "L'oxygène"],
  },
  {
    id: 'adl-428', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel film de Gaspar Noé (2002) a choqué par sa violence extrême ?', answer: 'Irréversible',
    distractors: ['Antichrist', 'Martyrs', 'Climax'],
  },
  {
    id: 'adl-429', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 4,
    text: 'À quel âge sont morts Hendrix, Joplin et Cobain, formant un « club » tristement célèbre ?', answer: '27 ans',
    distractors: ['30 ans', '25 ans', '33 ans'],
  },

  // ===== Vague 5 ============================================================
  // --- Niveau 2 · Épicé 🌶️ --------------------------------------------------
  {
    id: 'adl-229', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 2,
    text: 'Quelle liqueur de café entre dans un Espresso Martini ?', answer: 'Le Kahlúa',
    distractors: ['Le Cointreau', 'Le Baileys', 'La Chartreuse'],
  },
  {
    id: 'adl-230', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: 'Quel alcool japonais à base de riz accompagne traditionnellement les sushis ?', answer: 'Le saké',
    distractors: ['Le soju', 'Le baijiu', 'Le mirin'],
  },
  {
    id: 'adl-231', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 2,
    text: 'Quel cocktail brésilien est à base de cachaça ?', answer: 'La caïpirinha',
    distractors: ['La sangria', 'Le spritz', 'Le daïquiri'],
  },
  {
    id: 'adl-232', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle pierre précieuse rouge symbolise la passion ?', answer: 'Le rubis',
    distractors: ["L'émeraude", 'Le saphir', 'Le diamant'],
  },
  {
    id: 'adl-233', theme: 'culture', universe: 'Sexo 🔞', difficulty: 1, cancelLevel: 2,
    text: "Comment appelle-t-on l'attirance foudroyante dès le premier regard ?", answer: 'Le coup de foudre',
    distractors: ['Le béguin', 'La tendresse', 'La routine'],
  },
  {
    id: 'adl-234', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel roman de Choderlos de Laclos peint des jeux de séduction cruels ?', answer: 'Les Liaisons dangereuses',
    distractors: ['Manon Lescaut', 'Madame Bovary', 'Le Rouge et le Noir'],
  },
  {
    id: 'adl-235', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 2, cancelLevel: 2,
    text: "Comment nomme-t-on un couple qui vit loin l'un de l'autre ?", answer: 'Une relation à distance',
    distractors: ['Un mariage blanc', 'Une union libre', 'Un pacs'],
  },
  {
    id: 'adl-236', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 2, cancelLevel: 2,
    text: 'Quel contrat civil français unit deux personnes sans mariage ?', answer: 'Le PACS',
    distractors: ['Le CDI', 'Le bail', 'La tutelle'],
  },
  {
    id: 'adl-237', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: 'Quelle gigantesque fête de la bière a lieu chaque automne à Munich ?', answer: "L'Oktoberfest",
    distractors: ['Le Carnaval', 'La Saint-Patrick', 'Le Nouvel An'],
  },
  {
    id: 'adl-238', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 2,
    text: 'Quel cépage blanc entre, avec le pinot noir, dans la composition du champagne ?', answer: 'Le chardonnay',
    distractors: ['Le merlot', 'La syrah', 'Le gamay'],
  },

  // --- Niveau 3 · +18 🔞 ----------------------------------------------------
  {
    id: 'adl-329', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Comment nomme-t-on la zone de plaisir féminine controversée désignée par une lettre ?', answer: 'Le point G',
    distractors: ['Le point A', 'Le point V', 'Le point Z'],
  },
  {
    id: 'adl-330', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Comment désigne-t-on familièrement une relation charnelle sans engagement ?', answer: 'Un plan cul',
    distractors: ['Un rencard', 'Un flirt', 'Un béguin'],
  },
  {
    id: 'adl-331', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quel ensemble de muscles du plancher pelvien se muscle pour améliorer le plaisir ?", answer: 'Le périnée',
    distractors: ['Le diaphragme', 'Le biceps', 'Le trapèze'],
  },
  {
    id: 'adl-332', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Combien de terminaisons nerveuses compte environ le clitoris ?', answer: 'Environ 8 000',
    distractors: ['Environ 100', 'Environ 800', 'Environ 80 000'],
  },
  {
    id: 'adl-333', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quel film de 2013 d'Abdellatif Kechiche fut primé et remarqué pour ses scènes intimes ?", answer: "La Vie d'Adèle",
    distractors: ['Amour', 'Intouchables', 'La Haine'],
  },
  {
    id: 'adl-334', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel film de Paul Verhoeven (1995) sur des strip-teaseuses est devenu un flop culte ?', answer: 'Showgirls',
    distractors: ['Striptease', 'Flashdance', 'Coyote Ugly'],
  },
  {
    id: 'adl-335', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel groupe britannique a choqué avec « Relax », interdit d’antenne par la BBC ?', answer: 'Frankie Goes to Hollywood',
    distractors: ['Wham!', 'Duran Duran', 'The Police'],
  },
  {
    id: 'adl-336', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel style musical jamaïcain aux paroles souvent très crues a émergé dans les années 90 ?', answer: 'Le dancehall',
    distractors: ['Le reggae', 'Le ska', 'Le calypso'],
  },
  {
    id: 'adl-337', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle capitale asiatique est réputée pour sa vie nocturne intense ?', answer: 'Bangkok',
    distractors: ['Tokyo', 'Séoul', 'Hanoï'],
  },
  {
    id: 'adl-338', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quelle célèbre boîte techno berlinoise est réputée pour sa sélection d'entrée impitoyable ?", answer: 'Le Berghain',
    distractors: ['Le Studio 54', 'Le Rex', "L'Amnesia"],
  },

  // --- Niveau 4 · Cancellable ☠️ --------------------------------------------
  {
    id: 'adl-430', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 4,
    text: "Quel empereur romain aurait joué de la lyre pendant l'incendie de Rome ?", answer: 'Néron',
    distractors: ['Auguste', 'Hadrien', 'Marc Aurèle'],
  },
  {
    id: 'adl-431', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 4,
    text: "Quelle famille de la Renaissance italienne est synonyme d'intrigues et d'empoisonnements ?", answer: 'Les Borgia',
    distractors: ['Les Médicis', 'Les Sforza', 'Les Este'],
  },
  {
    id: 'adl-432', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 3, cancelLevel: 4,
    text: "Comment appelle-t-on l'argent exigé pour libérer un otage ?", answer: 'Une rançon',
    distractors: ['Une caution', 'Une amende', 'Un acompte'],
  },
  {
    id: 'adl-433', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 4, cancelLevel: 4,
    text: "Comment nomme-t-on le trafic d'êtres humains à des fins d'exploitation ?", answer: 'La traite',
    distractors: ['Le troc', 'La contrebande', 'Le recel'],
  },
  {
    id: 'adl-434', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quelle drogue hallucinogène fut popularisée par la contre-culture des années 60 ?', answer: 'Le LSD',
    distractors: ['La morphine', 'La nicotine', 'La caféine'],
  },
  {
    id: 'adl-435', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: "Quel film d'horreur français de 2008 est réputé pour être insoutenable ?", answer: 'Martyrs',
    distractors: ['Le Pacte des loups', 'Frontière(s)', 'Grave'],
  },
  {
    id: 'adl-436', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel festival de 1969 est devenu le symbole du mouvement hippie et de ses excès ?', answer: 'Woodstock',
    distractors: ['Coachella', 'Glastonbury', 'Le Hellfest'],
  },
  {
    id: 'adl-437', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quelle boîte de nuit new-yorkaise des années 70 symbolisait la fête et la décadence ?', answer: 'Le Studio 54',
    distractors: ['Le CBGB', 'Le Cotton Club', 'Le Blue Note'],
  },
  {
    id: 'adl-438', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on un dirigeant qui exerce un pouvoir absolu et répressif ?', answer: 'Un dictateur',
    distractors: ['Un député', 'Un maire', 'Un diplomate'],
  },
  {
    id: 'adl-439', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Comment nomme-t-on le fait de truquer une élection ?', answer: 'La fraude électorale',
    distractors: ['Le sondage', 'Le référendum', 'Le recensement'],
  },
];
