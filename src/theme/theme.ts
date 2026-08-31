/** Centralised design tokens. Tweak these to restyle the whole app. */

import * as SQLite from 'expo-sqlite';

export type ThemeMode = 'dark' | 'light';

export type Palette = {
  bg: string;
  bgElevated: string;
  card: string;
  cardAlt: string;
  primary: string;
  primaryDark: string;
  accent: string;
  success: string;
  /** Fond teinté « bonne réponse » (surface, pas texte). */
  successBg: string;
  warning: string;
  danger: string;
  /** Fond teinté « mauvaise réponse » (surface, pas texte). */
  dangerBg: string;
  sip: string;
  text: string;
  textDim: string;
  textFaint: string;
  border: string;
  overlay: string;
  white: string;
  black: string;
};

/** Thème sombre — l'identité d'origine de l'app (soirées, ambiance nocturne). */
const dark: Palette = {
  bg: '#0e0b1e',
  bgElevated: '#171231',
  card: '#211b3a',
  cardAlt: '#2b2350',
  primary: '#7c5cff',
  primaryDark: '#5a3fd6',
  accent: '#ff5c8a',
  success: '#33d69f',
  successBg: '#17352a',
  warning: '#ffd166',
  danger: '#ff5c5c',
  dangerBg: '#3a1f28',
  sip: '#ffb454',
  text: '#f4f1ff',
  textDim: '#b3a9d9',
  textFaint: '#7a7099',
  border: '#352b5e',
  overlay: 'rgba(8,6,18,0.75)',
  white: '#ffffff',
  black: '#000000',
};

/** Thème clair — mêmes clés, contrastes ajustés pour un fond lumineux. */
const light: Palette = {
  bg: '#f5f3fc',
  bgElevated: '#ffffff',
  card: '#ffffff',
  cardAlt: '#ece8f8',
  primary: '#6d4de6',
  primaryDark: '#5334c0',
  accent: '#e23a74',
  success: '#0fa678',
  successBg: '#daf4ea',
  warning: '#c98a00',
  danger: '#d83a3a',
  dangerBg: '#fbe0e1',
  sip: '#d5760a',
  text: '#1a1626',
  textDim: '#5b5474',
  textFaint: '#8b83a6',
  border: '#e4dff2',
  overlay: 'rgba(20,16,40,0.35)',
  white: '#ffffff',
  black: '#000000',
};

export const PALETTES: Record<ThemeMode, Palette> = { dark, light };

/**
 * Lit de façon SYNCHRONE le thème choisi, directement dans la base SQLite, au
 * tout premier chargement du module (avant que le moindre `StyleSheet.create`
 * ne fige ses couleurs). C'est ce qui permet aux deux thèmes de s'afficher
 * parfaitement sans toucher aux ~34 fichiers qui consomment `colors`.
 *
 * Best-effort et blindé : en environnement de test (Jest/Node) ou si la table
 * n'existe pas encore (tout premier lancement), on retombe sur le thème sombre.
 */
function readInitialThemeSync(): ThemeMode {
  // Jamais d'appel natif sous Jest (testEnvironment: node).
  if (typeof process !== 'undefined' && process.env?.JEST_WORKER_ID !== undefined) return 'dark';
  try {
    const db = SQLite.openDatabaseSync('soiree.db');
    const row = db.getFirstSync<{ value: string }>("SELECT value FROM kv WHERE key = 'ui:theme'");
    if (row?.value) {
      const parsed = JSON.parse(row.value) as unknown;
      if (parsed === 'light') return 'light';
    }
  } catch {
    // base/table absente ou API indisponible → thème sombre par défaut
  }
  return 'dark';
}

/** Thème actif pour CETTE session (fixé au boot ; un changement recharge l'app). */
export const themeMode: ThemeMode = readInitialThemeSync();

/**
 * Jeton de couleurs de la session. Résolu une fois au démarrage : tous les
 * `StyleSheet.create` de niveau module lisent déjà la bonne palette.
 */
export const colors: Palette = { ...PALETTES[themeMode] };

export const spacing = (n: number): number => n * 8;

export const radius = { sm: 8, md: 14, lg: 22, xl: 30, pill: 999 };

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  huge: 48,
};

/** Palette offered when creating a player. */
export const PLAYER_COLORS = [
  '#7c5cff',
  '#ff5c8a',
  '#33d69f',
  '#ffd166',
  '#5cc6ff',
  '#ff8c42',
  '#c45cff',
  '#ff5c5c',
  '#52e0c4',
  '#a0e548',
];

/** Emojis offered as player avatars. */
export const PLAYER_EMOJIS = [
  '🦊', '🐼', '🐸', '🐯', '🦄', '🐙', '🐲', '🦁', '🐵', '🐧',
  '👽', '🤖', '🎃', '👑', '🍕', '🔥', '⚡', '🌮', '🦖', '🐝',
];

export const RANK_MEDALS = ['🥇', '🥈', '🥉'];
