import { uid } from '../core/id';
import { type Difficulty, type Question, type Theme, THEMES } from '../core/models';
import { getDb } from './database';

/** Questions ajoutées par l'utilisateur, fusionnées à la banque intégrée. */

export interface CustomQuestionInput {
  theme: Theme;
  universe?: string;
  difficulty: Difficulty;
  text: string;
  answer: string;
  acceptable?: string[];
  distractors: string[];
  hints?: string[];
}

export type CustomQuestion = CustomQuestionInput & { id: string };

interface Row {
  id: string;
  theme: string;
  universe: string | null;
  difficulty: number;
  text: string;
  answer: string;
  acceptable: string | null;
  distractors: string;
  hints: string | null;
  created_at: number;
}

const THEME_SET = new Set<string>(THEMES);

function parseArr(s: string | null): string[] | undefined {
  if (!s) return undefined;
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : undefined;
  } catch {
    return undefined;
  }
}

export async function addCustomQuestion(input: CustomQuestionInput): Promise<string> {
  const db = await getDb();
  const id = `cq-${uid()}`;
  await db.runAsync(
    'INSERT INTO custom_questions (id, theme, universe, difficulty, text, answer, acceptable, distractors, hints, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      input.theme,
      input.universe?.trim() || null,
      input.difficulty,
      input.text.trim(),
      input.answer.trim(),
      input.acceptable && input.acceptable.length ? JSON.stringify(input.acceptable) : null,
      JSON.stringify((input.distractors ?? []).map((d) => d.trim()).filter((d) => d.length > 0)),
      input.hints && input.hints.length ? JSON.stringify(input.hints) : null,
      Date.now(),
    ],
  );
  return id;
}

export async function listCustomQuestions(): Promise<CustomQuestion[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM custom_questions ORDER BY created_at DESC');
  return rows.map((r) => ({
    id: r.id,
    theme: r.theme as Theme,
    universe: r.universe ?? undefined,
    difficulty: r.difficulty as Difficulty,
    text: r.text,
    answer: r.answer,
    acceptable: parseArr(r.acceptable),
    distractors: parseArr(r.distractors) ?? [],
    hints: parseArr(r.hints),
  }));
}

export async function deleteCustomQuestion(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM custom_questions WHERE id = ?', [id]);
}

export async function countCustomQuestions(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM custom_questions');
  return row?.c ?? 0;
}

/** Custom questions mapped to the generic Question shape, for the quiz pool. */
export async function loadCustomQuestionsAsQuestions(): Promise<Question[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM custom_questions');
  const out: Question[] = [];
  for (const r of rows) {
    if (!THEME_SET.has(r.theme)) continue; // ignore an orphaned/invalid theme
    const q: Question = {
      id: r.id,
      theme: r.theme as Theme,
      difficulty: r.difficulty as Difficulty,
      text: r.text,
      answer: r.answer,
      distractors: parseArr(r.distractors) ?? [],
    };
    if (r.universe) q.universe = r.universe;
    const acc = parseArr(r.acceptable);
    if (acc) q.acceptable = acc;
    const hints = parseArr(r.hints);
    if (hints) q.hints = hints;
    out.push(q);
  }
  return out;
}
