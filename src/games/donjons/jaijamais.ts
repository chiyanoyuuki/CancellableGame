import { filterHot } from '../../core/contentLevel';
import type { CancelLevel } from '../../core/models';

/**
 * Banque « Je n'ai jamais… » pour la carte du même nom. Une affirmation ; la
 * cible doit avouer avec panache ou bluffer (jet de Charisme dans le moteur).
 * Niveau 1 = grand public, 2/3/4 = de plus en plus corsé (mêmes limites que le
 * reste du contenu Cancellable).
 */
export const JAIJAMAIS: string[] = [
  'Je n’ai jamais séché une journée entière de cours ou de travail.',
  'Je n’ai jamais menti sur mon âge.',
  'Je n’ai jamais cassé quelque chose en accusant quelqu’un d’autre.',
  'Je n’ai jamais fait semblant d’être malade pour éviter un truc.',
  'Je n’ai jamais oublié un anniversaire important.',
  'Je n’ai jamais chanté sous la douche à tue-tête.',
  'Je n’ai jamais fouillé le téléphone de quelqu’un.',
  'Je n’ai jamais mangé un truc tombé par terre en douce.',
  'Je n’ai jamais pleuré devant un dessin animé.',
  'Je n’ai jamais eu un fou rire à un moment inapproprié.',
];

interface HotJaiJamais {
  text: string;
  lvl: CancelLevel;
}

export const JAIJAMAIS_HOT: HotJaiJamais[] = [
  // Niveau 2 · Épicé
  { text: 'Je n’ai jamais recontacté un(e) ex après minuit.', lvl: 2 },
  { text: 'Je n’ai jamais stalké le nouveau ou la nouvelle de mon ex.', lvl: 2 },
  { text: 'Je n’ai jamais menti sur mon nombre de rencards.', lvl: 2 },
  // Niveau 3 · +18
  { text: 'Je n’ai jamais eu un coup d’un soir.', lvl: 3 },
  { text: 'Je n’ai jamais envoyé une photo très osée.', lvl: 3 },
  { text: 'Je n’ai jamais embrassé deux personnes le même soir.', lvl: 3 },
  // Niveau 4 · Cancellable
  { text: 'Je n’ai jamais fait l’amour dans un lieu public.', lvl: 4 },
  { text: 'Je n’ai jamais trompé quelqu’un.', lvl: 4 },
  { text: 'Je n’ai jamais participé à un plan à plusieurs.', lvl: 4 },
];

export function jaijamaisForLevels(levels: CancelLevel[]): string[] {
  return [...(levels.includes(1) ? JAIJAMAIS : []), ...filterHot(JAIJAMAIS_HOT, levels).map((j) => j.text)];
}
