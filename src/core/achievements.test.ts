import { achievementSummary, playerAchievements } from './achievements';
import type { StatAnswer, StatResult } from './stats';

function result(over: Partial<StatResult>): StatResult {
  return {
    sessionId: 1,
    gameId: 'quiz',
    startedAt: 0,
    playerId: 'p1',
    points: 0,
    rank: 2,
    sipsDrunk: 0,
    sipsGiven: 0,
    ...over,
  };
}
function answer(over: Partial<StatAnswer>): StatAnswer {
  return {
    gameId: 'quiz',
    startedAt: 0,
    playerId: 'p1',
    theme: 'manga',
    difficulty: 1,
    correct: true,
    hintsUsed: 0,
    timeMs: null,
    points: 10,
    ...over,
  };
}

const find = (list: ReturnType<typeof playerAchievements>[string], id: string) => list.find((a) => a.def.id === id)!;

describe('playerAchievements', () => {
  test('compte les parties et les victoires', () => {
    const results = [
      result({ sessionId: 1, rank: 1 }),
      result({ sessionId: 2, rank: 2 }),
      result({ sessionId: 3, rank: 1 }),
    ];
    const a = playerAchievements(results, [])['p1']!;
    expect(find(a, 'first-game').done).toBe(true); // 3 parties >= 1
    expect(find(a, 'first-game').current).toBe(1); // borné à la cible
    expect(find(a, 'regular').current).toBe(3); // 3/10
    expect(find(a, 'regular').done).toBe(false);
    expect(find(a, 'first-win').done).toBe(true); // 2 victoires >= 1
    expect(find(a, 'champion').current).toBe(2); // 2/10 victoires
  });

  test('victoires par jeu débloquent les badges dédiés', () => {
    const results = [
      result({ gameId: 'bombe', rank: 1 }),
      result({ gameId: 'duel', rank: 1 }),
      result({ gameId: 'duelultime', rank: 2 }),
    ];
    const a = playerAchievements(results, [])['p1']!;
    expect(find(a, 'bombe').done).toBe(true);
    expect(find(a, 'duel').done).toBe(true);
    expect(find(a, 'ultimate').done).toBe(false); // pas gagné le duel ultime
  });

  test('questions, bonnes réponses, thèmes et réponses éclair', () => {
    const answers = [
      answer({ theme: 'manga', correct: true, timeMs: 1500 }), // éclair
      answer({ theme: 'films', correct: false }),
      answer({ theme: 'musique', correct: true, timeMs: 8000 }),
    ];
    const a = playerAchievements([], answers)['p1']!;
    expect(find(a, 'curious').current).toBe(3); // 3 questions
    expect(find(a, 'scholar').current).toBe(2); // 2 bonnes
    expect(find(a, 'polyglot').current).toBe(3); // 3 thèmes distincts
    expect(find(a, 'lightning').done).toBe(true); // une bonne < 3 s
  });

  test('les gorgées bues et distribuées cumulent', () => {
    const results = [
      result({ sessionId: 1, sipsDrunk: 20, sipsGiven: 12 }),
      result({ sessionId: 2, sipsDrunk: 15, sipsGiven: 10 }),
    ];
    const a = playerAchievements(results, [])['p1']!;
    expect(find(a, 'drinker').done).toBe(true); // 35 >= 30
    expect(find(a, 'generous').done).toBe(true); // 22 >= 20
  });

  test('les lignes d’équipe sont ignorées (hauts faits personnels)', () => {
    const results = [result({ playerId: 'team:rouge', rank: 1, details: { team: true } })];
    const out = playerAchievements(results, []);
    expect(out['team:rouge']).toBeUndefined();
  });

  test('achievementSummary compte les badges gagnés', () => {
    const results = [result({ rank: 1 })];
    const a = playerAchievements(results, [])['p1']!;
    const s = achievementSummary(a);
    expect(s.total).toBeGreaterThan(10);
    expect(s.earned).toBe(2); // première soirée + première victoire
    expect(achievementSummary(undefined).earned).toBe(0);
  });
});
