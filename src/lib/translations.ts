/**
 * Traductions anglaises de l'interface.
 *
 * Clé = chaîne source FRANÇAISE exacte, telle que passée à `t(...)`.
 * Valeur = anglais. N'ajoutez QUE l'anglais ici : le français est la source et
 * sert de repli automatique pour toute clé absente. Complété vague par vague.
 *
 * Les gabarits `{clef}` doivent être conservés à l'identique dans la traduction.
 */
export const EN: Record<string, string> = {
  // --- Commun / composants (ui.tsx) ---------------------------------------
  '❓ Comment jouer': '❓ How to play',
  inédite: 'unseen',
  inédites: 'unseen',

  // --- Accueil (HomeScreen) -----------------------------------------------
  'Le jeu de vos soirées entre amis': 'The party game for your nights with friends',
  'par Arma Cos': 'by Arma Cos',
  'PARTIES EN COURS': 'GAMES IN PROGRESS',
  'Nouvelle partie': 'New game',
  Jouer: 'Play',
  'Mode Soirée': 'Party Mode',
  Joueurs: 'Players',
  Statistiques: 'Statistics',
  'Mon contenu': 'My content',
  Boutique: 'Shop',
  Réglages: 'Settings',
  'Supprimer cette partie ?': 'Delete this game?',
  Annuler: 'Cancel',
  Supprimer: 'Delete',
  "{n} partie jouée jusqu'ici 🍻": '{n} game played so far 🍻',
  "{n} parties jouées jusqu'ici 🍻": '{n} games played so far 🍻',

  // --- Choix du jeu (GameSelectScreen) + définitions des modes ------------
  'Choisir un jeu': 'Choose a game',
  "Un mini-jeu à la fois (pour l'instant)": 'One mini-game at a time (for now)',
  BIENTÔT: 'SOON',
  '🔒 Débloquer dans la boutique — 1,99 €': '🔒 Unlock in the shop — €1.99',
  // Titres & descriptions des mini-jeux
  Quiz: 'Quiz',
  'Manga, jeux vidéo, séries, films, musique, culture G. Chacun son tour ou au plus rapide.':
    'Manga, video games, series, movies, music, general knowledge. Take turns or race to answer.',
  'La Bombe': 'The Bomb',
  'Élimination ! Réponds juste pour refiler la bombe. Celui qui la tient quand elle explose est éliminé.':
    'Elimination! Answer right to pass the bomb. Whoever holds it when it explodes is out.',
  Duel: 'Duel',
  'Élimination ! Chacun sur son thème, difficulté croissante. Une erreur et tu es éliminé. Dernier debout gagne.':
    "Elimination! Everyone on their own theme, rising difficulty. One mistake and you're out. Last one standing wins.",
  'Duel Ultime': 'Ultimate Duel',
  'Chacun choisit un ou plusieurs univers et affronte des questions pro, sans propositions. Meilleur score gagne. Jouable en solo.':
    'Everyone picks one or more universes and faces pro questions, no options given. Best score wins. Playable solo.',
  "L'Imposteur": 'The Impostor',
  "Un mot secret que tout le monde connaît… sauf l'imposteur. Chacun donne un indice, on démasque le bluffeur — ou pas. Déduction, bluff et gorgées.":
    'A secret word everyone knows… except the impostor. Each gives a clue, then you unmask the bluffer — or not. Deduction, bluffing and sips.',

  // --- Réglages (SettingsScreen) ------------------------------------------
  Petit: 'Small',
  Normal: 'Normal',
  Grand: 'Large',
  'Très grand': 'Extra large',
  'Accessibilité & confort': 'Accessibility & comfort',
  'Taille du texte': 'Text size',
  'Aperçu : tout le monde voit bien la question ? 👀': 'Preview: can everyone read the question clearly? 👀',
  'Vibrations 📳': 'Vibrations 📳',
  'Retours haptiques (bonnes/mauvaises réponses, victoire…)':
    'Haptic feedback (right/wrong answers, victory…)',
  'Cadre de palier sur les avatars 🖼️': 'Tier frame on avatars 🖼️',
  "Un anneau coloré autour de l'avatar selon le palier général du profil (nécessite le pack Hauts faits).":
    "A colored ring around the avatar based on the profile's overall tier (requires the Achievements pack).",
  Langue: 'Language',
  "Langue de l'application": 'App language',
  'Les questions du quiz restent en français.': 'Quiz questions stay in French.',
  Sauvegarde: 'Backup',
  "Vos stats sont conservées localement et survivent aux mises à jour de l'APK. Exportez une sauvegarde pour changer de téléphone ou vous prémunir d'une désinstallation.":
    'Your stats are kept locally and survive APK updates. Export a backup to switch phones or guard against an uninstall.',
  'Exporter une sauvegarde': 'Export a backup',
  'Importer une sauvegarde': 'Import a backup',
  Contenu: 'Content',
  "Le thème « Image mystère » charge de vraies photos depuis internet. Vérifiez d'un coup d'œil lesquelles ne s'affichent pas pour pouvoir les signaler.":
    "The “Mystery image” theme loads real photos from the internet. Check at a glance which ones don't show up so you can report them.",
  'Vérifier les images': 'Check images',
  'Questions signalées': 'Reported questions',
  'Questions signalées ({n})': 'Reported questions ({n})',
  'Zone de danger': 'Danger zone',
  'Tout effacer': 'Erase everything',
  'À propos': 'About',
  'Le jeu de vos soirées entre amis. D\'autres mini-jeux arrivent — toutes les stats resteront connectées.':
    'The party game for your nights with friends. More mini-games are coming — all your stats will stay connected.',
  "Astuce : ne désinstallez pas l'app et ne changez pas son identifiant pour conserver l'historique.":
    "Tip: don't uninstall the app or change its identifier, so your history is kept.",
  // Alertes des Réglages
  'Sauvegarde créée': 'Backup created',
  Erreur: 'Error',
  'Importer la sauvegarde ?': 'Import backup?',
  'Toutes les données actuelles seront remplacées.': 'All current data will be replaced.',
  Importer: 'Import',
  'Import terminé': 'Import complete',
  'Vos données ont été restaurées.': 'Your data has been restored.',
  'Tout effacer ?': 'Erase everything?',
  'Joueurs, parties et statistiques seront définitivement supprimés.':
    'Players, games and statistics will be permanently deleted.',
  'Données effacées': 'Data erased',
  'Sauvegarde Cancellable': 'Cancellable backup',

  // --- Premier lancement (OnboardingScreen) -------------------------------
  'Bienvenue 👋': 'Welcome 👋',
  'Choisis {n} univers à jouer gratuitement. Les autres restent visibles mais verrouillés — tu pourras tout débloquer plus tard dans la Boutique.':
    'Pick {n} universes to play for free. The rest stay visible but locked — you can unlock everything later in the Shop.',
  'Parfait ! Tu peux commencer.': "Perfect! You're ready to start.",
  'univers sélectionnés': 'universes selected',
  '🎲 Au hasard': '🎲 Random',
  'Commencer 🎉': 'Start 🎉',
  'Choisis encore {n} univers': 'Choose {n} more universes',
};
