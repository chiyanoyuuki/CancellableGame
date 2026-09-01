import type { SessionResult } from './models';

/**
 * « Mode Soirée » — fil rouge d'une soirée entière (pur et testable). On enchaîne
 * plusieurs manches de mini-jeux différents et un classement cumulé couronne le
 * champion de la soirée.
 *
 * Pour être ÉQUITABLE entre des jeux aux échelles de points très différentes
 * (le quiz donne des centaines de points, un duel se joue à l'élimination), on
 * ne cumule PAS les points bruts : chaque manche rapporte des points selon le
 * CLASSEMENT (1er = le plus). Barème : participants − rang + 1.
 */

export interface SoireePlayer {
  id: string;
  name: string;
  emoji: string;
  color: string;
  photoUri?: string;
}

export interface SoireeRound {
  gameId: string;
  winnerId: string | null;
  at: number;
}

export interface SoireeState {
  players: SoireePlayer[];
  /** Points cumulés de la soirée, par joueur. */
  points: Record<string, number>;
  rounds: SoireeRound[];
  startedAt: number;
  /**
   * Mode « Tournoi » : liste ordonnée des mini-jeux prévus. Absent pour une
   * Soirée libre (open-ended). Présent → nombre de manches fixé et cérémonie
   * de fin automatique une fois le programme épuisé.
   */
  plan?: string[];
}

export function createSoiree(players: SoireePlayer[], at: number = Date.now(), plan?: string[]): SoireeState {
  const points: Record<string, number> = {};
  for (const p of players) points[p.id] = 0;
  const base: SoireeState = { players, points, rounds: [], startedAt: at };
  if (plan && plan.length > 0) base.plan = [...plan];
  return base;
}

/** Mode Tournoi (un programme de manches est défini) ? */
export function isTournoi(state: SoireeState): boolean {
  return Array.isArray(state.plan) && state.plan.length > 0;
}

/** Prochain mini-jeu prévu du tournoi, ou null (soirée libre ou programme fini). */
export function nextPlannedGameId(state: SoireeState): string | null {
  if (!isTournoi(state)) return null;
  return state.plan![state.rounds.length] ?? null;
}

/** Nombre de manches restantes au programme du tournoi. */
export function plannedRemaining(state: SoireeState): number {
  if (!isTournoi(state)) return 0;
  return Math.max(0, state.plan!.length - state.rounds.length);
}

/** Tournoi terminé : toutes les manches prévues ont été jouées. */
export function isTournoiComplete(state: SoireeState): boolean {
  return isTournoi(state) && state.rounds.length >= state.plan!.length;
}

/** Points d'UNE manche par joueur selon le classement (1er = participants pts). */
export function roundPoints(result: SessionResult): Record<string, number> {
  const n = result.players.length;
  const out: Record<string, number> = {};
  for (const p of result.players) out[p.playerId] = Math.max(0, n - p.rank + 1);
  return out;
}

/**
 * Applique une manche à la soirée : crédite les points aux joueurs QUI FONT
 * PARTIE de la soirée (les autres — ex. équipes — sont ignorés) et journalise le
 * vainqueur. Renvoie un nouvel état (immuable).
 */
export function applyRound(state: SoireeState, result: SessionResult, at: number = Date.now()): SoireeState {
  const pts = roundPoints(result);
  const roster = new Set(state.players.map((p) => p.id));
  const points = { ...state.points };
  for (const [pid, add] of Object.entries(pts)) {
    if (roster.has(pid)) points[pid] = (points[pid] ?? 0) + add;
  }
  const top = [...result.players].sort((a, b) => a.rank - b.rank)[0];
  const winnerId = top && roster.has(top.playerId) ? top.playerId : null;
  return { ...state, points, rounds: [...state.rounds, { gameId: result.gameId, winnerId, at }] };
}

export interface SoireeStanding {
  player: SoireePlayer;
  points: number;
  rank: number;
}

/** Classement de la soirée, du plus de points au moins (rangs partagés en cas d'égalité). */
export function soireeStandings(state: SoireeState): SoireeStanding[] {
  const sorted = [...state.players].sort((a, b) => (state.points[b.id] ?? 0) - (state.points[a.id] ?? 0));
  const out: SoireeStanding[] = [];
  let rank = 0;
  let lastPts: number | null = null;
  let seen = 0;
  for (const p of sorted) {
    seen += 1;
    const pts = state.points[p.id] ?? 0;
    if (lastPts === null || pts < lastPts) {
      rank = seen;
      lastPts = pts;
    }
    out.push({ player: p, points: pts, rank });
  }
  return out;
}

/**
 * Joueurs à égalité en TÊTE (rang 1). Renvoie la liste seulement s'il y a
 * vraiment égalité (≥ 2 joueurs) et au moins une manche jouée ; sinon [].
 * Sert au « départage » : une manche surprise tranche entre eux.
 */
export function topTiedPlayerIds(state: SoireeState): string[] {
  if (state.rounds.length === 0) return [];
  const s = soireeStandings(state);
  const top = s.filter((x) => x.rank === 1);
  return top.length >= 2 ? top.map((x) => x.player.id) : [];
}

/**
 * Départage : crédite 1 point au vainqueur de la manche de départage pour
 * casser l'égalité en tête (le gagnant, jusque-là à égalité, passe seul devant).
 */
export function awardTieBreak(state: SoireeState, winnerId: string): SoireeState {
  return { ...state, points: { ...state.points, [winnerId]: (state.points[winnerId] ?? 0) + 1 } };
}

/** Champion de la soirée, ou null s'il y a égalité en tête (ou aucune manche). */
export function soireeChampion(state: SoireeState): SoireePlayer | null {
  if (state.rounds.length === 0) return null;
  const s = soireeStandings(state);
  if (s.length === 0) return null;
  if (s.length > 1 && s[1]!.rank === 1) return null; // égalité en tête
  return s[0]!.player;
}
