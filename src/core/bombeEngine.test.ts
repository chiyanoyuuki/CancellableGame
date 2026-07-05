import { DEFAULT_BOMBE_CONFIG, type BombeConfig, type Player, type Question } from './models';
import {
  bombeRanking,
  bombeReducer,
  bombeToSessionResult,
  createBombeState,
  randomFuseMs,
} from './bombeEngine';
import { mulberry32 } from './rng';

const players: Player[] = [
  { id: 'p1', name: 'A', emoji: '🦊', color: '#111' },
  { id: 'p2', name: 'B', emoji: '🐼', color: '#222' },
  { id: 'p3', name: 'C', emoji: '🐸', color: '#333' },
];

function q(id: string): Question {
  return { id, theme: 'culture', difficulty: 1, text: id, answer: 'a', distractors: ['b', 'c', 'd'] };
}
const questions: Question[] = Array.from({ length: 30 }, (_, i) => q(`q${i}`));

const config: BombeConfig = { ...DEFAULT_BOMBE_CONFIG, secondsPerPlayer: 10, penaltyWrongSec: 5 };

function fresh(fuseMs = 60000, startIndex = 0) {
  return createBombeState({ config, players, questions, order: ['p1', 'p2', 'p3'], startIndex, firstFuseMs: fuseMs });
}

describe('bombeEngine', () => {
  test('démarre avec le joueur indiqué et une question', () => {
    const s = fresh(60000, 1);
    expect(s.activeId).toBe('p2');
    expect(s.current).not.toBeNull();
    expect(s.phase).toBe('question');
    expect(s.aliveIds).toEqual(['p1', 'p2', 'p3']);
  });

  test('on ne passe au joueur suivant (sens horaire) que sur une bonne réponse', () => {
    let s = fresh();
    expect(s.activeId).toBe('p1');
    // Mauvaise réponse : même joueur, mèche raccourcie.
    s = bombeReducer(s, { type: 'ANSWER', correct: false });
    expect(s.activeId).toBe('p1');
    expect(s.fuseMs).toBe(60000 - 5000);
    // Bonne réponse : passe à p2.
    s = bombeReducer(s, { type: 'ANSWER', correct: true });
    expect(s.activeId).toBe('p2');
    s = bombeReducer(s, { type: 'ANSWER', correct: true });
    expect(s.activeId).toBe('p3');
    s = bombeReducer(s, { type: 'ANSWER', correct: true });
    expect(s.activeId).toBe('p1'); // retour au début, sens horaire
  });

  test('une mauvaise réponse enchaîne automatiquement sur une autre question', () => {
    let s = fresh();
    const firstQ = s.current?.id;
    s = bombeReducer(s, { type: 'ANSWER', correct: false });
    expect(s.activeId).toBe('p1'); // même joueur
    expect(s.current?.id).not.toBe(firstQ); // nouvelle question
    expect(s.propsShown).toBe(0); // propositions réinitialisées
    expect(s.fuseMs).toBe(60000 - 5000); // pénalité appliquée
  });

  test('une bonne réponse ne recharge pas la mèche (même bombe)', () => {
    let s = fresh(30000);
    s = bombeReducer(s, { type: 'TICK', deltaMs: 4000 });
    expect(s.fuseMs).toBe(26000);
    s = bombeReducer(s, { type: 'ANSWER', correct: true });
    expect(s.activeId).toBe('p2');
    expect(s.fuseMs).toBe(26000); // la mèche continue
  });

  test('demander des propositions et passer coûtent du temps', () => {
    let s = fresh(60000);
    s = bombeReducer(s, { type: 'REVEAL_PROPS', count: 4 });
    expect(s.propsShown).toBe(4);
    expect(s.fuseMs).toBe(60000 - config.penaltyProps4Sec * 1000);
    const afterProps = s.fuseMs;
    s = bombeReducer(s, { type: 'SKIP' });
    expect(s.fuseMs).toBe(afterProps - config.penaltySkipSec * 1000);
    expect(s.propsShown).toBe(0); // passer réinitialise les propositions
  });

  test('quand la mèche atteint zéro, le porteur explose et est éliminé', () => {
    let s = fresh(3000);
    s = bombeReducer(s, { type: 'TICK', deltaMs: 3000 });
    expect(s.phase).toBe('exploded');
    expect(s.lastEliminatedId).toBe('p1');
    expect(s.aliveIds).toEqual(['p2', 'p3']);
    // Manche suivante : reprend au joueur suivant l'éliminé.
    s = bombeReducer(s, { type: 'NEXT_ROUND', fuseMs: 40000 });
    expect(s.phase).toBe('question');
    expect(s.activeId).toBe('p2');
    expect(s.fuseMs).toBe(40000);
  });

  test('la partie continue jusqu\'à ce qu\'il ne reste qu\'un joueur', () => {
    let s = fresh(2000);
    // p1 explose
    s = bombeReducer(s, { type: 'TICK', deltaMs: 2000 });
    expect(s.phase).toBe('exploded');
    s = bombeReducer(s, { type: 'NEXT_ROUND', fuseMs: 2000 });
    expect(s.activeId).toBe('p2');
    // p2 explose → il ne reste que p3 : partie finie, p3 gagne
    s = bombeReducer(s, { type: 'TICK', deltaMs: 2000 });
    expect(s.phase).toBe('finished');
    expect(s.winnerId).toBe('p3');
    expect(s.eliminationOrder).toEqual(['p1', 'p2']);
  });

  test('le classement place le survivant premier, puis les éliminés du dernier au premier', () => {
    let s = fresh(1000);
    s = bombeReducer(s, { type: 'TICK', deltaMs: 1000 }); // p1 out
    s = bombeReducer(s, { type: 'NEXT_ROUND', fuseMs: 1000 });
    s = bombeReducer(s, { type: 'TICK', deltaMs: 1000 }); // p2 out, p3 wins
    expect(bombeRanking(s)).toEqual(['p3', 'p2', 'p1']);
  });

  test('après explosion, plus aucune action ne modifie une partie finie', () => {
    let s = fresh(1000);
    s = bombeReducer(s, { type: 'TICK', deltaMs: 1000 });
    s = bombeReducer(s, { type: 'NEXT_ROUND', fuseMs: 1000 });
    s = bombeReducer(s, { type: 'TICK', deltaMs: 1000 });
    expect(s.phase).toBe('finished');
    const frozen = s;
    s = bombeReducer(s, { type: 'ANSWER', correct: true });
    expect(s).toBe(frozen);
  });

  test('le SessionResult classe, compte les points et fait boire les éliminés', () => {
    let s = fresh(2000);
    s = bombeReducer(s, { type: 'ANSWER', correct: true }); // p1 marque 1 point, passe à p2
    s = bombeReducer(s, { type: 'TICK', deltaMs: 2000 }); // p2 explose
    s = bombeReducer(s, { type: 'NEXT_ROUND', fuseMs: 2000 });
    s = bombeReducer(s, { type: 'TICK', deltaMs: 2000 }); // p3 explose, p1 gagne
    const res = bombeToSessionResult(s, 1000, 2000);
    const winner = res.players[0]!;
    expect(res.gameId).toBe('bombe');
    expect(winner.playerId).toBe('p1');
    expect(winner.rank).toBe(1);
    expect(winner.sipsDrunk).toBe(0); // le gagnant ne boit pas
    expect(winner.points).toBe(1); // une bonne réponse
    expect(res.players.every((p, i) => i === 0 || p.sipsDrunk > 0)).toBe(true);
    // Un événement « answer » par réponse, pour les stats et l'anti-répétition.
    expect(res.events?.length).toBe(1);
    expect(res.events?.[0]!.payload.questionId).toBe('q0');
  });

  test('la mèche est plus longue avec plus de joueurs', () => {
    const many = randomFuseMs(config, 6, mulberry32(1));
    const few = randomFuseMs(config, 2, mulberry32(1));
    expect(many).toBeGreaterThan(few);
  });
});
