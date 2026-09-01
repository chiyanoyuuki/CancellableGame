import type { PlayerSessionResult, SessionResult } from './models';
import {
  applyRound,
  createSoiree,
  isTournoi,
  isTournoiComplete,
  nextPlannedGameId,
  plannedRemaining,
  roundPoints,
  soireeChampion,
  soireeStandings,
  type SoireePlayer,
} from './soiree';

const players: SoireePlayer[] = [
  { id: 'p1', name: 'Alice', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'Bob', emoji: '🐼', color: '#0f0' },
  { id: 'p3', name: 'Chloé', emoji: '🐯', color: '#00f' },
];

function pr(playerId: string, rank: number): PlayerSessionResult {
  return { playerId, rank, points: 0, sipsDrunk: 0, sipsGiven: 0 };
}
function session(gameId: string, ranks: [string, number][]): SessionResult {
  return {
    gameId,
    mode: 'turn',
    config: {},
    startedAt: 0,
    endedAt: 1,
    players: ranks.map(([id, r]) => pr(id, r)),
  };
}

describe('soiree', () => {
  test('createSoiree initialise tous les joueurs à 0', () => {
    const s = createSoiree(players);
    expect(s.points).toEqual({ p1: 0, p2: 0, p3: 0 });
    expect(s.rounds).toEqual([]);
  });

  test('roundPoints : 1er = participants, dernier = 1', () => {
    const pts = roundPoints(session('quiz', [['p1', 1], ['p2', 2], ['p3', 3]]));
    expect(pts).toEqual({ p1: 3, p2: 2, p3: 1 });
  });

  test('applyRound cumule les points et journalise le vainqueur', () => {
    let s = createSoiree(players);
    s = applyRound(s, session('quiz', [['p1', 1], ['p2', 2], ['p3', 3]]), 100);
    s = applyRound(s, session('bombe', [['p2', 1], ['p1', 2], ['p3', 3]]), 200);
    expect(s.points).toEqual({ p1: 3 + 2, p2: 2 + 3, p3: 1 + 1 }); // 5 / 5 / 2
    expect(s.rounds).toHaveLength(2);
    expect(s.rounds[1]).toEqual({ gameId: 'bombe', winnerId: 'p2', at: 200 });
  });

  test('les joueurs hors soirée (ex. équipes) ne marquent pas', () => {
    let s = createSoiree(players);
    s = applyRound(s, session('quiz', [['team:rouge', 1], ['team:bleu', 2]]), 100);
    expect(s.points).toEqual({ p1: 0, p2: 0, p3: 0 });
    expect(s.rounds[0]!.winnerId).toBeNull(); // vainqueur hors roster
  });

  test('soireeStandings classe par points avec rangs partagés', () => {
    let s = createSoiree(players);
    s = applyRound(s, session('quiz', [['p1', 1], ['p2', 1], ['p3', 3]])); // p1 et p2 ex æquo 1er
    const st = soireeStandings(s);
    // p1 et p2 ont 3 pts (participants 3 - rang 1 + 1), p3 a 1 pt.
    expect(st[0]!.rank).toBe(1);
    expect(st[1]!.rank).toBe(1);
    expect(st[2]!.rank).toBe(3);
    expect(st[2]!.player.id).toBe('p3');
  });

  test('soireeChampion : null sans manche, null si égalité en tête, sinon le leader', () => {
    let s = createSoiree(players);
    expect(soireeChampion(s)).toBeNull(); // aucune manche

    s = applyRound(s, session('quiz', [['p1', 1], ['p2', 2], ['p3', 3]]));
    expect(soireeChampion(s)?.id).toBe('p1');

    s = applyRound(s, session('duel', [['p2', 1], ['p3', 2], ['p1', 3]])); // p1:3+1=4, p2:2+3=5
    expect(soireeChampion(s)?.id).toBe('p2');
  });

  test('mode Tournoi : programme, progression et fin', () => {
    let s = createSoiree(players, 0, ['quiz', 'bombe', 'duel']);
    expect(isTournoi(s)).toBe(true);
    expect(nextPlannedGameId(s)).toBe('quiz');
    expect(plannedRemaining(s)).toBe(3);
    expect(isTournoiComplete(s)).toBe(false);

    s = applyRound(s, session('quiz', [['p1', 1], ['p2', 2], ['p3', 3]]));
    expect(nextPlannedGameId(s)).toBe('bombe');
    expect(plannedRemaining(s)).toBe(2);

    s = applyRound(s, session('bombe', [['p2', 1], ['p1', 2], ['p3', 3]]));
    s = applyRound(s, session('duel', [['p3', 1], ['p1', 2], ['p2', 3]]));
    expect(isTournoiComplete(s)).toBe(true);
    expect(nextPlannedGameId(s)).toBeNull();
    expect(plannedRemaining(s)).toBe(0);
  });

  test('une soirée libre n\'est pas un tournoi', () => {
    const s = createSoiree(players);
    expect(isTournoi(s)).toBe(false);
    expect(nextPlannedGameId(s)).toBeNull();
    expect(isTournoiComplete(s)).toBe(false);
    expect(createSoiree(players, 0, []).plan).toBeUndefined(); // plan vide ignoré
  });
});
