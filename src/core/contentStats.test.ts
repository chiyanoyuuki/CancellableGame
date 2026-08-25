import { contentStats, isTranslated } from './contentStats';
import type { Question } from './models';

const Q = (over: Partial<Question> & Pick<Question, 'id' | 'theme' | 'difficulty'>): Question => ({
  text: 'q',
  answer: 'a',
  distractors: ['b', 'c', 'd'],
  ...over,
});

const bank: Question[] = [
  Q({ id: 'm1', theme: 'manga', universe: 'Naruto', difficulty: 1, text_en: 'q' }),
  Q({ id: 'm2', theme: 'manga', universe: 'Naruto', difficulty: 2 }),
  Q({ id: 'm3', theme: 'manga', universe: 'Bleach', difficulty: 3, text_en: 'q' }),
  Q({ id: 'c1', theme: 'culture', universe: 'Géographie', difficulty: 4, text_en: 'q' }),
  Q({ id: 'c2', theme: 'culture', difficulty: 1 }),
];

describe('isTranslated', () => {
  test('true only when an English prompt exists', () => {
    expect(isTranslated(bank[0]!)).toBe(true);
    expect(isTranslated(bank[1]!)).toBe(false);
  });
});

describe('contentStats', () => {
  const s = contentStats(bank);

  test('counts questions and translated total', () => {
    expect(s.totalQuestions).toBe(5);
    expect(s.translatedQuestions).toBe(3);
    expect(s.translatedRatio).toBeCloseTo(3 / 5);
  });

  test('counts distinct universes and present themes', () => {
    expect(s.totalUniverses).toBe(3); // Naruto, Bleach, Géographie
    expect(s.themesPresent).toBe(2); // manga, culture
  });

  test('per-theme coverage follows THEMES order', () => {
    expect(s.byTheme.map((c) => c.theme)).toEqual(['manga', 'culture']);
    const manga = s.byTheme.find((c) => c.theme === 'manga')!;
    expect(manga.total).toBe(3);
    expect(manga.translated).toBe(2); // m1 + m3 ont un text_en
    expect(manga.universes).toBe(2);
  });

  test('difficulty breakdown sums to the total', () => {
    const { byDifficulty } = s;
    expect(byDifficulty[1]).toBe(2);
    expect(byDifficulty[2]).toBe(1);
    expect(byDifficulty[3]).toBe(1);
    expect(byDifficulty[4]).toBe(1);
  });

  test('empty bank is safe', () => {
    const e = contentStats([]);
    expect(e.totalQuestions).toBe(0);
    expect(e.translatedRatio).toBe(0);
    expect(e.byTheme).toEqual([]);
  });
});
