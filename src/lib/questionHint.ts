import { type Theme, THEME_META } from '../core/models';

/**
 * Indice de contexte affiché avec CHAQUE question du quiz : l'univers, le thème,
 * les deux, ou rien — pour régler la difficulté. Par défaut « univers » : sans
 * lui, beaucoup de questions sont trop dures à deviner.
 *
 * Préférence globale (Réglages), en mémoire, persistée via la clé kv
 * `ui:questionHint` et chargée au démarrage — comme les vibrations/sons.
 */
export type QuestionHint = 'universe' | 'theme' | 'both' | 'none';

export const QUESTION_HINT_KV = 'ui:questionHint';

let current: QuestionHint = 'universe';

export function setQuestionHint(mode: QuestionHint): void {
  current = mode;
}
export function getQuestionHint(): QuestionHint {
  return current;
}

/** Vrai si le mode courant révèle l'univers précis (pour masquer les indices qui le divulguent). */
export function hintRevealsUniverse(mode: QuestionHint = current): boolean {
  return mode === 'universe' || mode === 'both';
}

/**
 * Texte d'indice pour une question donnée, selon le mode courant. Renvoie null
 * quand il ne faut rien afficher (« aucun »). En mode « univers », si la
 * question n'a pas d'univers précis (culture générale), on retombe sur le thème
 * pour toujours donner un minimum de contexte.
 */
export function questionHintText(
  theme: Theme,
  universe: string | undefined,
  t: (s: string) => string,
  mode: QuestionHint = current,
): string | null {
  if (mode === 'none') return null;
  const emoji = THEME_META[theme].emoji;
  const themeLabel = t(THEME_META[theme].label);
  if (mode === 'theme') return `${emoji} ${themeLabel}`;
  if (mode === 'universe') return `${emoji} ${universe ?? themeLabel}`;
  // both
  return universe ? `${emoji} ${themeLabel} · ${universe}` : `${emoji} ${themeLabel}`;
}
