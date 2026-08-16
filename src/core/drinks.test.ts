import { DRINK_CHALLENGES, maybeChallenge, resolveChallenge, rollAnswerDrink } from './drinks';
import { mulberry32, type Rng } from './rng';

const always = (v: number): Rng => () => v;

describe('rollAnswerDrink', () => {
  test('wrong answer makes the player drink', () => {
    const out = rollAnswerDrink({
      correct: false,
      difficulty: 1,
      turnMode: 'turn',
      hintsUsed: 0,
      intensity: 'normal',
      rng: always(0),
    });
    expect(out.sipsDrunk).toBeGreaterThanOrEqual(1);
    expect(out.sipsGiven).toBe(0);
    expect(out.reason).not.toBe('');
  });

  test('hardcore intensity makes wrong answers cost more', () => {
    const normal = rollAnswerDrink({ correct: false, difficulty: 1, turnMode: 'turn', hintsUsed: 0, intensity: 'normal', rng: always(0.99) });
    const hardcore = rollAnswerDrink({ correct: false, difficulty: 1, turnMode: 'turn', hintsUsed: 0, intensity: 'hardcore', rng: always(0.99) });
    expect(hardcore.sipsDrunk).toBeGreaterThan(normal.sipsDrunk);
  });

  test('clutch hard answer with no hint lets you distribute', () => {
    const out = rollAnswerDrink({
      correct: true,
      difficulty: 3,
      turnMode: 'turn',
      hintsUsed: 0,
      intensity: 'normal',
      rng: always(0), // forces the 0.6 chance to trigger
    });
    expect(out.sipsGiven).toBeGreaterThanOrEqual(1);
    expect(out.sipsDrunk).toBe(0);
  });

  test('an easy correct answer with no hint is usually free', () => {
    const out = rollAnswerDrink({
      correct: true,
      difficulty: 1,
      turnMode: 'turn',
      hintsUsed: 0,
      intensity: 'normal',
      rng: always(0.99),
    });
    expect(out.sipsDrunk).toBe(0);
    expect(out.sipsGiven).toBe(0);
  });
});

describe('maybeChallenge', () => {
  test('returns a known challenge when the roll succeeds', () => {
    const c = maybeChallenge(always(0), 'normal');
    expect(c).not.toBeNull();
    expect(DRINK_CHALLENGES.map((x) => x.id)).toContain(c?.id);
  });

  test('returns null when the roll fails', () => {
    expect(maybeChallenge(always(0.99), 'normal')).toBeNull();
  });

  test('picks from a provided custom list when given one', () => {
    const custom = [{ id: 'custom-1', text: 'Défi perso' }];
    expect(maybeChallenge(always(0), 'normal', custom)?.id).toBe('custom-1');
  });

  test('returns null when the challenge list is empty', () => {
    expect(maybeChallenge(always(0), 'normal', [])).toBeNull();
  });

  test('evite les defis recemment tombes (exclude)', () => {
    const first = DRINK_CHALLENGES[0]!.id;
    const c = maybeChallenge(always(0), 'normal', DRINK_CHALLENGES, [first]);
    expect(c?.id).not.toBe(first);
    expect(c?.id).toBe(DRINK_CHALLENGES[1]!.id);
  });

  test('si tout est exclu, on repart de la liste complete', () => {
    const allIds = DRINK_CHALLENGES.map((c) => c.id);
    const c = maybeChallenge(always(0), 'normal', DRINK_CHALLENGES, allIds);
    expect(c?.id).toBe(DRINK_CHALLENGES[0]!.id);
  });
});

describe('resolveChallenge (tirage auto des joueurs + minuteur)', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Chloé' },
  ];

  test('remplace {0} et {1} par des joueurs distincts et renvoie leurs ids', () => {
    const ch = { id: 'duel', text: '{0} et {1} se fixent.', picks: 2, timerSec: 30 };
    const r = resolveChallenge(ch, players, mulberry32(1));
    expect(r.pickedIds).toHaveLength(2);
    expect(r.pickedIds[0]).not.toBe(r.pickedIds[1]); // deux joueurs différents
    const names = r.pickedIds.map((id) => players.find((p) => p.id === id)!.name);
    expect(r.text).toBe(`${names[0]} et ${names[1]} se fixent.`);
    expect(r.text).not.toContain('{'); // plus aucun marqueur
    expect(r.timerSec).toBe(30); // le minuteur passe tel quel
  });

  test('un défi sans picks est renvoyé tel quel, sans avatars', () => {
    const ch = { id: 'x', text: 'Tout le monde trinque.' };
    const r = resolveChallenge(ch, players, mulberry32(2));
    expect(r.text).toBe('Tout le monde trinque.');
    expect(r.pickedIds).toEqual([]);
    expect(r.timerSec).toBeUndefined();
  });

  test('moins de joueurs que demandé : les marqueurs restants deviennent « un joueur »', () => {
    const ch = { id: 'duel', text: '{0} affronte {1}.', picks: 2 };
    const r = resolveChallenge(ch, [{ id: 'p1', name: 'Alice' }], mulberry32(3));
    expect(r.pickedIds).toEqual(['p1']);
    expect(r.text).toBe('Alice affronte un joueur.');
  });

  test('sans joueur du tout, aucun marqueur ne subsiste', () => {
    const ch = { id: 'duel', text: '{0} et {1} !', picks: 2 };
    const r = resolveChallenge(ch, [], mulberry32(4));
    expect(r.text).toBe('un joueur et un joueur !');
    expect(r.pickedIds).toEqual([]);
  });

  test('le même marqueur répété est remplacé partout (ex. le Chef)', () => {
    const ch = { id: 'chef', text: 'Chef {0} : quand {0} boit, tous boivent.', picks: 1 };
    const r = resolveChallenge(ch, players, mulberry32(5));
    const name = players.find((p) => p.id === r.pickedIds[0])!.name;
    expect(r.text).toBe(`Chef ${name} : quand ${name} boit, tous boivent.`);
  });

  test('tous les défis « picks » ont assez de marqueurs {i} pour leur nombre', () => {
    for (const c of DRINK_CHALLENGES) {
      if (!c.picks) continue;
      for (let i = 0; i < c.picks; i++) expect(c.text).toContain(`{${i}}`);
    }
  });

  test('avoid : tire en priorite les joueurs pas choisis recemment', () => {
    const ch = { id: 'chef', text: 'Chef {0}.', picks: 1 };
    // p1 et p2 recemment choisis -> seul p3 est frais -> force sur p3.
    const r = resolveChallenge(ch, players, mulberry32(1), ['p1', 'p2']);
    expect(r.pickedIds).toEqual(['p3']);
  });

  test('avoid : complete avec les recents quand il manque des frais', () => {
    const ch = { id: 'duel', text: '{0} et {1}.', picks: 2 };
    const r = resolveChallenge(ch, players, mulberry32(1), ['p1', 'p2']);
    expect(r.pickedIds[0]).toBe('p3'); // le seul frais d'abord
    expect(r.pickedIds).toHaveLength(2);
    expect(['p1', 'p2']).toContain(r.pickedIds[1]); // complete avec un recent
  });
});
