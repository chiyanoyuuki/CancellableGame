import {
  createImposteurState,
  type ImposteurConfig,
  imposteurRanking,
  imposteurReducer,
  imposteurToSessionResult,
  type ImposteurState,
  isGoodImposteurWord,
  type WordCard,
} from './imposteurEngine';
import type { Player } from './models';

const players: Player[] = [
  { id: 'p1', name: 'A', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'B', emoji: '🐼', color: '#0f0' },
  { id: 'p3', name: 'C', emoji: '🐸', color: '#00f' },
  { id: 'p4', name: 'D', emoji: '🐯', color: '#ff0' },
];

const pool: WordCard[] = [
  { word: 'Luffy', universe: 'One Piece', theme: 'manga' },
  { word: 'Goku', universe: 'Dragon Ball', theme: 'manga' },
  { word: 'Mario', universe: 'Mario', theme: 'jeuxvideo' },
];

const cfg = (over: Partial<ImposteurConfig> = {}): ImposteurConfig => ({
  universes: ['One Piece', 'Dragon Ball', 'Mario'],
  rounds: 2,
  imposterCount: 1,
  imposterHint: 'none',
  discussionSec: 0,
  drinksEnabled: true,
  drinkIntensity: 'normal',
  ...over,
});

const create = (over: Partial<ImposteurConfig> = {}, ps = players) =>
  createImposteurState({ config: cfg(over), players: ps, pool, seed: 12345 });

function seeAll(s: ImposteurState): ImposteurState {
  let st = s;
  while (st.phase === 'reveal') st = imposteurReducer(st, { type: 'SEEN' });
  return st;
}
const nonImposter = (s: ImposteurState) => s.order.find((id) => !s.imposterIds.includes(id))!;

describe('createImposteurState', () => {
  test('au moins 3 joueurs, sinon la partie est terminee', () => {
    expect(create().phase).toBe('reveal');
    const solo = createImposteurState({ config: cfg(), players: players.slice(0, 2), pool, seed: 1 });
    expect(solo.phase).toBe('finished');
  });

  test('un mot, un univers et le bon nombre d\'imposteurs sont tires', () => {
    const s = create();
    expect(s.word).not.toBe('');
    expect(s.universe).not.toBe('');
    expect(s.imposterIds).toHaveLength(1);
    expect(s.revealOrder).toHaveLength(4);
    const two = create({ imposterCount: 2 });
    expect(two.imposterIds).toHaveLength(2);
  });
});

describe('revelation puis vote', () => {
  test('chaque SEEN avance, puis on passe a la discussion', () => {
    const s = create();
    expect(s.phase).toBe('reveal');
    const done = seeAll(s);
    expect(done.phase).toBe('discuss');
    expect(imposteurReducer(done, { type: 'START_VOTE' }).phase).toBe('vote');
  });
});

describe('resolution des manches', () => {
  test('equipage gagne si l imposteur est demasque et ne devine pas', () => {
    let s = imposteurReducer(seeAll(create()), { type: 'START_VOTE' });
    const imp = s.imposterIds[0]!;
    s = imposteurReducer(s, { type: 'ACCUSE', playerId: imp });
    expect(s.phase).toBe('guess');
    s = imposteurReducer(s, { type: 'GUESS', correct: false });
    expect(s.phase).toBe('result');
    expect(s.lastOutcome?.crewWon).toBe(true);
    // chaque membre de l'equipage marque, l'imposteur boit.
    for (const id of s.order) {
      if (id === imp) expect(s.scores[id] ?? 0).toBe(0);
      else expect(s.scores[id]).toBe(2);
    }
    expect(s.sipsById[imp]).toBe(2);
  });

  test('l imposteur vole la manche s il devine le mot', () => {
    let s = imposteurReducer(seeAll(create()), { type: 'START_VOTE' });
    const imp = s.imposterIds[0]!;
    s = imposteurReducer(s, { type: 'ACCUSE', playerId: imp });
    s = imposteurReducer(s, { type: 'GUESS', correct: true });
    expect(s.lastOutcome?.crewWon).toBe(false);
    expect(s.scores[imp]).toBe(3);
    // l'equipage boit
    for (const id of s.order) if (id !== imp) expect(s.sipsById[id]).toBe(2);
  });

  test('mauvaise accusation : l imposteur gagne sans phase de devinette', () => {
    let s = imposteurReducer(seeAll(create()), { type: 'START_VOTE' });
    const imp = s.imposterIds[0]!;
    const innocent = nonImposter(s);
    s = imposteurReducer(s, { type: 'ACCUSE', playerId: innocent });
    expect(s.phase).toBe('result');
    expect(s.lastOutcome?.crewWon).toBe(false);
    expect(s.scores[imp]).toBe(3);
  });

  test('les gorgees sont ignorees si le mode alcool est off', () => {
    let s = imposteurReducer(seeAll(create({ drinksEnabled: false })), { type: 'START_VOTE' });
    const imp = s.imposterIds[0]!;
    s = imposteurReducer(s, { type: 'ACCUSE', playerId: imp });
    s = imposteurReducer(s, { type: 'GUESS', correct: false });
    expect(s.sipsById[imp] ?? 0).toBe(0);
    expect(s.lastOutcome?.drinkers).toEqual([]);
  });
});

describe('manches et fin de partie', () => {
  test('NEXT enchaine les manches puis termine', () => {
    let s = imposteurReducer(seeAll(create({ rounds: 2 })), { type: 'START_VOTE' });
    s = imposteurReducer(s, { type: 'ACCUSE', playerId: nonImposter(s) }); // round 1 result
    expect(s.round).toBe(1);
    s = imposteurReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('reveal');
    expect(s.round).toBe(2);
    s = imposteurReducer(seeAll(s), { type: 'START_VOTE' });
    s = imposteurReducer(s, { type: 'ACCUSE', playerId: nonImposter(s) });
    s = imposteurReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('finished');
  });
});

describe('classement et resultat', () => {
  test('imposteurToSessionResult classe par points', () => {
    let s = imposteurReducer(seeAll(create({ rounds: 1 })), { type: 'START_VOTE' });
    const imp = s.imposterIds[0]!;
    s = imposteurReducer(s, { type: 'ACCUSE', playerId: imp });
    s = imposteurReducer(s, { type: 'GUESS', correct: false }); // crew wins
    s = imposteurReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('finished');
    const res = imposteurToSessionResult(s, 0, 1000);
    expect(res.gameId).toBe('imposteur');
    // le gagnant (rang 1) fait partie de l'equipage (2 pts), l'imposteur est dernier.
    const winner = res.players.find((p) => p.rank === 1)!;
    expect(winner.points).toBe(2);
    expect(res.players.find((p) => p.playerId === imp)!.points).toBe(0);
    expect(imposteurRanking(s)[0]).not.toBe(imp);
  });
});

describe("indice de l'imposteur (mot proche)", () => {
  // Univers avec plusieurs mots, pour garantir qu'un « mot proche » existe.
  const richPool: WordCard[] = [
    { word: 'Luffy', universe: 'One Piece', theme: 'manga' },
    { word: 'Zoro', universe: 'One Piece', theme: 'manga' },
    { word: 'Nami', universe: 'One Piece', theme: 'manga' },
  ];

  test("mode 'none' (defaut) : aucun mot proche", () => {
    const s = create();
    expect(s.imposterWord).toBe('');
  });

  test("mode 'close' : un mot du meme univers, different du vrai", () => {
    const s = createImposteurState({
      config: cfg({ imposterHint: 'close', universes: ['One Piece'] }),
      players,
      pool: richPool,
      seed: 7,
    });
    expect(s.imposterWord).not.toBe('');
    expect(s.imposterWord).not.toBe(s.word);
    expect(richPool.some((c) => c.word === s.imposterWord && c.universe === s.universe)).toBe(true);
  });

  test("mode 'close' : le mot proche a le meme nombre de mots que le vrai (type similaire)", () => {
    // Deux groupes par nombre de mots, chacun avec >=2 entrees : quel que soit
    // le vrai mot tire, un « meme type » (meme nombre de mots) existe toujours.
    const typedPool: WordCard[] = [
      { word: 'Thomas Shelby', universe: 'Peaky Blinders', theme: 'series' },
      { word: 'Arthur Shelby', universe: 'Peaky Blinders', theme: 'series' },
      { word: 'John Shelby', universe: 'Peaky Blinders', theme: 'series' },
      { word: 'Birmingham', universe: 'Peaky Blinders', theme: 'series' },
      { word: 'Londres', universe: 'Peaky Blinders', theme: 'series' },
    ];
    const wc = (s: string) => s.trim().split(/\s+/).length;
    for (let seed = 0; seed < 20; seed++) {
      const s = createImposteurState({
        config: cfg({ imposterHint: 'close', universes: ['Peaky Blinders'] }),
        players,
        pool: typedPool,
        seed,
      });
      expect(s.imposterWord).not.toBe('');
      expect(wc(s.imposterWord)).toBe(wc(s.word));
    }
  });

  test("mode 'close' sans alternative dans l'univers : retombe sur aucun mot", () => {
    // Chaque univers du pool par defaut n'a qu'un seul mot.
    const s = createImposteurState({ config: cfg({ imposterHint: 'close' }), players, pool, seed: 3 });
    expect(s.imposterWord).toBe('');
  });
});

describe('isGoodImposteurWord', () => {
  test('garde les mots concrets, ecarte nombres/dates et extremes', () => {
    expect(isGoodImposteurWord('Luffy')).toBe(true);
    expect(isGoodImposteurWord('One Piece')).toBe(true);
    expect(isGoodImposteurWord('1999')).toBe(false);
    expect(isGoodImposteurWord('a')).toBe(false);
    expect(isGoodImposteurWord('')).toBe(false);
    expect(isGoodImposteurWord('x'.repeat(40))).toBe(false);
  });
});
