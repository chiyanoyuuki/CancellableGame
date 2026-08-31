import type { Player } from './models';
import {
  answerSpeed,
  funFacts,
  headToHead,
  inPeriod,
  lastPlayedByPlayer,
  periodStart,
  playerTotals,
  seasonChampion,
  seasonKey,
  seasonKeys,
  seasonRef,
  type StatAnswer,
  type StatResult,
  type StatSession,
  superlatives,
  themeAccuracy,
  timeSeries,
  titlesByPlayer,
} from './stats';

const players: Player[] = [
  { id: 'p1', name: 'Alice', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'Bob', emoji: '🐼', color: '#0f0' },
];

const JAN = new Date(2026, 0, 15, 12).getTime();
const FEB = new Date(2026, 1, 10, 12).getTime();

const sessions: StatSession[] = [
  { id: 1, gameId: 'quiz', mode: 'turn/choices', startedAt: JAN, endedAt: JAN + 1000, playerCount: 2 },
  { id: 2, gameId: 'quiz', mode: 'turn/choices', startedAt: FEB, endedAt: FEB + 1000, playerCount: 2 },
];

const results: StatResult[] = [
  { sessionId: 1, gameId: 'quiz', startedAt: JAN, playerId: 'p1', points: 300, rank: 1, sipsDrunk: 1, sipsGiven: 4 },
  { sessionId: 1, gameId: 'quiz', startedAt: JAN, playerId: 'p2', points: 100, rank: 2, sipsDrunk: 6, sipsGiven: 0 },
  { sessionId: 2, gameId: 'quiz', startedAt: FEB, playerId: 'p1', points: 50, rank: 2, sipsDrunk: 2, sipsGiven: 1 },
  { sessionId: 2, gameId: 'quiz', startedAt: FEB, playerId: 'p2', points: 200, rank: 1, sipsDrunk: 3, sipsGiven: 0 },
];

const A = (
  startedAt: number,
  playerId: string,
  theme: string,
  difficulty: number,
  correct: boolean,
  hintsUsed: number,
  timeMs: number | null,
  points: number,
): StatAnswer => ({ gameId: 'quiz', startedAt, playerId, theme, difficulty, correct, hintsUsed, timeMs, points });

const answers: StatAnswer[] = [
  A(JAN, 'p1', 'manga', 1, true, 0, 1000, 100),
  A(JAN, 'p1', 'manga', 2, true, 1, 2000, 150),
  A(JAN, 'p1', 'films', 1, true, 0, 1500, 100),
  A(FEB, 'p1', 'films', 2, true, 0, 900, 200),
  A(FEB, 'p1', 'culture', 3, false, 0, 5000, 0),
  A(JAN, 'p2', 'manga', 1, false, 2, 8000, 0),
  A(JAN, 'p2', 'manga', 2, false, 3, 9000, 0),
  A(FEB, 'p2', 'culture', 1, true, 0, 7000, 100),
];

describe('period helpers', () => {
  test('periodStart for a year is Jan 1st', () => {
    expect(periodStart('year', JAN)).toBe(new Date(2026, 0, 1).getTime());
  });

  test('inPeriod month excludes other months', () => {
    expect(inPeriod(JAN, 'month', JAN)).toBe(true);
    expect(inPeriod(FEB, 'month', JAN)).toBe(false);
    expect(inPeriod(JAN, 'year', FEB)).toBe(true);
  });

  test('periode semaine : lundi -> dimanche, exclut la semaine voisine', () => {
    // mercredi 2026-09-02 (10h) — la semaine ISO va du lundi 08-31 au dimanche 09-06.
    const wed = new Date(2026, 8, 2, 10).getTime();
    expect(periodStart('week', wed)).toBe(new Date(2026, 7, 31).getTime()); // lundi 31 août
    expect(inPeriod(new Date(2026, 7, 31, 0, 1).getTime(), 'week', wed)).toBe(true); // lundi
    expect(inPeriod(new Date(2026, 8, 6, 23).getTime(), 'week', wed)).toBe(true); // dimanche
    expect(inPeriod(new Date(2026, 8, 7).getTime(), 'week', wed)).toBe(false); // lundi suivant
    expect(inPeriod(new Date(2026, 7, 30, 23).getTime(), 'week', wed)).toBe(false); // dimanche d'avant
  });
});

describe('playerTotals', () => {
  test('aggregates points, wins and sips across all sessions', () => {
    const totals = playerTotals(results);
    const p1 = totals.find((t) => t.playerId === 'p1');
    const p2 = totals.find((t) => t.playerId === 'p2');
    expect(p1?.points).toBe(350);
    expect(p1?.wins).toBe(1);
    expect(p1?.games).toBe(2);
    expect(p1?.sipsGiven).toBe(5);
    expect(p2?.sipsDrunk).toBe(9);
    expect(p2?.wins).toBe(1);
  });

  test('period filter narrows the window', () => {
    const jan = playerTotals(results, { period: 'month', ref: JAN });
    const p1 = jan.find((t) => t.playerId === 'p1');
    expect(p1?.points).toBe(300);
    expect(p1?.games).toBe(1);
  });

  test('sorted by points descending', () => {
    const totals = playerTotals(results);
    expect(totals[0]?.playerId).toBe('p1');
  });
});

describe('timeSeries', () => {
  test('buckets sessions and points by month', () => {
    const series = timeSeries(sessions, results, 'month');
    expect(series).toHaveLength(2);
    expect(series[0]?.key).toBe('2026-01');
    expect(series[0]?.games).toBe(1);
    expect(series[0]?.points).toBe(400);
  });
});

describe('themeAccuracy', () => {
  test('computes accuracy per theme for a player', () => {
    const acc = themeAccuracy(answers, 'p1');
    const films = acc.find((a) => a.theme === 'films');
    const culture = acc.find((a) => a.theme === 'culture');
    expect(films?.accuracy).toBe(1);
    expect(culture?.accuracy).toBe(0);
  });

  test('respects a period filter', () => {
    // In January p1 answered manga x2 and films x1; culture was February only.
    const acc = themeAccuracy(answers, 'p1', { period: 'month', ref: JAN });
    expect(acc.find((a) => a.theme === 'culture')).toBeUndefined();
    expect(acc.find((a) => a.theme === 'manga')?.total).toBe(2);
    expect(acc.find((a) => a.theme === 'films')?.total).toBe(1);
  });
});

describe('superlatives', () => {
  test('awards the expected funny titles', () => {
    const sup = superlatives(players, results, answers);
    const byId = new Map(sup.map((s) => [s.id, s]));
    expect(byId.get('sponge')?.playerId).toBe('p2'); // 9 sips drunk
    expect(byId.get('barman')?.playerId).toBe('p1'); // 5 sips given
    expect(byId.get('brain')?.playerId).toBe('p1'); // best accuracy
    expect(byId.get('clown')?.playerId).toBe('p2'); // most wrong
    expect(byId.get('flash')?.playerId).toBe('p1'); // fastest avg
    expect(byId.get('hints')?.playerId).toBe('p2'); // most hints
  });

  test('descriptions include the player name', () => {
    const sup = superlatives(players, results, answers);
    expect(sup.find((s) => s.id === 'sponge')?.description).toContain('Bob');
  });

  test('awards the newer titles', () => {
    const sup = superlatives(players, results, answers);
    const byId = new Map(sup.map((s) => [s.id, s]));
    expect(byId.get('comete')?.playerId).toBe('p1'); // best single game (300)
    expect(byId.get('marathonien')?.playerId).toBe('p1'); // most answers (5)
    expect(byId.get('encyclopedie')?.playerId).toBe('p1'); // most correct (4)
    // Pas assez de parties (min 3) pour ces titres avec ce jeu de données.
    expect(byId.get('stratege')).toBeUndefined();
    expect(byId.get('sobre')).toBeUndefined();
  });
});

describe('titlesByPlayer', () => {
  test('groups held titles by player, most prestigious first', () => {
    const map = titlesByPlayer(players, results, answers);
    expect(map['p1']?.[0]?.id).toBe('boss'); // p1 tête de classement
    expect(map['p2']?.[0]?.id).toBe('sponge'); // p2 a le plus bu
    // Chaque entrée ne contient que des titres du joueur.
    expect(map['p1']?.every((s) => s.playerId === 'p1')).toBe(true);
  });
});

describe('funFacts', () => {
  test('totals across the group', () => {
    const f = funFacts(sessions, results, answers);
    expect(f.totalGames).toBe(2);
    expect(f.totalSips).toBe(12);
    expect(f.totalQuestions).toBe(8);
    expect(f.totalPoints).toBe(650);
    expect(f.favouriteTheme).toBe('manga');
  });
});

describe('lastPlayedByPlayer', () => {
  test('keeps the most recent startedAt per player', () => {
    const map = lastPlayedByPlayer(results);
    expect(map['p1']).toBe(FEB);
    expect(map['p2']).toBe(FEB);
  });

  test('players without results are absent', () => {
    const map = lastPlayedByPlayer([results[0]!]); // uniquement p1 en janvier
    expect(map['p1']).toBe(JAN);
    expect(map['p2']).toBeUndefined();
  });

  test('empty input yields an empty map', () => {
    expect(lastPlayedByPlayer([])).toEqual({});
  });
});

describe('headToHead', () => {
  test('compte les victoires par session où les deux ont joué', () => {
    // session 1 : p1 rang1, p2 rang2 → A gagne ; session 2 : inverse → B gagne
    const h = headToHead(results, 'p1', 'p2');
    expect(h.meetings).toBe(2);
    expect(h.aWins).toBe(1);
    expect(h.bWins).toBe(1);
    expect(h.ties).toBe(0);
  });

  test('ignore les sessions où un seul des deux a joué', () => {
    const solo: StatResult[] = [
      { sessionId: 9, gameId: 'quiz', startedAt: JAN, playerId: 'p1', points: 10, rank: 1, sipsDrunk: 0, sipsGiven: 0 },
    ];
    expect(headToHead(solo, 'p1', 'p2').meetings).toBe(0);
  });

  test('compte les égalités de rang', () => {
    const tie: StatResult[] = [
      { sessionId: 5, gameId: 'q', startedAt: JAN, playerId: 'p1', points: 5, rank: 1, sipsDrunk: 0, sipsGiven: 0 },
      { sessionId: 5, gameId: 'q', startedAt: JAN, playerId: 'p2', points: 5, rank: 1, sipsDrunk: 0, sipsGiven: 0 },
    ];
    const h = headToHead(tie, 'p1', 'p2');
    expect(h.ties).toBe(1);
    expect(h.aWins).toBe(0);
    expect(h.bWins).toBe(0);
  });
});

describe('saisons', () => {
  test('seasonKey formate AAAA-MM', () => {
    expect(seasonKey(JAN)).toBe('2026-01');
    expect(seasonKey(FEB)).toBe('2026-02');
  });

  test('seasonRef tombe dans le bon mois', () => {
    expect(seasonKey(seasonRef('2026-02'))).toBe('2026-02');
  });

  test('seasonKeys liste les mois avec données, du plus récent au plus ancien', () => {
    expect(seasonKeys(results)).toEqual(['2026-02', '2026-01']);
  });

  test('seasonChampion prend le meilleur du mois (victoires puis points)', () => {
    expect(seasonChampion(results, '2026-01').playerId).toBe('p1'); // p1 gagne en janvier
    expect(seasonChampion(results, '2026-02').playerId).toBe('p2'); // p2 gagne en février
  });

  test('seasonChampion renvoie null pour un mois vide', () => {
    expect(seasonChampion(results, '2020-01').playerId).toBeNull();
  });
});

describe('answerSpeed', () => {
  test('calcule moyenne, meilleur temps et nombre de réponses chronométrées', () => {
    const s = answerSpeed(answers, 'p1');
    // p1 : 1000,2000,1500,900,5000 → best 900, avg 2080
    expect(s.count).toBe(5);
    expect(s.bestMs).toBe(900);
    expect(Math.round(s.avgMs)).toBe(2080);
  });

  test('ignore les réponses sans temps et gère l\'absence de données', () => {
    const noTime: StatAnswer[] = [
      { gameId: 'q', startedAt: JAN, playerId: 'p3', theme: 'manga', difficulty: 1, correct: true, hintsUsed: 0, timeMs: null, points: 10 },
    ];
    const s = answerSpeed(noTime, 'p3');
    expect(s.count).toBe(0);
    expect(s.avgMs).toBe(0);
    expect(s.bestMs).toBe(0);
  });
});
