import type { Question } from './models';
import { localizeQuestion } from './questionLocale';

const base: Question = {
  id: 'q1',
  theme: 'manga',
  universe: 'Naruto',
  difficulty: 1,
  text: 'Qui est le héros ?',
  answer: 'Naruto',
  distractors: ['Sasuke', 'Sakura', 'Kakashi'],
  explanation: 'Le ninja hyperactif du village de Konoha.',
};

describe('localizeQuestion', () => {
  it('renvoie la question inchangée en français', () => {
    expect(localizeQuestion(base, 'fr')).toBe(base);
  });

  it("renvoie l'objet tel quel en anglais sans aucune traduction", () => {
    expect(localizeQuestion(base, 'en')).toBe(base);
  });

  it('bascule sur les champs anglais présents', () => {
    const q: Question = {
      ...base,
      text_en: 'Who is the hero?',
      answer_en: 'Naruto',
      distractors_en: ['Sasuke', 'Sakura', 'Kakashi'],
      explanation_en: 'The hyperactive ninja of the Hidden Leaf Village.',
    };
    const en = localizeQuestion(q, 'en');
    expect(en.text).toBe('Who is the hero?');
    expect(en.distractors).toEqual(['Sasuke', 'Sakura', 'Kakashi']);
    expect(en.explanation).toBe('The hyperactive ninja of the Hidden Leaf Village.');
  });

  it('retombe champ par champ sur le français quand une traduction manque', () => {
    const q: Question = { ...base, text_en: 'Who is the hero?' };
    const en = localizeQuestion(q, 'en');
    expect(en.text).toBe('Who is the hero?');
    // answer / distractors / explanation non traduits → français conservé
    expect(en.answer).toBe('Naruto');
    expect(en.distractors).toEqual(['Sasuke', 'Sakura', 'Kakashi']);
    expect(en.explanation).toBe('Le ninja hyperactif du village de Konoha.');
  });
});
