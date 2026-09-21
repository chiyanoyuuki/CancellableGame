/**
 * Adaptateur de contenu pour « Donjons & Gorgées » : à partir des banques
 * EXISTANTES (quiz, gages) et des deux banques dédiées (vérités, j'ai jamais),
 * fournit le contenu d'une carte de défi choisie par le moteur.
 *
 * Fonctions pures (le pool quiz est fourni par l'appelant, comme pour les
 * autres mini-jeux) → testables et déterministes avec un RNG à seed fixe.
 */
import { daresForLevels } from '../../core/dares';
import type { CardType } from '../../core/donjonsEngine';
import type { CancelLevel, Difficulty, Question } from '../../core/models';
import { pick, type Rng } from '../../core/rng';
import { jaijamaisForLevels } from './jaijamais';
import { veritesForLevels } from './verites';

export interface DonjonsContentCtx {
  /** Niveaux Cancellable actifs. */
  levels: CancelLevel[];
  /** Banque de questions déjà chargée (filtrée en amont si besoin). */
  quizPool: readonly Question[];
  /** Univers imposé pour une question (sinon tous les univers dispos). */
  universe?: string;
  /** Catégorie de gage selon le mode alcool. */
  dareCategory: 'soft' | 'alcool';
  /** Ids de questions déjà vues à éviter (facultatif). */
  excludeQuestionIds?: ReadonlySet<string>;
}

export type DrawnChallenge =
  | { card: 'question'; question: Question; difficulty: Difficulty }
  | { card: 'action' | 'verite' | 'jaijamais'; text: string }
  | { card: 'duel' };

/** Niveau Cancellable d'une question (les questions de base valent 1). */
const levelOf = (q: Question): CancelLevel => (q.cancelLevel ?? 1) as CancelLevel;

/** Questions jouables pour les niveaux actifs (et un univers éventuel). */
export function eligibleQuestions(
  pool: readonly Question[],
  opts: { levels: CancelLevel[]; universe?: string; excludeIds?: ReadonlySet<string> },
): Question[] {
  const levelSet = new Set(opts.levels);
  return pool.filter(
    (q) =>
      levelSet.has(levelOf(q)) &&
      (!opts.universe || q.universe === opts.universe) &&
      !(opts.excludeIds?.has(q.id) ?? false),
  );
}

/** Univers disponibles (triés) pour les niveaux actifs — pour laisser l'actif choisir. */
export function availableUniverses(pool: readonly Question[], levels: CancelLevel[]): string[] {
  const levelSet = new Set(levels);
  const set = new Set<string>();
  for (const q of pool) if (q.universe && levelSet.has(levelOf(q))) set.add(q.universe);
  return [...set].sort((a, b) => a.localeCompare(b, 'fr'));
}

/** Pioche une question (respecte niveaux + univers + exclusions), ou null si rien. */
export function pickQuestion(
  pool: readonly Question[],
  opts: { levels: CancelLevel[]; universe?: string; excludeIds?: ReadonlySet<string> },
  rng: Rng,
): Question | null {
  const eligible = eligibleQuestions(pool, opts);
  return eligible.length ? pick(eligible, rng) : null;
}

/**
 * Fournit le contenu de la carte demandée. Renvoie `null` seulement si une
 * question est demandée mais qu'aucune n'est disponible (l'appelant re-tire une
 * autre carte). Le duel n'a pas de contenu (jets opposés sur une stat).
 */
export function drawChallenge(card: CardType, ctx: DonjonsContentCtx, rng: Rng): DrawnChallenge | null {
  switch (card) {
    case 'question': {
      const q = pickQuestion(
        ctx.quizPool,
        { levels: ctx.levels, universe: ctx.universe, excludeIds: ctx.excludeQuestionIds },
        rng,
      );
      return q ? { card: 'question', question: q, difficulty: q.difficulty } : null;
    }
    case 'action': {
      const pool = daresForLevels(ctx.dareCategory, ctx.levels);
      return { card: 'action', text: pool.length ? pick(pool, rng) : 'Fais une grimace à la personne de ton choix.' };
    }
    case 'verite': {
      const pool = veritesForLevels(ctx.levels);
      return { card: 'verite', text: pool.length ? pick(pool, rng) : 'Quel est ton pire souvenir de soirée ?' };
    }
    case 'jaijamais': {
      const pool = jaijamaisForLevels(ctx.levels);
      return { card: 'jaijamais', text: pool.length ? pick(pool, rng) : 'Je n’ai jamais menti à cette table.' };
    }
    case 'duel':
    default:
      return { card: 'duel' };
  }
}
