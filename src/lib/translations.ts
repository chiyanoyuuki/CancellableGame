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
};
