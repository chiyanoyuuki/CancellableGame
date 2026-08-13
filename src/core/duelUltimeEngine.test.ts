import type { Difficulty, DuelUltimeConfig, Player, Question, Theme } from './models';
import {
  createDuelUltimeState,
  duelUltimeRanking,
  duelUltimeReducer,
  duelUltimeToSessionResult,
  duelUltimeWinner,
  type DuelUltimeState,
} from './duelUltimeEngine';
import type { QuestionHistory } from './questionSelection';

const players: Player[] = [
  { id: 'p1', name: 'Alice', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'Bob', emoji: '🐼', color: '#0f0' },
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

function config(over: Partial<DuelUltimeConfig> = {}): DuelUltimeConfig {
  return { universesByPlayer: { p1: ['Naruto'], p2: ['Marvel'] }, questionsPerPlayer: 10, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0, ...over };
}

const start = (over: Partial<DuelUltimeConfig> = {}, order?: string[]) =>
  createDuelUltimeState({ config: config(over), players, pool, seed: 1, order });

/** Répond à une question (correct/faux) puis passe à la suivante. */
const turn = (s: DuelUltimeState, correct: boolean) =>
  duelUltimeReducer(duelUltimeReducer(s, { type: 'ANSWER', correct }), { type: 'CONTINUE' });

describe('createDuelUltimeState', () => {
  test('première question : premier joueur, pro, son univers, sans propositions', () => {
    const s = start();
    expect(s.activeId).toBe('p1');
    expect(s.current?.difficulty).toBe(4);
    expect(s.current?.universe).toBe('Naruto');
    expect(s.qNumber).toBe(1);
    expect(s.phase).toBe('question');
  });
});

describe('univers multiples et questions inédites', () => {
  test('un joueur peut choisir plusieurs univers : tirage dans leur union', () => {
    // « A » n'a que 3 questions pro ; le reste vient forcément de « B ».
    const twoUni: Question[] = [];
    for (let i = 0; i < 3; i++) {
      twoUni.push({ id: `A-4-${i}`, theme: 'manga' as Theme, universe: 'A', difficulty: 4, text: `a${i}`, answer: 'bon', distractors: ['a', 'b', 'c'] });
    }
    for (let i = 0; i < 20; i++) {
      twoUni.push({ id: `B-4-${i}`, theme: 'films' as Theme, universe: 'B', difficulty: 4, text: `b${i}`, answer: 'bon', distractors: ['a', 'b', 'c'] });
    }
    let s = createDuelUltimeState({
      config: { universesByPlayer: { p1: ['A', 'B'] }, questionsPerPlayer: 10, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0 },
      players: [players[0] as Player],
      pool: twoUni,
      seed: 7,
    });
    const unis = new Set<string>();
    let count = 0;
    while (s.phase === 'question' && s.current) {
      unis.add(s.current.universe ?? '');
      count += 1;
      s = turn(s, true);
    }
    expect(count).toBe(10);
    expect([...unis].every((u) => u === 'A' || u === 'B')).toBe(true);
    expect(unis.has('A') && unis.has('B')).toBe(true);
  });

  test('questions jamais vues d’abord (comme le quiz)', () => {
    // On marque Naruto-4-0..14 comme déjà vues → seules 15..19 sont inédites.
    const seen: QuestionHistory = {};
    for (let i = 0; i < 15; i++) seen[`Naruto-4-${i}`] = { timesUsed: 1, lastUsedAt: 0 };
    let s = createDuelUltimeState({
      config: { universesByPlayer: { p1: ['Naruto'] }, questionsPerPlayer: 5, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0 },
      players: [players[0] as Player],
      pool,
      seed: 9,
      historyByPlayer: { p1: seen },
    });
    const ids: string[] = [];
    while (s.phase === 'question' && s.current) {
      ids.push(s.current.id);
      s = turn(s, true);
    }
    expect(ids).toHaveLength(5);
    const unseen = new Set(['Naruto-4-15', 'Naruto-4-16', 'Naruto-4-17', 'Naruto-4-18', 'Naruto-4-19']);
    expect(ids.every((id) => unseen.has(id))).toBe(true);
  });
});

describe('déroulé séquentiel', () => {
  test('chaque joueur reçoit N questions pro sur SON univers, dans l’ordre', () => {
    let s = start({ questionsPerPlayer: 10, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0 });
    const seen: { id: string; uni: string; d: number }[] = [];
    for (let i = 0; i < 20; i++) {
      if (s.phase !== 'question' || !s.current || !s.activeId) break;
      seen.push({ id: s.activeId, uni: s.current.universe ?? '', d: s.current.difficulty });
      s = turn(s, true);
    }
    expect(s.phase).toBe('finished');
    expect(seen).toHaveLength(20);
    // 10 premières pour p1 (Naruto), 10 suivantes pour p2 (Marvel).
    expect(seen.slice(0, 10).every((x) => x.id === 'p1' && x.uni === 'Naruto')).toBe(true);
    expect(seen.slice(10).every((x) => x.id === 'p2' && x.uni === 'Marvel')).toBe(true);
    // Uniquement des questions pro.
    expect(seen.every((x) => x.d === 4)).toBe(true);
  });

  test('les identifiants de questions ne se répètent pas pour un joueur', () => {
    let s = start({ questionsPerPlayer: 10, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0 });
    const ids: string[] = [];
    while (s.phase === 'question' && s.current) {
      ids.push(s.current.id);
      s = turn(s, true);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('score et vainqueur', () => {
  test('le meilleur score gagne', () => {
    let s = start({ questionsPerPlayer: 5, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0 });
    // p1 : 4 bonnes / 1 fausse
    for (const c of [true, true, true, true, false]) s = turn(s, c);
    // p2 : 2 bonnes / 3 fausses
    for (const c of [true, false, true, false, false]) s = turn(s, c);
    expect(s.phase).toBe('finished');
    expect(s.correctById.p1).toBe(4);
    expect(s.correctById.p2).toBe(2);
    expect(s.wrongById.p1).toBe(1);
    expect(s.wrongById.p2).toBe(3);
    expect(duelUltimeWinner(s)).toBe('p1');
    expect(duelUltimeRanking(s)).toEqual(['p1', 'p2']);
  });

  test('égalité en tête : pas de vainqueur désigné', () => {
    let s = start({ questionsPerPlayer: 4 });
    for (const c of [true, true, false, false]) s = turn(s, c); // p1 : 2
    for (const c of [true, true, false, false]) s = turn(s, c); // p2 : 2
    expect(duelUltimeWinner(s)).toBeNull();
  });
});

describe('mode solo (1 joueur)', () => {
  test('un seul joueur : N questions, score enregistré, pas de vainqueur', () => {
    const solo: Player[] = [players[0] as Player];
    let s = createDuelUltimeState({
      config: { universesByPlayer: { p1: ['Naruto'] }, questionsPerPlayer: 10, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0 },
      players: solo,
      pool,
      seed: 3,
    });
    let answered = 0;
    while (s.phase === 'question') {
      s = turn(s, answered % 2 === 0);
      answered += 1;
    }
    expect(answered).toBe(10);
    expect(s.correctById.p1).toBe(5);
    expect(duelUltimeWinner(s)).toBeNull();
  });
});

describe('robustesse', () => {
  test('si l’univers a moins de N questions pro, on s’arrête au stock disponible', () => {
    const small: Question[] = [];
    for (let i = 0; i < 3; i++) {
      small.push({ id: `Solo-4-${i}`, theme: 'manga' as Theme, universe: 'Petit', difficulty: 4, text: `q${i}`, answer: 'bon', distractors: ['a', 'b', 'c'] });
    }
    let s = createDuelUltimeState({
      config: { universesByPlayer: { p1: ['Petit'] }, questionsPerPlayer: 10, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0 },
      players: [players[0] as Player],
      pool: small,
      seed: 5,
    });
    let count = 0;
    while (s.phase === 'question') {
      s = turn(s, true);
      count += 1;
    }
    expect(count).toBe(3);
    expect(s.phase).toBe('finished');
  });
});

describe('duelUltimeToSessionResult', () => {
  test('résultat générique : gameId, mode, rangs et détails', () => {
    let s = start({ questionsPerPlayer: 5, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0 });
    for (const c of [true, true, true, false, false]) s = turn(s, c); // p1 : 3
    for (const c of [true, false, false, false, false]) s = turn(s, c); // p2 : 1
    const res = duelUltimeToSessionResult(s, 1000, 2000);
    expect(res.gameId).toBe('duelultime');
    expect(res.mode).toBe('ultime');
    const p1 = res.players.find((p) => p.playerId === 'p1');
    const p2 = res.players.find((p) => p.playerId === 'p2');
    expect(p1?.rank).toBe(1);
    expect(p1?.points).toBe(3);
    expect(p2?.rank).toBe(2);
    expect(p1?.details?.universe).toBe('Naruto');
    expect(p2?.details?.universe).toBe('Marvel');
  });

  test('égalité : même rang pour les deux', () => {
    let s = start({ questionsPerPlayer: 4 });
    for (const c of [true, true, false, false]) s = turn(s, c);
    for (const c of [true, true, false, false]) s = turn(s, c);
    const res = duelUltimeToSessionResult(s, 0, 1);
    expect(res.players.every((p) => p.rank === 1)).toBe(true);
  });

  test('émet un événement « answer » par question (comptées comme déjà vues)', () => {
    let s = start({ questionsPerPlayer: 5, drinksEnabled: false, drinkIntensity: 'normal', questionTimerSec: 0 });
    const ids: string[] = [];
    while (s.phase === 'question' && s.current) {
      ids.push(s.current.id);
      s = turn(s, true);
    }
    const res = duelUltimeToSessionResult(s, 0, 1000);
    const answers = (res.events ?? []).filter((e) => e.type === 'answer');
    expect(answers).toHaveLength(ids.length); // 5 p1 + 5 p2
    expect(answers.map((e) => e.payload.questionId).sort()).toEqual([...ids].sort());
    expect(answers.every((e) => e.at === 1000)).toBe(true);
  });
});
