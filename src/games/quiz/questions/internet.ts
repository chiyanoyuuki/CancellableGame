import { universe } from './_build';

// Nouveau thème « Références Internet » : mèmes, virales, plateformes et
// culture web. Attention, ça vieillit vite — on privilégie les références
// déjà bien installées.
export const internetQuestions = universe('internet', 'Mèmes & viral', [
  // --- Faciles (5) ---
  { id: 'net-f1', d: 1, t: 'Quel réseau social est connu pour ses vidéos courtes et son fil « Pour toi » ?', a: 'TikTok', x: ['LinkedIn', 'Pinterest', 'Reddit'] },
  { id: 'net-f2', d: 1, t: 'Comment appelle-t-on une image humoristique qui se propage massivement sur internet ?', a: 'Un mème', acc: ['meme', 'mème'], x: ['Un spam', 'Un cookie', 'Un pixel'] },
  { id: 'net-f3', d: 1, t: 'Sur YouTube, quel bouton clique-t-on pour soutenir une vidéo qu\'on aime ?', a: 'J\'aime', acc: ["j'aime", 'like', 'pouce bleu'], x: ['Partager', 'S\'abonner', 'Signaler'] },
  { id: 'net-f4', d: 1, t: 'Quelle plateforme de diffusion en direct de jeux vidéo appartient à Amazon ?', a: 'Twitch', x: ['YouTube Gaming', 'Kick', 'Discord'] },
  { id: 'net-f5', d: 1, t: 'Que dit-on d\'une vidéo qui rencontre un énorme succès soudain sur internet ?', a: 'Elle devient virale', acc: ['virale', 'buzz', 'viral'], x: ['Elle devient payante', 'Elle devient privée', 'Elle est supprimée'] },

  // --- Moyennes (10) ---
  { id: 'net-m1', d: 2, t: 'Quel chanteur sud-coréen a explosé en 2012 avec « Gangnam Style » ?', a: 'PSY', x: ['Rain', 'G-Dragon', 'Taeyang'] },
  { id: 'net-m2', d: 2, t: 'Quel site de discussion s\'organise en « subreddits » et fonctionne aux votes ?', a: 'Reddit', x: ['Digg', 'Quora', '4chan'] },
  { id: 'net-m3', d: 2, t: 'Comment s\'appelle la grenouille verte devenue un célèbre mème ?', a: 'Pepe the Frog', acc: ['pepe', 'pepe the frog'], x: ['Kermit', 'Crazy Frog', 'Keroppi'] },
  { id: 'net-m4', d: 2, t: 'Quel défi viral de 2014 consistait à se verser un seau d\'eau glacée pour une cause ?', a: 'L\'Ice Bucket Challenge', acc: ['ice bucket challenge', 'ice bucket'], x: ['Le Mannequin Challenge', 'Le Harlem Shake', 'Le Kiki Challenge'] },
  { id: 'net-m5', d: 2, t: 'Quelle mode virale demandait de rester totalement figé pendant qu\'une caméra circule ?', a: 'Le Mannequin Challenge', acc: ['mannequin challenge'], x: ['Le Harlem Shake', 'La Macarena', 'Le Floss'] },
  { id: 'net-m6', d: 2, t: 'Quel format d\'image animée sans son est partout dans les commentaires ?', a: 'Le GIF', acc: ['gif'], x: ['Le PNG', 'Le MP3', 'Le PDF'] },
  { id: 'net-m7', d: 2, t: 'Comment appelle-t-on quelqu\'un qui provoque exprès pour semer la discorde en ligne ?', a: 'Un troll', x: ['Un noob', 'Un lurker', 'Un admin'] },
  { id: 'net-m8', d: 2, t: 'Quel chat grincheux est devenu une star des mèmes sous le nom de « Grumpy Cat » ?', a: 'Grumpy Cat', acc: ['grumpy cat'], x: ['Nyan Cat', 'Keyboard Cat', 'Lil Bub'] },
  { id: 'net-m9', d: 2, t: 'Quel site de tchat vidéo mettait en relation deux inconnus totalement au hasard ?', a: 'Chatroulette', x: ['Omegle', 'Skype', 'FaceTime'] },
  { id: 'net-m10', d: 2, t: 'Comment appelle-t-on les créateurs qui vivent de leur audience sur les réseaux sociaux ?', a: 'Des influenceurs', acc: ['influenceurs', 'influenceur'], x: ['Des modérateurs', 'Des développeurs', 'Des annonceurs'] },

  // --- Dures (15) ---
  { id: 'net-d1', d: 3, t: 'De quel jeu vidéo vient la phrase-mème « the cake is a lie » ?', a: 'Portal', x: ['Half-Life', 'Doom', 'BioShock'] },
  { id: 'net-d2', d: 3, t: 'Quelle réplique de Dragon Ball Z est devenue un mème sur la puissance ?', a: 'It\'s over 9000', acc: ['over 9000', '9000', 'plus de 9000'], x: ['Kamehameha', 'This is Sparta', 'Hasta la vista'] },
  { id: 'net-d3', d: 3, t: 'De quel film vient le mème « This is Sparta » ?', a: '300', x: ['Gladiator', 'Troie', 'Le Choc des Titans'] },
  { id: 'net-d4', d: 3, t: 'Quel site de partage de vidéos a été racheté par Google en 2006 ?', a: 'YouTube', x: ['Dailymotion', 'Vimeo', 'Twitch'] },
  { id: 'net-d5', d: 3, t: 'Quel format vertical éphémère, lancé par Snapchat, a été copié par Instagram ?', a: 'Les stories', acc: ['stories', 'story'], x: ['Les reels', 'Les shorts', 'Les lives'] },
  { id: 'net-d6', d: 3, t: 'De quel dessin animé vient le mème du texte en « MaJuScUlEs alternées » ?', a: 'Bob l\'éponge', acc: ['bob l\'eponge', 'spongebob'], x: ['Les Simpson', 'South Park', 'Rick et Morty'] },
  { id: 'net-d7', d: 3, t: 'Quel forum anonyme est à l\'origine de nombreux mèmes et du collectif Anonymous ?', a: '4chan', x: ['Reddit', 'Tumblr', 'Something Awful'] },
  { id: 'net-d8', d: 3, t: 'Comment appelle-t-on le fait de divulguer les informations privées de quelqu\'un en ligne ?', a: 'Le doxxing', acc: ['doxxing', 'dox', 'doxing'], x: ['Le phishing', 'Le catfishing', 'Le ghosting'] },
  { id: 'net-d9', d: 3, t: 'Comment appelle-t-on le fait de séduire quelqu\'un en ligne avec une fausse identité ?', a: 'Le catfishing', acc: ['catfishing', 'catfish'], x: ['Le doxxing', 'Le phishing', 'Le trolling'] },
  { id: 'net-d10', d: 3, t: 'Quelle vidéo de bébé mordeur est l\'une des toutes premières virales de YouTube ?', a: 'Charlie Bit My Finger', acc: ['charlie bit my finger', 'charlie'], x: ['David After Dentist', 'Chocolate Rain', 'Keyboard Cat'] },
  { id: 'net-d11', d: 3, t: 'Quel piège viral redirige l\'internaute vers une chanson de Rick Astley ?', a: 'Le Rickroll', acc: ['rickroll', 'rick roll', 'never gonna give you up'], x: ['Le Nyan Cat', 'Le Harlem Shake', 'Le Screamer'] },
  { id: 'net-d12', d: 3, t: 'Quel jeu mobile de 2016 en réalité augmentée a fait sortir tout le monde chasser des créatures ?', a: 'Pokémon GO', acc: ['pokemon go'], x: ['Ingress', 'Harry Potter Wizards Unite', 'Jurassic World Alive'] },
  { id: 'net-d13', d: 3, t: 'Comment appelle-t-on une fausse information largement partagée sur internet ?', a: 'Une fake news', acc: ['fake news', 'infox'], x: ['Un spoiler', 'Un thread', 'Un tag'] },
  { id: 'net-d14', d: 3, t: 'Quel mème montre un vieil homme souriant qui cache visiblement une douleur ?', a: 'Hide the Pain Harold', acc: ['hide the pain harold', 'harold'], x: ['Bad Luck Brian', 'Success Kid', 'Overly Attached Girlfriend'] },
  { id: 'net-d15', d: 3, t: 'Quel mème montre un homme se retournant sur une passante devant sa copine outrée ?', a: 'Distracted Boyfriend', acc: ['distracted boyfriend', 'petit ami distrait'], x: ['Two Buttons', 'Woman Yelling at a Cat', 'Expanding Brain'] },

  // --- Pro (20) ---
  { id: 'net-p1', d: 4, t: 'En quelle année YouTube a-t-il été créé ?', a: '2005', x: ['2003', '2007', '2009'] },
  { id: 'net-p2', d: 4, t: 'Quelle a été la toute première vidéo mise en ligne sur YouTube ?', a: 'Me at the zoo', acc: ['me at the zoo'], x: ['Charlie Bit My Finger', 'Gangnam Style', 'Nyan Cat'] },
  { id: 'net-p3', d: 4, t: 'Quel Suédois est resté des années le YouTubeur le plus suivi au monde ?', a: 'PewDiePie', x: ['Ninja', 'Markiplier', 'Jacksepticeye'] },
  { id: 'net-p4', d: 4, t: 'Quel YouTubeur américain est connu pour ses défis à gros budget et ses dons ?', a: 'MrBeast', x: ['PewDiePie', 'Ninja', 'Markiplier'] },
  { id: 'net-p5', d: 4, t: 'Quelle chanson est devenue en 2017 la vidéo la plus vue de YouTube ?', a: 'Despacito', x: ['Gangnam Style', 'Baby Shark', 'Shape of You'] },
  { id: 'net-p6', d: 4, t: 'Quelle comptine pour enfants figure parmi les vidéos les plus vues de tous les temps ?', a: 'Baby Shark', x: ['Despacito', 'Gangnam Style', 'La Reine des Neiges'] },
  { id: 'net-p7', d: 4, t: 'Quel réseau social a été fondé par Mark Zuckerberg en 2004 ?', a: 'Facebook', x: ['Myspace', 'Twitter', 'Instagram'] },
  { id: 'net-p8', d: 4, t: 'En quelle lettre Elon Musk a-t-il renommé Twitter en 2023 ?', a: 'X', x: ['Z', 'T', 'W'] },
  { id: 'net-p9', d: 4, t: 'Quel mème montre un homme transpirant devant deux boutons à choisir ?', a: 'Two Buttons', acc: ['two buttons', 'daily struggle'], x: ['Distracted Boyfriend', 'Drake Hotline Bling', 'Expanding Brain'] },
  { id: 'net-p10', d: 4, t: 'Quel mème utilise le rappeur Drake qui refuse puis approuve quelque chose ?', a: 'Drake Hotline Bling', acc: ['drake hotline bling', 'drakeposting'], x: ['Two Buttons', 'Distracted Boyfriend', 'Change My Mind'] },
  { id: 'net-p11', d: 4, t: 'Quelle plateforme de discussion par serveurs vocaux est très prisée des gamers ?', a: 'Discord', x: ['Slack', 'TeamSpeak', 'Skype'] },
  { id: 'net-p12', d: 4, t: 'Quel mème d\'un cerveau qui grossit illustre des idées prétendument géniales ?', a: 'Expanding Brain', acc: ['expanding brain', 'galaxy brain'], x: ['Two Buttons', 'Drakeposting', 'Stonks'] },
  { id: 'net-p13', d: 4, t: 'Quel mème d\'un homme d\'affaires devant un graphique illustre le « profit » absurde ?', a: 'Stonks', x: ['Gains', 'Bull', 'Cash'] },
  { id: 'net-p14', d: 4, t: 'Quel mème montre un chat blanc à table, pointé par une femme en colère ?', a: 'Woman Yelling at a Cat', acc: ['woman yelling at a cat', 'smudge'], x: ['Grumpy Cat', 'Nyan Cat', 'Cheems'] },
  { id: 'net-p15', d: 4, t: 'Quelle race de chien japonais est la mascotte du mème « Doge » et du Dogecoin ?', a: 'Le Shiba Inu', acc: ['shiba inu', 'shiba', 'doge'], x: ['Le Akita', 'Le Corgi', 'Le Husky'] },
  { id: 'net-p16', d: 4, t: 'Quel événement Facebook « pour rigoler » de 2019 proposait de prendre d\'assaut la Zone 51 ?', a: 'Storm Area 51', acc: ['storm area 51', 'area 51', 'zone 51'], x: ['Occupy Wall Street', 'Project Chanology', 'Rickroll'] },
  { id: 'net-p17', d: 4, t: 'Quel site d\'encyclopédie collaborative existe depuis 2001 ?', a: 'Wikipédia', x: ['Encarta', 'Quora', 'Reddit'] },
  { id: 'net-p18', d: 4, t: 'Quel mot d\'argot internet signifie « rire » et vient de l\'anglais ?', a: 'LOL', acc: ['lol', 'mdr'], x: ['BRB', 'AFK', 'FYI'] },
  { id: 'net-p19', d: 4, t: 'Quel YouTubeur et boxeur britannique forme un duo célèbre avec Logan Paul ?', a: 'KSI', x: ['MrBeast', 'PewDiePie', 'Ninja'] },
  { id: 'net-p20', d: 4, t: 'Comment appelle-t-on une tendance vidéo que tout le monde reproduit à l\'identique ?', a: 'Un challenge', acc: ['challenge', 'trend', 'tendance'], x: ['Un thread', 'Un raid', 'Un combo'] },
]);
