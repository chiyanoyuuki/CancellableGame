import { daresForLevels } from '../../core/dares';
import type { Question } from '../../core/models';
import { mulberry32 } from '../../core/rng';
import {
  availableUniverses,
  drawChallenge,
  type DonjonsContentCtx,
  eligibleQuestions,
  pickQuestion,
} from './content';
import { JAIJAMAIS, jaijamaisForLevels } from './jaijamais';
import { VERITES, veritesForLevels } from './verites';

const q = (id: string, over: Partial<Question> = {}): Question => ({
  id,
  theme: 'culture',
  difficulty: 2,
  text: `Q${id}`,
  answer: 'a',
  distractors: ['b', 'c', 'd'],
  ...over,
});

const pool: Question[] = [
  q('1', { universe: 'Naruto', cancelLevel: undefined }), // niveau 1
  q('2', { universe: 'Naruto', cancelLevel: 2 }),
  q('3', { universe: 'Sexo 🔞', cancelLevel: 4, difficulty: 4 }),
  q('4', { universe: 'One Piece', cancelLevel: undefined }),
];

const ctx = (over: Partial<DonjonsContentCtx> = {}): DonjonsContentCtx => ({
  levels: [1, 2, 3, 4],
  quizPool: pool,
  dareCategory: 'soft',
  ...over,
});

describe('banques Vérités & J’ai jamais', () => {
  it('les banques de base sont non vides et sans doublon', () => {
    for (const bank of [VERITES, JAIJAMAIS]) {
      expect(bank.length).toBeGreaterThan(5);
      expect(new Set(bank).size).toBe(bank.length);
    }
  });

  it('forLevels : niveau 1 seul = banque de base', () => {
    expect(veritesForLevels([1])).toEqual(VERITES);
    expect(jaijamaisForLevels([1])).toEqual(JAIJAMAIS);
  });

  it('forLevels : les niveaux osés ajoutent du contenu, sans doublon', () => {
    const all = veritesForLevels([1, 2, 3, 4]);
    expect(all.length).toBeGreaterThan(VERITES.length);
    expect(new Set(all).size).toBe(all.length);
    const only4 = jaijamaisForLevels([4]);
    expect(only4.length).toBeGreaterThan(0);
    expect(JAIJAMAIS.some((j) => only4.includes(j))).toBe(false); // pas de base sans niveau 1
  });
});

describe('sélection de questions', () => {
  it('eligibleQuestions filtre par niveaux actifs', () => {
    expect(eligibleQuestions(pool, { levels: [1] }).map((x) => x.id)).toEqual(['1', '4']);
    expect(eligibleQuestions(pool, { levels: [4] }).map((x) => x.id)).toEqual(['3']);
    expect(eligibleQuestions(pool, { levels: [1, 2] }).map((x) => x.id).sort()).toEqual(['1', '2', '4']);
  });

  it('eligibleQuestions filtre par univers et exclusions', () => {
    expect(eligibleQuestions(pool, { levels: [1, 2, 3, 4], universe: 'Naruto' }).map((x) => x.id)).toEqual(['1', '2']);
    const excl = new Set(['1']);
    expect(eligibleQuestions(pool, { levels: [1], excludeIds: excl }).map((x) => x.id)).toEqual(['4']);
  });

  it('availableUniverses ne liste que les univers des niveaux actifs', () => {
    expect(availableUniverses(pool, [1])).toEqual(['Naruto', 'One Piece']);
    expect(availableUniverses(pool, [4])).toEqual(['Sexo 🔞']);
  });

  it('pickQuestion renvoie une question éligible, null si rien', () => {
    const picked = pickQuestion(pool, { levels: [4] }, mulberry32(1));
    expect(picked?.id).toBe('3');
    expect(pickQuestion([], { levels: [1] }, mulberry32(1))).toBeNull();
    // aucun univers "Bleach" → null
    expect(pickQuestion(pool, { levels: [1, 2, 3, 4], universe: 'Bleach' }, mulberry32(1))).toBeNull();
  });
});

describe('drawChallenge', () => {
  it('question : renvoie la question + sa difficulté (pour le DC)', () => {
    const d = drawChallenge('question', ctx({ universe: 'Sexo 🔞' }), mulberry32(3));
    expect(d).not.toBeNull();
    if (d && d.card === 'question') {
      expect(d.question.id).toBe('3');
      expect(d.difficulty).toBe(4);
    }
  });

  it('question sans contenu disponible → null (l’appelant re-tire)', () => {
    expect(drawChallenge('question', ctx({ quizPool: [] }), mulberry32(3))).toBeNull();
  });

  it('action : renvoie un gage de la banque des niveaux actifs', () => {
    const d = drawChallenge('action', ctx({ levels: [1] }), mulberry32(5));
    expect(d && d.card === 'action').toBe(true);
    if (d && d.card === 'action') expect(daresForLevels('soft', [1])).toContain(d.text);
  });

  it('verite & jaijamais : renvoient un texte des banques dédiées', () => {
    const v = drawChallenge('verite', ctx({ levels: [1] }), mulberry32(7));
    const j = drawChallenge('jaijamais', ctx({ levels: [1] }), mulberry32(7));
    if (v && v.card === 'verite') expect(veritesForLevels([1])).toContain(v.text);
    if (j && j.card === 'jaijamais') expect(jaijamaisForLevels([1])).toContain(j.text);
  });

  it('duel : pas de contenu (jets opposés)', () => {
    expect(drawChallenge('duel', ctx(), mulberry32(1))).toEqual({ card: 'duel' });
  });
});
