import type { Difficulty } from './models';

/**
 * Difficulté adaptative (pure et testable). À partir du taux de réussite d'un
 * joueur, on propose l'éventail de difficultés le mieux calibré : ni trop dur,
 * ni trop facile. Sert au mode « adaptatif » du quiz — chaque joueur reçoit,
 * à son tour, des questions à sa mesure.
 */

/** En dessous de ce nombre de réponses, on n'a pas assez de recul : profil neutre. */
export const MIN_ANSWERS = 5;

export interface Accuracy {
  correct: number;
  total: number;
}

/** Taux de réussite (0..1) ou null si l'échantillon est trop faible. */
export function accuracyRatio(a: Accuracy | undefined): number | null {
  if (!a || a.total < MIN_ANSWERS) return null;
  return a.correct / a.total;
}

/**
 * Éventail de difficultés recommandé pour un taux de réussite donné (ou null
 * pour un joueur sans historique). On garde toujours au moins deux paliers pour
 * la variété, et on décale la fenêtre vers le haut à mesure que le joueur réussit.
 */
export function adaptiveDifficulties(ratio: number | null): Difficulty[] {
  if (ratio === null) return [1, 2, 3]; // profil neutre : on évite le pro d'emblée
  if (ratio < 0.35) return [1, 2];
  if (ratio < 0.55) return [1, 2, 3];
  if (ratio < 0.75) return [2, 3, 4];
  return [3, 4];
}

/** Raccourci : difficultés adaptatives directement à partir d'un couple correct/total. */
export function difficultiesForPlayer(a: Accuracy | undefined): Difficulty[] {
  return adaptiveDifficulties(accuracyRatio(a));
}
