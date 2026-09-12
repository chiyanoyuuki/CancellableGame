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
