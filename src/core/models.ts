/**
 * Shared, framework-agnostic domain types.
 *
 * Nothing in src/core may import React Native or Expo: these modules are the
 * "engine" of the app and are unit-tested under plain Node (see *.test.ts).
 */

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export interface Player {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Quiz domain
// ---------------------------------------------------------------------------

/** 1 = facile, 2 = moyen, 3 = difficile */
export type Difficulty = 1 | 2 | 3;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Facile',
  2: 'Moyen',
  3: 'Difficile',
};

/** All quiz themes. Add new themes here and tag questions with them. */
export const THEMES = ['manga', 'jeuxvideo', 'series', 'films', 'musique', 'culture'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_META: Record<Theme, { label: string; emoji: string }> = {
  manga: { label: 'Manga / Anime', emoji: '🍥' },
  jeuxvideo: { label: 'Jeux vidéo', emoji: '🎮' },
  series: { label: 'Séries', emoji: '📺' },
  films: { label: 'Films', emoji: '🎬' },
  musique: { label: 'Musique', emoji: '🎵' },
  culture: { label: 'Culture générale', emoji: '🧠' },
};

export interface Question {
  id: string;
  theme: Theme;
  difficulty: Difficulty;
  text: string;
  /** Canonical correct answer. */
  answer: string;
  /** Other accepted spellings for the "open answer" mode. */
  acceptable?: string[];
  /** Wrong options used to build the QCM (at least 3 recommended). */
  distractors: string[];
  /** Progressive hints; revealing one costs points. */
  hints?: string[];
}

// ---------------------------------------------------------------------------
// Quiz configuration (chosen on the setup screen before a game)
// ---------------------------------------------------------------------------

/** Turn structure of a round. */
export type TurnMode = 'turn' | 'fastest';
// 'turn'    = chacun son tour : chaque joueur a sa propre question.
// 'fastest' = au plus rapide   : tout le monde court sur la même question.

/** Answer format. */
export type AnswerFormat = 'choices' | 'open';
// 'choices' = avec propositions (QCM).
// 'open'    = sans propositions (réponse libre, validée par l'hôte).

export type DrinkIntensity = 'soft' | 'normal' | 'hardcore';

export interface QuizConfig {
  themes: Theme[];
  difficulties: Difficulty[];
  questionCount: number;
  turnMode: TurnMode;
  answerFormat: AnswerFormat;
  hintsEnabled: boolean;
  drinksEnabled: boolean;
  drinkIntensity: DrinkIntensity;
  /** Time limit per question for the "fastest" mode (ms). */
  fastestTimeLimitMs: number;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  themes: [...THEMES],
  difficulties: [1, 2, 3],
  questionCount: 15,
  turnMode: 'turn',
  answerFormat: 'choices',
  hintsEnabled: true,
  drinksEnabled: true,
  drinkIntensity: 'normal',
  fastestTimeLimitMs: 20000,
};

// ---------------------------------------------------------------------------
// Generic, cross-game result contract
//
// EVERY mini-game emits a SessionResult when it finishes. The persistence and
// stats layers only know about this shape, which is what makes statistics
// "connected" across all games, players and time periods. A game may attach
// arbitrary game-specific data via `details` and `events`.
// ---------------------------------------------------------------------------

export interface PlayerSessionResult {
  playerId: string;
  points: number;
  /** 1 = winner. */
  rank: number;
  sipsDrunk: number;
  sipsGiven: number;
  details?: Record<string, unknown>;
}

export interface GameEvent {
  type: string;
  playerId: string | null;
  /** epoch ms; 0 if not tracked. */
  at: number;
  payload: Record<string, unknown>;
}

export interface SessionResult {
  gameId: string;
  /** Free-form mode label/code, e.g. "turn/choices". */
  mode: string;
  config: Record<string, unknown>;
  startedAt: number;
  endedAt: number;
  players: PlayerSessionResult[];
  events?: GameEvent[];
}
