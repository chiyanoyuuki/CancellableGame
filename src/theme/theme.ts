/** Centralised design tokens. Tweak these to restyle the whole app. */

export const colors = {
  bg: '#0e0b1e',
  bgElevated: '#171231',
  card: '#211b3a',
  cardAlt: '#2b2350',
  primary: '#7c5cff',
  primaryDark: '#5a3fd6',
  accent: '#ff5c8a',
  success: '#33d69f',
  warning: '#ffd166',
  danger: '#ff5c5c',
  sip: '#ffb454',
  text: '#f4f1ff',
  textDim: '#b3a9d9',
  textFaint: '#7a7099',
  border: '#352b5e',
  overlay: 'rgba(8,6,18,0.75)',
  white: '#ffffff',
  black: '#000000',
};

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
