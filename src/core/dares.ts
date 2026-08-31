/**
 * Gages autonomes pour la « Roue des gages » — pur et testable.
 *
 * Deux catégories : « soft » (sans alcool, physique/fun) et « alcool ». Chaque
 * gage se suffit à lui-même (pas de marqueur {0}/{1} ni de meneur), pour pouvoir
 * tomber sur la roue sans contexte de partie.
 */
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
