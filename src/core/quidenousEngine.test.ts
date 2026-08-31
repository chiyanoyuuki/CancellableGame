import type { Player } from './models';
import {
  createQuiDeNousState,
  type QuiDeNousConfig,
  quiDeNousRanking,
  quiDeNousReducer,
  type QuiDeNousState,
  quiDeNousToSessionResult,
} from './quidenousEngine';

const players: Player[] = [
  { id: 'p1', name: 'A', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'B', emoji: '🐼', color: '#0f0' },
  { id: 'p3', name: 'C', emoji: '🐸', color: '#00f' },
  { id: 'p4', name: 'D', emoji: '🐯', color: '#ff0' },
];

const pool = ['… danser sur la table', '… oublier son code de carte', '… pleurer devant un film'];

const cfg = (over: Partial<QuiDeNousConfig> = {}): QuiDeNousConfig => ({
  rounds: 2,
  drinksEnabled: true,
  drinkIntensity: 'normal',
  ...over,
});

const create = (over: Partial<QuiDeNousConfig> = {}, ps = players) =>
  createQuiDeNousState({ config: cfg(over), players: ps, pool, seed: 42 });

/** Fait voter tous les joueurs dans l'ordre pour les cibles fournies. */
function voteAll(s: QuiDeNousState, targets: string[]): QuiDeNousState {
  let st = s;
  for (const target of targets) st = quiDeNousReducer(st, { type: 'VOTE', targetId: target });
  return st;
}

describe('quiDeNousEngine', () => {
  it('démarre en vote sur la 1re manche', () => {
    const s = create();
    expect(s.phase).toBe('vote');
    expect(s.round).toBe(1);
    expect(s.prompt).not.toBe('');
  });

  it('exige au moins 3 joueurs', () => {
    const s = create({}, players.slice(0, 2));
    expect(s.phase).toBe('finished');
  });

  it('désigne le plus voté comme gagnant et lui fait boire les votes reçus', () => {
    // p1,p1,p1,p2 → p1 gagne avec 3 votes
    let s = create();
    s = voteAll(s, ['p1', 'p1', 'p1', 'p2']);
    expect(s.phase).toBe('result');
    expect(s.lastOutcome?.winners).toEqual(['p1']);
    expect(s.lastOutcome?.maxVotes).toBe(3);
    expect(s.lastOutcome?.sips).toBe(3); // normal = ×1
    expect(s.sipsById['p1']).toBe(3);
    // scores = votes reçus
    expect(s.scores['p1']).toBe(3);
    expect(s.scores['p2']).toBe(1);
  });

  it('gère les égalités : plusieurs gagnants boivent', () => {
    // p1,p1,p3,p3 → p1 et p3 à égalité (2 chacun)
    let s = create();
    s = voteAll(s, ['p1', 'p1', 'p3', 'p3']);
    expect(s.lastOutcome?.winners?.sort()).toEqual(['p1', 'p3']);
    expect(s.lastOutcome?.maxVotes).toBe(2);
    expect(s.sipsById['p1']).toBe(2);
    expect(s.sipsById['p3']).toBe(2);
  });

  it('module les gorgées avec soft (×0.5, min 1)', () => {
    let s = create({ drinkIntensity: 'soft' });
    s = voteAll(s, ['p1', 'p1', 'p1', 'p1']); // 4 votes
    expect(s.lastOutcome?.sips).toBe(2); // round(4*0.5)=2
  });

  it('respecte drinksEnabled = false', () => {
    let s = create({ drinksEnabled: false });
    s = voteAll(s, ['p1', 'p1', 'p1', 'p2']);
    expect(s.lastOutcome?.sips).toBe(0);
    expect(s.sipsById['p1'] ?? 0).toBe(0);
    // les scores (personnage) restent comptés
    expect(s.scores['p1']).toBe(3);
  });

  it('enchaîne les manches puis termine', () => {
    let s = create({ rounds: 2 });
    s = voteAll(s, ['p1', 'p1', 'p1', 'p2']);
    s = quiDeNousReducer(s, { type: 'NEXT' });
    expect(s.round).toBe(2);
    expect(s.phase).toBe('vote');
    s = voteAll(s, ['p2', 'p2', 'p2', 'p1']);
    s = quiDeNousReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('finished');
    // p1 et p2 chacun 3+1 = 4 de personnage
    expect(s.scores['p1']).toBe(4);
    expect(s.scores['p2']).toBe(4);
  });

  it('classe par votes reçus et produit un SessionResult', () => {
    let s = create({ rounds: 1 });
    s = voteAll(s, ['p1', 'p1', 'p1', 'p2']);
    s = quiDeNousReducer(s, { type: 'NEXT' });
    const ranked = quiDeNousRanking(s);
    expect(ranked[0]).toBe('p1');
    const res = quiDeNousToSessionResult(s, 0, 1000);
    expect(res.gameId).toBe('quidenous');
    expect(res.players.length).toBe(4);
    const p1 = res.players.find((p) => p.playerId === 'p1')!;
    expect(p1.rank).toBe(1);
    expect(p1.sipsDrunk).toBe(3);
  });
});
