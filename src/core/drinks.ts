import { t } from '../lib/i18n';
import type { Difficulty, DrinkIntensity, TurnMode } from './models';
import { chance, pick, type Rng, rngInt, shuffle } from './rng';

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
      reason: t('Mauvaise réponse 😬 tu bois !'),
    };
  }

  // Clutch: a hard/hardcore question nailed without any hint lets you hand out gorgées.
  if (difficulty >= 3 && hintsUsed === 0 && chance(rng, 0.6)) {
    return {
      sipsDrunk: 0,
      sipsGiven: scale(rngInt(rng, 1, 2), intensity),
      reason: t('Sans faute sur une difficile 🔥 distribue les gorgées !'),
    };
  }

  // Correct, but only after leaning on the hints: a small sip.
  if (hintsUsed >= 2 && chance(rng, 0.4)) {
    return { sipsDrunk: scale(1, intensity), sipsGiven: 0, reason: t('Trouvé… mais avec les indices 👀') };
  }

  return NOTHING;
}

export interface DrinkChallenge {
  id: string;
  text: string;
  /**
   * Nombre de joueurs à tirer au sort pour ce défi. Leurs noms remplacent les
   * marqueurs {0}, {1}… dans `text` (résolu à l'affichage par `resolveChallenge`).
   */
  picks?: number;
  /** Minuteur en secondes : le défi affiche un compte à rebours réinitialisable. */
  timerSec?: number;
}

/** Un défi prêt à afficher : texte avec les noms tirés au sort déjà insérés. */
export interface ResolvedChallenge {
  id: string;
  text: string;
  /** Identifiants des joueurs tirés au sort (pour afficher leurs avatars). */
  pickedIds: string[];
  timerSec?: number;
}

/**
 * Résout un défi pour l'affichage : tire au sort `picks` joueurs DISTINCTS et
 * remplace {0}, {1}… par leurs noms. S'il manque des joueurs, les marqueurs
 * restants deviennent « un joueur ». Un défi sans `picks` est renvoyé tel quel.
 */
export function resolveChallenge(
  challenge: DrinkChallenge,
  players: readonly { id: string; name: string }[],
  rng: Rng,
  avoid: readonly string[] = [],
): ResolvedChallenge {
  const n = challenge.picks ?? 0;
  const base = { id: challenge.id, timerSec: challenge.timerSec };
  // On traduit le gabarit (les marqueurs {0}, {1}… sont conservés) avant d'y
  // insérer les noms tirés au sort.
  const template = t(challenge.text);
  if (n <= 0 || players.length === 0) {
    return { ...base, text: template.replace(/\{\d+\}/g, t('un joueur')), pickedIds: [] };
  }
  // Rotation : on pioche d'abord parmi ceux pas choisis récemment (`avoid`), puis
  // on complète avec les autres — chacun revient à tour de rôle plutôt qu'au
  // hasard pur qui retombe souvent sur les mêmes.
  const recent = new Set(avoid);
  const fresh = shuffle(players.filter((p) => !recent.has(p.id)), rng);
  const rest = shuffle(players.filter((p) => recent.has(p.id)), rng);
  const chosen = [...fresh, ...rest].slice(0, Math.min(n, players.length));
  let text = template;
  chosen.forEach((p, i) => {
    text = text.split(`{${i}}`).join(p.name);
  });
  // Marqueurs restants (moins de joueurs que demandé) : repli lisible.
  text = text.replace(/\{\d+\}/g, t('un joueur'));
  return { ...base, text, pickedIds: chosen.map((p) => p.id) };
}

/** Random group challenges fired between questions. */
export const DRINK_CHALLENGES: DrinkChallenge[] = [
  { id: 'cascade', text: 'Cascade ! Le dernier qui a marqué lance, chacun arrête de boire quand son voisin de droite s\'arrête.' },
  { id: 'gaucher', text: 'Tout le monde boit de la main gauche jusqu\'au prochain défi. Oubli = 1 gorgée.' },
  { id: 'categories', text: 'Catégories : le meneur lance un thème (ex: persos de manga), chacun en cite un à tour de rôle. Le premier qui bloque boit 2 gorgées.' },
  { id: 'jamaisjamais', text: 'Je n\'ai jamais… : chacun son tour une affirmation, ceux qui l\'ont déjà fait boivent une gorgée.' },
  { id: 'duel', text: 'Duel de regard : {0} et {1} se fixent dans les yeux. Le premier qui rit ou cligne boit 2 gorgées.', picks: 2, timerSec: 30 },
  { id: 'minorite', text: 'Vote secret : tout le monde montre pouce haut/bas en même temps. La minorité boit.' },
  { id: 'pouce', text: 'Le dernier à poser son pouce sur la table boit. (Le meneur peut le déclencher quand il veut d\'ici la prochaine question.)' },
  { id: 'rime', text: 'Le meneur dit un mot, chacun doit enchaîner avec une rime. Le premier qui sèche boit.' },
  { id: 'santetout', text: 'Petite pause santé : tout le monde trinque et boit une gorgée ensemble 🥂.' },
  { id: 'chef', text: 'Chef élu : {0}. Jusqu\'au prochain défi, quand {0} boit, tout le monde boit.', picks: 1 },
  { id: 'statue', text: "Statue : au prochain « statue ! » du meneur, le premier qui bouge boit 2 gorgées." },
  { id: 'motinterdit', text: "Mot interdit : le meneur bannit un mot jusqu'au prochain défi. Le prononcer coûte 1 gorgée à chaque fois." },
  { id: 'accent', text: "Tout le monde parle avec l'accent choisi par le meneur jusqu'au prochain défi. Oubli = 1 gorgée." },
  { id: 'vouvoiement', text: "On se vouvoie tous jusqu'au prochain défi. Un tutoiement qui échappe = 1 gorgée." },
  { id: 'gorgeecadeau', text: 'Gorgée cadeau 🎁 : {0} récolte 3 gorgées, à boire ou à distribuer.', picks: 1 },
  { id: 'binome', text: '{0} et {1} sont binômes : si l\'un des deux se trompe à la prochaine question, vous buvez tous les deux.', picks: 2 },
  { id: 'chanson', text: "Le meneur impose un mot : chacun son tour cite une chanson qui le contient. Le premier qui sèche boit." },
  { id: 'shifumi', text: 'Pierre-feuille-ciseaux : {0} affronte {1}, le perdant boit 2 gorgées.', picks: 2 },
  { id: 'grimace', text: "Concours de grimaces : celui qui fait craquer le meneur de rire gagne, tous les autres boivent." },
  { id: 'silence', text: 'Silence total : le premier qui parle avant la fin du minuteur boit 2 gorgées.', timerSec: 30 },
  { id: 'benjamin', text: "Le plus jeune et le plus âgé de la table distribuent chacun 2 gorgées." },
  { id: 'prenoms', text: "Interdit d'appeler quelqu'un par son prénom jusqu'au prochain défi. Erreur = 1 gorgée." },
  { id: 'echange', text: '{0} et {1} échangent leur place pour les deux prochaines questions.', picks: 2 },
  { id: 'petitpont', text: '{0} : le meneur te pose une question surprise. Hésitation ou blague ratée = 1 gorgée.', picks: 1 },
  { id: 'mainlevee', text: "Le meneur lève la main quand il veut d'ici la prochaine question : le dernier à lever la sienne boit." },
  { id: 'regleperso', text: "Le meneur invente une règle pour toute la table jusqu'au prochain défi, et la fait respecter." },
];

/**
 * Maybe return a random challenge to play before the next question.
 *
 * `exclude` = ids des défis récemment tombés : on les évite pour ne pas radoter.
 * Si tout est exclu (petite liste), on repart de la liste complète.
 */
export function maybeChallenge(
  rng: Rng,
  intensity: DrinkIntensity,
  challenges: DrinkChallenge[] = DRINK_CHALLENGES,
  exclude: readonly string[] = [],
): DrinkChallenge | null {
  if (challenges.length === 0) return null;
  if (!chance(rng, CHALLENGE_PROBABILITY[intensity])) return null;
  const excl = new Set(exclude);
  const fresh = challenges.filter((c) => !excl.has(c.id));
  return pick(fresh.length > 0 ? fresh : challenges, rng);
}
