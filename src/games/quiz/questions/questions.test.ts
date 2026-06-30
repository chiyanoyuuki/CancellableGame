import { THEMES } from '../../../core/models';
import { QUESTIONS } from './index';

const themeSet = new Set<string>(THEMES);

describe('banque de questions', () => {
  test('contient un bon volume de questions', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(120);
  });

  test('tous les identifiants sont uniques', () => {
    const ids = QUESTIONS.map((q) => q.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });

  test('chaque question est bien formée', () => {
    const problems: string[] = [];
    for (const q of QUESTIONS) {
      if (!q.id) problems.push('identifiant manquant');
      if (!themeSet.has(q.theme)) problems.push(`${q.id}: thème invalide (${q.theme})`);
      if (![1, 2, 3, 4].includes(q.difficulty)) problems.push(`${q.id}: difficulté invalide (${q.difficulty})`);
      if (!q.text || q.text.length === 0) problems.push(`${q.id}: texte vide`);
      if (!q.answer || q.answer.length === 0) problems.push(`${q.id}: réponse vide`);
      if (q.distractors.length < 3) problems.push(`${q.id}: moins de 3 distracteurs`);
      if (q.distractors.includes(q.answer)) problems.push(`${q.id}: la réponse figure dans les distracteurs`);
    }
    expect(problems).toEqual([]);
  });

  test('les médias sont cohérents', () => {
    const problems: string[] = [];
    for (const q of QUESTIONS) {
      if (!q.media) continue;
      if (q.media.type === 'image' && typeof q.media.uri !== 'string') problems.push(`${q.id}: uri image manquante`);
      if (q.media.type === 'emoji' && typeof q.media.emoji !== 'string') problems.push(`${q.id}: emoji manquant`);
    }
    expect(problems).toEqual([]);
  });

  test('couvre les niveaux moyen, difficile et hardcore', () => {
    const levels = new Set(QUESTIONS.map((q) => q.difficulty));
    expect(levels.has(2)).toBe(true);
    expect(levels.has(3)).toBe(true);
    expect(levels.has(4)).toBe(true);
  });
});
