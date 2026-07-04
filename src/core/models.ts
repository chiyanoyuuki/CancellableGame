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

/** 1 = facile, 2 = moyen, 3 = difficile, 4 = hardcore */
export type Difficulty = 1 | 2 | 3 | 4;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Facile',
  2: 'Moyen',
  3: 'Difficile',
  4: 'Pro',
};

/** All quiz themes. Add new themes here and tag questions with them. */
export const THEMES = [
  'manga',
  'jeuxvideo',
  'series',
  'films',
  'musique',
  'culture',
  'internet',
  'mythologie',
  'enigmes',
  'rebus',
  'blindtest',
  'images',
] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_META: Record<Theme, { label: string; emoji: string }> = {
  manga: { label: 'Manga / Anime', emoji: '🍥' },
  jeuxvideo: { label: 'Jeux vidéo', emoji: '🎮' },
  series: { label: 'Séries', emoji: '📺' },
  films: { label: 'Films', emoji: '🎬' },
  musique: { label: 'Musique', emoji: '🎵' },
  culture: { label: 'Culture générale', emoji: '🧠' },
  internet: { label: 'Références Internet', emoji: '🌐' },
  mythologie: { label: 'Mythologie', emoji: '🏛️' },
  enigmes: { label: 'Énigmes', emoji: '🧩' },
  rebus: { label: 'Rébus emoji', emoji: '🤔' },
  blindtest: { label: 'Blind test', emoji: '🎧' },
  images: { label: 'Image mystère', emoji: '📸' },
};

/**
 * Optional media shown with a question.
 * - 'emoji' : un rébus affiché en grand (ex. "🦁👑").
 * - 'image' : une image (PNG/JPG) via `uri` (distante) ou `module` (embarquée).
 * - 'audio' : un extrait à écouter via `uri` (distant) ou `module` (embarqué).
 *
 * `module` est le résultat d'un require('...') d'un fichier du projet : à
 * privilégier pour un usage hors-ligne et fiable (cf. assets/audio/).
 */
export interface QuestionMedia {
  type: 'emoji' | 'image' | 'audio';
  uri?: string;
  emoji?: string;
  module?: number;
}

export interface Question {
  id: string;
  theme: Theme;
  /** Sous-catégorie : l'univers (ex. "Naruto", "Breaking Bad"). Facultatif. */
  universe?: string;
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
  /** Optional image / emoji rebus shown above the question. */
  media?: QuestionMedia;
}

// ---------------------------------------------------------------------------
// Quiz configuration (chosen on the setup screen before a game)
// ---------------------------------------------------------------------------

/** Turn structure of a round. */
export type TurnMode = 'turn' | 'fastest';
// 'turn'    = chacun son tour : chaque joueur a sa propre question.
// 'fastest' = au plus rapide   : tout le monde court sur la même question.
//
// Le format de réponse n'est plus un réglage : chaque question démarre en
// « réponse libre » (points pleins) et le joueur peut demander de l'aide en
// cours de question (2 ou 4 propositions, un indice), ce qui réduit les points.

export type DrinkIntensity = 'soft' | 'normal' | 'hardcore';

export interface QuizConfig {
  themes: Theme[];
  difficulties: Difficulty[];
  questionCount: number;
  turnMode: TurnMode;
  drinksEnabled: boolean;
  drinkIntensity: DrinkIntensity;
  /** Time limit per question for the "fastest" mode (ms). */
  fastestTimeLimitMs: number;
  /** Show the current universe during the game (e.g. "Naruto"). */
  showUniverse: boolean;
  /** Universes (sub-categories) explicitly turned off for this game. */
  excludedUniverses: string[];
  /** Informative per-question countdown in seconds (0 = disabled). */
  questionTimerSec: number;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  // Blind test exclu par défaut : il faut y ajouter ses propres extraits audio.
  themes: ['manga', 'jeuxvideo', 'series', 'films', 'musique', 'culture', 'internet', 'mythologie', 'enigmes', 'rebus'],
  difficulties: [1, 2, 3],
  questionCount: 15,
  turnMode: 'turn',
  drinksEnabled: true,
  drinkIntensity: 'normal',
  fastestTimeLimitMs: 20000,
  showUniverse: true,
  excludedUniverses: [],
  questionTimerSec: 0,
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
  /** Free-form mode label/code, e.g. "turn" or "fastest". */
  mode: string;
  config: Record<string, unknown>;
  startedAt: number;
  endedAt: number;
  players: PlayerSessionResult[];
  events?: GameEvent[];
}
