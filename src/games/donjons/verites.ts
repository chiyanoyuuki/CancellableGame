import { filterHot } from '../../core/contentLevel';
import type { CancelLevel } from '../../core/models';

/**
 * Banque de « Vérités » pour la carte Action ou Vérité de Donjons & Gorgées.
 * Une vérité = une question personnelle posée à la cible. Niveau 1 = grand
 * public ; niveaux 2/3/4 = de plus en plus intime (mêmes limites que le reste
 * du contenu Cancellable : rien sur des mineurs, pas de haine ciblée).
 */
export const VERITES: string[] = [
  'Quel surnom gênant t’a-t-on déjà donné ?',
  'Quelle est la dernière chose que tu as cherchée sur ton téléphone ?',
  'Quel est ton pire souvenir de soirée ?',
  'Quelle habitude bizarre as-tu quand personne ne regarde ?',
  'Quel est le plus gros mensonge que tu aies dit à tes parents ?',
  'Quelle est la chose la plus enfantine que tu fais encore ?',
  'Quel talent totalement inutile possèdes-tu ?',
  'Quelle est ta plus grande honte à l’école ?',
  'Quelle est la dépense la plus stupide que tu aies faite ?',
  'Qui, dans cette pièce, connais-tu depuis le plus longtemps ?',
];

interface HotVerite {
  text: string;
  lvl: CancelLevel;
}

export const VERITES_HOT: HotVerite[] = [
  // Niveau 2 · Épicé
  { text: 'Quel a été ton pire rendez-vous galant ?', lvl: 2 },
  { text: 'Sur qui as-tu déjà eu un crush inavoué dans cette pièce ?', lvl: 2 },
  { text: 'Quel est le message le plus gênant que tu aies envoyé ?', lvl: 2 },
  // Niveau 3 · +18
  { text: 'Quel est l’endroit le plus insolite où tu as embrassé quelqu’un ?', lvl: 3 },
  { text: 'Quelle est la chose la plus osée que tu aies faite pour séduire ?', lvl: 3 },
  { text: 'Depuis combien de temps ne t’es-tu pas senti(e) aussi proche de quelqu’un ?', lvl: 3 },
  // Niveau 4 · Cancellable
  { text: 'Quel est ton pire coup d’un soir, sans citer de nom ?', lvl: 4 },
  { text: 'Quelle est la chose la plus trash que tu aies faite en soirée ?', lvl: 4 },
  { text: 'Quel fantasme n’oserais-tu jamais avouer à ton/ta partenaire ?', lvl: 4 },
];

/** Pioche pour les niveaux actifs : le grand public (niveau 1) + l'osé des niveaux actifs. */
export function veritesForLevels(levels: CancelLevel[]): string[] {
  return [...(levels.includes(1) ? VERITES : []), ...filterHot(VERITES_HOT, levels).map((v) => v.text)];
}
