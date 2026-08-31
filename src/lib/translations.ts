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

  // --- Salon / config / lancement (Lobby, GameConfig, GamePlay) -----------
  'Qui joue ?': "Who's playing?",
  'Configurer ({n} joueur)': 'Configure ({n} player)',
  'Configurer ({n} joueurs)': 'Configure ({n} players)',
  'Aucun joueur': 'No players',
  'Ajoute des joueurs avant de lancer une partie.': 'Add players before starting a game.',
  'Gérer les joueurs': 'Manage players',
  'Sélectionne au moins {n} joueur.': 'Select at least {n} player.',
  'Sélectionne au moins {n} joueurs.': 'Select at least {n} players.',
  'Jeu introuvable.': 'Game not found.',
  '{n} joueur': '{n} player',
  '{n} joueurs': '{n} players',

  // --- Joueurs (PlayersScreen) --------------------------------------------
  'Accès refusé': 'Access denied',
  "Autorise l'accès aux photos dans les réglages pour choisir un avatar.":
    'Allow photo access in settings to choose an avatar.',
  'Limite de profils atteinte': 'Profile limit reached',
  'La version gratuite est limitée à {n} profils. Débloque les profils illimités dans la Boutique.':
    'The free version is limited to {n} profiles. Unlock unlimited profiles in the Shop.',
  'Plus tard': 'Later',
  '{name} copie': '{name} copy',
  'Supprimer définitivement ?': 'Delete permanently?',
  'Les statistiques de {name} seront effacées.': 'The statistics for {name} will be erased.',
  'Limite atteinte': 'Limit reached',
  'Version gratuite limitée à {n} profils. Débloque les profils illimités dans la Boutique.':
    'Free version limited to {n} profiles. Unlock unlimited profiles in the Shop.',
  'Profil importé': 'Profile imported',
  '{name} a été ajouté, avec ses univers évités et ses questions déjà vues.':
    '{name} was added, along with their avoided universes and already-seen questions.',
  'Modifier le joueur': 'Edit player',
  'Nouveau joueur': 'New player',
  'Prénom / pseudo': 'First name / nickname',
  COULEUR: 'COLOR',
  'Changer la photo': 'Change photo',
  'Photo de profil': 'Profile photo',
  Retirer: 'Remove',
  Enregistrer: 'Save',
  Ajouter: 'Add',
  'Profil à distance (QR)': 'Remote profile (QR)',
  'Chaque invité remplit son profil sur son téléphone, tu scannes son QR.':
    'Each guest fills in their profile on their phone, you scan their QR.',
  'Importer un profil (fichier)': 'Import a profile (file)',
  Archivés: 'Archived',
  'Voir actifs': 'View active',
  'Voir archivés': 'View archived',
  'Aucun joueur archivé.': 'No archived players.',
  'Ajoute des joueurs pour commencer 👆': 'Add players to get started 👆',
  '📚 {kept}/{total} univers': '📚 {kept}/{total} universes',
  Restaurer: 'Restore',
  'Univers et thèmes': 'Universes and themes',
  "Tout est activé par défaut. Touche une catégorie pour la désactiver : {name} n'aura alors qu'environ 2 % de chance de tomber dessus, juste pour la surprise.":
    'Everything is on by default. Tap a category to turn it off: {name} will then have only about a 2% chance of getting it, just for the surprise.',
  'question inédite restante pour {name} avec ce choix': 'unseen question left for {name} with this choice',
  'questions inédites restantes pour {name} avec ce choix': 'unseen questions left for {name} with this choice',
  '📚 {kept}/{total} univers gardés': '📚 {kept}/{total} universes kept',
  '🆕 Triés par ajout : les univers les plus récents en premier.':
    '🆕 Sorted by date added: newest universes first.',
  '🏅 Profil et hauts faits': '🏅 Profile and achievements',
  Modifier: 'Edit',
  Dupliquer: 'Duplicate',
  '📤 Exporter ce profil (complet)': '📤 Export this profile (full)',
  'Univers et thèmes évités': 'Avoided universes and themes',
  Archiver: 'Archive',
  'Supprimer (efface les stats)': 'Delete (erases stats)',

  // --- Résultats (ResultsScreen) ------------------------------------------
  Résultats: 'Results',
  Rejouer: 'Play again',
  'Partager le résultat': 'Share result',
  Accueil: 'Home',
  'gagne la partie !': 'wins the game!',
  'Touche un joueur pour voir son résumé et sa progression 👇':
    'Tap a player to see their recap and progress 👇',
  '{c} ✓ · {w} ✗ · 🍺 {drunk} bu': '{c} ✓ · {w} ✗ · 🍺 {drunk} drunk',
  ' · 🤙 {given} donné': ' · 🤙 {given} given',
  '{medal} · {pts} pts cette partie': '{medal} · {pts} pts this game',
  Rang: 'Rank',
  Bonnes: 'Right',
  Ratées: 'Missed',
  Bu: 'Drunk',
  Donné: 'Given',
  '🔒 Progression des hauts faits': '🔒 Achievements progress',
  'Débloque les hauts faits dans la Boutique — 1,99 €.': 'Unlock achievements in the Shop — €1.99.',
  '⭐ Progression des hauts faits': '⭐ Achievements progress',
  '🎉 {n} nouveau palier débloqué cette partie !': '🎉 {n} new tier unlocked this game!',
  '🎉 {n} nouveaux paliers débloqués cette partie !': '🎉 {n} new tiers unlocked this game!',
  'Voir le profil complet': 'See full profile',
  Partie: 'Game',
  '🏆 {name} gagne !': '🏆 {name} wins!',
  '🍺 {n} gorgées au total': '🍺 {n} sips total',
  'Le jeu de vos soirées entre amis 🎉': 'The party game for your nights with friends 🎉',

  // --- Boutique (StoreScreen) ---------------------------------------------
  'Merci ! 🎉': 'Thanks! 🎉',
  'Ton achat est activé.': 'Your purchase is active.',
  'Achat annulé': 'Purchase cancelled',
  "L'achat n'a pas abouti.": 'The purchase did not go through.',
  "L'achat a échoué, réessaie plus tard.": 'The purchase failed, try again later.',
  'Achats restaurés': 'Purchases restored',
  'Tes achats précédents ont été réappliqués.': 'Your previous purchases have been reapplied.',
  'Soutiens le jeu et débloque tout': 'Support the game and unlock everything',
  'Achats uniques, définitifs et sans abonnement. Le pack « Tout débloquer » est le plus avantageux.':
    'One-time purchases, permanent and subscription-free. The “Unlock everything” pack is the best value.',
  '✓ Débloqué': '✓ Unlocked',
  Acheter: 'Buy',
  'Restaurer mes achats': 'Restore my purchases',
  'Version de démonstration : les achats sont simulés localement. En production, ils passeront par Google Play.':
    'Demo version: purchases are simulated locally. In production they will go through Google Play.',

  // --- Catalogue de produits (products.ts, affiché dans la Boutique) -------
  'Tous les thèmes': 'All themes',
  'Débloque tous les univers, actuels et à venir.': 'Unlock all universes, current and future.',
  'Tous les modes de jeu': 'All game modes',
  'Débloque La Bombe, le Duel et les modes futurs.': 'Unlock The Bomb, Duel and future modes.',
  'Profils illimités': 'Unlimited profiles',
  'Crée autant de joueurs que tu veux, au-delà de 10.': 'Create as many players as you want, beyond 10.',
  'Toutes les statistiques': 'All statistics',
  'Mois, année, total et tous les palmarès.': 'Month, year, total and all leaderboards.',
  'Hauts faits': 'Achievements',
  'Débloque tous les hauts faits, leurs paliers et le classement.':
    'Unlock all achievements, their tiers and the leaderboard.',
  'Sans publicité': 'No ads',
  'Retire les publicités pour toujours.': 'Remove ads forever.',
  'Tout débloquer': 'Unlock everything',
  'Profils, modes, thèmes, stats — et sans publicité.': 'Profiles, modes, themes, stats — and no ads.',
  '1,99 €': '€1.99',
  '0,99 €': '€0.99',
  '4,99 €': '€4.99',

  // --- Mode Soirée (SoireeScreen) -----------------------------------------
  'Terminer la soirée ?': 'End the party?',
  'Le classement final sera affiché.': 'The final standings will be shown.',
  Terminer: 'End',
  'Fin de la soirée': 'End of the party',
  'Nouvelle soirée': 'New party',
  'champion de la soirée !': 'party champion!',
  'Égalité en tête, pas de champion unique !': 'Tie at the top, no single champion!',
  '{n} manche jouée': '{n} round played',
  '{n} manches jouées': '{n} rounds played',
  'Un fil rouge pour toute la soirée': 'A through-line for the whole night',
  'Démarrer la soirée': 'Start the party',
  '🎉 Enchaînez les mini-jeux, un seul classement': '🎉 Chain mini-games, one single ranking',
  'Jouez plusieurs manches (Quiz, Bombe, Duel…) : chaque manche rapporte des points selon le classement. À la fin, un champion de la soirée est couronné.':
    'Play several rounds (Quiz, Bomb, Duel…): each round earns points based on the ranking. At the end, a party champion is crowned.',
  'Pas assez de joueurs': 'Not enough players',
  "Ajoute au moins 2 joueurs dans l'écran Joueurs.": 'Add at least 2 players in the Players screen.',
  'Qui participe ?': "Who's taking part?",
  '{n} manche': '{n} round',
  '{n} manches': '{n} rounds',
  'Jouer une manche': 'Play a round',
  'Terminer la soirée': 'End the party',
  'Choisis un mini-jeu': 'Choose a mini-game',
  'Classement de la soirée': 'Party standings',
  'Manches jouées': 'Rounds played',

  // --- Thèmes (THEME_META) & difficultés (DIFFICULTY_LABELS), models.ts ----
  'Manga / Anime': 'Manga / Anime',
  'Jeux vidéo': 'Video games',
  Séries: 'Series',
  Films: 'Movies',
  Musique: 'Music',
  Littérature: 'Literature',
  Japon: 'Japan',
  France: 'France',
  'République tchèque': 'Czech Republic',
  Mode: 'Fashion',
  'Culture générale': 'General knowledge',
  'Sciences & Nature': 'Science & Nature',
  'Société & lifestyle': 'Society & lifestyle',
  'Politique & Histoire': 'Politics & History',
  'Références Internet': 'Internet references',
  Mythologie: 'Mythology',
  Religions: 'Religions',
  Énigmes: 'Riddles',
  'Rébus emoji': 'Emoji rebus',
  'Image mystère': 'Mystery image',
  Facile: 'Easy',
  Moyen: 'Medium',
  Difficile: 'Hard',
  Pro: 'Pro',

  // --- Gorgées & défis (drinks.ts, affichés en partie) --------------------
  'Mauvaise réponse 😬 tu bois !': 'Wrong answer 😬 drink up!',
  'Sans faute sur une difficile 🔥 distribue les gorgées !':
    'Nailed a hard one 🔥 hand out the sips!',
  'Trouvé… mais avec les indices 👀': 'Got it… but with hints 👀',
  'un joueur': 'a player',
  "Cascade ! Le dernier qui a marqué lance, chacun arrête de boire quand son voisin de droite s'arrête.":
    'Waterfall! The last to score starts; each person stops drinking only when the one to their right stops.',
  "Tout le monde boit de la main gauche jusqu'au prochain défi. Oubli = 1 gorgée.":
    'Everyone drinks with their left hand until the next challenge. Forget = 1 sip.',
  'Catégories : le meneur lance un thème (ex: persos de manga), chacun en cite un à tour de rôle. Le premier qui bloque boit 2 gorgées.':
    'Categories: the host names a theme (e.g. manga characters), each names one in turn. First to get stuck drinks 2 sips.',
  "Je n'ai jamais… : chacun son tour une affirmation, ceux qui l'ont déjà fait boivent une gorgée.":
    'Never have I ever…: each in turn makes a statement; those who have done it drink a sip.',
  'Duel de regard : {0} et {1} se fixent dans les yeux. Le premier qui rit ou cligne boit 2 gorgées.':
    'Staring duel: {0} and {1} lock eyes. First to laugh or blink drinks 2 sips.',
  'Vote secret : tout le monde montre pouce haut/bas en même temps. La minorité boit.':
    'Secret vote: everyone shows thumbs up/down at once. The minority drinks.',
  "Le dernier à poser son pouce sur la table boit. (Le meneur peut le déclencher quand il veut d'ici la prochaine question.)":
    'Last to put a thumb on the table drinks. (The host can trigger it any time before the next question.)',
  'Le meneur dit un mot, chacun doit enchaîner avec une rime. Le premier qui sèche boit.':
    'The host says a word, everyone must follow with a rhyme. First to blank drinks.',
  'Petite pause santé : tout le monde trinque et boit une gorgée ensemble 🥂.':
    'Little health break: everyone clinks and drinks a sip together 🥂.',
  "Chef élu : {0}. Jusqu'au prochain défi, quand {0} boit, tout le monde boit.":
    'Elected chief: {0}. Until the next challenge, when {0} drinks, everyone drinks.',
  'Statue : au prochain « statue ! » du meneur, le premier qui bouge boit 2 gorgées.':
    'Statue: on the host’s next “freeze!”, the first to move drinks 2 sips.',
  "Mot interdit : le meneur bannit un mot jusqu'au prochain défi. Le prononcer coûte 1 gorgée à chaque fois.":
    'Forbidden word: the host bans a word until the next challenge. Saying it costs 1 sip each time.',
  "Tout le monde parle avec l'accent choisi par le meneur jusqu'au prochain défi. Oubli = 1 gorgée.":
    'Everyone speaks in the accent chosen by the host until the next challenge. Forget = 1 sip.',
  "On se vouvoie tous jusqu'au prochain défi. Un tutoiement qui échappe = 1 gorgée.":
    'Everyone stays formal until the next challenge. A slip into first names = 1 sip.',
  'Gorgée cadeau 🎁 : {0} récolte 3 gorgées, à boire ou à distribuer.':
    'Gift sips 🎁: {0} collects 3 sips, to drink or hand out.',
  "{0} et {1} sont binômes : si l'un des deux se trompe à la prochaine question, vous buvez tous les deux.":
    '{0} and {1} are partners: if either misses the next question, you both drink.',
  "Le meneur impose un mot : chacun son tour cite une chanson qui le contient. Le premier qui sèche boit.":
    'The host sets a word: each in turn names a song containing it. First to blank drinks.',
  'Pierre-feuille-ciseaux : {0} affronte {1}, le perdant boit 2 gorgées.':
    'Rock-paper-scissors: {0} faces {1}, the loser drinks 2 sips.',
  "Concours de grimaces : celui qui fait craquer le meneur de rire gagne, tous les autres boivent.":
    'Funny-face contest: whoever makes the host laugh wins, everyone else drinks.',
  'Silence total : le premier qui parle avant la fin du minuteur boit 2 gorgées.':
    'Total silence: the first to speak before the timer ends drinks 2 sips.',
  "Le plus jeune et le plus âgé de la table distribuent chacun 2 gorgées.":
    'The youngest and the oldest at the table each hand out 2 sips.',
  "Interdit d'appeler quelqu'un par son prénom jusqu'au prochain défi. Erreur = 1 gorgée.":
    'No calling anyone by their first name until the next challenge. Mistake = 1 sip.',
  '{0} et {1} échangent leur place pour les deux prochaines questions.':
    '{0} and {1} swap seats for the next two questions.',
  '{0} : le meneur te pose une question surprise. Hésitation ou blague ratée = 1 gorgée.':
    '{0}: the host asks you a surprise question. Hesitation or a flat joke = 1 sip.',
  "Le meneur lève la main quand il veut d'ici la prochaine question : le dernier à lever la sienne boit.":
    'The host raises a hand any time before the next question: the last to raise theirs drinks.',
  "Le meneur invente une règle pour toute la table jusqu'au prochain défi, et la fait respecter.":
    'The host invents a rule for the whole table until the next challenge, and enforces it.',

  // --- Config du Quiz (QuizConfig) ----------------------------------------
  'Chaque joueur répond à sa propre question, à tour de rôle — ou tout le monde court sur la même en « au plus rapide ».':
    'Each player answers their own question in turn — or everyone races on the same one in “fastest finger”.',
  'Sans proposition = points pleins. Demander des propositions ou un indice coûte des points.':
    'No options = full points. Asking for options or a hint costs points.',
  "Les questions déjà vues par un joueur ne reviennent qu'en dernier recours.":
    'Questions a player has already seen only come back as a last resort.',
  'Active les gorgées et les défis pour pimenter la soirée ; règle un chrono si besoin.':
    'Turn on sips and challenges to spice up the night; set a timer if needed.',
  Thèmes: 'Themes',
  "Astuce : chaque partie pioche des questions inédites et un maximum d'univers différents. Chaque joueur peut désactiver des univers ou des thèmes entiers dans l'écran Joueurs : il n'a alors qu'environ 2 % de chance par question d'en croiser un.":
    'Tip: each game draws unseen questions and as many different universes as possible. Each player can disable universes or whole themes in the Players screen: they then have only about a 2% chance per question of hitting one.',
  Difficulté: 'Difficulty',
  'Difficulté adaptative 🎯': 'Adaptive difficulty 🎯',
  'Chacun reçoit, à son tour, des questions à sa mesure selon ses réussites passées (mode « Chacun son tour »).':
    'Everyone gets, on their turn, questions tuned to them based on past success (“Take turns” mode).',
  'Options avancées — univers': 'Advanced options — universes',
  'Questions par joueur': 'Questions per player',
  'Par joueur': 'Per player',
  '{n} question': '{n} question',
  '{n} questions': '{n} questions',
  '{n} dispo': '{n} available',
  '{n} jamais vue': '{n} never seen',
  '{n} jamais vues': '{n} never seen',
  'Inédites par joueur': 'Unseen per player',
  'Questions jamais vues par chaque joueur avec les thèmes, difficultés et univers choisis.':
    'Questions never seen by each player with the chosen themes, difficulties and universes.',
  'Mode de jeu': 'Game mode',
  'Chacun son tour': 'Take turns',
  'Au plus rapide': 'Fastest finger',
  'Chaque joueur répond à sa propre question, à tour de rôle.':
    'Each player answers their own question, in turn.',
  'Tout le monde court sur la même question : le plus rapide marque (avec bonus de vitesse).':
    'Everyone races on the same question: the fastest scores (with a speed bonus).',
  'Temps par question': 'Time per question',
  "secondes — plus c'est rapide, plus le bonus est gros": 'seconds — the faster, the bigger the bonus',
  Équipes: 'Teams',
  'Mode équipe 👥': 'Team mode 👥',
  'Le tour passe à une équipe, pas à un joueur. Les univers évités par les joueurs sont ignorés.':
    'Turns pass to a team, not a player. Universes avoided by players are ignored.',
  "Nombre d'équipes": 'Number of teams',
  'Équipe {n}': 'Team {n}',
  'RÉPARTITION DES JOUEURS': 'PLAYER ASSIGNMENT',
  'Réponses & aide': 'Answers & help',
  'Réponse libre par défaut': 'Free answer by default',
  "Chaque question démarre sans proposition (points pleins). Pendant la question, des boutons permettent de demander de l'aide — au prix de points :":
    'Each question starts with no options (full points). During the question, buttons let you ask for help — at the cost of points:',
  '• 4 propositions → points ÷ 2\n• 2 propositions → points ÷ 4\n• un indice → points ÷ 1,5 (cumulable)':
    '• 4 options → points ÷ 2\n• 2 options → points ÷ 4\n• a hint → points ÷ 1.5 (stackable)',
  'Chrono par question': 'Per-question timer',
  'Chrono informatif ⏱': 'Informative timer ⏱',
  'Compte à rebours affiché, sans pénalité (0 = désactivé)':
    'Countdown shown, no penalty (0 = disabled)',
  '{n} s par question': '{n} s per question',
  Désactivé: 'Disabled',
  'Réponse fausse au temps écoulé ❌': 'Wrong answer on timeout ❌',
  "À la fin du chrono, une réponse fausse est enregistrée automatiquement (le joueur du tour ; « personne n'a trouvé » en mode au plus rapide).":
    'When the timer ends, a wrong answer is recorded automatically (the player on turn; “nobody got it” in fastest mode).',
  Options: 'Options',
  'Gorgées 🍻': 'Sips 🍻',
  'Gorgées à boire / distribuer selon les réponses': 'Sips to drink / hand out based on answers',
  'Défis 🎲': 'Challenges 🎲',
  'Cartes « Défi ! » proposées entre les questions': 'Challenge cards offered between questions',
  "Afficher l'univers": 'Show the universe',
  "Montrer l'univers pendant la partie (ex. « Naruto »)": 'Show the universe during the game (e.g. “Naruto”)',
  'Lancer la partie': 'Start the game',
  'Choisis au moins un thème et une difficulté.': 'Choose at least one theme and one difficulty.',

  // --- Partie de Quiz (QuizPlay) ------------------------------------------
  'Préparation des questions…': 'Preparing questions…',
  '✕ Quitter': '✕ Quit',
  '🏁 Terminer': '🏁 End',
  'Temps écoulé !': "Time's up!",
  "Mets un joueur en pause s'il s'absente : la partie continue sans lui. À son retour, il rattrape d'un coup toutes les questions manquées.":
    'Pause a player if they step away: the game goes on without them. When they return, they catch up on all missed questions at once.',
  '⏸ en pause': '⏸ paused',
  ' · {n} à rattraper': ' · {n} to catch up',
  '🔥 rattrape {n} question': '🔥 catching up {n} question',
  '🔥 rattrape {n} questions': '🔥 catching up {n} questions',
  'en jeu': 'in play',
  '▶️ Revenir': '▶️ Back',
  Fermer: 'Close',
  'Quitter la partie ?': 'Quit the game?',
  'La partie est gardée : tu pourras la reprendre plus tard.': 'The game is saved: you can resume it later.',
  'Continuer à jouer': 'Keep playing',
  Quitter: 'Quit',
  'Terminer la partie ?': 'End the game?',
  'La partie en cours sera perdue et les statistiques ne seront pas enregistrées.':
    'The current game will be lost and statistics will not be saved.',
  Univers: 'Universe',
  Thème: 'Theme',
  '🚫 {cat} non souhaité par {name}': '🚫 {cat} not wanted by {name}',
  '🚫 {cat} non souhaité': '🚫 {cat} not wanted',
  '✓ {cat} activé': '✓ {cat} on',
  '⭐ Univers voulu par {names}': '⭐ Universe wanted by {names}',
  "Univers exclu par toute l'équipe": 'Universe excluded by the whole team',
  '(image indisponible — question suivante…)': '(image unavailable — next question…)',
  '▶️  Écouter': '▶️  Listen',
  '⟲  Rejouer': '⟲  Replay',
  "BESOIN D'UN COUP DE POUCE ?": 'NEED A HINT?',
  '4 propositions': '4 options',
  '2 propositions': '2 options',
  '💡 Indice ÷1,5': '💡 Hint ÷1.5',
  ' ({n} restant)': ' ({n} left)',
  ' ({n} restants)': ' ({n} left)',
  'Réponse libre = points pleins · 4 props = ½ · 2 props = ¼ · indice = ÷1,5 (cumulables)':
    'Free answer = full points · 4 opts = ½ · 2 opts = ¼ · hint = ÷1.5 (stackable)',
  'À toi, {name} !': 'Your turn, {name}!',
  '🔥 RATTRAPAGE': '🔥 CATCH-UP',
  'Le plus rapide ! Qui a trouvé ?': 'Fastest finger! Who got it?',
  "Personne n'a trouvé": 'Nobody got it',
  '{name} a buzzé en {s} s': '{name} buzzed in {s} s',
  'Annuler le buzz': 'Cancel buzz',
  'Révéler la réponse': 'Reveal the answer',
  RÉPONSE: 'ANSWER',
  '✅ Réussi': '✅ Correct',
  '❌ Raté': '❌ Missed',
  'Signaler cette question': 'Report this question',
  'Qu’est-ce qui ne va pas ?': "What's wrong?",
  'Réponse fausse': 'Wrong answer',
  'Faute / orthographe': 'Typo / spelling',
  'Ambiguë ou obsolète': 'Ambiguous or outdated',
  'Bonne réponse !': 'Correct!',
  'Raté !': 'Missed!',
  '💡 Le sais-tu ?': '💡 Did you know?',
  '💡 {answer} — univers « {universe} »': '💡 {answer} — universe “{universe}”',
  '+{pts} pts pour {name}': '+{pts} pts for {name}',
  'base {n}': 'base {n}',
  ' + {n} vitesse': ' + {n} speed',
  'Le joueur': 'The player',
  '{name} boit {n} gorgée': '{name} drinks {n} sip',
  '{name} boit {n} gorgées': '{name} drinks {n} sips',
  '{name} distribue {n} gorgée': '{name} hands out {n} sip',
  '{name} distribue {n} gorgées': '{name} hands out {n} sips',
  CLASSEMENT: 'RANKING',
  'Voir les résultats': 'See results',
  'Question suivante': 'Next question',
  '↩︎ Corriger': '↩︎ Fix',
  '✓ Question signalée': '✓ Question reported',
  '⚠️ Signaler cette question': '⚠️ Report this question',
  '↩︎ Question précédente': '↩︎ Previous question',
  // Étapes marquantes (milestones)
  'Dernier tour !': 'Last lap!',
  'Il reste une question par personne.': 'One question left per person.',
  'Dernière question !': 'Last question!',
  'On est à la moitié !': "We're halfway!",
  '{n} question déjà passée.': '{n} question already done.',
  '{n} questions déjà passées.': '{n} questions already done.',
  Continuer: 'Continue',
  // Défi (challenge)
  'Défi !': 'Challenge!',
  '🎲 Retirer au sort': '🎲 Redraw',
  '↻ Réinitialiser le minuteur': '↻ Reset the timer',
  "C'est fait, on continue !": "Done, let's continue!",

  // --- La Bombe (BombeConfig / BombePlay) ---------------------------------
  '💣 La Bombe — élimination': '💣 The Bomb — elimination',
  'Un joueur au hasard commence. Réponds juste pour refiler la bombe au voisin de gauche. Erreur, propositions ou « passer » : la mèche raccourcit. Celui qui la tient quand elle explose est éliminé. Dernier survivant gagne !':
    'A random player starts. Answer right to pass the bomb to your left. A mistake, options or “skip”: the fuse gets shorter. Whoever holds it when it explodes is out. Last survivor wins!',
  'Un joueur au hasard démarre avec la bombe.': 'A random player starts with the bomb.',
  'Bonne réponse : tu passes la bombe à ton voisin. Erreur, propositions ou « passer » raccourcissent la mèche.':
    'Right answer: pass the bomb to your neighbor. A mistake, options or “skip” shorten the fuse.',
  "Quand la mèche explose, celui qui tient la bombe perd une vie (ou est éliminé s'il n'en a plus).":
    'When the fuse blows, whoever holds the bomb loses a life (or is out if they have none left).',
  'Le dernier survivant remporte la partie.': 'The last survivor wins the game.',
  '{n} question disponible avec ces filtres.': '{n} question available with these filters.',
  '{n} questions disponibles avec ces filtres.': '{n} questions available with these filters.',
  'Questions jamais vues par chaque joueur avec les thèmes et univers choisis.':
    'Questions never seen by each player with the chosen themes and universes.',
  'La bombe': 'The bomb',
  'Secondes par joueur ⏱': 'Seconds per player ⏱',
  'La mèche est tirée au hasard autour de cette valeur × le nombre de joueurs.':
    'The fuse is drawn at random around this value × the number of players.',
  '≈ {sec} s de mèche à {n} joueur au départ.': '≈ {sec} s of fuse with {n} player at the start.',
  '≈ {sec} s de mèche à {n} joueurs au départ.': '≈ {sec} s of fuse with {n} players at the start.',
  'Vies par joueur ❤️': 'Lives per player ❤️',
  "Nombre d'explosions encaissées avant d'être éliminé.": 'Number of explosions taken before being eliminated.',
  'Pénalités de temps': 'Time penalties',
  'Mauvaise réponse ❌': 'Wrong answer ❌',
  '4 propositions 🔎': '4 options 🔎',
  '2 propositions 🔍': '2 options 🔍',
  'Passer la question ⏭️': 'Skip the question ⏭️',
  Gorgées: 'Sips',
  'Chaque joueur éliminé boit une gorgée ou plus.': 'Each eliminated player drinks a sip or more.',
  'Allumer la mèche': 'Light the fuse',
  'Choisis au moins un thème et une difficulté avec des questions disponibles.':
    'Choose at least one theme and one difficulty with available questions.',
  'On amorce la bombe…': 'Arming the bomb…',
  '💣 {n} en lice': '💣 {n} still in',
  '⚠️ Ça va péter !': '⚠️ About to blow!',
  'La mèche brûle…': 'The fuse is burning…',
  "Blind test — le meneur lance l'extrait.": 'Blind test — the host plays the clip.',
  '⏭️ Passer  (−{n} s)': '⏭️ Skip  (−{n} s)',
  '4 props  −{n}s': '4 opts  −{n}s',
  '2 props  −{n}s': '2 opts  −{n}s',
  '❌ Raté  −{n}s': '❌ Missed  −{n}s',
  'BOOM ! {name} est éliminé': 'BOOM! {name} is eliminated',
  'BOOM ! {name} explose': 'BOOM! {name} blows up',
  'Il lui reste {n} vie ❤️': '{n} life left ❤️',
  'Il lui reste {n} vies ❤️': '{n} lives left ❤️',
  '🍻 {name} boit !': '🍻 {name} drinks!',
  'Encore {n} joueur en lice.': '{n} player still in.',
  'Encore {n} joueurs en lice.': '{n} players still in.',
  'Manche suivante 💣': 'Next round 💣',
  '{name} survit et gagne !': '{name} survives and wins!',
  'Le survivant': 'The survivor',
  'Résultats…': 'Results…',

  // --- Duel (DuelConfig / DuelPlay) ---------------------------------------
  '🔎 4 propositions': '🔎 4 options',
  'Révéler 4 propositions.': 'Reveal 4 options.',
  '🔍 2 propositions': '🔍 2 options',
  'Révéler 2 propositions.': 'Reveal 2 options.',
  "🆘 Aide d'un joueur": '🆘 Help from a player',
  "Demander l'aide d'un autre joueur.": 'Ask another player for help.',
  '🔄 Autre univers': '🔄 Another universe',
  "Obtenir une question d'un autre univers.": 'Get a question from another universe.',
  '⚔️ Duel — élimination': '⚔️ Duel — elimination',
  'Chacun son tour, sur les univers choisis. La difficulté monte pour chaque joueur : 3 faciles, 3 moyennes, 2 dures, puis tout le reste en pro. Une mauvaise réponse élimine. Dernier debout gagne !':
    'Take turns, on the chosen universes. Difficulty rises for each player: 3 easy, 3 medium, 2 hard, then all the rest in pro. A wrong answer eliminates. Last one standing wins!',
  'Chacun son tour, sur les univers choisis pour le duel.': 'Take turns, on the universes chosen for the duel.',
  'La difficulté monte : 3 faciles, 3 moyennes, 2 dures, puis tout le reste en pro.':
    'Difficulty rises: 3 easy, 3 medium, 2 hard, then all the rest in pro.',
  'Une mauvaise réponse élimine le joueur. Utilise tes jokers au bon moment.':
    'A wrong answer eliminates the player. Use your jokers at the right moment.',
  'Le dernier joueur encore en lice remporte le duel.': 'The last player still in wins the duel.',
  'Univers du duel': 'Duel universes',
  Manuel: 'Manual',
  Tous: 'All',
  Profils: 'Profiles',
  "🎲 Tous les univers du jeu — {n} au total. Le duel puise ses questions dans l'ensemble.":
    "🎲 All the game's universes — {n} in total. The duel draws its questions from all of them.",
  "🎲 {n} univers — tous ceux qu'au moins un joueur n'a pas exclus dans son profil.":
    "🎲 {n} universes — all those at least one player hasn't excluded in their profile.",
  'Aucun univers disponible : les joueurs ont tout exclu dans leur profil.':
    'No universes available: the players have excluded everything in their profiles.',
  '{n} univers choisi': '{n} universe chosen',
  '{n} univers choisis': '{n} universes chosen',
  'Questions jamais vues par chaque joueur avec les univers du duel.':
    'Questions never seen by each player with the duel universes.',
  'Jokers — un de chaque par joueur': 'Jokers — one of each per player',
  'Mode alcool': 'Drinking mode',
  '🍺 Gorgées': '🍺 Sips',
  'Le joueur éliminé boit ; sans-faute sur une dure, tu distribues.':
    'The eliminated player drinks; a clean answer on a hard one lets you hand out sips.',
  'Lancer le duel': 'Start the duel',
  'Il faut au moins 2 joueurs pour un duel.': 'You need at least 2 players for a duel.',
  'Choisis au moins un univers.': 'Choose at least one universe.',
  'Quitter le duel ?': 'Quit the duel?',
  'La partie en cours sera perdue.': 'The current game will be lost.',
  'Préparation du duel…': 'Preparing the duel…',
  '⚔️ {n} en jeu': '⚔️ {n} in play',
  'CHANGEMENT DE DIFFICULTÉ': 'DIFFICULTY CHANGE',
  '🔎 4 props': '🔎 4 opts',
  '🔍 2 props': '🔍 2 opts',
  '🆘 Aide joueur': '🆘 Player help',
  'JOKERS DE {name}': 'JOKERS OF {name}',
  "🆘 {name} a demandé l'aide d'un autre joueur !": '🆘 {name} asked another player for help!',
  '{name} reste en jeu !': '{name} stays in!',
  '{name} est éliminé !': '{name} is eliminated!',
  'ENCORE EN LICE ({n})': 'STILL IN ({n})',

  // --- Duel Ultime (DuelUltimeConfig / DuelUltimePlay) --------------------
  '🥊 Duel Ultime': '🥊 Ultimate Duel',
  'Chaque joueur choisit un ou plusieurs univers et affronte {n} questions pro dessus,':
    'Each player picks one or more universes and faces {n} pro questions on them,',
  ' sans propositions': ' no options',
  " : on révèle la réponse, tu dis si tu l'avais. Priorité aux questions jamais vues. Le meilleur score gagne — jouable en solo.":
    ': the answer is revealed, you say if you had it. Priority to never-seen questions. Best score wins — playable solo.',
  'Chaque joueur choisit un ou plusieurs univers et affronte N questions pro dessus.':
    'Each player picks one or more universes and faces N pro questions on them.',
  "Aucune proposition : on révèle la réponse, tu dis honnêtement si tu l'avais.":
    'No options: the answer is revealed, you honestly say if you had it.',
  'Priorité aux questions jamais vues par le joueur.': "Priority to questions the player has never seen.",
  "Le meilleur score l'emporte — parfait aussi en solo pour se tester.":
    'Best score wins — also perfect solo to test yourself.',
  Aucun: 'None',
  'Univers au hasard': 'Random universes',
  '🎲 Univers par joueur': '🎲 Universes per player',
  "Tire au sort ce nombre d'univers pour chaque joueur, parmi ceux qu'il n'évite pas dans son profil.":
    "Randomly draw this many universes for each player, from those they don't avoid in their profile.",
  'Tirer {n} univers pour chaque joueur': 'Draw {n} universes for each player',
  'Univers de chaque joueur (un ou plusieurs)': "Each player's universes (one or more)",
  '🎯 {list}': '🎯 {list}',
  'Univers à choisir…': 'Universe(s) to choose…',
  'EN COURS': 'EDITING',
  '{name} : {u} univers · {pro} questions pro dispo': '{name}: {u} universes · {pro} pro questions available',
  '{n} inédite': '{n} unseen',
  '{n} inédites': '{n} unseen',
  ' (moins que {n})': ' (fewer than {n})',
  'Touche pour ajouter/retirer.': 'Tap to add/remove.',
  'Choisis un ou plusieurs univers pour {name}.': 'Choose one or more universes for {name}.',
  'Lancer le Duel Ultime': 'Start the Ultimate Duel',
  'Chaque joueur doit choisir au moins un univers.': 'Each player must choose at least one universe.',
  'PASSE LE TÉLÉPHONE': 'PASS THE PHONE',
  '🎯 {total} questions pro sur {list}': '🎯 {total} pro questions on {list}',
  "C'est parti": "Let's go",
  'Réfléchis (ou dis ta réponse à voix haute), puis révèle la bonne réponse.':
    'Think (or say your answer out loud), then reveal the correct answer.',
  'Voir la réponse': 'See the answer',
  "Tu l'avais ?": 'Did you have it?',
  '✅ Trouvé': '✅ Got it',
  '{name} : {score} bonne sur {done}': '{name}: {score} right out of {done}',
  '{name} : {score} bonnes sur {done}': '{name}: {score} right out of {done}',
  Tu: 'You',
  '{name} bois {n} gorgée': '{name}, drink {n} sip',
  '{name} bois {n} gorgées': '{name}, drink {n} sips',

  // --- L'Imposteur (ImposteurConfig / ImposteurPlay) ----------------------
  "🕵️ L'Imposteur": '🕵️ The Impostor',
  "Un mot secret est tiré d'un univers et montré à tous… sauf à l'imposteur, qui ne voit que la catégorie. Chacun donne un indice, l'imposteur bluffe, puis on vote.":
    'A secret word is drawn from a universe and shown to everyone… except the impostor, who only sees the category. Each gives a clue, the impostor bluffs, then everyone votes.',
  "On se passe le téléphone : chacun découvre le mot secret — sauf l'imposteur.":
    'Pass the phone around: everyone discovers the secret word — except the impostor.',
  'À tour de rôle, chacun dit UN indice sur le mot, ni trop clair ni trop vague.':
    'In turn, each says ONE clue about the word, neither too clear nor too vague.',
  "L'imposteur ne connaît que l'univers : il doit bluffer un indice crédible.":
    'The impostor only knows the universe: they must bluff a believable clue.',
  "On vote pour le suspect. Démasqué, l'imposteur peut voler la manche en devinant le mot.":
    'Vote for the suspect. If unmasked, the impostor can steal the round by guessing the word.',
  "Équipage gagnant : l'imposteur boit. Imposteur gagnant : tout le monde boit.":
    'Crew wins: the impostor drinks. Impostor wins: everyone drinks.',
  'Univers des mots secrets': 'Secret-word universes',
  'Gardés par tous': 'Kept by all',
  'Je choisis': 'I choose',
  "Seuls les univers qu'AUCUN joueur n'a écartés dans son profil peuvent tomber.":
    'Only universes that NO player has excluded in their profile can come up.',
  '{n} univers': '{n} universes',
  '{n} mot': '{n} word',
  '{n} mots': '{n} words',
  " Personne n'a d'univers commun : passe en « Je choisis ».": ' No one has a common universe: switch to “I choose”.',
  'Touche les univers qui pourront tomber.': 'Tap the universes that can come up.',
  '{n} sélectionné': '{n} selected',
  '{n} sélectionnés': '{n} selected',
  Manches: 'Rounds',
  'Imposteurs par manche': 'Impostors per round',
  '1 imposteur': '1 impostor',
  '2 imposteurs': '2 impostors',
  "Indice de l'imposteur": "Impostor's hint",
  'Sans mot': 'No word',
  'Mot proche': 'Close word',
  "L'imposteur reçoit un mot proche (même univers) présenté comme le vrai : il ne sait même pas qu'il est l'imposteur. Le décalage se révèle à la fin.":
    "The impostor gets a close word (same universe) shown as the real one: they don't even know they're the impostor. The mismatch is revealed at the end.",
  "L'imposteur ne voit que l'univers : à lui de bluffer à l'aveugle.":
    'The impostor only sees the universe: they must bluff blind.',
  'Minuteur de discussion': 'Discussion timer',
  "Lancer L'Imposteur": 'Start The Impostor',
  'Il faut au moins 3 joueurs.': 'You need at least 3 players.',
  'Aucun univers disponible avec ce choix.': 'No universes available with this choice.',
  'Préparation de la partie…': 'Preparing the game…',
  '🕵️ Manche {n}/{total}': '🕵️ Round {n}/{total}',
  '{name}, à toi': '{name}, your turn',
  "Toi seul(e) regardes l'écran, puis tu passes au suivant.":
    'Only you look at the screen, then pass to the next person.',
  'Voir mon rôle': 'See my role',
  UNIVERS: 'UNIVERSE',
  "🤫 Tu es l'imposteur": "🤫 You're the impostor",
  "Tu ne connais pas le mot. Écoute, adapte-toi et donne un indice crédible pour ne pas te faire griller !":
    "You don't know the word. Listen, adapt and give a believable clue so you don't get caught!",
  'MOT SECRET': 'SECRET WORD',
  "Donne un indice à voix haute : assez précis pour prouver que tu sais, assez vague pour ne pas aider l'imposteur.":
    "Give a clue out loud: precise enough to prove you know, vague enough not to help the impostor.",
  "J'ai vu 👍": 'Seen it 👍',
  'Chacun son tour, donnez un indice sur le mot. Repérez celui qui bluffe…':
    "In turn, give a clue about the word. Spot the one who's bluffing…",
  'Passer au vote': 'Move to the vote',
  "Qui est l'imposteur ?": "Who's the impostor?",
  'Débattez, puis touchez le joueur désigné par le groupe.': 'Debate, then tap the player the group points to.',
  'Le suspect': 'The suspect',
  "{name} était bien l'imposteur !": '{name} really was the impostor!',
  "Dernière chance : l'imposteur annonce le mot à voix haute. A-t-il trouvé ?":
    'Last chance: the impostor says the word out loud. Did they get it?',
  'LE MOT ÉTAIT': 'THE WORD WAS',
  '❌ Non — équipage gagne': '❌ No — crew wins',
  '✅ Oui — il vole tout': '✅ Yes — they steal it all',
  "L'équipage gagne !": 'The crew wins!',
  "L'imposteur s'en sort !": 'The impostor gets away!',
  Imposteur: 'Impostor',
  Imposteurs: 'Impostors',
  'Le mot était « {word} » · {universe}': 'The word was “{word}” · {universe}',
  'Démasqué mais il a deviné le mot : il rafle la mise.':
    'Unmasked but guessed the word: they take it all.',
  '🍺 {names} : {n} gorgée': '🍺 {names}: {n} sip',
  '🍺 {names} : {n} gorgées': '🍺 {names}: {n} sips',
  'Manche suivante': 'Next round',

  // --- Hauts faits : paliers + pistes (achievements.ts, à l'affichage) -----
  Bronze: 'Bronze',
  Argent: 'Silver',
  Or: 'Gold',
  Platine: 'Platinum',
  Diamant: 'Diamond',
  Légende: 'Legend',
  Mythe: 'Myth',
  Cosmique: 'Cosmic',
  Infini: 'Infinite',
  Fêtard: 'Partygoer',
  Vainqueur: 'Winner',
  'Habitué des soirées': 'Party regular',
  Curieux: 'Curious',
  Érudit: 'Scholar',
  Cerveau: 'Brainiac',
  Expert: 'Expert',
  Puriste: 'Purist',
  Éclair: 'Lightning',
  'Touche-à-tout': 'Jack of all trades',
  'Bonne descente': 'Heavy drinker',
  Généreux: 'Generous',
  'Roi du Quiz': 'Quiz King',
  Démineur: 'Bomb defuser',
  Duelliste: 'Duelist',
  'Maître ultime': 'Ultimate master',
  'Maître du bluff': 'Master bluffer',
  'Parties jouées': 'Games played',
  'Parties gagnées': 'Games won',
  'Soirées différentes': 'Different nights',
  'Questions répondues': 'Questions answered',
  'Bonnes réponses': 'Right answers',
  'Bonnes réponses difficiles': 'Right hard answers',
  'Bonnes réponses pro': 'Right pro answers',
  'Bonnes réponses sans indice': 'Right answers without a hint',
  'Bonnes réponses en moins de 3 s': 'Right answers under 3 s',
  'Thèmes explorés': 'Themes explored',
  'Gorgées bues': 'Sips drunk',
  'Gorgées offertes': 'Sips given',
  'Quiz gagnés': 'Quizzes won',
  'Bombes gagnées': 'Bombs won',
  'Duels gagnés': 'Duels won',
  'Duels Ultimes gagnés': 'Ultimate Duels won',
  'Parties Imposteur gagnées': 'Impostor games won',
  parties: 'games',
  victoires: 'wins',
  soirées: 'nights',
  bonnes: 'right',
  dures: 'hard',
  'sans indice': 'no hint',
  éclair: 'flash',
  thèmes: 'themes',
  gorgées: 'sips',
  offertes: 'given',
  bombes: 'bombs',
  duels: 'duels',
  ultimes: 'ultimate',
  imposteur: 'impostor',

  // --- Titres rigolos (stats.ts, superlatifs, traduits à l'exécution) ------
  "L'éponge": 'The sponge',
  'Le barman': 'The bartender',
  'Le boss': 'The boss',
  'Le cerveau': 'The brain',
  'Le boulet': 'The klutz',
  "L'éclair": 'The lightning',
  "L'assisté": 'The helped one',
  'Le pilier': 'The pillar',
  'La comète': 'The comet',
  'Le stratège': 'The strategist',
  'Le marathonien': 'The marathoner',
  "L'encyclopédie": 'The encyclopedia',
  'Le podium ambulant': 'The walking podium',
  'Le sobre': 'The sober one',
  'A bu le plus de gorgées': 'Drank the most sips',
  'A distribué le plus de gorgées': 'Handed out the most sips',
  'A gagné le plus de parties': 'Won the most games',
  'Meilleur taux de bonnes réponses': 'Best accuracy',
  'A donné le plus de mauvaises réponses': 'Gave the most wrong answers',
  'Réponse la plus rapide en moyenne': 'Fastest answer on average',
  "A utilisé le plus d'indices": 'Used the most hints',
  'A joué le plus de parties': 'Played the most games',
  'Meilleur score en une partie': 'Best score in one game',
  'Meilleur classement moyen': 'Best average rank',
  'A répondu au plus de questions': 'Answered the most questions',
  'Le plus de bonnes réponses': 'The most right answers',
  'Le plus de podiums (top 3)': 'The most podiums (top 3)',
  'A le moins bu (parmi les habitués)': 'Drank the least (among regulars)',
  '{n} gorgées': '{n} sips',
  '{n} victoires': '{n} wins',
  '{n} %': '{n}%',
  '{n} ratés': '{n} misses',
  '{n} indices': '{n} hints',
  '{n} parties': '{n} games',
  'rang moyen {n}': 'avg rank {n}',
  '{n} bonnes': '{n} right',

  // --- Carte de piste de hauts faits (AchievementTrackCard) ---------------
  '🔒 à débloquer': '🔒 to unlock',
  '✨ Nouveau palier cette partie !': '✨ New tier this game!',
  '✨ Nouveaux paliers ×{n} cette partie !': '✨ New tiers ×{n} this game!',
  ' · prochain palier à {n}': ' · next tier at {n}',
  ' · palier max atteint 👑': ' · max tier reached 👑',

  // --- Profil du joueur (PlayerProfileScreen) -----------------------------
  Profil: 'Profile',
  'Joueur introuvable': 'Player not found',
  '{n} partie': '{n} game',
  '{n} palier': '{n} tier',
  '{n} paliers': '{n} tiers',
  '🔒 Hauts faits verrouillés': '🔒 Achievements locked',
  'Débloque tous les hauts faits, leurs paliers et le classement dans la Boutique — 1,99 €.':
    'Unlock all achievements, their tiers and the leaderboard in the Shop — €1.99.',
  'Voir la Boutique': 'See the Shop',
  '⭐ Points de hauts faits': '⭐ Achievement points',
  '{score} / {max} points possibles': '{score} / {max} possible points',

  // --- Statistiques (StatsScreen) -----------------------------------------
  Soir: 'Tonight',
  Mois: 'Month',
  Année: 'Year',
  Total: 'Total',
  Classement: 'Ranking',
  Titres: 'Titles',
  'Aucune partie sur cette période.': 'No games in this period.',
  ' · appuie pour les membres': ' · tap for members',
  'Composition inconnue': 'Unknown lineup',
  'Pas encore de titres sur cette période.': 'No titles yet in this period.',
  'Le classement et les paliers sont dans la Boutique — 1,99 €. Touche pour débloquer.':
    'The leaderboard and tiers are in the Shop — €1.99. Tap to unlock.',
  'Pas encore de hauts faits débloqués.': 'No achievements unlocked yet.',
  'Classement à vie (toutes périodes). Chaque palier rapporte des points ; touche un joueur pour ses badges.':
    'Lifetime ranking (all periods). Each tier earns points; tap a player for their badges.',
  'appuie pour le profil': 'tap for the profile',
  'Pas de réponses sur cette période.': 'No answers in this period.',
  'Le palmarès de vos soirées': 'Your party hall of fame',
  '🔒 Stats du soir uniquement': "🔒 Tonight's stats only",
  "Débloque le mois, l'année et le total dans la Boutique — 1,99 €.":
    'Unlock month, year and total in the Shop — €1.99.',
  'Pas encore de stats': 'No stats yet',
  'Jouez une partie et revenez admirer le palmarès !': 'Play a game and come back to admire the hall of fame!',
  'Thème favori : {theme}': 'Favorite theme: {theme}',

  // --- Questions signalées (ReportedQuestionsScreen) ----------------------
  Autre: 'Other',
  'Supprimer tous les signalements ?': 'Delete all reports?',
  Effacer: 'Erase',
  'À relire et corriger dans la banque': 'To review and fix in the bank',
  'Aucun signalement': 'No reports',
  'Les questions signalées en jeu apparaîtront ici.': 'Questions reported in-game will appear here.',
  'Réponse : {answer}': 'Answer: {answer}',

  // --- Vérifier les images (ImageCheckScreen) -----------------------------
  '{n} questions à image': '{n} image questions',
  Chargées: 'Loaded',
  Cassées: 'Broken',
  'En cours': 'Loading',
  "Laisse l'écran ouvert quelques secondes le temps que tout se charge. Une connexion est requise.":
    'Leave the screen open a few seconds while everything loads. A connection is required.',
  Tout: 'All',
  'Cassées ({n})': 'Broken ({n})',
  'Partager la liste des cassées': 'Share the broken list',
  'Images cassées': 'Broken images',
  'Toutes les images': 'All images',
  'Aucune image cassée détectée 🎉': 'No broken image detected 🎉',
  'Aucune question à image.': 'No image questions.',
  'ne charge pas': 'not loading',
  'chargement…': 'loading…',
  'Images cassées ({n}) :': 'Broken images ({n}):',

  // --- Profil à distance (RemoteProfileScreen) ----------------------------
  "Accès à l'appareil photo refusé. Autorise-le dans les réglages.":
    'Camera access denied. Allow it in settings.',
  '{name} mis à jour !': '{name} updated!',
  '{name} ajouté !': '{name} added!',
  'Limite de {n} profils atteinte. Débloque les profils illimités dans la Boutique.':
    'Profile limit of {n} reached. Unlock unlimited profiles in the Shop.',
  'QR non reconnu. Assure-toi que c’est bien un profil Cancellable.':
    "QR not recognized. Make sure it's really a Cancellable profile.",
  '{n} univers évité': '{n} avoided universe',
  '{n} univers évités': '{n} avoided universes',
  'Aucun univers évité': 'No avoided universe',
  'Profil existant': 'Existing profile',
  'Un profil du même nom existe déjà.': 'A profile with the same name already exists.',
  'Créer un nouveau': 'Create a new one',
  'Mettre à jour': 'Update',
  'Ajouter ce joueur ?': 'Add this player?',
  "Vise le QR code du profil de l'invité": "Aim at the guest's profile QR code",
  'Profil à distance': 'Remote profile',
  'URL du formulaire non configurée': 'Form URL not configured',
  "Hébergez le dossier `webform/` puis renseignez son adresse dans `REMOTE_PROFILE_URL` (src/config.ts) pour afficher les QR d'accès.":
    'Host the `webform/` folder then set its address in `REMOTE_PROFILE_URL` (src/config.ts) to show the access QR codes.',
  '📲 Chacun édite son profil, sans se passer le tel': '📲 Everyone edits their profile, no phone-passing',
  'Deux sortes de QR : un pour ': 'Two kinds of QR: one to ',
  créer: 'create',
  ' un nouveau profil, et un ': ' a new profile, and one ',
  'par joueur': 'per player',
  " pour mettre à jour le sien (avatar et univers évités déjà pré-cochés). L'invité scanne, ajuste dans son navigateur, puis te montre son QR retour que tu scannes ici. Rien ne passe par Internet.":
    ' to update theirs (avatar and avoided universes already pre-checked). The guest scans, adjusts in their browser, then shows you their return QR which you scan here. Nothing goes through the Internet.',
  '➕ CRÉER UN NOUVEAU PROFIL': '➕ CREATE A NEW PROFILE',
  'Un invité scanne ce QR pour créer son profil de zéro.':
    'A guest scans this QR to create their profile from scratch.',
  'Scanner un profil': 'Scan a profile',
  "Quand un invité a fini, scanne le QR qu'il affiche (création ou mise à jour).":
    'When a guest is done, scan the QR they show (create or update).',
  '✏️ METTRE À JOUR UN JOUEUR': '✏️ UPDATE A PLAYER',
  "Aucun joueur pour l'instant. Crée-en d'abord (QR ci-dessus, ou écran Joueurs).":
    'No players yet. Create one first (QR above, or Players screen).',
  "Touche un joueur pour afficher SON QR : son profil s'ouvrira déjà rempli.":
    'Tap a player to show THEIR QR: their profile will open pre-filled.',
  'REÇUS CETTE SESSION ({n})': 'RECEIVED THIS SESSION ({n})',
  '{n} univers exclus': '{n} excluded universes',
  'Tous les univers gardés': 'All universes kept',
  ' · mis à jour': ' · updated',
  ' · nouveau': ' · new',
  "{name} scanne ce QR : son profil s'ouvre déjà rempli. Il ajuste puis te montre son QR retour, que tu scannes ici. (Tu peux aussi lui envoyer une capture.)":
    '{name} scans this QR: their profile opens pre-filled. They adjust then show you their return QR, which you scan here. (You can also send them a screenshot.)',

  // --- Mon contenu (CustomContentScreen) ----------------------------------
  'Ajoute tes propres questions et défis': 'Add your own questions and challenges',
  'Nouvelle question': 'New question',
  THÈME: 'THEME',
  'Univers (optionnel, ex. Naruto)': 'Universe (optional, e.g. Naruto)',
  'Bonne réponse': 'Correct answer',
  'MAUVAISES RÉPONSES (pour le QCM)': 'WRONG ANSWERS (for multiple choice)',
  'Proposition 1': 'Option 1',
  'Proposition 2': 'Option 2',
  'Proposition 3': 'Option 3',
  'Indice (optionnel)': 'Hint (optional)',
  'Ajouter la question': 'Add the question',
  'Mes questions ({n})': 'My questions ({n})',
  "Aucune question perso pour l'instant.": 'No custom questions yet.',
  'Supprimer cette question ?': 'Delete this question?',
  'Nouveau défi 🍻': 'New challenge 🍻',
  "Ex. : Tout le monde boit de la main gauche jusqu'au prochain défi.":
    'E.g.: Everyone drinks with their left hand until the next challenge.',
  'Ajouter le défi': 'Add the challenge',
  'Mes défis ({n})': 'My challenges ({n})',
  "Aucun défi perso pour l'instant.": 'No custom challenges yet.',
  'Supprimer ce défi ?': 'Delete this challenge?',

  // --- Statistiques de l'app (AppStatsScreen / Settings) -------------------
  "Statistiques de l'app": 'App statistics',
  'Contenu, traduction et totaux': 'Content, translation and totals',
  univers: 'universes',
  'Répartition par difficulté': 'Difficulty breakdown',
  'Traduction anglaise': 'English translation',
  '{done} / {total} questions': '{done} / {total} questions',
  "Les énoncés non traduits restent affichés en français : l'app est toujours jouable, la couverture se complète par lots.":
    'Untranslated prompts stay in French: the app is always playable, and coverage fills in batch by batch.',
  'Par thème': 'By theme',
  'Vos parties': 'Your games',
  profils: 'profiles',
  réponses: 'answers',
  'points cumulés': 'total points',
  "Voir les statistiques de l'app": 'View app statistics',
  "L'état de la banque de questions (nombre, univers, difficultés), l'avancée de la traduction anglaise et vos totaux de parties.":
    'The state of the question bank (count, universes, difficulties), the progress of the English translation, and your game totals.',

  // --- Date relative + dernière partie (relativeTime / PlayersScreen) ------
  "aujourd'hui": 'today',
  hier: 'yesterday',
  'il y a {n} j': '{n}d ago',
  'il y a {n} sem.': '{n}w ago',
  'il y a {n} mois': '{n}mo ago',
  'il y a {n} an': '{n}y ago',
  'il y a {n} ans': '{n}y ago',
  '🕹️ Dernière partie : {when}': '🕹️ Last game: {when}',
  '🕹️ Jamais joué': '🕹️ Never played',

  // --- Découvrabilité des univers (QuizConfig) ------------------------------
  'Rechercher un univers…': 'Search for a universe…',
  'Tout activer': 'Enable all',
  'Tout désactiver': 'Disable all',
  'Appui long sur un univers pour le mettre en favori ★.': 'Long-press a universe to favorite it ★.',
  FAVORIS: 'FAVORITES',
  'RÉCEMMENT JOUÉS': 'RECENTLY PLAYED',
  'Aucun univers ne correspond à la recherche.': 'No universe matches your search.',

  // --- Défi du jour (DailyChallengeScreen / Home) ---------------------------
  'Défi du jour': 'Daily challenge',
  'Défi du jour · 🔥 {n}': 'Daily challenge · 🔥 {n}',
  'Chargement…': 'Loading…',
  'Série : {n}': 'Streak: {n}',
  '🔥 Série : {n}': '🔥 Streak: {n}',
  'Meilleure série : {n}': 'Best streak: {n}',
  '{n} questions, un défi par jour': '{n} questions, one challenge a day',
  'Le même défi pour tout le monde aujourd’hui. Reviens chaque jour pour allonger ta série.':
    'The same challenge for everyone today. Come back each day to grow your streak.',
  '✅ Terminé aujourd’hui — {score}/{total}': '✅ Done today — {score}/{total}',
  'Commencer le défi': 'Start the challenge',
  'Rejouer (hors série)': 'Play again (no streak)',
  'Aucune question disponible.': 'No questions available.',
  'Question {i}/{n}': 'Question {i}/{n}',
  'Score : {n}': 'Score: {n}',
  'Voir le score': 'See score',
  '{pct}% de bonnes réponses': '{pct}% correct',
  // Défi entre amis (codes partagés)
  'Défi partagé': 'Shared challenge',
  'CODE DU DÉFI': 'CHALLENGE CODE',
  '{n} questions, exactement les mêmes pour ton ami': '{n} questions, the exact same for your friend',
  'Comparez vos scores ! (ce défi ne compte pas pour ta série)':
    'Compare your scores! (this challenge does not count toward your streak)',
  'Partager ce défi': 'Share this challenge',
  'Défi entre amis': 'Challenge a friend',
  'Crée un code et partage-le : ton ami jouera exactement les mêmes questions.':
    'Create a code and share it: your friend plays the exact same questions.',
  'Créer un défi à partager': 'Create a challenge to share',
  'Entrer un code reçu': 'Enter a code you received',
  'Défier un ami': 'Challenge a friend',
  'Je fais {score}/{total} sur ce défi Cancellable ! Bats-moi avec le code {code} 🎯':
    'I scored {score}/{total} on this Cancellable challenge! Beat me with code {code} 🎯',
  'Défi Cancellable ! Rejoue exactement mes questions avec le code {code} 🎯':
    'Cancellable challenge! Replay my exact questions with code {code} 🎯',
  Suivant: 'Next',
  Retour: 'Back',

  // --- Lecture vocale (Réglages) --------------------------------------------
  'Lecture vocale 🔊': 'Read aloud 🔊',
  "Lire l'énoncé des questions à voix haute (utile en soirée).": 'Read questions aloud (handy at parties).',

  // --- Rappel quotidien (Réglages) ------------------------------------------
  'Rappel quotidien 🔔': 'Daily reminder 🔔',
  'Une notification à 19h pour ne pas perdre ta série.': 'A 7pm notification so you keep your streak.',
  'Défi du jour Cancellable': 'Cancellable daily challenge',
  'Ton défi du jour t’attend — garde ta série ! 🔥': 'Your daily challenge is ready — keep your streak! 🔥',
  'Notifications refusées': 'Notifications denied',
  'Autorise les notifications pour recevoir le rappel.': 'Allow notifications to receive the reminder.',

  // --- Thème clair / sombre (Réglages) --------------------------------------
  // (« Thème » est déjà traduit plus haut.)
  "Thème de l'application": 'App theme',
  Sombre: 'Dark',
  Clair: 'Light',
  'Le thème sombre est idéal en soirée. Le changement redémarre l’application.':
    'Dark theme is best for parties. Changing it restarts the app.',
  'Thème enregistré': 'Theme saved',
  "Redémarre l'application pour appliquer le nouveau thème.": 'Restart the app to apply the new theme.',

  // --- Effets sonores (Réglages) --------------------------------------------
  'Effets sonores 🎶': 'Sound effects 🎶',
  'Petits sons de jeu (bonne/mauvaise réponse, compte à rebours, victoire).':
    'Little game sounds (right/wrong answer, countdown, victory).',

  // --- Tu préfères ? (mode) -------------------------------------------------
  'Tu préfères ?': 'Would you rather?',
  '🤔 Tu préfères ?': '🤔 Would you rather?',
  'Un dilemme, deux options. Chacun vote en secret, on révèle le partage — et un camp trinque.':
    'One dilemma, two options. Everyone votes in secret, the split is revealed — and one side drinks.',
  'Un dilemme, deux options, aucune bonne réponse. Chacun vote en secret, on révèle le partage — et le camp minoritaire trinque. Débats garantis.':
    'One dilemma, two options, no right answer. Everyone votes in secret, the split is revealed — and the minority drinks. Debates guaranteed.',
  'On se passe le téléphone : chacun vote A ou B en secret, puis passe au suivant.':
    'Pass the phone around: everyone votes A or B in secret, then hands it on.',
  'Une fois tout le monde a voté, on révèle le partage des voix.':
    'Once everyone has voted, the vote split is revealed.',
  'Par défaut, la minorité (les originaux !) boit, et la majorité marque un point.':
    'By default the minority (the originals!) drinks, and the majority scores a point.',
  'Égalité parfaite ? Tout le monde trinque 🥂.': 'Perfect tie? Everyone drinks 🥂.',
  'Qui boit ?': 'Who drinks?',
  'La minorité': 'The minority',
  'La majorité': 'The majority',
  'Le petit camp assume ses goûts… et boit 😏.': 'The small camp owns its taste… and drinks 😏.',
  'Le grand camp boit : les moutons trinquent !': 'The big camp drinks: the sheep pay up!',
  'Lancer Tu préfères': 'Start Would You Rather',
  'Il faut au moins 2 joueurs.': 'You need at least 2 players.',
  '🤔 Manche {n}/{total}': '🤔 Round {n}/{total}',
  'Toi seul(e) votes, puis tu passes au suivant.': 'Only you vote, then pass to the next player.',
  'Voter en secret': 'Vote in secret',
  'TU PRÉFÈRES…': 'WOULD YOU RATHER…',
  '— ou —': '— or —',
  RÉSULTAT: 'RESULT',
  '{pct}% ont préféré A': '{pct}% chose A',
  '🥂 Égalité — tout le monde trinque !': '🥂 Tie — everyone drinks!',
  'Le camp minoritaire boit.': 'The minority side drinks.',
  'Le camp majoritaire boit.': 'The majority side drinks.',

  // --- Qui est le plus susceptible… ? (mode) --------------------------------
  'Qui de nous… ?': 'Which of us… ?',
  '🙋 Qui est le plus susceptible… ?': '🙋 Who is most likely to… ?',
  'Une affirmation, tout le monde désigne un joueur en secret. Le plus pointé du doigt trinque.':
    'One statement, everyone secretly points at a player. The most pointed-at drinks.',
  'Une affirmation, tout le monde désigne un joueur en secret. Le plus pointé du doigt trinque et devient la vedette de la manche. Fous rires garantis.':
    'One statement, everyone secretly points at a player. The most pointed-at drinks and becomes the round’s star. Belly laughs guaranteed.',
  'On se passe le téléphone : chacun désigne en secret le joueur qui colle le mieux, puis passe au suivant.':
    'Pass the phone: everyone secretly points at the player who fits best, then hands it on.',
  'Une fois tout le monde a voté, on révèle le décompte des doigts pointés.':
    'Once everyone has voted, the tally of pointed fingers is revealed.',
  'Le plus désigné boit autant de gorgées que de votes reçus — et devient la vedette de la manche.':
    'The most-picked drinks as many sips as votes received — and becomes the round’s star.',
  'Classement final : la plus grosse vedette de la soirée 🌟.':
    'Final ranking: the biggest star of the night 🌟.',
  'Lancer Qui est le plus susceptible': 'Start Most Likely To',
  '🙋 Manche {n}/{total}': '🙋 Round {n}/{total}',
  'QUI EST LE PLUS SUSCEPTIBLE…': 'WHO IS MOST LIKELY TO…',
  '🌟 Ex æquo : {names}': '🌟 Tied: {names}',
  '🌟 {names}': '🌟 {names}',
  '{n} doigts pointés': '{n} fingers pointed',
  '{n} doigt pointé': '{n} finger pointed',
  DÉCOMPTE: 'TALLY',
  'VEDETTES DE LA SOIRÉE': 'STARS OF THE NIGHT',

  // --- Roue des gages & mode sans alcool ------------------------------------
  'Roue des gages': 'Dares wheel',
  '🎡 Roue des gages': '🎡 Dares wheel',
  'Un gage au hasard, quand vous voulez — pas besoin de lancer une partie.':
    'A random dare, whenever you want — no need to start a game.',
  'Sans alcool': 'Alcohol-free',
  Alcool: 'Alcohol',
  'Appuie sur « Tourner la roue » 👇': 'Tap “Spin the wheel” 👇',
  'Tourner la roue': 'Spin the wheel',
  'Tourner encore': 'Spin again',
  Soirée: 'Party',
  'Sans alcool 🚫🍺': 'Alcohol-free 🚫🍺',
  'Les nouveaux modes démarrent sans gorgées et la Roue s’ouvre sur les gages soft.':
    'New modes start without sips and the Wheel opens on soft dares.',

  // --- Culture ou gage (mode) -----------------------------------------------
  'Culture ou gage': 'Trivia or dare',
  '🎲 Culture ou gage': '🎲 Trivia or dare',
  'Une question éclair à ton tour. Tu sais ? +1 point. Tu sèches ? Tu piges un gage.':
    'A flash question on your turn. Know it? +1 point. Stumped? Draw a dare.',
  "Une question éclair à ton tour : bonne réponse, +1 point ; mauvaise réponse, tu piges un gage (et des gorgées si tu veux). Le quiz qui pimente la soirée.":
    'A flash question on your turn: right answer, +1 point; wrong answer, draw a dare (and sips if you like). The quiz that spices up the party.',
  'Le téléphone tourne : à ton tour, tu as une question à choix multiple.':
    'The phone goes around: on your turn you get a multiple-choice question.',
  'Bonne réponse : +1 point, tu passes tranquille.': 'Right answer: +1 point, you’re safe.',
  'Mauvaise réponse : tu piges un gage à faire (et des gorgées si le mode alcool est activé).':
    'Wrong answer: draw a dare to do (and sips if alcohol mode is on).',
  'Chacun a le même nombre de questions ; le plus cultivé gagne 🧠.':
    'Everyone gets the same number of questions; the most knowledgeable wins 🧠.',
  // (« Questions par joueur » est déjà traduit plus haut.)
  'Le gage à faire est toujours « soft » (physique/fun) ; les gorgées s’ajoutent si le mode alcool est activé.':
    'The dare is always “soft” (physical/fun); sips are added if alcohol mode is on.',
  'Lancer Culture ou gage': 'Start Trivia or Dare',
  '🎲 Question {n}/{total}': '🎲 Question {n}/{total}',
  "C'est à {name}": "{name}’s turn",
  'Bonne réponse ! +1': 'Correct! +1',
  'Raté… gage !': 'Missed… dare!',
  'La bonne réponse était': 'The correct answer was',
  '🎭 Gage': '🎭 Dare',
  '🍺 {name} : {n} gorgées': '🍺 {name}: {n} sips',
  '🍺 {name} : {n} gorgée': '🍺 {name}: {n} sip',
  'Joueur suivant': 'Next player',

  // --- Récap de partie en image (Résultats) ---------------------------------
  Partager: 'Share',
  'En image': 'As image',
  'Récap de la partie': 'Game recap',
  Oups: 'Oops',
  "Impossible de générer l'image du récap.": 'Could not generate the recap image.',

  // --- Réviser mes erreurs (solo) -------------------------------------------
  'Réviser mes erreurs': 'Review my mistakes',
  'Réviser mes erreurs ({n})': 'Review my mistakes ({n})',
  'Révision terminée': 'Review complete',
  'Aucune erreur à réviser': 'No mistakes to review',
  'Joue au quiz : les questions que tu rates atterriront ici pour être révisées.':
    'Play the quiz: questions you miss will land here to review.',
  '{n} sur {total} maîtrisées': '{n} of {total} mastered',
  'Sans faute ! Ces questions ne reviendront plus. 👑': 'Flawless! These questions won’t come back. 👑',
  'Les questions encore ratées restent à réviser plus tard.':
    'Questions still missed stay for you to review later.',
  '{n}/{total} · {m} maîtrisées': '{n}/{total} · {m} mastered',
  'Voir le bilan': 'See summary',

  // --- Partage de packs de contenu perso ------------------------------------
  'Partage de packs': 'Pack sharing',
  'Exporte tes questions et défis dans un fichier à envoyer à tes amis — ou importe le leur.':
    'Export your questions and dares to a file to send to friends — or import theirs.',
  'Partager mon pack': 'Share my pack',
  'Importer un pack': 'Import a pack',
  'Rien à partager': 'Nothing to share',
  'Crée au moins une question ou un défi.': 'Create at least one question or dare.',
  'Pack créé': 'Pack created',
  'Pack invalide': 'Invalid pack',
  "Ce fichier n'est pas un pack Cancellable valide.": 'This file is not a valid Cancellable pack.',
  'Importer ce pack ?': 'Import this pack?',
  '{q} questions et {c} défis seront ajoutés à ton contenu.':
    '{q} questions and {c} dares will be added to your content.',
  '{q} questions et {c} défis ajoutés.': '{q} questions and {c} dares added.',

  // --- Face-à-face & radar par thème (stats) --------------------------------
  'Face-à-face': 'Head-to-head',
  'Compare deux joueurs : victoires, vitesse et forces par thème.':
    'Compare two players: wins, speed and strengths by theme.',
  'Joueur A': 'Player A',
  'Joueur B': 'Player B',
  // (« Pas assez de joueurs » est déjà traduit plus haut.)
  'Ajoute au moins deux joueurs et jouez quelques parties pour comparer vos bilans.':
    'Add at least two players and play a few games to compare records.',
  '{n} duels · {t} nuls': '{n} duels · {t} ties',
  'Jamais affrontés': 'Never faced off',
  '{name} mène 🔥': '{name} leads 🔥',
  'Tout est serré !': 'Neck and neck!',
  'Vitesse ⚡': 'Speed ⚡',
  'Forces par thème': 'Strengths by theme',
  'Jouez au quiz dans plus de thèmes pour comparer vos forces.':
    'Play the quiz across more themes to compare strengths.',
  'Choisis deux joueurs différents.': 'Pick two different players.',
  'moy · record {n}s': 'avg · best {n}s',
  'Taux de bonnes réponses par thème (le plus large = le plus fort).':
    'Correct-answer rate by theme (wider = stronger).',

  // --- Triage des signalements ----------------------------------------------
  'signalée {n} fois': 'reported {n} time',
  'signalée {n}×': 'reported {n}×',

  // --- Calibrage difficulté (AppStats) --------------------------------------
  'Calibrage difficulté': 'Difficulty calibration',
  'Taux de réussite par difficulté': 'Success rate by difficulty',
  '⚠️ Calibrage à revoir : {issue}': '⚠️ Calibration to review: {issue}',
  'La réussite décroît bien avec la difficulté 👍': 'Success rate drops nicely with difficulty 👍',
  'Thèmes les plus durs': 'Hardest themes',
  // Classement hebdomadaire (période Stats)
  Semaine: 'Week',

  // --- Modes solo (Survie / Contre-la-montre) -------------------------------
  'Autres modes solo': 'Other solo modes',
  Survie: 'Survival',
  'Contre-la-montre': 'Time attack',
  'Meilleur score : {n}': 'Best score: {n}',
  'Réponds à un maximum de questions en {s} secondes.': 'Answer as many questions as you can in {s} seconds.',
  'Enchaîne les bonnes réponses. La première erreur arrête tout !':
    'Chain correct answers. The first mistake ends it all!',
  Commencer: 'Start',
  '⏱️ {s}s': '⏱️ {s}s',
  '💀 Survie': '💀 Survival',
  'Nouveau record ! 🎉': 'New record! 🎉',
};
