import {
  achievementScore,
  achievementScoresByPlayer,
  achievementSummary,
  ACHIEVEMENT_TRACKS,
  MAX_POINTS,
  playerAchievements,
  TIER_META,
  trackProgress,
} from './achievements';
import type { StatAnswer, StatResult } from './stats';

function result(over: Partial<StatResult>): StatResult {
  return { sessionId: 1, gameId: 'quiz', startedAt: 0, playerId: 'p1', points: 0, rank: 2, sipsDrunk: 0, sipsGiven: 0, ...over };
}
function answer(over: Partial<StatAnswer>): StatAnswer {
  return { gameId: 'quiz', startedAt: 0, playerId: 'p1', theme: 'manga', difficulty: 1, correct: true, hintsUsed: 0, timeMs: null, points: 10, ...over };
}
const find = (list: ReturnType<typeof playerAchievements>[string], id: string) => list.find((p) => p.track.id === id)!;

describe('trackProgress (paliers)', () => {
  const games = ACHIEVEMENT_TRACKS.find((t) => t.id === 'games')!;

  test('aucun palier sous la première cible', () => {
    const p = trackProgress(games, 0);
    expect(p.current).toBeNull();
    expect(p.tiersReached).toBe(0);
    expect(p.points).toBe(0);
    expect(p.next?.tier).toBe('bronze');
  });

  test('un seul palier franchi = ses points', () => {
    const p = trackProgress(games, 3); // >= 1 (bronze), < 10 (argent)
    expect(p.current).toBe('bronze');
    expect(p.tiersReached).toBe(1);
    expect(p.points).toBe(TIER_META.bronze.points);
    expect(p.next?.tier).toBe('argent');
  });

  test('les points des paliers se cumulent', () => {
    const p = trackProgress(games, 10); // bronze + argent
    expect(p.current).toBe('argent');
    expect(p.tiersReached).toBe(2);
    expect(p.points).toBe(TIER_META.bronze.points + TIER_META.argent.points);
  });

  test('tout franchi = plus de palier suivant', () => {
    const p = trackProgress(games, 100000);
    expect(p.current).toBe('legende');
    expect(p.next).toBeNull();
    expect(p.tiersReached).toBe(games.tiers.length);
  });
});

describe('playerAchievements (agrégation)', () => {
  test('parties, victoires et soirées distinctes', () => {
    const DAY = 86_400_000;
    const results = [
      result({ sessionId: 1, rank: 1, startedAt: 0 }),
      result({ sessionId: 2, rank: 2, startedAt: DAY }), // autre jour
      result({ sessionId: 3, rank: 1, startedAt: DAY + 1000 }), // même jour que la 2
    ];
    const a = playerAchievements(results, [])['p1']!;
    expect(find(a, 'games').value).toBe(3);
    expect(find(a, 'wins').value).toBe(2);
    expect(find(a, 'nights').value).toBe(2); // deux jours distincts
  });

  test('victoires par jeu alimentent les pistes dédiées', () => {
    const results = [result({ gameId: 'bombe', rank: 1 }), result({ gameId: 'duel', rank: 1 })];
    const a = playerAchievements(results, [])['p1']!;
    expect(find(a, 'bombe').value).toBe(1);
    expect(find(a, 'duel').value).toBe(1);
    expect(find(a, 'ultimate').value).toBe(0);
  });

  test('bonnes réponses : difficiles, pro, sans indice, éclair', () => {
    const answers = [
      answer({ difficulty: 4, correct: true, hintsUsed: 0, timeMs: 1500 }), // dure + pro + sans indice + éclair
      answer({ difficulty: 3, correct: true, hintsUsed: 2, timeMs: 9000 }), // dure, avec indice, lente
      answer({ difficulty: 1, correct: false }), // rien
    ];
    const a = playerAchievements([], answers)['p1']!;
    expect(find(a, 'correct').value).toBe(2);
    expect(find(a, 'hard').value).toBe(2); // deux réponses en difficulté >= 3
    expect(find(a, 'pro').value).toBe(1); // une seule en difficulté 4
    expect(find(a, 'nohint').value).toBe(1);
    expect(find(a, 'fast').value).toBe(1);
    expect(find(a, 'questions').value).toBe(3);
  });

  test('les lignes d’équipe sont ignorées', () => {
    const out = playerAchievements([result({ playerId: 'team:rouge', rank: 1, details: { team: true } })], []);
    expect(out['team:rouge']).toBeUndefined();
  });
});

describe('score et classement', () => {
  test('achievementScore additionne les points des pistes', () => {
    const a = playerAchievements([result({ gameId: 'quiz', rank: 1 })], [])['p1']!;
    // bronze sur : parties, victoires, soirées, et Quiz gagnés (la partie est un quiz gagné).
    expect(achievementScore(a)).toBe(TIER_META.bronze.points * 4);
  });

  test('achievementSummary renvoie paliers, points et maximum', () => {
    const a = playerAchievements([result({ gameId: 'quiz', rank: 1 })], [])['p1']!;
    const s = achievementSummary(a);
    expect(s.tiers).toBe(4);
    expect(s.points).toBe(TIER_META.bronze.points * 4);
    expect(s.maxPoints).toBe(MAX_POINTS);
    expect(achievementSummary(undefined)).toEqual({ tiers: 0, points: 0, maxPoints: MAX_POINTS });
  });

  test('achievementScoresByPlayer classe les joueurs par points', () => {
    const results = [
      result({ playerId: 'p1', rank: 1 }),
      result({ playerId: 'p2', rank: 2 }),
      result({ playerId: 'p2', sessionId: 2, rank: 2 }),
    ];
    const scores = achievementScoresByPlayer(results, []);
    expect(scores['p1']!.points).toBeGreaterThan(0);
    expect(scores['p2']!.points).toBeGreaterThan(0);
    // p1 a une victoire (piste wins) en plus → strictement plus de points.
    expect(scores['p1']!.points).toBeGreaterThan(scores['p2']!.points);
  });

  test('MAX_POINTS est cohérent (somme de tous les paliers)', () => {
    const manual = ACHIEVEMENT_TRACKS.reduce((s, t) => s + t.tiers.reduce((a, x) => a + x.points, 0), 0);
    expect(MAX_POINTS).toBe(manual);
    expect(MAX_POINTS).toBeGreaterThan(1000);
  });
});
