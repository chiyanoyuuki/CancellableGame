import type { Difficulty, DuelConfig, Player, Question, Theme } from './models';
import { createDuelState, duelDifficulty, duelReducer, type DuelState } from './duelEngine';

const players: Player[] = [
  { id: 'p1', name: 'Alice', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'Bob', emoji: '🐼', color: '#0f0' },
  { id: 'p3', name: 'Cléo', emoji: '🐸', color: '#00f' },
];

const PER: Record<Difficulty, number> = { 1: 5, 2: 10, 3: 15, 4: 20 };
const pool: Question[] = [];
for (const [theme, uni] of [
  ['manga', 'Naruto'],
  ['films', 'Marvel'],
] as [Theme, string][]) {
  for (const d of [1, 2, 3, 4] as Difficulty[]) {
    for (let i = 0; i < PER[d]; i++) {
      pool.push({ id: `${uni}-${d}-${i}`, theme, universe: uni, difficulty: d, text: `${uni}-${d}-${i}`, answer: 'bon', distractors: ['a', 'b', 'c'] });
    }
  }
}

const ALL_JOKERS = { props4: true, props2: true, playerHelp: true, otherUniverse: true };

function config(over: Partial<DuelConfig> = {}): DuelConfig {
  return { universes: ['Naruto', 'Marvel'], jokers: ALL_JOKERS, ...over };
}

const start = (order: string[], over: Partial<DuelConfig> = {}) =>
  createDuelState({ config: config(over), players, pool, seed: 1, order });

const turn = (s: DuelState, correct: boolean) =>
  duelReducer(duelReducer(s, { type: 'ANSWER', correct }), { type: 'CONTINUE' });

describe('duelDifficulty (barème PAR JOUEUR 3/3/2 puis pro)', () => {
  test('3 faciles, 3 moyennes, 2 dures, puis tout le reste en pro', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 20].map(duelDifficulty)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4]);
  });
});

describe('createDuelState', () => {
  test('la première question est pour le premier joueur, facile, dans un univers choisi', () => {
    const s = start(['p1', 'p2', 'p3']);
    expect(s.activeId).toBe('p1');
    expect(s.current?.difficulty).toBe(1);
    expect(['Naruto', 'Marvel']).toContain(s.current?.universe);
    expect(s.phase).toBe('question');
  });
});

describe('difficulté croissante par joueur', () => {
  test('les questions d’un joueur suivent 3 faciles, 3 moyennes, 2 dures, puis pro', () => {
    let s = start(['p1', 'p2']);
    const p1diffs: number[] = [];
    for (let i = 0; i < 18; i++) {
      if (s.activeId === 'p1' && s.current) p1diffs.push(s.current.difficulty);
      s = turn(s, true);
    }
    expect(p1diffs.slice(0, 9)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 4]);
  });

  test('chacun son tour', () => {
    let s = start(['p1', 'p2', 'p3']);
    const ids: (string | null)[] = [];
    for (let i = 0; i < 6; i++) {
      ids.push(s.activeId);
      s = turn(s, true);
    }
    expect(ids).toEqual(['p1', 'p2', 'p3', 'p1', 'p2', 'p3']);
  });
});

describe('élimination et dernier debout', () => {
  test('une mauvaise réponse envoie en reveal puis élimine', () => {
    let s = start(['p1', 'p2']);
    s = duelReducer(s, { type: 'ANSWER', correct: false });
    expect(s.phase).toBe('reveal');
    expect(s.lastCorrect).toBe(false);
    expect(s.lastEliminatedId).toBe('p1');
    s = duelReducer(s, { type: 'CONTINUE' });
    expect(s.phase).toBe('finished');
    expect(s.winnerId).toBe('p2');
    expect(s.eliminationOrder).toEqual(['p1']);
  });

  test('à trois, la partie continue jusqu’au dernier survivant', () => {
    let s = start(['p1', 'p2', 'p3']);
    s = turn(s, false); // p1 éliminé → p2 actif
    expect(s.phase).toBe('question');
    expect(s.activeId).toBe('p2');
    expect(s.alive).toEqual(['p2', 'p3']);
    s = turn(s, true); // p2 juste → p3
    expect(s.activeId).toBe('p3');
    s = turn(s, false); // p3 éliminé → il ne reste que p2
    expect(s.phase).toBe('finished');
    expect(s.winnerId).toBe('p2');
    expect(s.eliminationOrder).toEqual(['p1', 'p3']);
  });
});

describe('jokers (un de chaque par joueur, activables)', () => {
  test('joker désactivé : USE_JOKER est ignoré', () => {
    let s = start(['p1', 'p2'], { jokers: { ...ALL_JOKERS, props4: false } });
    s = duelReducer(s, { type: 'USE_JOKER', joker: 'props4' });
    expect(s.propsShown).toBe(0);
  });

  test('props4 puis props2, chacun consommé une fois', () => {
    let s = start(['p1', 'p2']);
    s = duelReducer(s, { type: 'USE_JOKER', joker: 'props4' });
    expect(s.propsShown).toBe(4);
    expect(s.jokersUsed.p1).toContain('props4');
    s = duelReducer(s, { type: 'USE_JOKER', joker: 'props2' });
    expect(s.propsShown).toBe(2);
    // props4 déjà utilisé : ignoré.
    const before = s;
    expect(duelReducer(s, { type: 'USE_JOKER', joker: 'props4' })).toBe(before);
  });

  test('playerHelp : marque l’aide demandée et consomme le joker', () => {
    let s = start(['p1', 'p2']);
    s = duelReducer(s, { type: 'USE_JOKER', joker: 'playerHelp' });
    expect(s.helpUsed).toBe(true);
    expect(s.jokersUsed.p1).toContain('playerHelp');
  });

  test('otherUniverse : une question d’un autre univers, même difficulté', () => {
    let s = start(['p1', 'p2']);
    const u0 = s.current?.universe;
    const d0 = s.current?.difficulty;
    s = duelReducer(s, { type: 'USE_JOKER', joker: 'otherUniverse' });
    expect(s.current?.universe).not.toBe(u0);
    expect(s.current?.difficulty).toBe(d0);
    expect(s.jokersUsed.p1).toContain('otherUniverse');
  });

  test('un joker est à usage unique pour toute la partie', () => {
    let s = start(['p1', 'p2']);
    s = duelReducer(s, { type: 'USE_JOKER', joker: 'playerHelp' }); // p1 sur Q1
    s = turn(s, true);
    s = turn(s, true); // retour à p1
    expect(s.activeId).toBe('p1');
    expect(s.helpUsed).toBe(false); // remis à zéro à la nouvelle question
    s = duelReducer(s, { type: 'USE_JOKER', joker: 'playerHelp' }); // déjà consommé
    expect(s.helpUsed).toBe(false);
    expect(s.jokersUsed.p1).toEqual(['playerHelp']);
  });
});
