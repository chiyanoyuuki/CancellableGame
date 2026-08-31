import type { Question } from './models';
import { mulberry32, shuffle } from './rng';

/**
 * Défi du jour — logique pure et testable.
 *
 * Un même jour donne le MÊME set de questions pour tout le monde (graine dérivée
 * de la date), et il change chaque jour. Une « série » (streak) compte les jours
 * consécutifs où le défi a été complété. Aucun I/O ici : l'écran lit/écrit l'état
 * via le kv.
 */

export const DAILY_COUNT = 10;

/** Clé de date locale AAAA-MM-JJ. */
export function dateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Clé de la veille de `now`. */
export function previousDateKey(now: Date = new Date()): string {
  return dateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
}

/** Graine entière déterministe à partir d'une chaîne (FNV-1a 32 bits). */
export function seedFromString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface DailyQuestion {
  question: Question;
  /** Réponse + distracteurs, dans un ordre mélangé de façon déterministe. */
  options: string[];
}

/**
 * Construit le défi du jour : `count` questions tirées de façon déterministe du
 * pool, options mélangées. On ne garde que les questions à choix multiple
 * « propres » et sans média (jouables hors-ligne, sans image à charger).
 */
export function buildDaily(pool: readonly Question[], key: string, count = DAILY_COUNT): DailyQuestion[] {
  const rng = mulberry32(seedFromString(key));
  const eligible = pool.filter(
    (q) => !q.media && q.distractors.length === 3 && !q.distractors.includes(q.answer),
  );
  const chosen = shuffle(eligible, rng).slice(0, Math.min(count, eligible.length));
  return chosen.map((q) => ({ question: q, options: shuffle([q.answer, ...q.distractors], rng) }));
}

export interface StreakState {
  /** Dernier jour où le défi a été complété (clé de date), ou null. */
  lastDate: string | null;
  current: number;
  best: number;
}

export const EMPTY_STREAK: StreakState = { lastDate: null, current: 0, best: 0 };

/** Vrai si le défi de `today` a déjà été complété. */
export function isDoneToday(state: StreakState, today: string): boolean {
  return state.lastDate === today;
}

/**
 * État après complétion du défi de `today`. Idempotent (rejouer le même jour ne
 * change rien). La série s'incrémente si la veille a été jouée, sinon repart à 1.
 */
export function completeDay(state: StreakState, today: string, yesterday: string): StreakState {
  if (state.lastDate === today) return state;
  const current = state.lastDate === yesterday ? state.current + 1 : 1;
  return { lastDate: today, current, best: Math.max(state.best, current) };
}

/**
 * Série « vivante » : si le dernier jour joué n'est ni aujourd'hui ni hier, la
 * série est rompue et vaut 0 à l'affichage (sans réécrire l'état stocké).
 */
export function liveStreak(state: StreakState, today: string, yesterday: string): number {
  if (state.lastDate === today || state.lastDate === yesterday) return state.current;
  return 0;
}
