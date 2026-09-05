import {
  type AliasConfig,
  type AliasState,
  aliasRanking,
  aliasReducer,
  createAliasState,
  currentRoundForTeam,
  currentTeam,
} from './aliasEngine';

const teams = [
  { id: 't1', name: 'Rouges', emoji: '🔴', color: '#f00' },
  { id: 't2', name: 'Bleus', emoji: '🔵', color: '#00f' },
];

const pool = ['Luffy', 'Goku', 'Mario', 'Zelda', 'Batman', 'Naruto', 'Sonic', 'Kirby'];

const cfg = (over: Partial<AliasConfig> = {}): AliasConfig => ({
  teams,
  roundsPerTeam: 1,
  roundSeconds: 45,
  ...over,
});

const create = (over: Partial<AliasConfig> = {}) => createAliasState({ config: cfg(over), pool, seed: 3 });

describe('aliasEngine', () => {
  it('démarre « prêt » pour la 1re équipe', () => {
    const s = create();
    expect(s.phase).toBe('ready');
    expect(currentTeam(s)?.id).toBe('t1');
    expect(s.totalTurns).toBe(2); // 2 équipes × 1 tour
  });

  it('exige au moins 2 équipes', () => {
    const s = create({ teams: [teams[0]!] });
    expect(s.phase).toBe('finished');
  });

  it('START_TURN sert un mot ; FOUND marque et avance', () => {
    let s = create();
    s = aliasReducer(s, { type: 'START_TURN' });
    expect(s.phase).toBe('playing');
    expect(s.word).not.toBe('');
    const first = s.word;
    s = aliasReducer(s, { type: 'FOUND' });
    expect(s.scores['t1']).toBe(1);
    expect(s.turnResults).toEqual([{ word: first, found: true }]);
    expect(s.word).not.toBe(first);
  });

  it('SKIP ne marque pas mais enregistre le mot', () => {
    let s = create();
    s = aliasReducer(s, { type: 'START_TURN' });
    const w = s.word;
    s = aliasReducer(s, { type: 'SKIP' });
    expect(s.scores['t1'] ?? 0).toBe(0);
    expect(s.turnResults).toEqual([{ word: w, found: false }]);
  });

  it('END_TURN → recap, NEXT_TURN → équipe suivante', () => {
    let s = create();
    s = aliasReducer(s, { type: 'START_TURN' });
    s = aliasReducer(s, { type: 'FOUND' });
    s = aliasReducer(s, { type: 'END_TURN' });
    expect(s.phase).toBe('turnEnd');
    s = aliasReducer(s, { type: 'NEXT_TURN' });
    expect(currentTeam(s)?.id).toBe('t2');
    expect(s.phase).toBe('ready');
  });

  it('termine après le même nombre de tours pour toutes les équipes', () => {
    let s = create({ roundsPerTeam: 1 });
    // tour équipe 1
    s = aliasReducer(s, { type: 'START_TURN' });
    s = aliasReducer(s, { type: 'FOUND' });
    s = aliasReducer(s, { type: 'END_TURN' });
    s = aliasReducer(s, { type: 'NEXT_TURN' });
    // tour équipe 2
    s = aliasReducer(s, { type: 'START_TURN' });
    s = aliasReducer(s, { type: 'END_TURN' });
    s = aliasReducer(s, { type: 'NEXT_TURN' });
    expect(s.phase).toBe('finished');
    expect(aliasRanking(s)[0]?.id).toBe('t1'); // t1 a 1 pt, t2 a 0
  });

  it('END_TURN au temps écoulé ajoute le mot en cours au recap', () => {
    let s = create();
    s = aliasReducer(s, { type: 'START_TURN' });
    const w = s.word;
    s = aliasReducer(s, { type: 'END_TURN', timedOut: true });
    expect(s.phase).toBe('turnEnd');
    expect(s.turnResults).toContainEqual({ word: w, found: false, timedOut: true });
  });

  it('porte le thème et l’univers du mot courant, pour le faire deviner', () => {
    let s = createAliasState({
      config: cfg(),
      pool: [{ word: 'Sasuke', theme: 'manga', universe: 'Naruto' }],
      seed: 1,
    });
    s = aliasReducer(s, { type: 'START_TURN' });
    expect(s.word).toBe('Sasuke');
    expect(s.theme).toBe('manga');
    expect(s.universe).toBe('Naruto');
  });

  it('currentRoundForTeam suit la progression', () => {
    let s = create({ roundsPerTeam: 2 });
    expect(currentRoundForTeam(s)).toBe(1);
    // après un tour complet de chaque équipe, on passe à la manche 2
    for (let i = 0; i < 2; i += 1) {
      s = aliasReducer(s, { type: 'START_TURN' });
      s = aliasReducer(s, { type: 'END_TURN' });
      s = aliasReducer(s, { type: 'NEXT_TURN' });
    }
    expect(currentRoundForTeam(s)).toBe(2);
  });
});
