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

  // ===== Vague 6 ============================================================
  // --- Niveau 2 · Épicé 🌶️ --------------------------------------------------
  {
    id: 'adl-239', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 2,
    text: "Quelle boisson mexicaine fermentée, ancêtre de la tequila, est tirée de l'agave ?", answer: 'Le pulque',
    distractors: ['Le mezcal', 'Le sotol', 'Le raicilla'],
  },
  {
    id: 'adl-240', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 2,
    text: "Quel vin pétillant espagnol est l'équivalent du champagne ?", answer: 'Le cava',
    distractors: ['Le porto', 'Le xérès', 'Le rioja'],
  },
  {
    id: 'adl-241', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on familièrement un baiser avec la langue ?', answer: 'Un patin',
    distractors: ['Une bise', 'Un smack', 'Une accolade'],
  },
  {
    id: 'adl-242', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 3, cancelLevel: 2,
    text: 'Comment appelle-t-on les noces de 10 ans de mariage ?', answer: "Les noces d'étain",
    distractors: ["Les noces d'or", 'Les noces de cuir', 'Les noces de perle'],
  },
  {
    id: 'adl-243', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Quel organe féminin accueille le fœtus pendant la grossesse ?', answer: "L'utérus",
    distractors: ['Le foie', "L'estomac", 'La rate'],
  },
  {
    id: 'adl-244', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quelle est la durée moyenne d'un cycle menstruel ?", answer: '28 jours',
    distractors: ['7 jours', '90 jours', '365 jours'],
  },
  {
    id: 'adl-245', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 2,
    text: 'Combien de bulles compte environ une flûte de champagne ?', answer: 'Environ un million',
    distractors: ['Une centaine', 'Un milliard', 'Une dizaine'],
  },
  {
    id: 'adl-246', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel dieu grec du vin et de la fête symbolise les excès ?', answer: 'Dionysos',
    distractors: ['Apollon', 'Hermès', 'Arès'],
  },

  // --- Niveau 3 · +18 🔞 ----------------------------------------------------
  {
    id: 'adl-347', theme: 'culture', universe: 'Sexo 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Comment nommait-on l’amulette phallique porte-bonheur des Romains ?', answer: 'Le fascinus',
    distractors: ['Le laraire', "L'amphore", 'La fibule'],
  },
  {
    id: 'adl-348', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle hormone féminine domine le cycle et la grossesse ?', answer: "L'œstrogène",
    distractors: ['La testostérone', "L'insuline", 'Le cortisol'],
  },
  {
    id: 'adl-349', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel film japonais de 1976 fut censuré pour sa crudité sexuelle ?', answer: "L'Empire des sens",
    distractors: ['Ran', 'Rashômon', 'Tokyo Story'],
  },
  {
    id: 'adl-350', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle est la suite directe de « Cinquante nuances de Grey » ?', answer: 'Cinquante nuances plus sombres',
    distractors: ['Après', '365 Jours', 'Twilight'],
  },
  {
    id: 'adl-351', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle chanteuse a choqué avec le clip très suggestif « Dirrty » en 2002 ?', answer: 'Christina Aguilera',
    distractors: ['Britney Spears', 'Pink', 'Jessica Simpson'],
  },
  {
    id: 'adl-352', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quelle chanteuse a déchiré une photo du pape en direct à la télé en 1992 ?', answer: "Sinéad O'Connor",
    distractors: ['Madonna', 'Cyndi Lauper', 'Alanis Morissette'],
  },
  {
    id: 'adl-353', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel quartier animé de Tokyo abrite le célèbre Kabukichō ?', answer: 'Shinjuku',
    distractors: ['Shibuya', 'Ginza', 'Asakusa'],
  },
  {
    id: 'adl-354', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Comment appelle-t-on la grande avenue des casinos de Las Vegas ?', answer: 'Le Strip',
    distractors: ['Broadway', 'Sunset Boulevard', 'La Rambla'],
  },

  // --- Niveau 4 · Cancellable ☠️ --------------------------------------------
  {
    id: 'adl-440', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel film polonais de Netflix (2020) a fait scandale par ses scènes explicites ?', answer: '365 Jours',
    distractors: ['Sex/Life', 'Elite', 'Baby'],
  },
  {
    id: 'adl-441', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 4, cancelLevel: 4,
    text: "Comment appelle-t-on le commerce illégal d'organes humains ?", answer: "Le trafic d'organes",
    distractors: ['Le don du sang', 'La greffe', 'La transfusion'],
  },
  {
    id: 'adl-442', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Quel réseau chiffré est associé aux marchés illégaux en ligne ?', answer: 'Le dark web',
    distractors: ['Le cloud', 'Le wifi', 'Le web 2.0'],
  },
  {
    id: 'adl-443', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 4,
    text: "Quel jugement médiéval par l'eau ou le feu était censé prouver l'innocence ?", answer: "L'ordalie",
    distractors: ['Le tournoi', "L'adoubement", 'La dîme'],
  },
  {
    id: 'adl-444', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Quel conquérant mongol a bâti un empire par la terreur au XIIIᵉ siècle ?', answer: 'Gengis Khan',
    distractors: ['Attila', 'Tamerlan', 'Soliman'],
  },
  {
    id: 'adl-445', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel poison végétal a servi à exécuter Socrate ?', answer: 'La ciguë',
    distractors: ["L'arsenic", 'Le cyanure', 'La belladone'],
  },
  {
    id: 'adl-446', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 3, cancelLevel: 4,
    text: "Quel festival déjanté du désert du Nevada prône l'auto-expression radicale ?", answer: 'Le Burning Man',
    distractors: ['Coachella', 'Tomorrowland', 'Glastonbury'],
  },
  {
    id: 'adl-447', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Comment appelle-t-on le fait de détourner des fonds publics à son profit ?', answer: 'Le détournement de fonds',
    distractors: ["L'épargne", 'La subvention', 'Le budget'],
  },

  // ── Vague : nouveaux thèmes osés (séries, jeux vidéo, littérature, manga, internet) + compléments ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-247', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 2,
    text: "Dans quelle série suit-on le quotidien d'un parrain de la mafia du New Jersey qui voit un psy ?", answer: 'Les Soprano',
    distractors: ['Peaky Blinders', 'Boardwalk Empire', 'Narcos'],
  },
  {
    id: 'adl-248', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle série suit un écrivain obsédé par le sexe incarné par David Duchovny ?', answer: 'Californication',
    distractors: ['Entourage', 'Ballers', 'House of Lies'],
  },
  {
    id: 'adl-249', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Quelle saga vidéoludique laisse semer le chaos en ville au volant de voitures volées ?', answer: 'GTA',
    distractors: ['Need for Speed', 'Watch Dogs', 'Mafia'],
  },
  {
    id: 'adl-250', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Dans quelle saga le sorceleur Geralt enchaîne les contrats… et les conquêtes amoureuses ?', answer: 'The Witcher',
    distractors: ['Dragon Age', 'Skyrim', 'Dark Souls'],
  },
  {
    id: 'adl-251', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel roman épistolaire de Laclos met en scène les jeux de séduction cruels de deux libertins ?', answer: 'Les Liaisons dangereuses',
    distractors: ['Manon Lescaut', 'La Princesse de Clèves', 'Le Rouge et le Noir'],
  },
  {
    id: 'adl-252', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel recueil de Baudelaire fut condamné pour outrage à la morale publique en 1857 ?', answer: 'Les Fleurs du mal',
    distractors: ['Les Contemplations', 'Alcools', 'Poèmes saturniens'],
  },
  {
    id: 'adl-253', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel manga ultra-violent suit Guts, un mercenaire au sombre destin dans un monde médiéval ?', answer: 'Berserk',
    distractors: ['Vinland Saga', 'Claymore', 'Vagabond'],
  },
  {
    id: 'adl-254', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel anime mêle esthétique mignonne et hémoglobine autour de mutantes appelées Diclonius ?', answer: 'Elfen Lied',
    distractors: ['School Days', 'Higurashi', 'Another'],
  },
  {
    id: 'adl-255', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel réseau permet de naviguer anonymement en faisant rebondir la connexion sur plusieurs relais ?', answer: 'Tor',
    distractors: ['Le VPN', 'Le proxy', 'Le DNS'],
  },
  {
    id: 'adl-256', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Comment nomme-t-on une arnaque qui soutire vos données via un faux mail ou un faux site ?', answer: 'Le phishing',
    distractors: ['Le spam', 'Le cookie', 'Le captcha'],
  },
  {
    id: 'adl-257', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quel film de Scorsese suit l'ascension déjantée d'un courtier véreux de Wall Street ?", answer: 'Le Loup de Wall Street',
    distractors: ['Casino', 'Boiler Room', 'Margin Call'],
  },
  {
    id: 'adl-258', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel artiste de rock choc provoquait avec des shows sanglants et le titre « The Beautiful People » ?', answer: 'Marilyn Manson',
    distractors: ['Slipknot', 'Rammstein', 'KISS'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-355', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelle série médiévale de HBO est célèbre pour ses scènes de sexe et de violence explicites ?', answer: 'Game of Thrones',
    distractors: ['Vikings', 'Rome', 'The Last Kingdom'],
  },
  {
    id: 'adl-356', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle série sur les gladiateurs est réputée pour son sang et son sexe à profusion ?', answer: 'Spartacus',
    distractors: ['Rome', 'Gladiator', 'Barbares'],
  },
  {
    id: 'adl-357', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel mini-jeu caché sexuellement explicite a fait scandale dans GTA: San Andreas ?', answer: 'Hot Coffee',
    distractors: ['Night Life', 'Red Light', 'Private Dance'],
  },
  {
    id: 'adl-358', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quelle saga japonaise de survival horror regorge de créatures cauchemardesques et de symbolisme dérangeant ?", answer: 'Silent Hill',
    distractors: ['Resident Evil', 'Outlast', 'Dead Space'],
  },
  {
    id: 'adl-359', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel roman érotique de Pauline Réage explore la soumission consentie de son héroïne ?', answer: "Histoire d'O",
    distractors: ['Emmanuelle', 'Belle du Seigneur', 'Vénus à la fourrure'],
  },
  {
    id: 'adl-360', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel écrivain a choqué avec « Tropique du Cancer », longtemps censuré pour obscénité ?', answer: 'Henry Miller',
    distractors: ['Charles Bukowski', 'Jack Kerouac', 'William Burroughs'],
  },
  {
    id: 'adl-361', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quel manga d'horreur de Junji Ito suit une ville obsédée par les spirales ?", answer: 'Uzumaki',
    distractors: ['Tomie', 'Gyo', "Fragments d'horreur"],
  },
  {
    id: 'adl-362', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quel manga suit des humains dévorés par des géants derrière d’immenses murs ?', answer: "L'Attaque des Titans",
    distractors: ['Kabaneri', 'Claymore', 'Deadman Wonderland'],
  },
  {
    id: 'adl-363', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle place de marché du dark web, fermée en 2013, vendait drogues et armes ?', answer: 'Silk Road',
    distractors: ['The Pirate Bay', 'Napster', 'eDonkey'],
  },
  {
    id: 'adl-364', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Comment appelle-t-on un logiciel qui chiffre vos fichiers et réclame une rançon ?', answer: 'Un rançongiciel',
    distractors: ['Un adware', 'Un cookie', 'Un pare-feu'],
  },
  {
    id: 'adl-365', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quelle hormone de l'attachement est massivement libérée pendant l'orgasme et l'accouchement ?", answer: "L'ocytocine",
    distractors: ["L'adrénaline", 'La testostérone', 'La mélatonine'],
  },
  {
    id: 'adl-366', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelle rappeuse a co-signé le titre explicite « WAP » avec Megan Thee Stallion en 2020 ?', answer: 'Cardi B',
    distractors: ['Nicki Minaj', 'Doja Cat', 'Iggy Azalea'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-448', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelle série italienne plonge sans filtre dans la guerre des clans de la Camorra napolitaine ?', answer: 'Gomorra',
    distractors: ['Suburra', 'Romanzo Criminale', 'ZeroZeroZero'],
  },
  {
    id: 'adl-449', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quelle série détourne les super-héros en stars ultra-violentes et corrompues ?', answer: 'The Boys',
    distractors: ['Invincible', 'Watchmen', 'Peacemaker'],
  },
  {
    id: 'adl-450', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelle mission controversée de Call of Duty: Modern Warfare 2 fait participer à un massacre dans un aéroport ?', answer: 'No Russian',
    distractors: ['Shock and Awe', 'Endgame', 'Loose Ends'],
  },
  {
    id: 'adl-451', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 2, cancelLevel: 4,
    text: "Quel jeu de Rockstar laisse dévaliser des trains et braquer des villes dans l'Ouest sauvage ?", answer: 'Red Dead Redemption',
    distractors: ['Call of Juarez', 'Desperados', 'Gun'],
  },
  {
    id: 'adl-452', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 4,
    text: "Quel roman de Bret Easton Ellis suit un yuppie tueur en série d'une froideur glaçante ?", answer: 'American Psycho',
    distractors: ['Fight Club', 'Trainspotting', 'Moins que zéro'],
  },
  {
    id: 'adl-453', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 4,
    text: "Quel roman d'Anthony Burgess dépeint l'ultra-violence d'Alex et de ses droogs ?", answer: 'Orange mécanique',
    distractors: ['Sa Majesté des Mouches', '1984', 'Le Meilleur des mondes'],
  },
  {
    id: 'adl-454', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quel manga culte suit un lycéen qui tue en écrivant des noms dans un carnet ?', answer: 'Death Note',
    distractors: ['Code Geass', 'Monster', 'Psycho-Pass'],
  },
  {
    id: 'adl-455', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel thriller de Naoki Urasawa suit un chirurgien traquant un tueur qu’il a jadis sauvé ?', answer: 'Monster',
    distractors: ['Death Note', 'Psycho-Pass', 'Terror in Resonance'],
  },
  {
    id: 'adl-456', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 4,
    text: "Comment appelle-t-on la divulgation malveillante des données privées d'une personne en ligne ?", answer: 'Le doxxing',
    distractors: ['Le trolling', 'Le streaming', 'Le blogging'],
  },
  {
    id: 'adl-457', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quelle monnaie numérique décentralisée est prisée pour les transactions anonymes du dark web ?', answer: 'Le Bitcoin',
    distractors: ['Le PayPal', 'Le dollar', "L'euro"],
  },
  {
    id: 'adl-458', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quelle toxine mortelle à dose infime est aussi injectée pour lisser les rides ?', answer: 'Le Botox',
    distractors: ['Le collagène', "L'acide hyaluronique", 'La kératine'],
  },
  {
    id: 'adl-459', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 2, cancelLevel: 4,
    text: "Où planque-t-on discrètement de l'argent pour échapper à l'impôt de son pays ?", answer: 'Dans un paradis fiscal',
    distractors: ['À la banque de France', 'Au Trésor public', 'À la Sécurité sociale'],
  },

  // ── Vague : nouveaux thèmes (politique, mythologie, japon, france, mode) ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-259', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 2,
    text: "Comment appelle-t-on un discours mensonger destiné à manipuler l'opinion ?", answer: 'La propagande',
    distractors: ['Le débat', 'Le sondage', "L'éditorial"],
  },
  {
    id: 'adl-260', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel dieu grec dévorait ses propres enfants par peur d'être détrôné ?", answer: 'Cronos',
    distractors: ['Zeus', 'Hadès', 'Poséidon'],
  },
  {
    id: 'adl-261', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Comment appelle-t-on la mafia japonaise ?', answer: 'Les yakuzas',
    distractors: ['Les triades', 'Les ninjas', 'Les samouraïs'],
  },
  {
    id: 'adl-262', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quelle reine de France fut éclaboussée par l'affaire du collier de diamants ?", answer: 'Marie-Antoinette',
    distractors: ['Catherine de Médicis', 'Joséphine', 'Marie de Médicis'],
  },
  {
    id: 'adl-263', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle créatrice a lancé la mini-jupe dans le Londres des années 60 ?', answer: 'Mary Quant',
    distractors: ['Coco Chanel', 'Vivienne Westwood', 'Jean-Paul Gaultier'],
  },
  {
    id: 'adl-264', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 2,
    text: 'Comment nomme-t-on la prise du pouvoir par la force ?', answer: "Un coup d'État",
    distractors: ['Une élection', 'Un référendum', 'Une motion'],
  },
  {
    id: 'adl-265', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quelle boîte, ouverte par curiosité, libéra tous les maux sur l'humanité ?", answer: 'La boîte de Pandore',
    distractors: ['Le vase de Soissons', "La lampe d'Aladin", 'Le coffre de Barbe Noire'],
  },
  {
    id: 'adl-266', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Comment nomme-t-on les estampes japonaises, dont certaines très érotiques (shunga) ?', answer: "L'ukiyo-e",
    distractors: ['Le manga', "L'origami", "L'ikebana"],
  },
  {
    id: 'adl-267', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel roi de France était surnommé le Vert-Galant pour ses nombreuses maîtresses ?', answer: 'Henri IV',
    distractors: ['Louis XIV', 'François Ier', 'Louis XV'],
  },
  {
    id: 'adl-268', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel sous-vêtement gainant a comprimé la taille des femmes pendant des siècles ?', answer: 'Le corset',
    distractors: ['Le string', 'Le jupon', 'Le châle'],
  },
  {
    id: 'adl-269', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 1, cancelLevel: 2,
    text: 'Comment appelle-t-on une fausse information diffusée pour tromper le public ?', answer: 'Une fake news',
    distractors: ['Un scoop', 'Un édito', 'Une tribune'],
  },
  {
    id: 'adl-270', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 4, cancelLevel: 2,
    text: 'Quel héros grec tua sa mère pour venger son père, puis fut poursuivi par les Furies ?', answer: 'Oreste',
    distractors: ['Œdipe', 'Persée', 'Thésée'],
  },
  {
    id: 'adl-271', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel suicide rituel par éventration pratiquaient les samouraïs déshonorés ?", answer: 'Le seppuku',
    distractors: ['Le sumo', 'Le kabuki', 'Le shinto'],
  },
  {
    id: 'adl-272', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle maison a multiplié les défilés provocateurs sous John Galliano ?', answer: 'Dior',
    distractors: ['Zara', 'Uniqlo', 'Levi’s'],
  },
  {
    id: 'adl-273', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 4, cancelLevel: 2,
    text: "Quelle affaire d'empoisonnements éclaboussa la cour de Louis XIV ?", answer: 'L’affaire des poisons',
    distractors: ['L’affaire Dreyfus', 'L’affaire du collier', 'La conspiration des poudres'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-367', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 3,
    text: "Quel scandale d'espionnage fit tomber le président Nixon en 1974 ?", answer: 'Le Watergate',
    distractors: ['L’Irangate', 'Les Pentagon Papers', 'Le Whitewater'],
  },
  {
    id: 'adl-368', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel roi de Thèbes tua son père et épousa sa mère sans le savoir ?', answer: 'Œdipe',
    distractors: ['Agamemnon', 'Ménélas', 'Priam'],
  },
  {
    id: 'adl-369', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Comment nomme-t-on au Japon ces hôtels discrets loués à l’heure pour les couples ?', answer: 'Les love hotels',
    distractors: ['Les ryokan', 'Les capsule hotels', 'Les izakaya'],
  },
  {
    id: 'adl-370', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel ministre du Budget mentit sur son compte caché en Suisse avant d’être condamné ?', answer: 'Jérôme Cahuzac',
    distractors: ['François Fillon', 'Bernard Tapie', 'Patrick Balkany'],
  },
  {
    id: 'adl-371', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle marque a choqué avec des campagnes montrant un malade du sida signées Toscani ?', answer: 'Benetton',
    distractors: ['Vogue', 'Elle', 'Gucci'],
  },
  {
    id: 'adl-372', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 3,
    text: "Comment appelle-t-on l'enrichissement personnel d'un dirigeant aux dépens de l'État ?", answer: 'La corruption',
    distractors: ['La diplomatie', 'La législation', 'La souveraineté'],
  },
  {
    id: 'adl-373', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quelle déesse naquit de l'écume de la mer après la mutilation d'Ouranos ?", answer: 'Aphrodite',
    distractors: ['Héra', 'Athéna', 'Artémis'],
  },
  {
    id: 'adl-374', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel tatouage couvrant tout le corps est associé aux yakuzas ?', answer: "L'irezumi",
    distractors: ['Le henné', 'Le kanji', "L'origami"],
  },
  {
    id: 'adl-375', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle favorite de Louis XV régna sur la cour et les arts ?', answer: 'La marquise de Pompadour',
    distractors: ['Madame du Barry', 'Diane de Poitiers', 'Madame de Maintenon'],
  },
  {
    id: 'adl-376', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quel créateur a habillé Madonna d’un bustier à seins coniques ?', answer: 'Jean-Paul Gaultier',
    distractors: ['Karl Lagerfeld', 'Yves Saint Laurent', 'Thierry Mugler'],
  },
  {
    id: 'adl-377', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 3,
    text: 'Quel lanceur d’alerte révéla la surveillance de masse de la NSA en 2013 ?', answer: 'Edward Snowden',
    distractors: ['Julian Assange', 'Chelsea Manning', 'Mark Felt'],
  },
  {
    id: 'adl-378', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel dieu nordique fourbe provoque la mort de Baldr et le Ragnarök ?', answer: 'Loki',
    distractors: ['Thor', 'Odin', 'Freyr'],
  },
  {
    id: 'adl-379', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Comment appelle-t-on les artistes formées au divertissement traditionnel japonais ?', answer: 'Les geishas',
    distractors: ['Les samouraïs', 'Les miko', 'Les kunoichi'],
  },
  {
    id: 'adl-380', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quels escarpins de luxe sont devenus un symbole de séduction dans « Sex and the City » ?', answer: 'Les Manolo Blahnik',
    distractors: ['Les Crocs', 'Les Birkenstock', 'Les Doc Martens'],
  },
  {
    id: 'adl-381', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel scandale financier éclaboussa Bernard Tapie et le Crédit Lyonnais ?', answer: 'L’affaire Tapie',
    distractors: ['L’affaire Elf', 'L’affaire Bettencourt', 'L’affaire Clearstream'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-460', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Comment appelle-t-on le trucage du découpage électoral pour favoriser un camp ?', answer: 'Le gerrymandering',
    distractors: ['Le référendum', 'La primaire', "L'abstention"],
  },
  {
    id: 'adl-461', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel Titan fut condamné à voir un aigle lui dévorer le foie chaque jour ?', answer: 'Prométhée',
    distractors: ['Atlas', 'Sisyphe', 'Tantale'],
  },
  {
    id: 'adl-462', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Comment appelle-t-on les pilotes-suicides japonais de la Seconde Guerre mondiale ?', answer: 'Les kamikazes',
    distractors: ['Les rōnin', 'Les shoguns', 'Les ninjas'],
  },
  {
    id: 'adl-463', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 3, cancelLevel: 4,
    text: "Quelle affaire d'antisémitisme divisa la France autour d'un capitaine injustement condamné ?", answer: 'L’affaire Dreyfus',
    distractors: ['L’affaire Stavisky', 'L’affaire Ranucci', 'L’affaire Seznec'],
  },
  {
    id: 'adl-464', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quelle marque de lingerie a mis fin à son défilé télévisé jugé sexiste en 2019 ?', answer: "Victoria's Secret",
    distractors: ['Etam', 'Aubade', 'Chantal Thomass'],
  },
  {
    id: 'adl-465', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 4,
    text: "Comment nomme-t-on l'élimination systématique d'opposants par un régime ?", answer: 'La purge',
    distractors: ['Le scrutin', 'Le mandat', 'La coalition'],
  },
  {
    id: 'adl-466', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel roi fut condamné à une faim et une soif éternelles pour avoir défié les dieux ?', answer: 'Tantale',
    distractors: ['Midas', 'Sisyphe', 'Ixion'],
  },
  {
    id: 'adl-467', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on les guerriers samouraïs sans maître, devenus errants ?', answer: 'Les rōnin',
    distractors: ['Les shoguns', 'Les daimyos', 'Les geishas'],
  },
  {
    id: 'adl-468', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quelle affaire de financement occulte visa la classe politique via la société pétrolière Elf ?', answer: 'L’affaire Elf',
    distractors: ['L’affaire Tapie', 'L’affaire Bettencourt', 'L’affaire du Rainbow Warrior'],
  },
  {
    id: 'adl-469', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quelle matière issue d’animaux à poils est boycottée par de nombreuses maisons de mode ?', answer: 'La fourrure',
    distractors: ['Le cuir végétal', 'Le denim', 'La soie'],
  },
  {
    id: 'adl-470', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on un agent double infiltré qui trahit son camp ?', answer: 'Une taupe',
    distractors: ['Un ambassadeur', 'Un attaché', 'Un émissaire'],
  },
  {
    id: 'adl-471', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel personnage fut condamné à rouler éternellement un rocher au sommet d’une colline ?', answer: 'Sisyphe',
    distractors: ['Héraclès', 'Persée', 'Jason'],
  },
  {
    id: 'adl-472', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on au Japon la mort provoquée par un excès de travail ?', answer: 'Le karōshi',
    distractors: ['Le hikikomori', 'Le kaizen', 'Le bushido'],
  },
  {
    id: 'adl-473', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment nomme-t-on ces robes transparentes qui ne laissent presque rien à l’imagination ?', answer: 'Les naked dresses',
    distractors: ['Les tailleurs', 'Les trench-coats', 'Les doudounes'],
  },
  {
    id: 'adl-474', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 3, cancelLevel: 4,
    text: "Quelle affaire d'argent et d'héritage opposa la milliardaire Liliane Bettencourt à son entourage ?", answer: 'L’affaire Bettencourt',
    distractors: ['L’affaire Elf', 'L’affaire Tapie', 'L’affaire Cahuzac'],
  },

  // ── Vague : approfondissement des univers existants ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-274', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle série suit une famille de gangsters à Birmingham après la Grande Guerre ?', answer: 'Peaky Blinders',
    distractors: ['Boardwalk Empire', 'Gomorra', 'Sons of Anarchy'],
  },
  {
    id: 'adl-275', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel jeu de combat fait scandale avec ses « Fatalities » ultra-gores ?', answer: 'Mortal Kombat',
    distractors: ['Tekken', 'Street Fighter', 'Soul Calibur'],
  },
  {
    id: 'adl-276', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel roman du marquis de Sade suit les malheurs de son héroïne vertueuse ?', answer: 'Justine',
    distractors: ['Manon Lescaut', 'Thérèse Raquin', 'Nana'],
  },
  {
    id: 'adl-277', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel manga suit Ken, mi-humain mi-goule contraint de dévorer de la chair ?', answer: 'Tokyo Ghoul',
    distractors: ['Parasite', 'Ajin', 'Deadman Wonderland'],
  },
  {
    id: 'adl-278', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on le fait de séduire en ligne sous une fausse identité ?', answer: 'Le catfishing',
    distractors: ['Le streaming', 'Le blogging', 'Le podcasting'],
  },
  {
    id: 'adl-279', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel texte indien ancien est célèbre pour son catalogue de positions amoureuses ?', answer: 'Le Kâmasûtra',
    distractors: ['Le Rāmāyana', 'Le Mahābhārata', 'Les Upanishads'],
  },
  {
    id: 'adl-280', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quelles molécules odorantes influenceraient l'attirance entre individus ?", answer: 'Les phéromones',
    distractors: ['Les enzymes', 'Les protéines', 'Les vitamines'],
  },
  {
    id: 'adl-281', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: 'Quel cocktail cubain mêle rhum, menthe, citron vert et sucre ?', answer: 'Le mojito',
    distractors: ['Le mai tai', 'Le cosmopolitan', 'Le spritz'],
  },
  {
    id: 'adl-282', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel film de Darren Aronofsky plonge dans l'enfer glaçant de la toxicomanie ?", answer: 'Requiem for a Dream',
    distractors: ['Trainspotting', 'Las Vegas Parano', 'Christiane F.'],
  },
  {
    id: 'adl-283', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle chanteuse a choqué avec le titre sado-maso « S&M » en 2011 ?', answer: 'Rihanna',
    distractors: ['Beyoncé', 'Katy Perry', 'Shakira'],
  },
  {
    id: 'adl-284', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel célèbre cabaret parisien est le temple du french cancan depuis 1889 ?', answer: 'Le Moulin Rouge',
    distractors: ['Le Crazy Horse', 'Le Lido', 'Le Paradis Latin'],
  },
  {
    id: 'adl-285', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 1, cancelLevel: 2,
    text: 'Que fait un prétendant en posant un genou à terre avec une bague ?', answer: 'Une demande en mariage',
    distractors: ['Une déclaration de divorce', 'Une rupture', 'Une réconciliation'],
  },
  {
    id: 'adl-286', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on la fabrication et la vente illégales de fausses marques ?', answer: 'La contrefaçon',
    distractors: ['La franchise', 'La licence', 'La garantie'],
  },
  {
    id: 'adl-287', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel jeune homme mourut amoureux de son propre reflet ?', answer: 'Narcisse',
    distractors: ['Adonis', 'Ganymède', 'Hyacinthe'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-382', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelle série suit un expert de la police scientifique, tueur en série à ses heures ?', answer: 'Dexter',
    distractors: ['Hannibal', 'Mindhunter', 'The Fall'],
  },
  {
    id: 'adl-383', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel RPG futuriste de CD Projekt sortit criblé de bugs en 2020 ?', answer: 'Cyberpunk 2077',
    distractors: ['Deus Ex', 'Watch Dogs', 'Detroit: Become Human'],
  },
  {
    id: 'adl-384', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quelle écrivaine a signé les nouvelles érotiques « Vénus Erotica » ?', answer: 'Anaïs Nin',
    distractors: ['Colette', 'George Sand', 'Simone de Beauvoir'],
  },
  {
    id: 'adl-385', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel manga culte de Go Nagai mêle démons et érotisme dès les années 70 ?', answer: 'Devilman',
    distractors: ['Bleach', 'Blue Exorcist', 'Chrono Crusade'],
  },
  {
    id: 'adl-386', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 2, cancelLevel: 3,
    text: "Quel programme malveillant se cache dans un logiciel d'apparence inoffensive ?", answer: 'Un cheval de Troie',
    distractors: ['Un pare-feu', 'Un antivirus', 'Un navigateur'],
  },
  {
    id: 'adl-387', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: "Comment nomme-t-on une attirance sexuelle marquée pour un objet ou une partie du corps ?", answer: 'Le fétichisme',
    distractors: ['Le romantisme', 'Le platonisme', 'Le narcissisme'],
  },
  {
    id: 'adl-388', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle IST bactérienne est parfois surnommée « la chaude-pisse » ?', answer: 'La gonorrhée',
    distractors: ['La cystite', 'La candidose', "L'herpès"],
  },
  {
    id: 'adl-389', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 3,
    text: 'Quel spiritueux surnommé « la fée verte » fut interdit en France en 1915 ?', answer: "L'absinthe",
    distractors: ['Le pastis', 'La chartreuse', 'La suze'],
  },
  {
    id: 'adl-390', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quel diptyque de Lars von Trier explore la dépendance sexuelle d'une femme ?", answer: 'Nymphomaniac',
    distractors: ['Antichrist', 'Melancholia', 'Shame'],
  },
  {
    id: 'adl-391', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel groupe punk britannique provoqua avec « God Save the Queen » en 1977 ?', answer: 'Les Sex Pistols',
    distractors: ['The Clash', 'The Damned', 'Ramones'],
  },
  {
    id: 'adl-392', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 2, cancelLevel: 3,
    text: "Comment appelle-t-on le fait de tromper son/sa partenaire ?", answer: "L'adultère",
    distractors: ['Le célibat', 'Le veuvage', 'Le concubinage'],
  },
  {
    id: 'adl-393', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 3,
    text: 'Quel moine mystique eut une influence sulfureuse sur la cour du tsar Nicolas II ?', answer: 'Raspoutine',
    distractors: ['Nostradamus', 'Cagliostro', 'Savonarole'],
  },
  {
    id: 'adl-394', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 3,
    text: "Comment appelle-t-on l'interdiction de publier ou de diffuser certaines idées ?", answer: 'La censure',
    distractors: ['Le suffrage', 'Le quorum', 'Le mandat'],
  },
  {
    id: 'adl-395', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelle créature mi-homme mi-taureau était enfermée dans le Labyrinthe ?', answer: 'Le Minotaure',
    distractors: ['Le Centaure', 'Le Cyclope', 'Cerbère'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-475', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 4,
    text: "Quelle série retrace l'ascension du baron de la drogue Pablo Escobar ?", answer: 'Narcos',
    distractors: ['Ozark', 'El Chapo', 'ZeroZeroZero'],
  },
  {
    id: 'adl-476', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel jeu de Rockstar fait incarner un condamné forcé de tuer pour un snuff movie ?', answer: 'Manhunt',
    distractors: ['Hitman', 'Postal', 'Hotline Miami'],
  },
  {
    id: 'adl-477', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel roman scandaleux de Georges Bataille multiplie les scènes obscènes autour d’objets ?', answer: "Histoire de l'œil",
    distractors: ['Belle du Seigneur', 'Bonjour tristesse', "L'Écume des jours"],
  },
  {
    id: 'adl-478', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel manga ultra-violent envoie des morts ressuscités combattre des aliens à Tokyo ?', answer: 'Gantz',
    distractors: ['Btooom!', 'Deadman Wonderland', 'Mirai Nikki'],
  },
  {
    id: 'adl-479', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 2, cancelLevel: 4,
    text: "Comment appelle-t-on une vidéo truquée par IA faisant dire n'importe quoi à quelqu'un ?", answer: 'Un deepfake',
    distractors: ['Un gif', 'Un mème', 'Un émoji'],
  },
  {
    id: 'adl-480', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 4,
    text: "Comment nomme-t-on le plaisir tiré de la douleur infligée à autrui ?", answer: 'Le sadisme',
    distractors: ['Le masochisme', 'Le voyeurisme', "L'exhibitionnisme"],
  },
  {
    id: 'adl-481', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Comment nomme-t-on une érection douloureuse et prolongée nécessitant un avis médical ?', answer: 'Le priapisme',
    distractors: ['La prostatite', "L'impuissance", 'La stérilité'],
  },
  {
    id: 'adl-482', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 4,
    text: "Comment appelle-t-on l'absorption massive d'alcool en un temps très court ?", answer: 'Le binge drinking',
    distractors: ["L'apéritif", 'La dégustation', 'Le digestif'],
  },
  {
    id: 'adl-483', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel film italien de 1980, longtemps interdit, imite un faux documentaire cannibale ?', answer: 'Cannibal Holocaust',
    distractors: ['Cannibal Ferox', 'Zombie', 'Suspiria'],
  },
  {
    id: 'adl-484', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 4,
    text: "Quel groupe de gangsta rap choqua l'Amérique avec « Straight Outta Compton » ?", answer: 'N.W.A',
    distractors: ['Public Enemy', 'Wu-Tang Clan', 'Run-DMC'],
  },
  {
    id: 'adl-485', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelait-on les bars clandestins de la Prohibition américaine ?', answer: 'Les speakeasies',
    distractors: ['Les saloons', 'Les pubs', 'Les tavernes'],
  },
  {
    id: 'adl-486', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Quel prince valaque, inspirateur de Dracula, empalait ses ennemis ?', answer: "Vlad l'Empaleur",
    distractors: ['Attila', 'Néron', 'Caligula'],
  },
  {
    id: 'adl-487', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on le fait de spéculer en Bourse grâce à des informations confidentielles ?', answer: "Le délit d'initié",
    distractors: ['Le dividende', 'La cotation', "L'introduction en Bourse"],
  },
  {
    id: 'adl-488', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on un discours qui flatte les peurs du peuple pour séduire les foules ?', answer: 'Le populisme',
    distractors: ['Le fédéralisme', 'Le parlementarisme', 'Le libéralisme'],
  },
];
