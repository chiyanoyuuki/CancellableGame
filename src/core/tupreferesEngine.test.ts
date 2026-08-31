import type { Player } from './models';
import {
  createTuPreferesState,
  type Dilemma,
  type TuPreferesConfig,
  tuPreferesRanking,
  tuPreferesReducer,
  type TuPreferesState,
  tuPreferesToSessionResult,
  type Vote,
} from './tupreferesEngine';

const players: Player[] = [
  { id: 'p1', name: 'A', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'B', emoji: '🐼', color: '#0f0' },
  { id: 'p3', name: 'C', emoji: '🐸', color: '#00f' },
  { id: 'p4', name: 'D', emoji: '🐯', color: '#ff0' },
];

const pool: Dilemma[] = [
  { a: 'Voler', b: 'Être invisible' },
  { a: 'Pizza', b: 'Burger' },
  { a: 'Montagne', b: 'Plage' },
];

const cfg = (over: Partial<TuPreferesConfig> = {}): TuPreferesConfig => ({
  rounds: 2,
  drinksEnabled: true,
  drinkIntensity: 'normal',
  drinkingSide: 'minority',
  ...over,
});

const create = (over: Partial<TuPreferesConfig> = {}, ps = players) =>
  createTuPreferesState({ config: cfg(over), players: ps, pool, seed: 999 });

/** Fait voter tous les joueurs dans l'ordre selon la liste fournie. */
function voteAll(s: TuPreferesState, votes: Vote[]): TuPreferesState {
  let st = s;
  for (const v of votes) st = tuPreferesReducer(st, { type: 'VOTE', vote: v });
  return st;
}

describe('tuPreferesEngine', () => {
  it('démarre en phase de vote sur la 1re manche', () => {
    const s = create();
    expect(s.phase).toBe('vote');
    expect(s.round).toBe(1);
    expect(s.voterIdx).toBe(0);
  });

  it('fait tourner le téléphone puis résout à la fin des votes', () => {
    let s = create();
    s = tuPreferesReducer(s, { type: 'VOTE', vote: 'a' });
    expect(s.voterIdx).toBe(1);
    expect(s.phase).toBe('vote');
    s = voteAll(s, ['a', 'b', 'b']); // 3 votes restants
    expect(s.phase).toBe('result');
    expect(s.lastOutcome?.votesA).toBe(2);
    expect(s.lastOutcome?.votesB).toBe(2);
  });

  it('la minorité boit et la majorité marque un point', () => {
    // A,A,A,B → majorité A (3), minorité B (1)
    let s = create();
    s = voteAll(s, ['a', 'a', 'a', 'b']);
    expect(s.phase).toBe('result');
    expect(s.lastOutcome?.drinkingChoice).toBe('b'); // minorité boit
    // le buveur est p4 (a voté b)
    expect(s.lastOutcome?.drinkers).toEqual(['p4']);
    expect(s.sipsById['p4']).toBe(2); // normal = 2
    // majorité (p1,p2,p3) marque 1 point chacun
    expect(s.scores['p1']).toBe(1);
    expect(s.scores['p2']).toBe(1);
    expect(s.scores['p3']).toBe(1);
    expect(s.scores['p4'] ?? 0).toBe(0);
  });

  it('en mode majorité, c\'est la majorité qui boit', () => {
    let s = create({ drinkingSide: 'majority' });
    s = voteAll(s, ['a', 'a', 'a', 'b']);
    expect(s.lastOutcome?.drinkingChoice).toBe('a');
    expect(s.lastOutcome?.drinkers?.sort()).toEqual(['p1', 'p2', 'p3']);
  });

  it('égalité : tout le monde trinque, personne ne marque', () => {
    let s = create();
    s = voteAll(s, ['a', 'a', 'b', 'b']);
    expect(s.lastOutcome?.tie).toBe(true);
    expect(s.lastOutcome?.drinkers?.length).toBe(4);
    expect(Object.keys(s.scores).length).toBe(0);
  });

  it('respecte drinksEnabled = false', () => {
    let s = create({ drinksEnabled: false });
    s = voteAll(s, ['a', 'a', 'a', 'b']);
    expect(s.lastOutcome?.drinkers).toEqual([]);
    expect(s.sipsById['p4'] ?? 0).toBe(0);
  });

  it('enchaîne les manches puis termine', () => {
    let s = create({ rounds: 2 });
    s = voteAll(s, ['a', 'a', 'a', 'b']);
    s = tuPreferesReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('vote');
    expect(s.round).toBe(2);
    s = voteAll(s, ['b', 'b', 'b', 'a']);
    s = tuPreferesReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('finished');
  });

  it('produit un SessionResult classé et cohérent', () => {
    let s = create({ rounds: 1 });
    s = voteAll(s, ['a', 'a', 'a', 'b']);
    s = tuPreferesReducer(s, { type: 'NEXT' });
    const res = tuPreferesToSessionResult(s, 0, 1000);
    expect(res.gameId).toBe('tupreferes');
    expect(res.players.length).toBe(4);
    expect(res.players[0]!.rank).toBe(1);
    // p4 (minorité) a bu, les autres ont 1 point
    const p4 = res.players.find((p) => p.playerId === 'p4')!;
    expect(p4.sipsDrunk).toBe(2);
  });

  it('classe par points décroissants', () => {
    let s = create({ rounds: 1 });
    s = voteAll(s, ['a', 'a', 'a', 'b']);
    s = tuPreferesReducer(s, { type: 'NEXT' });
    const ranked = tuPreferesRanking(s);
    expect(ranked[ranked.length - 1]).toBe('p4'); // p4 dernier (0 pt)
  });
});
