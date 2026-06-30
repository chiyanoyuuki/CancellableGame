import type { Difficulty, DrinkIntensity, TurnMode } from './models';
import { chance, pick, type Rng, rngInt } from './rng';

/**
 * The "à boire" layer. Gorgées are handed out on wrong answers, won (and
 * redistributed) on clutch correct answers, and occasionally a random group
 * challenge fires between two questions. Everything is rng-driven so it stays
 * unpredictable yet testable.
 */

export interface DrinkOutcome {
  /** Gorgées that this player drinks. */
  sipsDrunk: number;
  /** Gorgées that this player gives away to others. */
  sipsGiven: number;
  /** Fun explanation shown on the reveal screen ('' = nothing happened). */
  reason: string;
}

const NOTHING: DrinkOutcome = { sipsDrunk: 0, sipsGiven: 0, reason: '' };

const INTENSITY_FACTOR: Record<DrinkIntensity, number> = {
  soft: 0.5,
  normal: 1,
  hardcore: 1.8,
};

const CHALLENGE_PROBABILITY: Record<DrinkIntensity, number> = {
  soft: 0.12,
  normal: 0.2,
  hardcore: 0.33,
};

function scale(base: number, intensity: DrinkIntensity): number {
  return Math.max(1, Math.round(base * INTENSITY_FACTOR[intensity]));
}

/** Drink consequence of a single quiz answer. */
export function rollAnswerDrink(params: {
  correct: boolean;
  difficulty: Difficulty;
  turnMode: TurnMode;
  hintsUsed: number;
  intensity: DrinkIntensity;
  rng: Rng;
}): DrinkOutcome {
  const { correct, difficulty, hintsUsed, intensity, rng } = params;

  if (!correct) {
    return {
      sipsDrunk: scale(rngInt(rng, 1, 2), intensity),
      sipsGiven: 0,
      reason: 'Mauvaise réponse 😬 tu bois !',
    };
  }

  // Clutch: a hard/hardcore question nailed without any hint lets you hand out gorgées.
  if (difficulty >= 3 && hintsUsed === 0 && chance(rng, 0.6)) {
    return {
      sipsDrunk: 0,
      sipsGiven: scale(rngInt(rng, 1, 2), intensity),
      reason: 'Sans faute sur une difficile 🔥 distribue les gorgées !',
    };
  }

  // Correct, but only after leaning on the hints: a small sip.
  if (hintsUsed >= 2 && chance(rng, 0.4)) {
    return { sipsDrunk: scale(1, intensity), sipsGiven: 0, reason: 'Trouvé… mais avec les indices 👀' };
  }

  return NOTHING;
}

export interface DrinkChallenge {
  id: string;
  text: string;
}

/** Random group challenges fired between questions. */
export const DRINK_CHALLENGES: DrinkChallenge[] = [
  { id: 'cascade', text: 'Cascade ! Le dernier qui a marqué lance, chacun arrête de boire quand son voisin de droite s\'arrête.' },
  { id: 'gaucher', text: 'Tout le monde boit de la main gauche jusqu\'au prochain défi. Oubli = 1 gorgée.' },
  { id: 'categories', text: 'Catégories : le meneur lance un thème (ex: persos de manga), chacun en cite un à tour de rôle. Le premier qui bloque boit 2 gorgées.' },
  { id: 'jamaisjamais', text: 'Je n\'ai jamais… : chacun son tour une affirmation, ceux qui l\'ont déjà fait boivent une gorgée.' },
  { id: 'duel', text: 'Duel de regard : deux joueurs au hasard se fixent, le premier qui rit ou cligne boit 2 gorgées.' },
  { id: 'minorite', text: 'Vote secret : tout le monde montre pouce haut/bas en même temps. La minorité boit.' },
  { id: 'pouce', text: 'Le dernier à poser son pouce sur la table boit. (Le meneur peut le déclencher quand il veut d\'ici la prochaine question.)' },
  { id: 'rime', text: 'Le meneur dit un mot, chacun doit enchaîner avec une rime. Le premier qui sèche boit.' },
  { id: 'santetout', text: 'Petite pause santé : tout le monde trinque et boit une gorgée ensemble 🥂.' },
  { id: 'chef', text: 'Élisez un Chef : jusqu\'au prochain défi, quand le Chef boit, tout le monde boit.' },
];

/** Maybe return a random challenge to play before the next question. */
export function maybeChallenge(rng: Rng, intensity: DrinkIntensity): DrinkChallenge | null {
  if (!chance(rng, CHALLENGE_PROBABILITY[intensity])) return null;
  return pick(DRINK_CHALLENGES, rng);
}
