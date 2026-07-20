import type { Difficulty, DuelConfig, Player, Question, Theme } from './models';
import { createDuelState, duelDifficulty, duelReducer, type DuelState } from './duelEngine';

const players: Player[] = [
  { id: 'p1', name: 'Alice', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'Bob', emoji: '🐼', color: '#0f0' },
  { id: 'p3', name: 'Cléo', emoji: '🐸', color: '#00f' },
];

function q(id: string, theme: Theme, d: Difficulty): Question {
  return { id, theme, difficulty: d, text: id, answer: 'bon', distractors: ['a', 'b', 'c'] };
}

const pool: Question[] = [];
for (const t of ['manga', 'films', 'culture'] as Theme[]) {
  for (const d of [1, 2, 3, 4] as Difficulty[]) {
    for (let i = 0; i < 15; i++) pool.push(q(`${t}-${d}-${i}`, t, d));
  }
}

function config(over: Partial<DuelConfig> = {}): DuelConfig {
  return { themesByPlayer: { p1: 'manga', p2: 'films', p3: 'culture' }, allowPropositions: true, ...over };
}

const start = (order: string[], over: Partial<DuelConfig> = {}) =>
  createDuelState({ config: config(over), players, pool, seed: 1, order });

const turn = (s: DuelState, correct: boolean) =>
  duelReducer(duelReducer(s, { type: 'ANSWER', correct }), { type: 'CONTINUE' });

describe('duelDifficulty (barème 2/2/2 puis pro)', () => {
  test('2 faciles, 2 moyennes, 2 dures, puis tout le reste en pro', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 20].map(duelDifficulty)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 4]);
  });
});

describe('createDuelState', () => {
  test('la première question est pour le premier joueur, facile, sur son thème', () => {
    const s = start(['p1', 'p2', 'p3']);
    expect(s.activeId).toBe('p1');
    expect(s.current?.theme).toBe('manga');
    expect(s.current?.difficulty).toBe(1);
    expect(s.phase).toBe('question');
  });
});

describe('déroulé et difficulté croissante', () => {
  test('chacun son tour, sur son thème, avec la difficulté qui monte', () => {
    let s = start(['p1', 'p2', 'p3']);
    const seq: { id: string | null; theme?: string; d?: number }[] = [];
    for (let i = 0; i < 9; i++) {
      seq.push({ id: s.activeId, theme: s.current?.theme, d: s.current?.difficulty });
      s = turn(s, true);
    }
    expect(seq.map((x) => x.id)).toEqual(['p1', 'p2', 'p3', 'p1', 'p2', 'p3', 'p1', 'p2', 'p3']);
    expect(seq.map((x) => x.theme)).toEqual(['manga', 'films', 'culture', 'manga', 'films', 'culture', 'manga', 'films', 'culture']);
    // 2 faciles, 2 moyennes, 2 dures, puis pro.
    expect(seq.map((x) => x.d)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 4]);
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

describe('propositions activables', () => {
  test('désactivées : REVEAL_PROPS est ignoré', () => {
    let s = start(['p1', 'p2'], { allowPropositions: false });
    s = duelReducer(s, { type: 'REVEAL_PROPS', count: 4 });
    expect(s.propsShown).toBe(0);
  });

  test('activées : on peut révéler 4 puis 2 propositions', () => {
    let s = start(['p1', 'p2'], { allowPropositions: true });
    s = duelReducer(s, { type: 'REVEAL_PROPS', count: 4 });
    expect(s.propsShown).toBe(4);
    s = duelReducer(s, { type: 'REVEAL_PROPS', count: 2 });
    expect(s.propsShown).toBe(2);
  });
});
