import {
  createCultureState,
  type CultureConfig,
  cultureRanking,
  cultureReducer,
  type CultureState,
  cultureToSessionResult,
  currentPlayerId,
  type QCard,
} from './cultureEngine';
import type { Player } from './models';

const players: Player[] = [
  { id: 'p1', name: 'A', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'B', emoji: '🐼', color: '#0f0' },
];

const deck: QCard[] = [
  { id: 'q1', text: 'Capitale de la France ?', options: ['Paris', 'Lyon', 'Nice', 'Lille'], answer: 'Paris' },
  { id: 'q2', text: '2+2 ?', options: ['3', '4', '5', '6'], answer: '4' },
  { id: 'q3', text: 'Couleur du ciel ?', options: ['Bleu', 'Vert', 'Rouge', 'Noir'], answer: 'Bleu' },
  { id: 'q4', text: 'Contraire de chaud ?', options: ['Froid', 'Tiède', 'Bouillant', 'Doux'], answer: 'Froid' },
];

const cfg = (over: Partial<CultureConfig> = {}): CultureConfig => ({
  questionsPerPlayer: 2,
  drinksEnabled: true,
  drinkIntensity: 'normal',
  dareCategory: 'soft',
  ...over,
});

const create = (over: Partial<CultureConfig> = {}, ps = players) =>
  createCultureState({ config: cfg(over), players: ps, deck, dares: ['Fais 10 pompes', 'Chante'], seed: 7 });

describe('cultureEngine', () => {
  it('démarre sur une question du 1er joueur', () => {
    const s = create();
    expect(s.phase).toBe('question');
    expect(currentPlayerId(s)).toBe('p1');
    expect(s.totalQuestions).toBe(4); // 2 joueurs × 2
    expect(s.card.options.length).toBeGreaterThan(0);
  });

  it('bonne réponse → +1 point, pas de gage', () => {
    let s = create();
    s = cultureReducer(s, { type: 'ANSWER', choice: s.card.answer });
    expect(s.phase).toBe('result');
    expect(s.lastOutcome?.correct).toBe(true);
    expect(s.lastOutcome?.dare).toBe('');
    expect(s.lastOutcome?.sips).toBe(0);
    expect(s.scores['p1']).toBe(1);
  });

  it('mauvaise réponse → gage + gorgées', () => {
    let s = create();
    const wrong = s.card.options.find((o) => o !== s.card.answer)!;
    s = cultureReducer(s, { type: 'ANSWER', choice: wrong });
    expect(s.lastOutcome?.correct).toBe(false);
    expect(s.lastOutcome?.dare).not.toBe('');
    expect(s.lastOutcome?.sips).toBe(2); // normal
    expect(s.sipsById['p1']).toBe(2);
    expect(s.scores['p1'] ?? 0).toBe(0);
  });

  it('mauvaise réponse sans alcool → gage, pas de gorgées', () => {
    let s = create({ drinksEnabled: false });
    const wrong = s.card.options.find((o) => o !== s.card.answer)!;
    s = cultureReducer(s, { type: 'ANSWER', choice: wrong });
    expect(s.lastOutcome?.dare).not.toBe('');
    expect(s.lastOutcome?.sips).toBe(0);
    expect(s.sipsById['p1'] ?? 0).toBe(0);
  });

  it('alterne les joueurs et termine après totalQuestions', () => {
    let s = create();
    s = cultureReducer(s, { type: 'ANSWER', choice: s.card.answer });
    s = cultureReducer(s, { type: 'NEXT' });
    expect(currentPlayerId(s)).toBe('p2');
    expect(s.phase).toBe('question');
    s = cultureReducer(s, { type: 'ANSWER', choice: s.card.answer });
    s = cultureReducer(s, { type: 'NEXT' });
    expect(currentPlayerId(s)).toBe('p1'); // tour 3
    s = cultureReducer(s, { type: 'ANSWER', choice: s.card.answer });
    s = cultureReducer(s, { type: 'NEXT' });
    s = cultureReducer(s, { type: 'ANSWER', choice: s.card.answer });
    s = cultureReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('finished');
  });

  it('produit un SessionResult classé', () => {
    let s = create({ questionsPerPlayer: 1 });
    // p1 bon, p2 faux
    s = cultureReducer(s, { type: 'ANSWER', choice: s.card.answer });
    s = cultureReducer(s, { type: 'NEXT' });
    const wrong = s.card.options.find((o) => o !== s.card.answer)!;
    s = cultureReducer(s, { type: 'ANSWER', choice: wrong });
    s = cultureReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('finished');
    const ranked = cultureRanking(s);
    expect(ranked[0]).toBe('p1');
    const res = cultureToSessionResult(s, 0, 100);
    expect(res.gameId).toBe('cultureougage');
    expect(res.players.find((p) => p.playerId === 'p1')!.rank).toBe(1);
  });

  it('finit direct si le deck est vide', () => {
    const s = createCultureState({ config: cfg(), players, deck: [], dares: ['x'], seed: 1 });
    expect(s.phase).toBe('finished');
  });
});
