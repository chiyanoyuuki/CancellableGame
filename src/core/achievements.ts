import type { StatAnswer, StatResult } from './stats';

/**
 * Hauts faits À PALIERS (Bronze → Infini), par joueur — logique pure et testable.
 *
 * Chaque « piste » (track) suit une mesure cumulée (parties, victoires, bonnes
 * réponses…) et compte plusieurs paliers. Franchir un palier rapporte ses points ;
 * le total sur toutes les pistes donne un SCORE de hauts faits, base d'un
 * classement dédié. Tout se calcule sur la vie entière du joueur — un palier
 * gagné reste acquis. Les paliers les plus hauts sont volontairement énormes :
 * tout débloquer revient à « finir le jeu ».
 */

export type TierName =
  | 'bronze'
  | 'argent'
  | 'or'
  | 'platine'
  | 'diamant'
  | 'legende'
  | 'mythe'
  | 'cosmique'
  | 'infini';

export const TIER_ORDER: TierName[] = [
  'bronze',
  'argent',
  'or',
  'platine',
  'diamant',
  'legende',
  'mythe',
  'cosmique',
  'infini',
];

export const TIER_META: Record<TierName, { label: string; emoji: string; points: number; color: string }> = {
  bronze: { label: 'Bronze', emoji: '🥉', points: 5, color: '#cd7f32' },
  argent: { label: 'Argent', emoji: '🥈', points: 15, color: '#b8c0c8' },
  or: { label: 'Or', emoji: '🥇', points: 40, color: '#ffd447' },
  platine: { label: 'Platine', emoji: '💠', points: 100, color: '#7fe3d4' },
  diamant: { label: 'Diamant', emoji: '💎', points: 250, color: '#8ad3ff' },
  legende: { label: 'Légende', emoji: '👑', points: 600, color: '#ff7ae0' },
  mythe: { label: 'Mythe', emoji: '🔱', points: 1400, color: '#b07cff' },
  cosmique: { label: 'Cosmique', emoji: '🌌', points: 3200, color: '#5ac8ff' },
  infini: { label: 'Infini', emoji: '♾️', points: 7000, color: '#ff9f45' },
};

export interface TrackTier {
  tier: TierName;
  target: number;
  points: number;
}

export interface AchievementTrack {
  id: string;
  emoji: string;
  title: string;
  /** Ce que la mesure compte, ex. « parties jouées ». */
  desc: string;
  /** Unité affichée dans la progression (« parties », « pts »…). */
  unit: string;
  tiers: TrackTier[];
}

interface PlayerAgg {
  games: number;
  wins: number;
  winsByGame: Record<string, number>;
  questions: number;
  correct: number;
  hardCorrect: number;
  proCorrect: number;
  noHintCorrect: number;
  fastCorrect: number;
  themes: Set<string>;
  days: Set<number>;
  sipsDrunk: number;
  sipsGiven: number;
}

/** Une bonne réponse « éclair » : correcte en moins de 3 secondes. */
const FAST_MS = 3000;
const DAY_MS = 86_400_000;

type Metric = (a: PlayerAgg) => number;

/** Construit une piste : les cibles (croissantes) prennent les paliers dans l'ordre. */
function track(id: string, emoji: string, title: string, desc: string, unit: string, metric: Metric, targets: number[]): AchievementTrack & { metric: Metric } {
  const tiers: TrackTier[] = targets.slice(0, TIER_ORDER.length).map((target, i) => {
    const tier = TIER_ORDER[i] as TierName;
    return { tier, target, points: TIER_META[tier].points };
  });
  return { id, emoji, title, desc, unit, tiers, metric };
}

const TRACKS: (AchievementTrack & { metric: Metric })[] = [
  track('games', '🎮', 'Fêtard', 'Parties jouées', 'parties', (a) => a.games, [1, 10, 50, 150, 400, 1000, 2500, 6000, 15000]),
  track('wins', '🏆', 'Vainqueur', 'Parties gagnées', 'victoires', (a) => a.wins, [1, 10, 50, 150, 400, 1000, 2500, 6000, 15000]),
  track('nights', '🌙', 'Habitué des soirées', 'Soirées différentes', 'soirées', (a) => a.days.size, [1, 5, 15, 40, 100, 250, 600]),
  track('questions', '🧠', 'Curieux', 'Questions répondues', 'questions', (a) => a.questions, [10, 100, 500, 2000, 5000, 15000, 40000, 100000, 250000]),
  track('correct', '✅', 'Érudit', 'Bonnes réponses', 'bonnes', (a) => a.correct, [5, 50, 300, 1000, 3000, 10000, 30000, 80000, 200000]),
  track('hard', '🔥', 'Cerveau', 'Bonnes réponses difficiles', 'dures', (a) => a.hardCorrect, [5, 50, 250, 1000, 3000, 10000, 30000, 80000]),
  track('pro', '🎓', 'Expert', 'Bonnes réponses pro', 'pro', (a) => a.proCorrect, [3, 25, 150, 600, 2000, 7000, 20000, 60000]),
  track('nohint', '🎯', 'Puriste', 'Bonnes réponses sans indice', 'sans indice', (a) => a.noHintCorrect, [10, 100, 500, 2000, 6000, 20000, 60000, 150000]),
  track('fast', '⚡', 'Éclair', 'Bonnes réponses en moins de 3 s', 'éclair', (a) => a.fastCorrect, [1, 20, 100, 500, 1500, 5000, 15000, 40000]),
  track('themes', '🌍', 'Touche-à-tout', 'Thèmes explorés', 'thèmes', (a) => a.themes.size, [2, 4, 7, 10, 13, 16, 18, 20]),
  track('sips', '🍺', 'Bonne descente', 'Gorgées bues', 'gorgées', (a) => a.sipsDrunk, [5, 30, 150, 500, 1500, 5000, 15000, 40000]),
  track('given', '🤙', 'Généreux', 'Gorgées offertes', 'offertes', (a) => a.sipsGiven, [5, 30, 150, 500, 1500, 5000, 15000]),
  track('quiz', '❓', 'Roi du Quiz', 'Quiz gagnés', 'quiz', (a) => a.winsByGame.quiz ?? 0, [1, 10, 50, 150, 400, 1000, 2500, 6000]),
  track('bombe', '💣', 'Démineur', 'Bombes gagnées', 'bombes', (a) => a.winsByGame.bombe ?? 0, [1, 10, 50, 150, 400, 1000, 2500]),
  track('duel', '⚔️', 'Duelliste', 'Duels gagnés', 'duels', (a) => a.winsByGame.duel ?? 0, [1, 10, 50, 150, 400, 1000, 2500]),
  track('ultimate', '🥊', 'Maître ultime', 'Duels Ultimes gagnés', 'ultimes', (a) => a.winsByGame.duelultime ?? 0, [1, 5, 25, 100, 300, 800, 2000]),
  track('imposteur', '🕵️', 'Maître du bluff', 'Parties Imposteur gagnées', 'imposteur', (a) => a.winsByGame.imposteur ?? 0, [1, 10, 50, 150, 400]),
];

/** Toutes les pistes (sans la fonction de mesure), pour l'affichage. */
export const ACHIEVEMENT_TRACKS: AchievementTrack[] = TRACKS.map(({ metric: _m, ...t }) => t);

export interface TrackProgress {
  track: AchievementTrack;
  /** Valeur brute de la mesure. */
  value: number;
  /** Palier le plus haut atteint (null = aucun). */
  current: TierName | null;
  /** Prochain palier à atteindre (null si tout est atteint). */
  next: TrackTier | null;
  /** Nombre de paliers franchis sur cette piste. */
  tiersReached: number;
  /** Points cumulés des paliers franchis (chaque palier rapporte les siens). */
  points: number;
}

function emptyAgg(): PlayerAgg {
  return {
    games: 0, wins: 0, winsByGame: {}, questions: 0, correct: 0, hardCorrect: 0, proCorrect: 0,
    noHintCorrect: 0, fastCorrect: 0, themes: new Set(), days: new Set(), sipsDrunk: 0, sipsGiven: 0,
  };
}

function aggregate(results: readonly StatResult[], answers: readonly StatAnswer[]): Map<string, PlayerAgg> {
  const map = new Map<string, PlayerAgg>();
  const get = (id: string): PlayerAgg => {
    let a = map.get(id);
    if (!a) {
      a = emptyAgg();
      map.set(id, a);
    }
    return a;
  };

  for (const r of results) {
    // On ignore les lignes d'ÉQUIPE : les hauts faits sont personnels.
    if ((r.details as { team?: boolean } | undefined)?.team) continue;
    const a = get(r.playerId);
    a.games += 1;
    a.sipsDrunk += r.sipsDrunk;
    a.sipsGiven += r.sipsGiven;
    a.days.add(Math.floor(r.startedAt / DAY_MS));
    if (r.rank === 1) {
      a.wins += 1;
      a.winsByGame[r.gameId] = (a.winsByGame[r.gameId] ?? 0) + 1;
    }
  }

  for (const ans of answers) {
    const a = get(ans.playerId);
    a.questions += 1;
    a.themes.add(ans.theme);
    if (ans.correct) {
      a.correct += 1;
      if (ans.difficulty >= 3) a.hardCorrect += 1;
      if (ans.difficulty >= 4) a.proCorrect += 1;
      if ((ans.hintsUsed ?? 0) === 0) a.noHintCorrect += 1;
      if (ans.timeMs != null && ans.timeMs < FAST_MS) a.fastCorrect += 1;
    }
  }

  return map;
}

/** Progression d'une piste pour une valeur donnée (paliers franchis + points cumulés). */
export function trackProgress(t: AchievementTrack, value: number): TrackProgress {
  let current: TierName | null = null;
  let next: TrackTier | null = null;
  let points = 0;
  let tiersReached = 0;
  for (const tier of t.tiers) {
    if (value >= tier.target) {
      current = tier.tier;
      points += tier.points;
      tiersReached += 1;
    } else {
      next = tier;
      break;
    }
  }
  return { track: t, value, current, next, tiersReached, points };
}

/** Progression de toutes les pistes, par joueur. */
export function playerAchievements(
  results: readonly StatResult[],
  answers: readonly StatAnswer[],
): Record<string, TrackProgress[]> {
  const agg = aggregate(results, answers);
  const out: Record<string, TrackProgress[]> = {};
  for (const [pid, a] of agg) {
    out[pid] = TRACKS.map((t) => trackProgress(t, t.metric(a)));
  }
  return out;
}

/** Somme des points de hauts faits pour une liste de pistes. */
export function achievementScore(list: readonly TrackProgress[] | undefined): number {
  return (list ?? []).reduce((s, p) => s + p.points, 0);
}

/** Résumé : paliers franchis, points, et points maximum atteignables. */
export function achievementSummary(list: readonly TrackProgress[] | undefined): { tiers: number; points: number; maxPoints: number } {
  const tiers = (list ?? []).reduce((s, p) => s + p.tiersReached, 0);
  return { tiers, points: achievementScore(list), maxPoints: MAX_POINTS };
}

/** Points maximum possibles (tous paliers de toutes les pistes). */
export const MAX_POINTS: number = TRACKS.reduce((s, t) => s + t.tiers.reduce((a, x) => a + x.points, 0), 0);

/** Score de hauts faits par joueur (pour un classement). */
export function achievementScoresByPlayer(
  results: readonly StatResult[],
  answers: readonly StatAnswer[],
): Record<string, { points: number; tiers: number }> {
  const per = playerAchievements(results, answers);
  const out: Record<string, { points: number; tiers: number }> = {};
  for (const [pid, list] of Object.entries(per)) {
    out[pid] = { points: achievementScore(list), tiers: list.reduce((s, p) => s + p.tiersReached, 0) };
  }
  return out;
}

/**
 * Palier « général » d'un profil : un niveau de compte global déduit du TOTAL
 * de points de hauts faits (toutes pistes confondues). Sert de cadre coloré
 * autour de l'avatar. `null` tant qu'aucun seuil n'est atteint.
 */
const GENERAL_TIER_MIN: Record<TierName, number> = {
  bronze: 20,
  argent: 80,
  or: 250,
  platine: 700,
  diamant: 1800,
  legende: 4500,
  mythe: 11000,
  cosmique: 28000,
  infini: 70000,
};

export function generalTier(points: number): TierName | null {
  let out: TierName | null = null;
  for (const t of TIER_ORDER) {
    if (points >= GENERAL_TIER_MIN[t]) out = t;
    else break;
  }
  return out;
}
