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

  // ── Vague : deuxième passe d'approfondissement + univers tchèque ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-288', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quelle série suit un club de motards hors-la-loi en Californie ?", answer: 'Sons of Anarchy',
    distractors: ['Mayans M.C.', 'Gomorra', 'Peaky Blinders'],
  },
  {
    id: 'adl-289', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quelle série de jeux d'infiltration fait incarner un tueur à gages chauve au code-barres ?", answer: 'Hitman',
    distractors: ['Splinter Cell', 'Dishonored', "Assassin's Creed"],
  },
  {
    id: 'adl-290', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 2,
    text: "Quel écrivain américain a chroniqué l'alcool et les bas-fonds dans « Women » ?", answer: 'Charles Bukowski',
    distractors: ['John Fante', 'Hunter S. Thompson', 'Raymond Carver'],
  },
  {
    id: 'adl-291', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel manga contraint des collégiens à s'entretuer sur une île déserte ?", answer: 'Battle Royale',
    distractors: ['Danganronpa', 'As the Gods Will', 'Doubt'],
  },
  {
    id: 'adl-292', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Comment appelle-t-on le harcèlement répété visant à détruire une personne en ligne ?', answer: 'Le cyberharcèlement',
    distractors: ['Le spam', 'Le buzz', 'Le troll'],
  },
  {
    id: 'adl-293', theme: 'culture', universe: 'Sexo 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Comment appelle-t-on la grande marche festive qui célèbre les fiertés LGBT ?', answer: 'La Gay Pride',
    distractors: ['Le carnaval', 'Le téléthon', 'La fête de la musique'],
  },
  {
    id: 'adl-294', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 2,
    text: "Comment nomme-t-on la chair de poule provoquée par un frisson intense ?", answer: "L'horripilation",
    distractors: ['La transpiration', 'La digestion', 'La respiration'],
  },
  {
    id: 'adl-295', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: "Quel alcool d'agave bleu est produit dans la région de Guadalajara ?", answer: 'La tequila',
    distractors: ['Le mezcal', 'Le rhum', 'La cachaça'],
  },
  {
    id: 'adl-296', theme: 'tcheque', universe: 'Prague interdite 🔞', difficulty: 2, cancelLevel: 2,
    text: "Dans quelle capitale la bière coule à flots et l'absinthe a fait son retour ?", answer: 'Prague',
    distractors: ['Vienne', 'Budapest', 'Varsovie'],
  },
  {
    id: 'adl-297', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel film de 2000 de Mary Harron met en scène un yuppie tueur en série ?', answer: 'American Psycho',
    distractors: ['Fight Club', 'Seven', 'Psycho'],
  },
  {
    id: 'adl-298', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel groupe allemand crache du feu sur scène et chante en allemand ?', answer: 'Rammstein',
    distractors: ['Tokio Hotel', 'Scorpions', 'Kraftwerk'],
  },
  {
    id: 'adl-299', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 2, cancelLevel: 2,
    text: "Comment appelle-t-on une soirée où l'on cache son identité derrière un masque ?", answer: 'Un bal masqué',
    distractors: ['Un after', 'Un before', 'Une garden-party'],
  },
  {
    id: 'adl-300', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on des partenaires qui vivent ensemble sans être mariés ?', answer: 'Le concubinage',
    distractors: ['Le célibat', 'Le veuvage', 'La bigamie'],
  },
  {
    id: 'adl-2014', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on le transport illégal de marchandises pour éviter les taxes ?', answer: 'La contrebande',
    distractors: ['La douane', 'La franchise', 'La caution'],
  },
  {
    id: 'adl-2015', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel maillot deux-pièces fit scandale à sa sortie en 1946 ?', answer: 'Le bikini',
    distractors: ['Le monokini', 'Le tankini', 'Le une-pièce'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-396', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quelle série suit un patron de boîte de nuit menant une double vie de trafiquant ?", answer: 'Power',
    distractors: ['Snowfall', 'Ozark', 'BMF'],
  },
  {
    id: 'adl-397', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel jeu d’horreur fait fuir un journaliste sans arme dans un asile psychiatrique ?', answer: 'Outlast',
    distractors: ['Amnesia', 'Layers of Fear', 'Observer'],
  },
  {
    id: 'adl-398', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel roman de D. H. Lawrence fut censuré pour ses scènes explicites ?', answer: "L'Amant de Lady Chatterley",
    distractors: ['Madame Bovary', 'Ulysse', 'Lolita'],
  },
  {
    id: 'adl-399', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel manga enferme des joueurs dans un Tokyo parallèle où chaque jeu peut être mortel ?', answer: 'Alice in Borderland',
    distractors: ['Btooom!', "King's Game", "Darwin's Game"],
  },
  {
    id: 'adl-400', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Comment appelle-t-on une attaque qui sature un site de requêtes pour le faire tomber ?', answer: 'Une attaque DDoS',
    distractors: ['Un cookie', 'Un captcha', 'Un firewall'],
  },
  {
    id: 'adl-3006', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: "Comment nomme-t-on l'excitation tirée du fait de s'exhiber devant autrui ?", answer: "L'exhibitionnisme",
    distractors: ['Le voyeurisme', 'Le fétichisme', 'Le romantisme'],
  },
  {
    id: 'adl-3007', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle IST virale se manifeste par des vésicules et reste à vie dans le corps ?', answer: "L'herpès",
    distractors: ['La chlamydia', 'La syphilis', 'La gonorrhée'],
  },
  {
    id: 'adl-3008', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 3,
    text: "Quelle liqueur anisée grecque devient laiteuse au contact de l'eau ?", answer: "L'ouzo",
    distractors: ['Le limoncello', 'La grappa', 'Le porto'],
  },
  {
    id: 'adl-3009', theme: 'tcheque', universe: 'Prague interdite 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quel écrivain praguois a dépeint l'absurde et l'angoisse dans « Le Procès » ?", answer: 'Franz Kafka',
    distractors: ['Milan Kundera', 'Bohumil Hrabal', 'Václav Havel'],
  },
  {
    id: 'adl-3010', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel film de Gaspar Noé (2015) présente des scènes intimes non simulées en 3D ?', answer: 'Love',
    distractors: ['Enter the Void', 'Climax', 'Irréversible'],
  },
  {
    id: 'adl-3011', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel groupe mené par Trent Reznor a choqué avec le titre cru « Closer » ?', answer: 'Nine Inch Nails',
    distractors: ['Marilyn Manson', 'Ministry', 'Nirvana'],
  },
  {
    id: 'adl-3012', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 3,
    text: 'Quelle épouse de Claude était réputée pour sa vie dissolue à Rome ?', answer: 'Messaline',
    distractors: ['Livie', 'Agrippine', 'Julia'],
  },
  {
    id: 'adl-3013', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 3,
    text: "Comment appelle-t-on le trafic d'influence exercé par des groupes de pression ?", answer: 'Le lobbying',
    distractors: ['Le suffrage', 'Le recensement', 'Le référendum'],
  },
  {
    id: 'adl-3014', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 2, cancelLevel: 3,
    text: "Quel héros grec, invulnérable sauf au talon, mourut d'une flèche à Troie ?", answer: 'Achille',
    distractors: ['Ajax', 'Hector', 'Ulysse'],
  },
  {
    id: 'adl-3015', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel art japonais du bondage esthétique utilise des cordes ?', answer: 'Le shibari',
    distractors: ['Le kintsugi', 'Le bonsaï', 'Le kendo'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-489', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelle série préquelle suit la naissance du cartel de Guadalajara ?', answer: 'Narcos: Mexico',
    distractors: ['El Chapo', 'Queen of the South', 'ZeroZeroZero'],
  },
  {
    id: 'adl-490', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 2, cancelLevel: 4,
    text: "Quel FPS ultra-gore de 2016 ressuscite le tueur de démons venu de l'enfer ?", answer: 'Doom',
    distractors: ['Quake', 'Wolfenstein', 'Painkiller'],
  },
  {
    id: 'adl-491', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel roman de Chuck Palahniuk inspira un film culte sur un club de combat clandestin ?', answer: 'Fight Club',
    distractors: ['American Psycho', 'Trainspotting', 'Choke'],
  },
  {
    id: 'adl-492', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 4, cancelLevel: 4,
    text: "Quel manga d'horreur de Junji Ito suit une femme à la beauté envoûtante et mortelle ?", answer: 'Tomie',
    distractors: ['Uzumaki', 'Gyo', 'Shiver'],
  },
  {
    id: 'adl-493', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 4,
    text: "Comment appelle-t-on la diffusion de contenus intimes d'un ex par vengeance ?", answer: 'Le revenge porn',
    distractors: ['Le sexting', 'Le catfishing', 'Le trolling'],
  },
  {
    id: 'adl-494', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on une relation amoureuse ouverte à plusieurs partenaires consentants ?', answer: 'Le polyamour',
    distractors: ['La monogamie', 'Le célibat', 'Le concubinage'],
  },
  {
    id: 'adl-495', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel examen dépiste les papillomavirus responsables du cancer du col ?', answer: 'Le frottis',
    distractors: ['La mammographie', 'La coloscopie', "L'échographie"],
  },
  {
    id: 'adl-496', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 4,
    text: "Comment appelle-t-on l'intoxication aiguë à l'alcool pouvant mener au coma ?", answer: 'Le coma éthylique',
    distractors: ['La migraine', "L'insolation", 'La déshydratation'],
  },
  {
    id: 'adl-497', theme: 'tcheque', universe: 'Prague interdite 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel roman de Milan Kundera explore le libertinage à Prague sous le communisme ?', answer: "L'Insoutenable Légèreté de l'être",
    distractors: ['Le Livre du rire et de l’oubli', 'La Plaisanterie', "L'Immortalité"],
  },
  {
    id: 'adl-498', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel film de Lars von Trier (2009) a choqué Cannes par sa violence sexuelle ?', answer: 'Antichrist',
    distractors: ['Melancholia', 'Dogville', 'The House That Jack Built'],
  },
  {
    id: 'adl-499', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quel chanteur a croqué une chauve-souris en plein concert ?', answer: 'Ozzy Osbourne',
    distractors: ['Alice Cooper', 'Gene Simmons', 'Marilyn Manson'],
  },
  {
    id: 'adl-500', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Quel tueur en série victorien terrorisa le quartier de Whitechapel en 1888 ?', answer: "Jack l'Éventreur",
    distractors: ['H. H. Holmes', 'Landru', 'Ed Gein'],
  },
  {
    id: 'adl-501', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 2, cancelLevel: 4,
    text: 'Comment appelle-t-on la menace de révéler un secret pour obtenir quelque chose ?', answer: 'Le chantage',
    distractors: ['Le compromis', 'La négociation', 'La médiation'],
  },
  {
    id: 'adl-502', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on un régime contrôlant tous les aspects de la vie des citoyens ?', answer: 'Le totalitarisme',
    distractors: ['La démocratie', 'La monarchie', 'La république'],
  },
  {
    id: 'adl-503', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Comment appelle-t-on une fête électro clandestine organisée dans un lieu secret ?', answer: 'Une rave',
    distractors: ['Un gala', 'Un vernissage', 'Un cocktail'],
  },

  // ── Vague : troisième passe d'approfondissement (IDs 4 chiffres) ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-2016', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle série espagnole suit des ados friqués et leurs secrets meurtriers ?', answer: 'Elite',
    distractors: ['La Casa de Papel', 'Física o Química', 'Merlí'],
  },
  {
    id: 'adl-2017', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel jeu multijoueur oppose des survivants à un tueur qui les traque ?', answer: 'Dead by Daylight',
    distractors: ['Friday the 13th', 'Phasmophobia', 'The Forest'],
  },
  {
    id: 'adl-2018', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel poète maudit mena une vie de scandales aux côtés de Verlaine ?', answer: 'Arthur Rimbaud',
    distractors: ['Charles Baudelaire', 'Stéphane Mallarmé', 'Guillaume Apollinaire'],
  },
  {
    id: 'adl-2019', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel manga gore suit un chasseur de démons dans le Japon de l’ère Taishō ?', answer: 'Demon Slayer',
    distractors: ['Jujutsu Kaisen', 'Bleach', 'Inuyasha'],
  },
  {
    id: 'adl-2020', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 2, cancelLevel: 2,
    text: "Comment appelle-t-on l'usurpation de l'identité numérique de quelqu'un ?", answer: "Le vol d'identité",
    distractors: ['Le partage', 'Le like', "L'abonnement"],
  },
  {
    id: 'adl-2021', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 2,
    text: "Comment nomme-t-on l'ensemble de l'appareil génital externe féminin ?", answer: 'La vulve',
    distractors: ["L'utérus", "L'ovaire", 'Le vagin'],
  },
  {
    id: 'adl-2022', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 2, cancelLevel: 2,
    text: "Quel cocktail au champagne et au jus d'orange se boit au brunch ?", answer: 'Le mimosa',
    distractors: ['Le bellini', 'Le kir royal', 'Le spritz'],
  },
  {
    id: 'adl-2023', theme: 'tcheque', universe: 'Prague interdite 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle bière tchèque a donné son nom au style « pils » ?', answer: 'La Pilsner Urquell',
    distractors: ['La Budweiser Budvar', 'La Staropramen', 'La Kozel'],
  },
  {
    id: 'adl-2024', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel film de Steve McQueen (2011) suit un homme accro au sexe à New York ?', answer: 'Shame',
    distractors: ['Nymphomaniac', 'Don Jon', 'Boogie Nights'],
  },
  {
    id: 'adl-2025', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 2, cancelLevel: 2,
    text: 'Quel roi anglais fit décapiter deux de ses six épouses ?', answer: 'Henri VIII',
    distractors: ['Richard III', 'Charles Ier', 'Jacques Ier'],
  },
  {
    id: 'adl-2026', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Quelle pièce de lingerie soutient et galbe la poitrine ?', answer: 'Le soutien-gorge',
    distractors: ['La guêpière', 'Le jupon', 'Le boléro'],
  },
  {
    id: 'adl-2027', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel artiste inspira la création du « Parental Advisory » avec « Darling Nikki » ?", answer: 'Prince',
    distractors: ['Madonna', 'Michael Jackson', 'George Michael'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-3016', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quelle série met en scène le milieu du porno new-yorkais des années 70 ?', answer: 'The Deuce',
    distractors: ['Boogie Nights', 'Vinyl', 'Minx'],
  },
  {
    id: 'adl-3017', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel jeu de 2019 fait enquêter un détective épave dans une ville décadente ?', answer: 'Disco Elysium',
    distractors: ['L.A. Noire', 'Night in the Woods', 'Kentucky Route Zero'],
  },
  {
    id: 'adl-3018', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel roman de Sacher-Masoch a donné son nom au masochisme ?', answer: 'La Vénus à la fourrure',
    distractors: ['Justine', "Histoire d'O", 'Emmanuelle'],
  },
  {
    id: 'adl-3019', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel manga culte suit un justicier vengeur dans un monde post-apocalyptique sanglant ?', answer: 'Ken le Survivant',
    distractors: ['Berserk', 'Baki', 'JoJo'],
  },
  {
    id: 'adl-3020', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel forum anonyme est tristement connu pour ses contenus les plus extrêmes ?', answer: '4chan',
    distractors: ['Reddit', 'Wikipedia', 'LinkedIn'],
  },
  {
    id: 'adl-3021', theme: 'culture', universe: 'Sexo 🔞', difficulty: 2, cancelLevel: 3,
    text: "Comment nomme-t-on l'attirance amoureuse et sexuelle envers les deux sexes ?", answer: 'La bisexualité',
    distractors: ["L'asexualité", 'La pansexualité', "L'hétérosexualité"],
  },
  {
    id: 'adl-3022', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quel organe reproducteur féminin libère un ovule chaque mois ?', answer: "L'ovaire",
    distractors: ["L'utérus", 'Le vagin', 'Le col'],
  },
  {
    id: 'adl-3023', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 1, cancelLevel: 3,
    text: 'Quel alcool fort slave titre souvent 40° et se boit glacé cul sec ?', answer: 'La vodka',
    distractors: ['Le gin', 'Le whisky', 'La tequila'],
  },
  {
    id: 'adl-3024', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel film de Bernardo Bertolucci (2003) suit un trio à Paris en Mai 68 ?', answer: 'The Dreamers',
    distractors: ['Les Amants', "Jeux d'enfants", 'Love'],
  },
  {
    id: 'adl-3025', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 3,
    text: 'Quel roi de France entretenait ses favorites au Parc-aux-Cerfs ?', answer: 'Louis XV',
    distractors: ['Louis XIV', 'Louis XVI', 'Henri III'],
  },
  {
    id: 'adl-3026', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel créateur a imposé « Le Smoking » pour femme en 1966 ?', answer: 'Yves Saint Laurent',
    distractors: ['Christian Dior', 'Hubert de Givenchy', 'Pierre Cardin'],
  },
  {
    id: 'adl-3027', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel artiste glam provoquait par son androgynie assumée dans les années 70 ?', answer: 'David Bowie',
    distractors: ['Elton John', 'Freddie Mercury', 'Marc Bolan'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-4001', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelle série animée pour adultes suit un cheval alcoolique et dépressif à Hollywood ?', answer: 'BoJack Horseman',
    distractors: ['Rick et Morty', 'Big Mouth', 'Archer'],
  },
  {
    id: 'adl-4002', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel volet de 2017 réinvente la série en horreur à la première personne dans un manoir ?', answer: 'Resident Evil 7',
    distractors: ['Outlast 2', 'P.T.', 'Visage'],
  },
  {
    id: 'adl-4003', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel roman du marquis de Sade, longtemps interdit, pousse la transgression à son extrême ?', answer: 'Les 120 Journées de Sodome',
    distractors: ['Justine', 'Juliette', 'La Philosophie dans le boudoir'],
  },
  {
    id: 'adl-4004', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: "Quel manga ultra-violent enferme un condamné à mort dans une prison parc d'attractions ?", answer: 'Deadman Wonderland',
    distractors: ['Gantz', 'Btooom!', 'Prison School'],
  },
  {
    id: 'adl-4005', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on une escroquerie qui paie les anciens investisseurs avec l’argent des nouveaux ?', answer: 'Une pyramide de Ponzi',
    distractors: ['Un crowdfunding', 'Une tombola', 'Une cagnotte'],
  },
  {
    id: 'adl-4006', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 4,
    text: "Comment appelle-t-on l'échange de partenaires entre couples consentants ?", answer: "L'échangisme",
    distractors: ['Le libertinage', 'Le voyeurisme', 'Le naturisme'],
  },
  {
    id: 'adl-4007', theme: 'sciences', universe: 'Corps humain 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelle opération sectionne les canaux déférents pour stériliser un homme ?', answer: 'La vasectomie',
    distractors: ['La circoncision', 'La castration', 'La prostatectomie'],
  },
  {
    id: 'adl-4008', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on un alcool fort distillé clandestinement, façon Prohibition ?', answer: 'Le moonshine',
    distractors: ['Le champagne', 'Le porto', 'Le cidre'],
  },
  {
    id: 'adl-4009', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel film culte de 1975 mêle horreur kitsch, transgression et comédie musicale ?', answer: 'The Rocky Horror Picture Show',
    distractors: ['Hedwig', 'Little Shop of Horrors', 'Repo! The Genetic Opera'],
  },
  {
    id: 'adl-4010', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 2, cancelLevel: 4,
    text: "Quelle machine à décapiter fut utilisée en France jusqu'en 1977 ?", answer: 'La guillotine',
    distractors: ['La pendaison', 'La chaise électrique', 'Le peloton'],
  },
  {
    id: 'adl-4011', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 4,
    text: "Quel mannequin des années 90 incarna l'esthétique controversée de l'« heroin chic » ?", answer: 'Kate Moss',
    distractors: ['Naomi Campbell', 'Cindy Crawford', 'Claudia Schiffer'],
  },
  {
    id: 'adl-4012', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on le culte exagéré voué à un dirigeant unique ?', answer: 'Le culte de la personnalité',
    distractors: ['Le bipartisme', 'Le fédéralisme', 'Le parlementarisme'],
  },

  // ── Vague : pop-culture (séries, jeux, manga, films, mythologie, histoire) ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-2028', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle série suit le quotidien de détenues dans une prison pour femmes ?', answer: 'Orange Is the New Black',
    distractors: ['Wentworth', 'Bad Girls', 'Vis a Vis'],
  },
  {
    id: 'adl-2029', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel univers virtuel permet de vivre une seconde vie sans (presque) aucune limite ?', answer: 'Second Life',
    distractors: ['The Sims', 'IMVU', 'Habbo'],
  },
  {
    id: 'adl-2030', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel manga suit des sorciers combattant des fléaux dans un Tokyo maudit ?', answer: 'Jujutsu Kaisen',
    distractors: ['Bleach', 'Blue Exorcist', 'Chainsaw Man'],
  },
  {
    id: 'adl-2031', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 2,
    text: 'Quelle comédie grecque met en scène une grève du sexe pour arrêter la guerre ?', answer: 'Lysistrata',
    distractors: ['Antigone', 'Médée', 'Électre'],
  },
  {
    id: 'adl-2032', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle magicienne, trahie par Jason, tua ses propres enfants par vengeance ?', answer: 'Médée',
    distractors: ['Circé', 'Ariane', 'Hélène'],
  },
  {
    id: 'adl-2033', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quel jeu d'argent japonais ressemble à un flipper vertical ?", answer: 'Le pachinko',
    distractors: ['Le mah-jong', 'Le sudoku', 'Le go'],
  },
  {
    id: 'adl-2034', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel groupe de rock provoqua avec « Sympathy for the Devil » ?', answer: 'The Rolling Stones',
    distractors: ['The Beatles', 'The Who', 'The Kinks'],
  },
  {
    id: 'adl-2035', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel empereur français répudia Joséphine faute d'héritier ?", answer: 'Napoléon',
    distractors: ['Louis XVIII', 'Charles X', 'Napoléon III'],
  },
  {
    id: 'adl-2036', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel film de 1974 de Tobe Hooper terrifia avec sa tronçonneuse ?', answer: 'Massacre à la tronçonneuse',
    distractors: ['La Colline a des yeux', 'Halloween', 'Vendredi 13'],
  },
  {
    id: 'adl-2037', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle marque a fait scandale avec des pubs de jeans jugées trop suggestives ?', answer: 'Calvin Klein',
    distractors: ["Levi's", 'Guess', 'Diesel'],
  },
  {
    id: 'adl-2038', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 2, cancelLevel: 2,
    text: 'Quel roi de France fut guillotiné en 1793 pendant la Révolution ?', answer: 'Louis XVI',
    distractors: ['Louis XV', 'Louis XVIII', 'Charles X'],
  },
  {
    id: 'adl-2039', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 2, cancelLevel: 2,
    text: "Quelle danse orientale des cabarets fascina l'Occident au XIXᵉ siècle ?", answer: 'La danse du ventre',
    distractors: ['Le quadrille', 'La valse', 'Le tango'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-3028', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle série suit une mère de famille qui se lance dans le trafic de cannabis ?', answer: 'Weeds',
    distractors: ['Breaking Bad', 'Nurse Jackie', 'Claws'],
  },
  {
    id: 'adl-3029', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel jeu narratif de 2013 suit un homme et une fillette dans un monde infesté ?', answer: 'The Last of Us',
    distractors: ['Days Gone', 'A Plague Tale', 'Death Stranding'],
  },
  {
    id: 'adl-3030', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel manga suit un jeune fusionné à une tronçonneuse démoniaque ?', answer: 'Chainsaw Man',
    distractors: ['Dorohedoro', 'Fire Force', "Hell's Paradise"],
  },
  {
    id: 'adl-3031', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelle créature à la chevelure de serpents pétrifiait quiconque la regardait ?', answer: 'Méduse',
    distractors: ['Une sirène', 'Une harpie', 'Une chimère'],
  },
  {
    id: 'adl-3032', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Comment appelle-t-on les reclus japonais qui se coupent totalement du monde ?', answer: 'Les hikikomori',
    distractors: ['Les otaku', 'Les salarymen', 'Les NEET'],
  },
  {
    id: 'adl-3033', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel rappeur français a bâti sa légende sur les clashs et la provocation ?', answer: 'Booba',
    distractors: ['Kaaris', 'Rohff', 'La Fouine'],
  },
  {
    id: 'adl-3034', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 3,
    text: 'En 1572, quel massacre visa les protestants français ?', answer: 'Le massacre de la Saint-Barthélemy',
    distractors: ['La Terreur', 'Les Vêpres siciliennes', 'La Commune'],
  },
  {
    id: 'adl-3035', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 3,
    text: 'Quel site de Julian Assange a publié des masses de documents confidentiels ?', answer: 'WikiLeaks',
    distractors: ['Anonymous', 'Tor', 'Pastebin'],
  },
  {
    id: 'adl-3036', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 2, cancelLevel: 3,
    text: "Quel film de Kubrick (1980) sombre dans la folie d'un hôtel isolé ?", answer: 'Shining',
    distractors: ["Rosemary's Baby", "L'Exorciste", 'The Thing'],
  },
  {
    id: 'adl-3037', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel auteur a disséqué la passion et la vanité dans « Belle du Seigneur » ?', answer: 'Albert Cohen',
    distractors: ['Romain Gary', 'André Malraux', 'Marcel Proust'],
  },
  {
    id: 'adl-3038', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 3,
    text: "Comment nomme-t-on l'absence d'attirance sexuelle ?", answer: "L'asexualité",
    distractors: ['La bisexualité', 'La pansexualité', 'Le célibat'],
  },
  {
    id: 'adl-3039', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quel dieu grec des Enfers enleva Perséphone pour en faire sa reine ?', answer: 'Hadès',
    distractors: ['Zeus', 'Poséidon', 'Arès'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-4013', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quelle série animée trash parodie une famille dysfonctionnelle du Rhode Island ?', answer: 'Family Guy',
    distractors: ['American Dad', 'The Cleveland Show', 'South Park'],
  },
  {
    id: 'adl-4014', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quelle saga de FPS de guerre est régulièrement accusée de banaliser les conflits ?', answer: 'Call of Duty',
    distractors: ['Battlefield', 'Medal of Honor', 'ARMA'],
  },
  {
    id: 'adl-4015', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel manga d’horreur de Junji Ito met en scène des poissons marchants et pestilentiels ?', answer: 'Gyo',
    distractors: ['Uzumaki', 'Tomie', 'Mimic'],
  },
  {
    id: 'adl-4016', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quel héros dut accomplir douze travaux pour expier le meurtre de sa famille ?', answer: 'Héraclès',
    distractors: ['Thésée', 'Persée', 'Jason'],
  },
  {
    id: 'adl-4017', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Quelle période de la Révolution française vit des milliers d’exécutions à la guillotine ?', answer: 'La Terreur',
    distractors: ['La Restauration', 'Le Directoire', 'La Fronde'],
  },
  {
    id: 'adl-4018', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 4,
    text: "Comment appelle-t-on l'écrasement des opposants par la force et la peur ?", answer: 'La répression',
    distractors: ['La coalition', 'La cohabitation', 'La primaire'],
  },
  {
    id: 'adl-4019', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel scandale sanitaire des années 80 toucha des transfusés en France ?', answer: 'L’affaire du sang contaminé',
    distractors: ['L’affaire Elf', 'L’affaire Tapie', 'L’affaire Clearstream'],
  },
  {
    id: 'adl-4020', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel film de found footage de 1999 relança le cinéma horrifique ?', answer: 'Le Projet Blair Witch',
    distractors: ['Paranormal Activity', 'REC', 'Cloverfield'],
  },
  {
    id: 'adl-4021', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel poète brigand du XVᵉ siècle écrivit la « Ballade des pendus » ?', answer: 'François Villon',
    distractors: ['Ronsard', 'Du Bellay', 'Rutebeuf'],
  },
  {
    id: 'adl-4022', theme: 'culture', universe: 'Sexo 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on une fête sexuelle collective entre plusieurs personnes ?', answer: 'Une partouze',
    distractors: ['Une sauterie', 'Une kermesse', 'Une matinée'],
  },
  {
    id: 'adl-4023', theme: 'societe', universe: 'Alcool & fêtes 🍻', difficulty: 3, cancelLevel: 4,
    text: "Comment nomme-t-on la dépendance chronique à l'alcool ?", answer: "L'éthylisme",
    distractors: ['La sobriété', "L'abstinence", 'La tempérance'],
  },
  {
    id: 'adl-4024', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel roi fut attaché pour l’éternité à une roue enflammée pour avoir défié Zeus ?', answer: 'Ixion',
    distractors: ['Tantale', 'Sisyphe', 'Prométhée'],
  },

  // ── Vague : pop-culture & histoire, 2e passe ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-2040', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle série sur une famille de pompes funèbres explore la mort sans tabou ?', answer: 'Six Feet Under',
    distractors: ['This Is Us', 'The Leftovers', 'Rectify'],
  },
  {
    id: 'adl-2041', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle série de jeux comiques suit les mésaventures coquines de Larry Laffer ?', answer: 'Leisure Suit Larry',
    distractors: ['Duke Nukem', 'Monkey Island', 'Sam & Max'],
  },
  {
    id: 'adl-2042', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quel film d'horreur de 2004 lance la saga aux pièges mortels de Jigsaw ?", answer: 'Saw',
    distractors: ['Hostel', 'Cube', 'Destination finale'],
  },
  {
    id: 'adl-2043', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle chanteuse soul à la vie tourmentée est morte à 27 ans en 2011 ?', answer: 'Amy Winehouse',
    distractors: ['Adele', 'Duffy', 'Janis Joplin'],
  },
  {
    id: 'adl-2044', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel manga ecchi enferme cinq garçons dans un lycée quasi exclusivement féminin ?', answer: 'Prison School',
    distractors: ['Shimoneta', 'To Love-Ru', 'High School DxD'],
  },
  {
    id: 'adl-2045', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel roman d'Oscar Wilde suit un homme dont le portrait vieillit à sa place ?", answer: 'Le Portrait de Dorian Gray',
    distractors: ['Frankenstein', 'Dracula', 'Docteur Jekyll et M. Hyde'],
  },
  {
    id: 'adl-2046', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Sous quelle forme Zeus séduisit-il Léda ?', answer: 'Un cygne',
    distractors: ['Un taureau', 'Un aigle', "Une pluie d'or"],
  },
  {
    id: 'adl-2047', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Quel sport de lutte japonais oppose des colosses en pagne ?', answer: 'Le sumo',
    distractors: ['Le judo', 'Le karaté', "L'aïkido"],
  },
  {
    id: 'adl-2048', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 2,
    text: 'Quelle impératrice russe alimente les légendes sur sa vie amoureuse débridée ?', answer: 'Catherine II',
    distractors: ['Élisabeth Ire', 'Marie-Thérèse', 'Victoria'],
  },
  {
    id: 'adl-2049', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on un régime militaire ayant pris le pouvoir par la force ?', answer: 'Une junte',
    distractors: ['Une république', 'Une fédération', 'Une confédération'],
  },
  {
    id: 'adl-2050', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle série suit une famille pauvre et déjantée des quartiers de Chicago ?', answer: 'Shameless',
    distractors: ['Roseanne', 'The Middle', 'Malcolm'],
  },
  {
    id: 'adl-2051', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel film d'horreur d'Ari Aster (2019) traumatise avec une secte suédoise en plein jour ?", answer: 'Midsommar',
    distractors: ['Hereditary', 'The Witch', 'Saint Maud'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-3040', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle série mêle vampires et scènes de sexe torrides en Louisiane ?', answer: 'True Blood',
    distractors: ['The Vampire Diaries', 'Being Human', 'Van Helsing'],
  },
  {
    id: 'adl-3041', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quel jeu de gangs parodique pousse l'outrance et le chaos urbain à l'extrême ?", answer: 'Saints Row',
    distractors: ['Just Cause', 'Sleeping Dogs', 'Watch Dogs'],
  },
  {
    id: 'adl-3042', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel film de Cronenberg (1996) lie accidents de voiture et désir malsain ?', answer: 'Crash',
    distractors: ['Videodrome', 'Crimes of the Future', 'Titane'],
  },
  {
    id: 'adl-3043', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel groupe sud-africain provoque avec son style « zef » déjanté ?', answer: 'Die Antwoord',
    distractors: ['Die Toten Hosen', 'Gorillaz', 'Pendulum'],
  },
  {
    id: 'adl-3044', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quel manga suit un homme obsédé par la chirurgie et l'esprit humain ?", answer: 'Homunculus',
    distractors: ['Ibitsu', 'Franken Fran', 'Parasite'],
  },
  {
    id: 'adl-3045', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quel recueil érotique d'Apollinaire fut longtemps publié sous le manteau ?", answer: 'Les Onze Mille Verges',
    distractors: ['Les Fleurs du mal', 'Les Chansons de Bilitis', 'Gamiani'],
  },
  {
    id: 'adl-3046', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quelle reine crétoise s'éprit d'un taureau et engendra le Minotaure ?", answer: 'Pasiphaé',
    distractors: ['Ariane', 'Phèdre', 'Europe'],
  },
  {
    id: 'adl-3047', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quelle estampe d'Hokusai représente une plongeuse et des poulpes ?", answer: 'Le Rêve de la femme du pêcheur',
    distractors: ['La Grande Vague de Kanagawa', 'Les Trente-six Vues du Fuji', 'Le Pont suspendu'],
  },
  {
    id: 'adl-3048', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 3,
    text: 'Quel jeune empereur romain (218-222) choqua Rome par ses excès et ses scandales ?', answer: 'Héliogabale',
    distractors: ['Commode', 'Caracalla', 'Domitien'],
  },
  {
    id: 'adl-3049', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 3,
    text: 'Quel scandale sexuel impliqua le président Clinton et une stagiaire en 1998 ?', answer: "L'affaire Lewinsky",
    distractors: ['Le Watergate', "L'Irangate", "L'affaire Profumo"],
  },
  {
    id: 'adl-3050', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quel film d'Ang Lee (2007) mêle espionnage et scènes intimes crues ?", answer: 'Lust, Caution',
    distractors: ['In the Mood for Love', 'Tigre et Dragon', 'The Grandmaster'],
  },
  {
    id: 'adl-3051', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quel groupe grunge mené par Kurt Cobain marqua les années 90 ?', answer: 'Nirvana',
    distractors: ['Pearl Jam', 'Soundgarden', 'Alice in Chains'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-4025', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelle série suit un séduisant psychopathe narrant ses obsessions amoureuses ?', answer: 'You',
    distractors: ['Killing Eve', 'The Fall', 'Bates Motel'],
  },
  {
    id: 'adl-4026', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel jeu-cauchemar de 2018 situé en enfer fut jugé trop dérangeant ?', answer: 'Agony',
    distractors: ['Scorn', 'Lust for Darkness', 'Layers of Fear'],
  },
  {
    id: 'adl-4027', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: "Quel film d'horreur néerlandais de 2009 coud ses victimes ensemble ?", answer: 'The Human Centipede',
    distractors: ['Hostel', 'Saw', 'Martyrs'],
  },
  {
    id: 'adl-4028', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel chanteur punk provocateur se mutilait et choquait sur scène ?', answer: 'GG Allin',
    distractors: ['Iggy Pop', 'Sid Vicious', 'Henry Rollins'],
  },
  {
    id: 'adl-4029', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel manga sanglant de Hideo Yamamoto suit le tueur torturé Ichi ?', answer: 'Ichi the Killer',
    distractors: ['Gantz', 'Homunculus', 'MPD-Psycho'],
  },
  {
    id: 'adl-4030', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel roman de Jean Genet célèbre le vol, la prison et la marginalité ?', answer: 'Journal du voleur',
    distractors: ['Les Misérables', 'Voyage au bout de la nuit', "L'Étranger"],
  },
  {
    id: 'adl-4031', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel dieu grec de la fertilité est représenté avec un phallus démesuré ?', answer: 'Priape',
    distractors: ['Pan', 'Dionysos', 'Hermès'],
  },
  {
    id: 'adl-4032', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel quartier de Tokyo est célèbre pour ses bars à hôtesses et sa vie nocturne ?', answer: 'Kabukichō',
    distractors: ['Akihabara', 'Harajuku', 'Ginza'],
  },
  {
    id: 'adl-4033', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 4,
    text: "Quelle marquise empoisonna sa famille lors de l'affaire des poisons ?", answer: 'La marquise de Brinvilliers',
    distractors: ['La Voisin', 'Madame de Montespan', 'La marquise de Sévigné'],
  },
  {
    id: 'adl-4034', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 4,
    text: 'Quelle police secrète surveillait la population de la RDA ?', answer: 'La Stasi',
    distractors: ['Le KGB', 'La CIA', 'Le MI6'],
  },
  {
    id: 'adl-4035', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel film français de 2000 de Virginie Despentes fut interdit à sa sortie ?', answer: 'Baise-moi',
    distractors: ['Romance', "Anatomie de l'enfer", 'Irréversible'],
  },
  {
    id: 'adl-4036', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quel rappeur légendaire de la West Coast incarna le gangsta rap sous le nom de 2Pac ?', answer: 'Tupac Shakur',
    distractors: ['Notorious B.I.G.', 'Snoop Dogg', 'Dr. Dre'],
  },

  // ── Vague : culture & concepts, 3e passe ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-2052', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quel film de Danny Boyle (1996) plonge dans l'héroïne à Édimbourg ?", answer: 'Trainspotting',
    distractors: ['Requiem for a Dream', 'Christiane F.', 'Las Vegas Parano'],
  },
  {
    id: 'adl-2053', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle sorcière stylée et sensuelle combat des anges dans un beat’em up déjanté ?', answer: 'Bayonetta',
    distractors: ['Nier: Automata', 'Devil May Cry', 'Nioh'],
  },
  {
    id: 'adl-2054', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle série britannique suit une femme cynique brisant le quatrième mur ?', answer: 'Fleabag',
    distractors: ['Chewing Gum', 'Catastrophe', 'Miranda'],
  },
  {
    id: 'adl-2055', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quel artiste a provoqué avec le clip « Montero » et ses « Satan Shoes » ?', answer: 'Lil Nas X',
    distractors: ['Lil Uzi Vert', 'Tyler, the Creator', 'Doja Cat'],
  },
  {
    id: 'adl-2056', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle autrice scandalisa la Belle Époque par sa vie libre et ses « Claudine » ?', answer: 'Colette',
    distractors: ['George Sand', 'Anaïs Nin', 'Simone de Beauvoir'],
  },
  {
    id: 'adl-2057', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle nymphe, éprise de Narcisse qui la rejeta, dépérit jusqu’à n’être qu’une voix ?', answer: 'Écho',
    distractors: ['Daphné', 'Calypso', 'Io'],
  },
  {
    id: 'adl-2058', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on les bains chauds volcaniques japonais ?', answer: 'Les onsen',
    distractors: ['Les tatami', 'Les ryokan', 'Les futon'],
  },
  {
    id: 'adl-2059', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Comment appelle-t-on un titre racoleur conçu pour pousser au clic ?', answer: 'Le clickbait',
    distractors: ['Le hashtag', 'Le permalien', 'Le favori'],
  },
  {
    id: 'adl-2060', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 2, cancelLevel: 2,
    text: 'Quelle pièce intemporelle Coco Chanel imposa-t-elle dans les années 20 ?', answer: 'La petite robe noire',
    distractors: ['Le tailleur pantalon', 'La veste en tweed', 'Le trench'],
  },
  {
    id: 'adl-2061', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on le favoritisme envers sa propre famille au pouvoir ?', answer: 'Le népotisme',
    distractors: ['Le fédéralisme', 'Le bipartisme', 'Le lobbying'],
  },
  {
    id: 'adl-2062', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel thriller de Paul Verhoeven (1992) choqua avec une scène d'interrogatoire culte ?", answer: 'Basic Instinct',
    distractors: ['Fatal Attraction', 'Body Double', 'Sliver'],
  },
  {
    id: 'adl-2063', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quelle série suit des publicitaires new-yorkais volages et alcoolisés des années 60 ?', answer: 'Mad Men',
    distractors: ['The Hour', 'Masters of Sex', 'Halt and Catch Fire'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-3052', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel film de Park Chan-wook (2003) suit une vengeance et un secret tabou ?', answer: 'Old Boy',
    distractors: ['The Chaser', 'I Saw the Devil', 'Memories of Murder'],
  },
  {
    id: 'adl-3053', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel jeu d’horreur spatial fait affronter les monstrueux Nécromorphes ?', answer: 'Dead Space',
    distractors: ['Doom 3', 'Alien: Isolation', 'Prey'],
  },
  {
    id: 'adl-3054', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelle série montre sans détour la vie d’ados entre drogue, sexe et réseaux (Zendaya) ?', answer: 'Euphoria',
    distractors: ['Skins', 'Élite', '13 Reasons Why'],
  },
  {
    id: 'adl-3055', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quelle artiste électro provoque en chantant crûment la sexualité ?', answer: 'Peaches',
    distractors: ['Grimes', 'Björk', 'M.I.A.'],
  },
  {
    id: 'adl-3056', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quel roman de Pierre Louÿs célèbre la sensualité dans l'Alexandrie antique ?", answer: 'Aphrodite',
    distractors: ['Salammbô', 'Thaïs', 'Quo Vadis'],
  },
  {
    id: 'adl-3057', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelles créatures marines attiraient les marins par leur chant mortel ?', answer: 'Les sirènes',
    distractors: ['Les néréides', 'Les harpies', 'Les gorgones'],
  },
  {
    id: 'adl-3058', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Comment appelle-t-on le théâtre japonais stylisé aux acteurs très maquillés ?', answer: 'Le kabuki',
    distractors: ['Le manga', 'Le karaoké', 'Le pachinko'],
  },
  {
    id: 'adl-3059', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Comment appelle-t-on le chantage à partir d’images intimes obtenues en ligne ?', answer: 'La sextorsion',
    distractors: ['Le phishing', 'Le spam', 'Le hoax'],
  },
  {
    id: 'adl-3060', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel créateur a signé des publicités jugées ultra-sexualisées pour Gucci puis sa marque ?', answer: 'Tom Ford',
    distractors: ['Marc Jacobs', 'Alexander McQueen', 'Riccardo Tisci'],
  },
  {
    id: 'adl-3061', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 3,
    text: 'Comment appelle-t-on la chasse aux communistes menée par le sénateur McCarthy ?', answer: 'Le maccarthysme',
    distractors: ['Le thatchérisme', 'Le gaullisme', 'Le reaganisme'],
  },
  {
    id: 'adl-3062', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel film de Gaspar Noé (2018) sombre dans une fête gangrenée par le LSD ?', answer: 'Climax',
    distractors: ['Enter the Void', 'Love', 'Irréversible'],
  },
  {
    id: 'adl-3063', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Quelle série de Shondaland dépeint la haute société londonienne et ses intrigues charnelles ?', answer: 'Bridgerton',
    distractors: ['The Great', 'Harlots', 'Sanditon'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-4037', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: "Quel film serbe de 2010 est réputé l'un des plus choquants jamais tournés ?", answer: 'A Serbian Film',
    distractors: ['Martyrs', 'Salò', 'Cannibal Holocaust'],
  },
  {
    id: 'adl-4038', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel jeu polémique de 2015 ne consiste qu’à commettre des massacres gratuits ?', answer: 'Hatred',
    distractors: ['Postal', 'Manhunt', 'Carmageddon'],
  },
  {
    id: 'adl-4039', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelle série animée pour adultes suit une agence d’espions dépravés menée par Sterling Archer ?', answer: 'Archer',
    distractors: ['Rick et Morty', 'F is for Family', 'Paradise PD'],
  },
  {
    id: 'adl-4040', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel musicien génial et provocateur composa « Bobby Brown » aux paroles très crues ?', answer: 'Frank Zappa',
    distractors: ['Captain Beefheart', 'Lou Reed', 'Iggy Pop'],
  },
  {
    id: 'adl-4041', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 4,
    text: "Quel auteur d'« American Psycho » a aussi choqué avec « Lunar Park » ?", answer: 'Bret Easton Ellis',
    distractors: ['Chuck Palahniuk', 'Don DeLillo', 'Jay McInerney'],
  },
  {
    id: 'adl-4042', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelles guerrières mythiques se seraient mutilées pour mieux tirer à l’arc ?', answer: 'Les Amazones',
    distractors: ['Les Walkyries', 'Les Ménades', 'Les Gorgones'],
  },
  {
    id: 'adl-4043', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on les femmes ninjas de l’espionnage féodal japonais ?', answer: 'Les kunoichi',
    distractors: ['Les geishas', 'Les miko', 'Les onna-musha'],
  },
  {
    id: 'adl-4044', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on le canular qui envoie une intervention policière chez quelqu’un ?', answer: 'Le swatting',
    distractors: ['Le doxxing', 'Le trolling', 'Le phishing'],
  },
  {
    id: 'adl-4045', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelle marque américaine a enchaîné les pubs hypersexualisées et les scandales de son PDG ?', answer: 'American Apparel',
    distractors: ['Abercrombie & Fitch', 'Urban Outfitters', 'Brandy Melville'],
  },
  {
    id: 'adl-4046', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 4, cancelLevel: 4,
    text: "Quel scandale révéla la vente secrète d'armes à l'Iran sous Reagan ?", answer: "L'Iran-Contra",
    distractors: ['Le Watergate', 'Le Whitewater', 'Le Lewinskygate'],
  },
  {
    id: 'adl-4047', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel film de Nicolas Winding Refn (2016) plonge dans le narcissisme mortel de la mode ?', answer: 'The Neon Demon',
    distractors: ['Only God Forgives', 'Spring Breakers', 'Suspiria'],
  },
  {
    id: 'adl-4048', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quelle série retrace la vie violente des gangsters de l’Atlantic City de la Prohibition ?', answer: 'Boardwalk Empire',
    distractors: ['Peaky Blinders', 'The Knick', 'Carnivàle'],
  },

  // ── Vague : culture & concepts, 4e passe ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-2064', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel film de David Lynch (1986) explore les pulsions sombres d'une petite ville ?", answer: 'Blue Velvet',
    distractors: ['Mulholland Drive', 'Twin Peaks', 'Lost Highway'],
  },
  {
    id: 'adl-2065', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel jeu de plateforme met en scène un écureuil vulgaire et alcoolisé ?', answer: "Conker's Bad Fur Day",
    distractors: ['Banjo-Kazooie', 'Crash Bandicoot', 'Rayman'],
  },
  {
    id: 'adl-2066', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Quelle série culte suit quatre New-Yorkaises et leur vie sentimentale et sexuelle ?', answer: 'Sex and the City',
    distractors: ['Girls', 'Younger', 'The Bold Type'],
  },
  {
    id: 'adl-2067', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 2,
    text: 'Quel groupe mené par Ice-T fit scandale avec le titre « Cop Killer » ?', answer: 'Body Count',
    distractors: ['Rage Against the Machine', 'Public Enemy', 'N.W.A'],
  },
  {
    id: 'adl-2068', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel recueil de contes grivois de Boccace date du XIVᵉ siècle ?', answer: 'Le Décaméron',
    distractors: ['Les Contes de Canterbury', "L'Heptaméron", 'Gargantua'],
  },
  {
    id: 'adl-2069', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quelle magicienne transforma les compagnons d'Ulysse en porcs ?", answer: 'Circé',
    distractors: ['Médée', 'Calypso', 'Pénélope'],
  },
  {
    id: 'adl-2070', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 2, cancelLevel: 2,
    text: "Comment appelle-t-on les fans obsessionnels de manga et d'anime ?", answer: 'Les otaku',
    distractors: ['Les samouraïs', 'Les geishas', 'Les sensei'],
  },
  {
    id: 'adl-2071', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 2,
    text: 'Quelle espionne et danseuse fut fusillée pour espionnage en 1917 ?', answer: 'Mata Hari',
    distractors: ['Lola Montès', 'Cléo de Mérode', 'La Belle Otero'],
  },
  {
    id: 'adl-2072', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 2, cancelLevel: 2,
    text: "Comment appelle-t-on la diffusion volontaire d'informations trompeuses ?", answer: 'La désinformation',
    distractors: ['La transparence', 'La médiation', 'La concertation'],
  },
  {
    id: 'adl-2073', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Comment appelle-t-on des chaussures à talon très fin et très haut ?', answer: 'Les talons aiguilles',
    distractors: ['Les mocassins', 'Les ballerines', 'Les compensées'],
  },
  {
    id: 'adl-2074', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel film de Roman Polanski (1968) suit une grossesse démoniaque ?', answer: "Rosemary's Baby",
    distractors: ["L'Exorciste", 'The Omen', 'Suspiria'],
  },
  {
    id: 'adl-2075', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 2, cancelLevel: 2,
    text: "Quelle plateforme d'abonnement est prisée pour le contenu pour adultes ?", answer: 'OnlyFans',
    distractors: ['Patreon', 'Twitch', 'Substack'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-3064', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel film de Michael Haneke (2001) suit une professeure de piano aux désirs masochistes ?', answer: 'La Pianiste',
    distractors: ['Amour', 'Caché', 'Funny Games'],
  },
  {
    id: 'adl-3065', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel jeu de tir déjanté récompense les mises à mort les plus créatives ?', answer: 'Bulletstorm',
    distractors: ['Doom', 'Painkiller', 'Serious Sam'],
  },
  {
    id: 'adl-3066', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle série de HBO plonge dans la drogue et la police de Baltimore ?', answer: 'The Wire',
    distractors: ['The Shield', 'Bosch', 'True Detective'],
  },
  {
    id: 'adl-3067', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel groupe de metal fut jugé pour de prétendus messages subliminaux en 1990 ?', answer: 'Judas Priest',
    distractors: ['Iron Maiden', 'Metallica', 'Black Sabbath'],
  },
  {
    id: 'adl-3068', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel roman satirique de Pétrone décrit les excès de la Rome antique ?', answer: 'Le Satyricon',
    distractors: ["L'Énéide", 'Les Métamorphoses', 'La Guerre des Gaules'],
  },
  {
    id: 'adl-3069', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: "Quel être aux deux sexes naquit de la fusion d'un dieu et d'une nymphe ?", answer: 'Hermaphrodite',
    distractors: ['Narcisse', 'Adonis', 'Protée'],
  },
  {
    id: 'adl-3070', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: "Comment appelle-t-on l'art érotique des estampes japonaises anciennes ?", answer: 'Le shunga',
    distractors: ['Le manga', 'Le sumi-e', 'Le kirigami'],
  },
  {
    id: 'adl-3071', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 3,
    text: 'Quelle courtisane du Grand Siècle tenait un salon libertin très couru ?', answer: 'Ninon de Lenclos',
    distractors: ['Madame de Sévigné', 'Madame de La Fayette', 'Madame de Maintenon'],
  },
  {
    id: 'adl-3072', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 3,
    text: "Quel système de ségrégation raciale régit l'Afrique du Sud jusqu'en 1991 ?", answer: "L'apartheid",
    distractors: ['La ségrégation', 'Le colonialisme', 'Le protectorat'],
  },
  {
    id: 'adl-3073', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel styliste visionnaire signait des défilés spectaculaires avant sa mort en 2010 ?', answer: 'Alexander McQueen',
    distractors: ['John Galliano', 'Karl Lagerfeld', 'Gianni Versace'],
  },
  {
    id: 'adl-3074', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel film de Julia Ducournau (2016) suit une végétarienne prise de pulsions cannibales ?', answer: 'Grave',
    distractors: ['Titane', 'Border', 'Thelma'],
  },
  {
    id: 'adl-3075', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel collectif punk russe a défié le pouvoir et fini en prison ?', answer: 'Pussy Riot',
    distractors: ['Femen', 't.A.T.u.', 'Little Big'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-4049', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel film de Żuławski (1981) mêle horreur et folie conjugale avec Isabelle Adjani ?', answer: 'Possession',
    distractors: ['Antichrist', 'Repulsion', 'mother!'],
  },
  {
    id: 'adl-4050', theme: 'jeuxvideo', universe: 'Jeux interdits 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel jeu interactif de 1992 déclencha des auditions au Sénat américain ?', answer: 'Night Trap',
    distractors: ['Mortal Kombat', 'Doom', 'Phantasmagoria'],
  },
  {
    id: 'adl-4051', theme: 'series', universe: 'Séries interdites 🔞', difficulty: 2, cancelLevel: 4,
    text: 'Quelle série suit un prof de chimie devenu baron de la méthamphétamine ?', answer: 'Breaking Bad',
    distractors: ['Ozark', 'Better Call Saul', 'Weeds'],
  },
  {
    id: 'adl-4052', theme: 'musique', universe: 'Sulfureux 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel duo russe joua sur une fausse relation lesbienne pour choquer en 2002 ?', answer: 't.A.T.u.',
    distractors: ['Pussy Riot', 'Nina Hagen', 'Roxette'],
  },
  {
    id: 'adl-4053', theme: 'litterature', universe: 'Littérature sulfureuse 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel conte de Diderot fait parler les parties intimes des femmes ?', answer: 'Les Bijoux indiscrets',
    distractors: ['Candide', 'Jacques le Fataliste', 'La Religieuse'],
  },
  {
    id: 'adl-4054', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel devin grec fut changé en femme pendant sept ans par les dieux ?', answer: 'Tirésias',
    distractors: ['Orphée', 'Cadmos', 'Calchas'],
  },
  {
    id: 'adl-4055', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Comment appelle-t-on les bandes de motards rebelles japonais ?', answer: 'Les bōsōzoku',
    distractors: ['Les yakuzas', 'Les otaku', 'Les rōnin'],
  },
  {
    id: 'adl-4056', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 3, cancelLevel: 4,
    text: "Comment nomme-t-on la maison close de Pompéi aux fresques érotiques ?", answer: 'Le lupanar',
    distractors: ['Le forum', 'Les thermes', "L'amphithéâtre"],
  },
  {
    id: 'adl-4057', theme: 'politique', universe: 'Politique trash ☠️', difficulty: 3, cancelLevel: 4,
    text: "Comment appelle-t-on les camps de travail forcé de l'URSS ?", answer: 'Le goulag',
    distractors: ['Le kolkhoze', 'Le soviet', 'Le politburo'],
  },
  {
    id: 'adl-4058', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel maillot dénudant la poitrine créa le scandale en 1964 ?', answer: 'Le monokini',
    distractors: ['Le bikini', 'Le trikini', 'Le tankini'],
  },
  {
    id: 'adl-4059', theme: 'films', universe: 'Cinéma interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel film de Takashi Miike (1999) piège le spectateur dans une horreur insoutenable ?', answer: 'Audition',
    distractors: ['Ichi the Killer', 'Ringu', 'Ju-on'],
  },
  {
    id: 'adl-4060', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on une arnaque crypto où les créateurs filent avec les fonds ?', answer: 'Le rug pull',
    distractors: ['Le mining', 'Le staking', 'Le hodl'],
  },

  // ── Vague : équilibrage des univers les plus légers ──
  // Niveau 2 (Épicé 🌶️)
  {
    id: 'adl-2076', theme: 'tcheque', universe: 'Prague interdite 🔞', difficulty: 4, cancelLevel: 2,
    text: 'Quel quartier juif de Prague abrite un vieux cimetière et la légende du Golem ?', answer: 'Josefov',
    distractors: ['Malá Strana', 'Vinohrady', 'Žižkov'],
  },
  {
    id: 'adl-2077', theme: 'tcheque', universe: 'Prague interdite 🔞', difficulty: 4, cancelLevel: 2,
    text: 'Quelle liqueur amère aux plantes est un digestif national tchèque ?', answer: 'La Becherovka',
    distractors: ['Le Fernet', 'La Slivovice', "L'Unicum"],
  },
  {
    id: 'adl-2078', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 3, cancelLevel: 2,
    text: 'Comment appelle-t-on la première année de mariage ?', answer: 'Les noces de coton',
    distractors: ['Les noces de cuir', 'Les noces de bois', 'Les noces de perle'],
  },
  {
    id: 'adl-2079', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on la remise en question qui frapperait certains vers 40 ans ?', answer: 'La crise de la quarantaine',
    distractors: ["La crise d'ado", 'Le baby blues', 'Le burn-out'],
  },
  {
    id: 'adl-2080', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 3, cancelLevel: 2,
    text: "Quel président français cacha longtemps l'existence de sa fille Mazarine ?", answer: 'François Mitterrand',
    distractors: ['Jacques Chirac', "Valéry Giscard d'Estaing", 'Georges Pompidou'],
  },
  {
    id: 'adl-2081', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Quelle boisson énergisante est associée aux nuits blanches en club ?', answer: 'La Red Bull',
    distractors: ['Le Coca', 'Le Perrier', 'Le Schweppes'],
  },
  {
    id: 'adl-2082', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 2, cancelLevel: 2,
    text: "Comment appelle-t-on la fête qui prolonge la soirée jusqu'au petit matin ?", answer: "L'after",
    distractors: ["L'apéro", 'Le brunch', 'Le before'],
  },
  {
    id: 'adl-2083', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 2, cancelLevel: 2,
    text: 'Comment appelle-t-on la revente de biens que l’on sait volés ?', answer: 'Le recel',
    distractors: ['Le troc', 'Le crédit', 'Le leasing'],
  },
  {
    id: 'adl-2084', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 1, cancelLevel: 2,
    text: 'Comment appelle-t-on un compte automatisé qui inonde les réseaux de messages ?', answer: 'Un bot',
    distractors: ['Un fil', 'Un flux', 'Un widget'],
  },
  {
    id: 'adl-2085', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 3, cancelLevel: 2,
    text: 'Quel manga suit un tournoi d’arts martiaux clandestin et ultra-violent ?', answer: 'Baki',
    distractors: ['Kengan Ashura', 'Hajime no Ippo', 'Grappler Baki'],
  },
  // Niveau 3 (+18 🔞)
  {
    id: 'adl-3076', theme: 'tcheque', universe: 'Prague interdite 🔞', difficulty: 4, cancelLevel: 3,
    text: 'Quel dramaturge dissident devint président de la Tchécoslovaquie puis de la Tchéquie ?', answer: 'Václav Havel',
    distractors: ['Alexander Dubček', 'Tomáš Masaryk', 'Miloš Zeman'],
  },
  {
    id: 'adl-3077', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 2, cancelLevel: 3,
    text: 'Comment appelle-t-on une relation sans engagement ni exclusivité ?', answer: 'Une relation libre',
    distractors: ['Le mariage', 'Les fiançailles', 'Le concubinage'],
  },
  {
    id: 'adl-3078', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quel scandale de 1934 mêla escroquerie et politique autour d'Alexandre Stavisky ?", answer: "L'affaire Stavisky",
    distractors: ["L'affaire Dreyfus", "L'affaire Caillaux", 'Le scandale de Panama'],
  },
  {
    id: 'adl-3079', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 4, cancelLevel: 3,
    text: "Quel scandale visa des écoutes illégales organisées depuis l'Élysée dans les années 80 ?", answer: "Les écoutes de l'Élysée",
    distractors: ['Le Rainbow Warrior', 'Les affaires des fiches', "L'affaire des micros"],
  },
  {
    id: 'adl-3080', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 2, cancelLevel: 3,
    text: 'Comment appelle-t-on le fait de faire travailler quelqu’un sans le déclarer ?', answer: 'Le travail au noir',
    distractors: ['Le bénévolat', 'Le stage', "L'intérim"],
  },
  {
    id: 'adl-3081', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quelle matière moulante et brillante est associée aux tenues fétichistes ?', answer: 'Le latex',
    distractors: ['Le lin', 'Le velours', 'La laine'],
  },
  {
    id: 'adl-3082', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Comment appelle-t-on les cafés où des serveuses habillées en soubrettes servent les clients ?', answer: 'Les maid cafés',
    distractors: ['Les izakaya', 'Les konbini', 'Les ryokan'],
  },
  {
    id: 'adl-3083', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Comment appelle-t-on l’espace réservé aux fêtards fortunés en boîte de nuit ?', answer: 'Le carré VIP',
    distractors: ['Le vestiaire', 'Le fumoir', 'Le sas'],
  },
  {
    id: 'adl-3084', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 2, cancelLevel: 3,
    text: 'Comment appelle-t-on un lien piégé menant vers un site malveillant ?', answer: 'Un lien vérolé',
    distractors: ['Un favori', 'Un onglet', 'Un raccourci'],
  },
  {
    id: 'adl-3085', theme: 'mythologie', universe: 'Mythes interdits 🔞', difficulty: 3, cancelLevel: 3,
    text: 'Quel fleuve les âmes traversaient-elles pour rejoindre les Enfers grecs ?', answer: 'Le Styx',
    distractors: ['Le Gange', 'Le Jourdain', 'Le Rubicon'],
  },
  // Niveau 4 (Cancellable ☠️)
  {
    id: 'adl-4061', theme: 'tcheque', universe: 'Prague interdite 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel « Printemps » de 1968 fut écrasé par les chars soviétiques à Prague ?', answer: 'Le Printemps de Prague',
    distractors: ['Le Printemps des peuples', 'La Révolution de velours', 'Le Dégel'],
  },
  {
    id: 'adl-4062', theme: 'culture', universe: 'Vie de couple 💔', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on le fait de garder un(e) ex « sous le coude » par messages sporadiques ?', answer: 'Le breadcrumbing',
    distractors: ['Le ghosting', 'Le catfishing', 'Le zapping'],
  },
  {
    id: 'adl-4063', theme: 'france', universe: 'France scandaleuse 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel scandale sous Chirac concerna les emplois fictifs de la Ville de Paris ?', answer: 'L’affaire des emplois fictifs',
    distractors: ['L’affaire Elf', 'L’affaire Bettencourt', 'L’affaire Karachi'],
  },
  {
    id: 'adl-4064', theme: 'societe', universe: 'Tabou & trash ☠️', difficulty: 2, cancelLevel: 4,
    text: 'Comment appelle-t-on l’enlèvement d’une personne contre rançon ?', answer: 'Le kidnapping',
    distractors: ['Le cambriolage', 'Le braquage', 'Le racket'],
  },
  {
    id: 'adl-4065', theme: 'mode', universe: 'Mode sulfureuse 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Quel accessoire en cuir issu du fétichisme est devenu une pièce de mode provocante ?', answer: 'Le harnais',
    distractors: ['Le foulard', 'Le béret', 'Le gilet'],
  },
  {
    id: 'adl-4066', theme: 'internet', universe: 'Internet sale 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on la revente clandestine de données personnelles volées ?', answer: 'Le trafic de données',
    distractors: ['Le streaming', 'Le partage', "L'archivage"],
  },
  {
    id: 'adl-4067', theme: 'societe', universe: 'Nuit & tabous 🔞', difficulty: 3, cancelLevel: 4,
    text: 'Comment appelle-t-on une soirée où les couples échangent leurs partenaires ?', answer: 'Une soirée échangiste',
    distractors: ['Une soirée mousse', 'Une soirée pyjama', 'Une soirée casino'],
  },
  {
    id: 'adl-4068', theme: 'culture', universe: 'Histoire trash ☠️', difficulty: 4, cancelLevel: 4,
    text: 'Quel empereur romain, gladiateur mégalomane, fut étranglé en 192 ?', answer: 'Commode',
    distractors: ['Néron', 'Caligula', 'Titus'],
  },
  {
    id: 'adl-4069', theme: 'manga', universe: 'Manga interdits 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Quel manga d’horreur enferme un village dans une malédiction meurtrière répétée ?', answer: 'Higurashi',
    distractors: ['Another', 'Corpse Party', 'School-Live!'],
  },
  {
    id: 'adl-4070', theme: 'japon', universe: 'Japon interdit 🔞', difficulty: 4, cancelLevel: 4,
    text: 'Comment appelle-t-on les bains chauds mixtes traditionnels au Japon ?', answer: 'Le konyoku',
    distractors: ['Le kaiseki', 'Le karaoke', 'Le kabuki'],
  },
];
