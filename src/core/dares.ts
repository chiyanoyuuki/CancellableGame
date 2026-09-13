/**
 * Gages autonomes pour la « Roue des gages » — pur et testable.
 *
 * Deux catégories : « soft » (sans alcool, physique/fun) et « alcool ». Chaque
 * gage se suffit à lui-même (pas de marqueur {0}/{1} ni de meneur), pour pouvoir
 * tomber sur la roue sans contexte de partie.
 */
import { filterHot } from './contentLevel';
import type { CancelLevel } from './models';
import { pick, type Rng } from './rng';

export type DareCategory = 'soft' | 'alcool';

/** Gages sans alcool : rigolos, physiques, sociaux. */
export const SOFT_DARES: string[] = [
  'Imite un animal jusqu\'à ton prochain tour.',
  'Parle avec un accent (au choix du groupe) pendant 2 minutes.',
  'Fais 10 pompes… ou 10 squats, au choix.',
  'Raconte ta pire honte de soirée.',
  'Chante le refrain d\'une chanson choisie par le groupe.',
  'Fais deviner un film en mimant, sans parler.',
  'Prends la pose la plus stylée pour une photo de groupe.',
  'Tiens la planche pendant 30 secondes.',
  'Fais un compliment sincère à chaque personne de la table.',
  'Danse 20 secondes sans musique.',
  'Parle uniquement en rimes jusqu\'à ton prochain tour.',
  'Fais ta meilleure imitation de quelqu\'un de la table.',
  'Invente un slogan pour la soirée et crie-le.',
  'Raconte une blague : si personne ne rit, refais-en une.',
  'Laisse ton voisin de droite écrire ton prochain statut (à voix haute).',
  'Fais le tour de la pièce en marchant comme un crabe.',
  'Prends l\'accent d\'un présentateur télé pour commenter la pièce.',
  'Fais un câble/roulade ou une grimace de 10 secondes.',
  'Envoie un message gentil à un(e) ami(e) absent(e).',
  'Fais deviner une émotion rien qu\'avec les yeux.',
  'Raconte ton pire rendez-vous (version courte).',
  'Fais 5 sauts en étoile en criant « énergie ! ».',
  'Parle à la 3e personne jusqu\'à ton prochain tour.',
  'Improvise une pub de 15 secondes pour un objet de la pièce.',
  'Fais le beatbox pendant 10 secondes.',
  'Tiens un équilibre sur un pied pendant 20 secondes.',
  'Complimente le/la voisin(e) de gauche façon poème.',
  'Rejoue ta réaction quand tu reçois une bonne nouvelle.',
  'Fais la statue : au prochain « statue ! » tu ne bouges plus 20 s.',
  'Choisis quelqu\'un : vous inventez un check secret pour la soirée.',
];

/** Gages « alcool » autonomes (gorgées / cul sec léger). */
export const BOOZE_DARES: string[] = [
  'Bois 2 gorgées.',
  'Distribue 3 gorgées à qui tu veux.',
  'Cul sec (ou 3 gorgées si t\'es sage) !',
  'Toi et ton voisin de droite : santé, 1 gorgée ensemble.',
  'Le/la plus jeune de la table boit 1 gorgée, sinon toi 2.',
  'Trinque avec tout le monde puis 1 gorgée.',
  'Bois autant de gorgées que de voyelles dans ton prénom.',
  'Gorgée cadeau : 2 gorgées à répartir dans la table.',
  'Bois de la main gauche jusqu\'à ton prochain tour, sinon 1 gorgée.',
  'Mot interdit : « boire ». Si tu le dis, 1 gorgée.',
  'La table vote : la personne désignée boit 2 gorgées (toi compris).',
  'Fais une cascade avec ton voisin de droite (2 gorgées chacun).',
  'Bois 1 gorgée, puis choisis quelqu\'un qui boit avec toi.',
  'Duel de regard avec quelqu\'un : le premier qui rit boit 2 gorgées.',
  'Chacun son tour cite une marque de boisson : le premier qui sèche boit.',
  'Bois 1 gorgée pour chaque téléphone visible sur la table.',
  'Tout le monde boit 1 gorgée « à ta santé ».',
  'Le/la dernier(e) à lever la main boit 2 gorgées.',
];

export function daresFor(category: DareCategory): string[] {
  return category === 'soft' ? SOFT_DARES : BOOZE_DARES;
}

/** Tire un gage au hasard, différent de `current` si possible. */
export function nextDare(pool: readonly string[], current: string | null, rng: Rng): string {
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0] as string;
  const fresh = pool.filter((d) => d !== current);
  return pick(fresh.length > 0 ? fresh : [...pool], rng);
}

/** Gage osé tagué du niveau minimum de « cancellabilité » et de sa catégorie. */
export interface HotDare {
  text: string;
  lvl: CancelLevel;
  category: DareCategory;
}

/**
 * Gages « cancellable » (échantillon), du plus léger (2) au plus trash (4), pour
 * la Roue des gages et Culture ou Gage. Esprit soirée entre adultes — coquin,
 * torride, tabou — sans jamais viser ni rabaisser quelqu'un. Rangés par catégorie
 * (soft = sans alcool ; alcool = gorgées) comme la banque de base.
 */
export const HOT_DARES: HotDare[] = [
  // --- soft · Niveau 2 · Épicé 🌶️ ------------------------------------------
  { category: 'soft', lvl: 2, text: "Fais un slow d'une minute avec la personne à ta droite." },
  { category: 'soft', lvl: 2, text: "Mime ta scène de film la plus romantique avec quelqu'un de la table." },
  { category: 'soft', lvl: 2, text: "Fais un compliment un peu osé à la personne en face de toi." },
  { category: 'soft', lvl: 2, text: "Assieds-toi sur les genoux de quelqu'un jusqu'à ton prochain tour." },
  { category: 'soft', lvl: 2, text: "Écris « tu me manques » à la 3e personne de tes contacts (et assume)." },
  // --- soft · Niveau 3 · +18 🔞 ---------------------------------------------
  { category: 'soft', lvl: 3, text: "Improvise un strip-tease de 10 secondes (tu gardes tout, joue le jeu)." },
  { category: 'soft', lvl: 3, text: "Mime une position du Kâma-Sûtra choisie par le groupe." },
  { category: 'soft', lvl: 3, text: "Chuchote à l'oreille de ton voisin ce que tu ferais après la soirée." },
  { category: 'soft', lvl: 3, text: "Fais deviner un mot très coquin en mime, sans parler." },
  { category: 'soft', lvl: 3, text: "Roule la pelle la plus convaincante… à ton avant-bras." },
  // --- soft · Niveau 4 · Cancellable ☠️ ------------------------------------
  { category: 'soft', lvl: 4, text: "Avoue à la table ton fantasme le plus inavouable." },
  { category: 'soft', lvl: 4, text: "Raconte ton pire (ou meilleur) plan d'un soir en 30 secondes." },
  { category: 'soft', lvl: 4, text: "Écris « je pense à toi » à ton ex maintenant, ou prends un gage double." },
  { category: 'soft', lvl: 4, text: "Dis quelle personne de la pièce tu trouves la plus attirante." },
  { category: 'soft', lvl: 4, text: "Montre la dernière photo de ta galerie… ou décris-la si tu n'oses pas." },

  // --- alcool · Niveau 2 · Épicé 🌶️ ----------------------------------------
  { category: 'alcool', lvl: 2, text: "Cul sec avec la personne que tu trouves la plus mignonne de la table." },
  { category: 'alcool', lvl: 2, text: "Bois une gorgée pour chaque date raté que tu as eu cette année." },
  { category: 'alcool', lvl: 2, text: "Trinque bras dessus bras dessous avec ton voisin, puis 2 gorgées." },
  { category: 'alcool', lvl: 2, text: "La dernière personne que tu as embrassée te fait boire (ou 2 gorgées)." },
  // --- alcool · Niveau 3 · +18 🔞 -------------------------------------------
  { category: 'alcool', lvl: 3, text: "Bois autant de gorgées que de partenaires cette année… ou mens et bois le double si on te grille." },
  { category: 'alcool', lvl: 3, text: "Body shot version soft : un shot posé sur le dos de la main de quelqu'un." },
  { category: 'alcool', lvl: 3, text: "Le/la dernier(e) à avoir couché distribue 5 gorgées." },
  { category: 'alcool', lvl: 3, text: "Bois cul sec ou nomme la personne de la table la plus à ton goût." },
  // --- alcool · Niveau 4 · Cancellable ☠️ ----------------------------------
  { category: 'alcool', lvl: 4, text: "Bois cul sec ou révèle ton historique de recherches privées." },
  { category: 'alcool', lvl: 4, text: "Bois une gorgée pour chaque personne de la table qui t'attire." },
  { category: 'alcool', lvl: 4, text: "Le plus gros compteur de partenaires distribue 10 gorgées." },
  { category: 'alcool', lvl: 4, text: "Cul sec, ou avoue le lieu le plus insolite où tu as couché." },

  // ----- Vague 2 -----------------------------------------------------------
  { category: 'soft', lvl: 2, text: "Fais un clin d'œil appuyé à chaque personne de la table, une par une." },
  { category: 'soft', lvl: 2, text: "Déclare ta flamme (fausse) à un objet de la pièce, avec conviction." },
  { category: 'soft', lvl: 3, text: "Fais une danse lascive de 10 secondes sur la musique du moment." },
  { category: 'soft', lvl: 3, text: "Décris ton date idéal dans les moindres détails coquins." },
  { category: 'soft', lvl: 4, text: "Classe les ex dont tu te souviens, du pire au meilleur, à voix haute." },
  { category: 'soft', lvl: 4, text: "Avoue la chose la plus folle que tu aies faite par désir." },
  { category: 'alcool', lvl: 2, text: "Tout le monde boit une gorgée en l'honneur de ton dernier crush." },
  { category: 'alcool', lvl: 2, text: "Bois avec la personne dont l'anniversaire est le plus proche du tien." },
  { category: 'alcool', lvl: 3, text: "Choisis quelqu'un : cul sec en vous regardant dans les yeux." },
  { category: 'alcool', lvl: 3, text: "Bois une gorgée pour chaque personne que tu as embrassée ce mois-ci." },
  { category: 'alcool', lvl: 4, text: "Cul sec, ou réponds franchement : combien de partenaires cette année ?" },
  { category: 'alcool', lvl: 4, text: "Désigne la personne la plus sexy de la table : elle et toi, cul sec." },

  // ----- Vague 3 -----------------------------------------------------------
  { category: 'soft', lvl: 2, text: "Fais deviner ton type idéal en trois mimes." },
  { category: 'soft', lvl: 3, text: "Décris ton meilleur souvenir coquin (sans citer de nom)." },
  { category: 'soft', lvl: 4, text: "Nomme la personne de la table avec qui tu partirais en week-end en amoureux." },
  { category: 'alcool', lvl: 2, text: "Bois avec la dernière personne à qui tu as écrit." },
  { category: 'alcool', lvl: 3, text: "Cul sec, ou montre la dernière photo de ta pellicule." },
  { category: 'alcool', lvl: 4, text: "Bois autant de gorgées que de personnes que tu as embrassées (à la louche)." },

  // ----- Vague 4 -----------------------------------------------------------
  { category: 'soft', lvl: 2, text: "Imite la façon dont tu dragues quand tu as trop bu." },
  { category: 'soft', lvl: 3, text: "Mime ta scène de film la plus torride pendant 10 secondes." },
  { category: 'soft', lvl: 4, text: "Avoue le plus gros mensonge que tu aies dit pour séduire quelqu'un." },
  { category: 'alcool', lvl: 2, text: "Bois avec la personne que tu trouves la plus mystérieuse ici." },
  { category: 'alcool', lvl: 3, text: "Cul sec, ou révèle le prénom de ton dernier crush secret." },
  { category: 'alcool', lvl: 4, text: "Bois autant de gorgées que de personnes présentes que tu trouves attirantes." },

  // ----- Vague 5 -----------------------------------------------------------
  { category: 'soft', lvl: 2, text: "Rejoue ton pire vent reçu, en incarnant les deux rôles." },
  { category: 'soft', lvl: 2, text: "Fais ton plus beau regard charmeur à la personne en face pendant 5 secondes." },
  { category: 'soft', lvl: 3, text: "Décris ton crush idéal, puis dis qui, ici, s'en rapproche le plus." },
  { category: 'soft', lvl: 3, text: "Mime une scène de danse sensuelle jusqu'à ce qu'on devine le film." },
  { category: 'soft', lvl: 4, text: "Avoue le plus gros secret que tu n'as encore jamais dit ce soir." },
  { category: 'soft', lvl: 4, text: "Révèle le fantasme le plus fou que tu oses avouer à voix haute." },
  { category: 'alcool', lvl: 2, text: "Bois avec la personne que tu trouves la plus flirteuse ce soir." },
  { category: 'alcool', lvl: 2, text: "Trinque avec la dernière personne qui t'a fait rougir." },
  { category: 'alcool', lvl: 3, text: "Cul sec, ou avoue ton coup de cœur le plus inavouable." },
  { category: 'alcool', lvl: 3, text: "Bois une gorgée pour chaque appli de rencontre installée sur ton téléphone." },
  { category: 'alcool', lvl: 4, text: "Cul sec, ou révèle combien de personnes présentes tu as déjà embrassées." },
  { category: 'alcool', lvl: 4, text: "Désigne la personne la plus mystérieuse : vous buvez tous les deux à votre pire secret." },

  // ----- Vague 6 -----------------------------------------------------------
  { category: 'soft', lvl: 2, text: "Fais une déclaration enflammée à la personne à ta gauche, en alexandrins approximatifs." },
  { category: 'soft', lvl: 2, text: "Imite ta réaction quand ton crush entre dans la pièce." },
  { category: 'soft', lvl: 3, text: "Raconte ton pire date, sans épargner aucun détail gênant." },
  { category: 'soft', lvl: 3, text: "Fais deviner une scène de film romantique en un seul mime." },
  { category: 'soft', lvl: 4, text: "Avoue à voix haute une chose que personne dans cette pièce ne sait sur toi." },
  { category: 'soft', lvl: 4, text: "Nomme la personne présente que tu aurais osé draguer dans une autre vie (ou passe ton tour)." },
  { category: 'alcool', lvl: 2, text: "Bois avec la personne qui, selon toi, a le plus de matchs en attente." },
  { category: 'alcool', lvl: 2, text: "Trinque avec celui/celle qui a rougi en dernier ce soir." },
  { category: 'alcool', lvl: 3, text: "Cul sec, ou dévoile le dernier emoji que tu as envoyé et à qui." },
  { category: 'alcool', lvl: 3, text: "Bois une gorgée par relation sérieuse que tu as déjà eue." },
  { category: 'alcool', lvl: 4, text: "Cul sec, ou avoue le pire endroit où tu as déjà dragué." },
  { category: 'alcool', lvl: 4, text: "Bois une gorgée pour chaque fois que tu as menti aujourd'hui." },

  // ----- Vague 7 -----------------------------------------------------------
  { category: 'soft', lvl: 2, text: "Fais semblant de tomber amoureux(se) de la personne à ta droite, en 10 secondes chrono." },
  { category: 'soft', lvl: 2, text: "Envoie un clin d'œil appuyé à chaque personne de la table, une par une." },
  { category: 'soft', lvl: 3, text: "Décris à voix haute ton pire flirt raté." },
  { category: 'soft', lvl: 3, text: "Rejoue le moment le plus gênant de ta vie amoureuse." },
  { category: 'soft', lvl: 4, text: "Avoue lequel des présents tu aurais ajouté à ta liste secrète (ou passe ton tour)." },
  { category: 'soft', lvl: 4, text: "Confesse la chose la moins avouable que tu aies faite par jalousie." },
  { category: 'alcool', lvl: 2, text: "Bois avec la personne qui, selon toi, drague le mieux." },
  { category: 'alcool', lvl: 2, text: "Trinque avec la dernière personne à qui tu as menti." },
  { category: 'alcool', lvl: 3, text: "Cul sec, ou raconte ton pire lendemain de soirée." },
  { category: 'alcool', lvl: 3, text: "Bois une gorgée par personne présente que tu suivrais sur un compte privé." },
  { category: 'alcool', lvl: 4, text: "Cul sec, ou révèle le secret le plus lourd que tu gardes ce soir." },
  { category: 'alcool', lvl: 4, text: "Bois cul sec avec la personne que tu connais depuis le plus longtemps." },

  // ----- Vague 8 -----------------------------------------------------------
  { category: 'soft', lvl: 2, text: "Déclare ta flamme à la personne en face en trois compliments improvisés." },
  { category: 'soft', lvl: 2, text: "Fais deviner, en mimant, ton émotion quand ton crush te répond." },
  { category: 'soft', lvl: 3, text: "Raconte la fois où tu as été le plus gêné(e) en public." },
  { category: 'soft', lvl: 3, text: "Imite la démarche de quelqu'un que tu trouves irrésistible." },
  { category: 'soft', lvl: 4, text: "Avoue le pire prétexte que tu aies inventé pour éviter quelqu'un." },
  { category: 'soft', lvl: 4, text: "Dis quelle rumeur tu aimerais lancer sur toi-même (ou passe ton tour)." },
  { category: 'alcool', lvl: 2, text: "Bois avec la personne qui a, selon toi, le sourire le plus charmeur." },
  { category: 'alcool', lvl: 2, text: "Trinque avec celui/celle que tu connais le moins ici." },
  { category: 'alcool', lvl: 3, text: "Cul sec, ou révèle le pseudo le plus gênant que tu aies eu." },
  { category: 'alcool', lvl: 3, text: "Bois une gorgée par soirée dont tu ne te souviens pas entièrement." },
  { category: 'alcool', lvl: 4, text: "Cul sec, ou avoue la pire chose que tu aies faite en soirée." },
  { category: 'alcool', lvl: 4, text: "Bois, ou envoie « je pense à toi » à ton dernier contact." },

  // ----- Vague 9 -----------------------------------------------------------
  { category: 'soft', lvl: 2, text: "Fais un compliment sincère à chaque personne, en te déhanchant." },
  { category: 'soft', lvl: 2, text: "Mime la scène du tout premier regard entre deux amoureux." },
  { category: 'soft', lvl: 3, text: "Raconte la drague la plus culottée que tu aies tentée." },
  { category: 'soft', lvl: 3, text: "Fais deviner ton signe astro en jouant ses pires clichés en amour." },
  { category: 'soft', lvl: 4, text: "Avoue le mensonge le plus long que tu aies tenu dans un couple." },
  { category: 'soft', lvl: 4, text: "Donne la qualité et le défaut de la personne à ta gauche, sans filtre." },
  { category: 'alcool', lvl: 2, text: "Bois avec la personne dont tu envierais le plus la vie amoureuse." },
  { category: 'alcool', lvl: 2, text: "Trinque avec la personne que tu trouves la plus drôle ce soir." },
  { category: 'alcool', lvl: 3, text: "Cul sec, ou raconte ton rencard le plus catastrophique." },
  { category: 'alcool', lvl: 3, text: "Bois une gorgée par appli de rencontre que tu as supprimée par dépit." },
  { category: 'alcool', lvl: 4, text: "Cul sec, ou avoue combien de fois tu es retourné(e) avec un(e) ex." },
  { category: 'alcool', lvl: 4, text: "Bois une gorgée pour chaque relation que tu as gardée secrète." },

  // ----- Vague 10 ----------------------------------------------------------
  { category: 'soft', lvl: 2, text: "Fais deviner « je t'aime » en langue des signes improvisée." },
  { category: 'soft', lvl: 2, text: "Prends la pose la plus charmeuse possible pendant 5 secondes." },
  { category: 'soft', lvl: 3, text: "Décris ton idéal amoureux, puis dis pourquoi tu tombes toujours sur l'inverse." },
  { category: 'soft', lvl: 3, text: "Rejoue ton pire moment de séduction, en accéléré." },
  { category: 'soft', lvl: 4, text: "Avoue ce que tu as déjà fait pour rendre quelqu'un jaloux." },
  { category: 'soft', lvl: 4, text: "Dis quel(le) invité(e) tu choisirais pour un road-trip à deux (ou bois)." },
  { category: 'alcool', lvl: 2, text: "Bois avec la personne au style le plus audacieux ce soir." },
  { category: 'alcool', lvl: 2, text: "Trinque avec la personne que tu aimerais mieux connaître." },
  { category: 'alcool', lvl: 3, text: "Cul sec, ou avoue ton pire prétexte pour rester dormir." },
  { category: 'alcool', lvl: 3, text: "Bois une gorgée par personne à qui tu as déjà menti pour un rencard." },
  { category: 'alcool', lvl: 4, text: "Cul sec, ou dis la chose la plus folle que tu aies faite par amour." },
  { category: 'alcool', lvl: 4, text: "Bois une gorgée pour chaque coup de foudre secret que tu as eu ici." },

  // ----- Vague 11 · Cancellable ++ (plus trash) ----------------------------
  { category: 'soft', lvl: 4, text: "Montre la dernière photo de ta galerie, sans en choisir une autre." },
  { category: 'soft', lvl: 4, text: "Lis à voix haute ton dernier message envoyé à un(e) ex." },
  { category: 'soft', lvl: 4, text: "Imite un orgasme convaincant pendant cinq secondes." },
  { category: 'soft', lvl: 4, text: "Décris ta pire expérience au lit, sans donner de nom." },
  { category: 'soft', lvl: 4, text: "Mime ta position préférée avec un coussin." },
  { category: 'soft', lvl: 4, text: "Classe trois personnes de la table, de la plus à la moins tentante (ou bois cul sec)." },
  { category: 'alcool', lvl: 4, text: "Envoie « t'es réveillé(e) ? » à la dernière personne avec qui tu as flirté, ou cul sec." },
  { category: 'alcool', lvl: 4, text: "Montre ton historique de recherche des 24 dernières heures, ou cul sec." },
  { category: 'alcool', lvl: 4, text: "Avoue le plus gros mensonge que tu aies dit pour coucher, ou cul sec." },
  { category: 'alcool', lvl: 4, text: "Raconte le lieu le plus improbable où tu as pris du bon temps, ou cul sec." },
  { category: 'alcool', lvl: 4, text: "Envoie un emoji très suggestif à la 3ᵉ personne de tes conversations, ou cul sec." },
  { category: 'alcool', lvl: 4, text: "Avoue ton nombre de partenaires à la table, ou vide ton verre." },

  // ----- Vague 12 · Cancellable ++ -----------------------------------------
  { category: 'alcool', lvl: 4, text: "Envoie « je repense à l'autre soir 😏 » à un contact au hasard, ou cul sec." },
  { category: 'soft', lvl: 4, text: "Décris ton fantasme le plus fou dans le détail, ou finis ton verre." },
  { category: 'soft', lvl: 4, text: "Fais un lap dance de dix secondes à la personne de ton choix (ou double cul sec)." },
  { category: 'alcool', lvl: 4, text: "Montre tes messages avec ton/ta dernier(ère) crush, ou cul sec." },
  { category: 'alcool', lvl: 4, text: "Appelle un(e) ex en haut-parleur et dis « je pensais à toi », ou cul sec." },
  { category: 'soft', lvl: 4, text: "Garde un glaçon dans ta bouche et fais-le fondre le plus lentement possible." },
  { category: 'soft', lvl: 4, text: "Mime ton réveil au lendemain d'une soirée beaucoup trop arrosée." },
  { category: 'alcool', lvl: 4, text: "Avoue le surnom coquin le plus gênant qu'on t'ait donné, ou bois." },
  { category: 'soft', lvl: 4, text: "Refais le bruit que tu fais quand ça devient sérieux au lit, ou passe ton tour." },
  { category: 'alcool', lvl: 4, text: "Envoie un emoji très suggestif à la personne en haut de tes messages, ou cul sec." },

  // ----- Vague 13 · Cancellable ++ -----------------------------------------
  { category: 'soft', lvl: 4, text: "Montre à la table ta conversation la plus gênante, ou passe ton tour." },
  { category: 'soft', lvl: 4, text: "Fais semblant d'appeler quelqu'un pour un plan cul, en improvisant." },
  { category: 'soft', lvl: 4, text: "Décris ce que tu aimes au lit en trois mots, ou passe ton tour." },
  { category: 'alcool', lvl: 4, text: "Laisse la personne à ta droite poster une story sur ton compte, ou cul sec." },
  { category: 'soft', lvl: 4, text: "Chuchote à l'oreille de ton voisin la chose la plus osée que tu oses dire." },
  { category: 'alcool', lvl: 4, text: "Bois autant de gorgées que ton nombre de coups d'un soir (à la louche)." },
  { category: 'soft', lvl: 4, text: "Imite deux célébrités en plein flirt jusqu'à ce qu'on devine." },
  { category: 'alcool', lvl: 4, text: "Envoie « t'as aimé l'autre fois ? » à ton dernier contact, sans contexte, ou cul sec." },
  { category: 'soft', lvl: 4, text: "Fais ton regard le plus chargé à trois personnes d'affilée, ou passe ton tour." },
  { category: 'alcool', lvl: 4, text: "Avoue quel(le) invité(e) hante tes pensées coquines, ou vide ton verre." },

  // ----- Vague 14 · Cancellable ++ -----------------------------------------
  { category: 'soft', lvl: 4, text: "Fais ta meilleure imitation de quelqu'un qui drague très maladroitement." },
  { category: 'alcool', lvl: 4, text: "Dis à voix haute le dernier truc coquin que tu as tapé au clavier, ou cul sec." },
  { category: 'soft', lvl: 4, text: "Prends la personne à ta gauche dans tes bras pendant vingt secondes." },
  { category: 'soft', lvl: 4, text: "Raconte ton pire moment de honte en soirée trop arrosée." },
  { category: 'alcool', lvl: 4, text: "Envoie « faut qu'on parle » à un(e) ex, puis « pardon, mauvais contact », ou cul sec." },
  { category: 'alcool', lvl: 4, text: "Avoue combien de fois tu as recontacté un(e) ex par faiblesse, ou bois." },
  { category: 'soft', lvl: 4, text: "Complimente le physique de chaque personne, une par une, sans mentir." },
  { category: 'soft', lvl: 4, text: "Mime la scène de film la plus torride que tu connaisses." },
  { category: 'alcool', lvl: 4, text: "Révèle le fond d'écran de ton téléphone, ou cul sec." },
  { category: 'alcool', lvl: 4, text: "Bois autant de gorgées que de personnes ici avec qui tu accepterais un date." },

  // ----- Vague 15 · Cancellable ++ (sans filtre) ---------------------------
  { category: 'soft', lvl: 4, text: "Décris ta dernière fois au lit dans le détail, ou triple cul sec." },
  { category: 'alcool', lvl: 4, text: "Lis à voix haute ton dernier message osé envoyé, ou cul sec." },
  { category: 'soft', lvl: 4, text: "Mime trois positions à la suite, la table doit deviner, ou finis ton verre." },
  { category: 'soft', lvl: 4, text: "Dis le fantasme précis que t'inspire la personne en face, ou double cul sec." },
  { category: 'alcool', lvl: 4, text: "Envoie « t'es chaud(e) ce soir ? » à ton dernier match, ou cul sec." },
  { category: 'soft', lvl: 4, text: "Simule dix secondes de préliminaires avec une chaise." },
  { category: 'alcool', lvl: 4, text: "Avoue le lieu le plus risqué où tu l'as fait, ou bois cul sec." },
  { category: 'soft', lvl: 4, text: "Fais un suçon à ton propre avant-bras, en gros plan." },
  { category: 'alcool', lvl: 4, text: "Classe la table du meilleur au pire coup présumé, ou vide ton verre." },
  { category: 'soft', lvl: 4, text: "Refais ta tête et tes bruits au moment de l'orgasme, ou passe ton tour." },

  // ----- Vague 16 · Cancellable ++ (sans filtre) ---------------------------
  { category: 'soft', lvl: 4, text: "Décris ton pire coup d'un soir sans épargner les détails, ou triple cul sec." },
  { category: 'alcool', lvl: 4, text: "Envoie « tu me manques au lit » à ton dernier contact, ou cul sec." },
  { category: 'soft', lvl: 4, text: "Montre avec tes mains la position que tu préfères, ou finis ton verre." },
  { category: 'alcool', lvl: 4, text: "Avoue ton nombre de partenaires du dernier mois, ou triple cul sec." },
  { category: 'soft', lvl: 4, text: "Fais une démo live de ta technique de drague la plus lourde." },
  { category: 'soft', lvl: 4, text: "Simule un orgasme façon film X pendant dix secondes, ou double cul sec." },
  { category: 'alcool', lvl: 4, text: "Dis à qui, ici, tu proposerais un plan cul, ou vide ton verre." },
  { category: 'soft', lvl: 4, text: "Chuchote ton fantasme le plus interdit à l'oreille de ton voisin." },
  { category: 'alcool', lvl: 4, text: "Bois autant de gorgées que de fois où tu as menti pour finir au lit." },
  { category: 'alcool', lvl: 4, text: "Révèle le dernier truc pour adultes que tu as regardé, ou cul sec." },

  // ----- Vague 17 · Cancellable ++ -----------------------------------------
  { category: 'soft', lvl: 4, text: "Fais deviner ton fantasme en trois mimes." },
  { category: 'alcool', lvl: 4, text: "Envoie un vocal d'un gémissement à ton dernier contact, ou triple cul sec." },
  { category: 'soft', lvl: 4, text: "Raconte ta pire cuite dans les détails, ou bois." },
  { category: 'alcool', lvl: 4, text: "Dis quelle célébrité tu ajouterais à ton tableau de chasse, ou cul sec." },
  { category: 'soft', lvl: 4, text: "Montre ta danse de séduction ultime, à fond." },
  { category: 'alcool', lvl: 4, text: "Avoue le pire endroit où tu as eu envie de quelqu'un, ou cul sec." },
  { category: 'soft', lvl: 4, text: "Déclare ta flamme à quelqu'un de la façon la plus vulgaire possible." },
  { category: 'alcool', lvl: 4, text: "Bois autant de gorgées que de personnes ici que tu trouves franchement bandantes." },
];

/**
 * Banque de gages pour un ensemble de niveaux ACTIFS : le contenu de base
 * (niveau 1) s'il est actif + les gages osés de la catégorie dont le niveau est
 * actif. Sélection indépendante (ex. 1 et 4).
 */
export function daresForLevels(category: DareCategory, levels: CancelLevel[]): string[] {
  const base = levels.includes(1) ? daresFor(category) : [];
  const spicy = filterHot(
    HOT_DARES.filter((d) => d.category === category),
    levels,
  ).map((d) => d.text);
  return [...base, ...spicy];
}
