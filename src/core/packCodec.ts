/**
 * Codec des « packs » de contenu perso : sérialise les questions et défis créés
 * par l'utilisateur en une chaîne de texte partageable (fichier .json partagé
 * via la feuille native), et la relit. Pur et testable (aucun import natif).
 *
 * Un pack importé est du contenu NON fiable : `decodePack` valide et borne tout
 * (thème connu, difficulté valide, longueurs et nombres plafonnés), et écarte
 * silencieusement les entrées invalides plutôt que de faire confiance.
 */
import type { CustomQuestionInput } from '../db/customQuestions';
import { type Difficulty, type Theme, THEMES } from './models';

export interface CustomPack {
  questions: CustomQuestionInput[];
  challenges: string[];
}

const MAGIC = 'CANCELLABLE-PACK';
const VERSION = 1;
const VERSION_MAX = 1;

const MAX_QUESTIONS = 1000;
const MAX_CHALLENGES = 500;
const MAX_TEXT = 400;
const MAX_SHORT = 120;
const MAX_LIST = 12;

const THEME_SET = new Set<string>(THEMES as readonly string[]);

export function encodePack(pack: CustomPack): string {
  return `${MAGIC}|${VERSION}|${JSON.stringify(pack)}`;
}

/** Vrai si la chaîne ressemble à un pack Cancellable (sans la valider en entier). */
export function isPackCode(raw: string): boolean {
  return typeof raw === 'string' && raw.trimStart().startsWith(`${MAGIC}|`);
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (s.length === 0) return null;
  return s.slice(0, max);
}

function strList(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    const s = str(item, maxLen);
    if (s) out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
}

function validQuestion(raw: unknown): CustomQuestionInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const q = raw as Record<string, unknown>;
  const theme = typeof q.theme === 'string' && THEME_SET.has(q.theme) ? (q.theme as Theme) : null;
  if (!theme) return null;
  const diffNum = Math.trunc(Number(q.difficulty));
  if (!(diffNum >= 1 && diffNum <= 4)) return null;
  const text = str(q.text, MAX_TEXT);
  const answer = str(q.answer, MAX_SHORT);
  if (!text || !answer) return null;
  const distractors = strList(q.distractors, MAX_LIST, MAX_SHORT);
  if (distractors.length === 0) return null;
  const universe = str(q.universe, MAX_SHORT);
  const acceptable = strList(q.acceptable, MAX_LIST, MAX_SHORT);
  const hints = strList(q.hints, MAX_LIST, MAX_TEXT);
  const out: CustomQuestionInput = {
    theme,
    difficulty: diffNum as Difficulty,
    text,
    answer,
    distractors,
  };
  if (universe) out.universe = universe;
  if (acceptable.length) out.acceptable = acceptable;
  if (hints.length) out.hints = hints;
  return out;
}

/** Relit un pack depuis une chaîne NON fiable. Renvoie null si irrécupérable. */
export function decodePack(raw: string): CustomPack | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const sep1 = trimmed.indexOf('|');
  if (sep1 < 0 || trimmed.slice(0, sep1) !== MAGIC) return null;
  const sep2 = trimmed.indexOf('|', sep1 + 1);
  if (sep2 < 0) return null;
  const version = Number(trimmed.slice(sep1 + 1, sep2));
  if (!(version >= 1 && version <= VERSION_MAX)) return null;
  let body: unknown;
  try {
    body = JSON.parse(trimmed.slice(sep2 + 1));
  } catch {
    return null;
  }
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const questions: CustomQuestionInput[] = [];
  if (Array.isArray(b.questions)) {
    for (const q of b.questions) {
      const valid = validQuestion(q);
      if (valid) questions.push(valid);
      if (questions.length >= MAX_QUESTIONS) break;
    }
  }
  const challenges = strList(b.challenges, MAX_CHALLENGES, MAX_TEXT);
  if (questions.length === 0 && challenges.length === 0) return null;
  return { questions, challenges };
}
