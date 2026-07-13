import type { Difficulty, Question, Theme } from './models';
import { recordUsage, selectQuestions } from './questionSelection';
import { mulberry32 } from './rng';

function q(id: string, theme: Theme, difficulty: Difficulty): Question {
  return { id, theme, difficulty, text: id, answer: 'a', distractors: ['b', 'c', 'd'] };
}

const pool: Question[] = [
  q('m1', 'manga', 1),
  q('m2', 'manga', 2),
  q('m3', 'manga', 3),
  q('v1', 'jeuxvideo', 1),
  q('v2', 'jeuxvideo', 2),
  q('c1', 'culture', 1),
  q('c2', 'culture', 2),
  q('c3', 'culture', 3),
];

describe('selectQuestions — bases', () => {
  test('respects theme and difficulty filters', () => {
    const out = selectQuestions(
      pool,
      { themes: ['manga'], difficulties: [1, 2], count: 10 },
      {},
      mulberry32(1),
    );
    expect(out.map((x) => x.id).sort()).toEqual(['m1', 'm2']);
  });

  test('respects the requested count', () => {
    const out = selectQuestions(
      pool,
      { themes: ['manga', 'jeuxvideo', 'culture'], difficulties: [1, 2, 3], count: 3 },
      {},
      mulberry32(5),
    );
    expect(out).toHaveLength(3);
  });

  test('never returns duplicates within a round', () => {
    const out = selectQuestions(
      pool,
      { themes: ['manga', 'jeuxvideo', 'culture'], difficulties: [1, 2, 3], count: 8 },
      {},
      mulberry32(8),
    );
    expect(new Set(out.map((x) => x.id)).size).toBe(out.length);
  });

  test('excludes disabled universes but keeps questions without a universe', () => {
    const withUni: Question[] = [
      { id: 'n1', theme: 'manga', difficulty: 1, universe: 'Naruto', text: 'n1', answer: 'a', distractors: ['b', 'c', 'd'] },
      { id: 'o1', theme: 'manga', difficulty: 1, universe: 'One Piece', text: 'o1', answer: 'a', distractors: ['b', 'c', 'd'] },
      { id: 'noUni', theme: 'manga', difficulty: 1, text: 'noUni', answer: 'a', distractors: ['b', 'c', 'd'] },
    ];
    const out = selectQuestions(
      withUni,
      { themes: ['manga'], difficulties: [1], count: 10, excludedUniverses: ['One Piece'] },
      {},
      mulberry32(1),
    );
    const ids = out.map((x) => x.id);
    expect(ids).toContain('n1');
    expect(ids).toContain('noUni');
    expect(ids).not.toContain('o1');
  });

  test('recordUsage increments counts immutably', () => {
    const h0 = {};
    const h1 = recordUsage(h0, ['m1', 'm2'], 1000);
    const h2 = recordUsage(h1, ['m1'], 2000);
    expect(h0).toEqual({});
    expect(h1.m1).toEqual({ timesUsed: 1, lastUsedAt: 1000 });
    expect(h2.m1).toEqual({ timesUsed: 2, lastUsedAt: 2000 });
    expect(h2.m2).toEqual({ timesUsed: 1, lastUsedAt: 1000 });
  });
});

// Helpers for the larger, realistic pools used below.
function uq(id: string, universe: string): Question {
  return { id, theme: 'manga', difficulty: 1, universe, text: id, answer: 'a', distractors: ['b', 'c', 'd'] };
}
/** N universes × `per` questions each, all in the manga theme, difficulty 1. */
function multiUniversePool(nUniverses: number, per: number): Question[] {
  const out: Question[] = [];
  for (let u = 0; u < nUniverses; u++) for (let i = 0; i < per; i++) out.push(uq(`U${u}_${i}`, `Univers${u}`));
  return out;
}

describe('nouvelles questions d’abord (anti-répétition)', () => {
  test('with a single slot, the least-used question is chosen', () => {
    const history = {
      m1: { timesUsed: 5, lastUsedAt: 100 },
      m2: { timesUsed: 5, lastUsedAt: 100 },
      m3: { timesUsed: 0, lastUsedAt: 0 },
    };
    const out = selectQuestions(pool, { themes: ['manga'], difficulties: [1, 2, 3], count: 1 }, history, mulberry32(2));
    expect(out.map((x) => x.id)).toEqual(['m3']);
  });

  test('unseen questions are exhausted before any already-seen one is reused', () => {
    // 30 unseen + 30 seen; a 20-question round must be 100% unseen.
    const p = multiUniversePool(12, 5); // 60 questions
    const history: Record<string, { timesUsed: number; lastUsedAt: number }> = {};
    const seen = new Set(p.slice(0, 30).map((x) => x.id));
    for (const id of seen) history[id] = { timesUsed: 2, lastUsedAt: 1 };
    for (let seed = 1; seed <= 20; seed++) {
      const out = selectQuestions(p, { themes: ['manga'], difficulties: [1], count: 20 }, history, mulberry32(seed), {
        order: ['p1'],
        turnMode: 'turn',
      });
      expect(out.every((x) => !seen.has(x.id))).toBe(true);
    }
  });
});

describe('diversité des univers', () => {
  test('a round covers as many distinct universes as possible', () => {
    const p = multiUniversePool(20, 5); // 20 universes
    let distinct = 0;
    const SEEDS = 60;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const out = selectQuestions(p, { themes: ['manga'], difficulties: [1], count: 10 }, {}, mulberry32(seed), {
        order: ['p1'],
        turnMode: 'turn',
      });
      distinct += new Set(out.map((x) => x.universe)).size;
    }
    // 10 picks over 20 universes → nearly 10 distinct on average (here ~9.7).
    expect(distinct / SEEDS).toBeGreaterThan(9);
  });

  test('a single player is not buried under one universe', () => {
    const p = multiUniversePool(20, 5);
    for (let seed = 1; seed <= 30; seed++) {
      const out = selectQuestions(p, { themes: ['manga'], difficulties: [1], count: 10 }, {}, mulberry32(seed), {
        order: ['p1'],
        turnMode: 'turn',
      });
      const perUniverse = new Map<string, number>();
      for (const x of out) perUniverse.set(x.universe!, (perUniverse.get(x.universe!) ?? 0) + 1);
      const max = Math.max(...perUniverse.values());
      expect(max).toBeLessThanOrEqual(3); // no single universe dominates a 10-question round
    }
  });
});

describe('univers non souhaités (≈ 2 %)', () => {
  // 15 univers de manga + 15 univers de jeux vidéo, 4 questions chacun.
  function tq(id: string, theme: Theme, universe: string): Question {
    return { id, theme, difficulty: 1, universe, text: id, answer: 'a', distractors: ['b', 'c', 'd'] };
  }
  const twoThemes: Question[] = [];
  for (let u = 0; u < 15; u++) for (let i = 0; i < 4; i++) twoThemes.push(tq(`M${u}_${i}`, 'manga', `M${u}`));
  for (let u = 0; u < 15; u++) for (let i = 0; i < 4; i++) twoThemes.push(tq(`V${u}_${i}`, 'jeuxvideo', `V${u}`));
  // Tous les univers de jeux vidéo, marqués comme non souhaités en bloc.
  const vUniverses = Array.from({ length: 15 }, (_, u) => `V${u}`);
  const SEEDS = 100;
  const N = 20;

  function jeuxvideoTotal(opts: Parameters<typeof selectQuestions>[4]): number {
    let t = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const out = selectQuestions(
        twoThemes,
        { themes: ['manga', 'jeuxvideo'], difficulties: [1], count: N },
        {},
        mulberry32(seed),
        opts,
      );
      t += out.filter((x) => x.theme === 'jeuxvideo').length;
    }
    return t;
  }

  test('turn mode: un univers non souhaité ne sort quasiment jamais', () => {
    const neutral = jeuxvideoTotal({ order: ['p1'], turnMode: 'turn' });
    const unwanted = jeuxvideoTotal({ order: ['p1'], turnMode: 'turn', unwantedUniversesByPlayer: { p1: vUniverses } });
    // Neutral est ~la moitié de 20×100 = ~1000 ; non souhaité ~2 % des tirages (~40).
    expect(unwanted).toBeLessThan(neutral * 0.1);
  });

  test('fastest mode: un univers non souhaité par un joueur est évité pour la question partagée', () => {
    const neutral = jeuxvideoTotal({ order: ['p1', 'p2'], turnMode: 'fastest' });
    const unwanted = jeuxvideoTotal({
      order: ['p1', 'p2'],
      turnMode: 'fastest',
      unwantedUniversesByPlayer: { p2: vUniverses },
    });
    expect(unwanted).toBeLessThan(neutral * 0.1);
  });

  test('par joueur : seul le joueur qui a marqué les univers les évite', () => {
    let p1Jeuxvideo = 0;
    let p2Jeuxvideo = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const out = selectQuestions(
        twoThemes,
        { themes: ['manga', 'jeuxvideo'], difficulties: [1], count: N },
        {},
        mulberry32(seed),
        { order: ['p1', 'p2'], turnMode: 'turn', unwantedUniversesByPlayer: { p1: vUniverses } },
      );
      out.forEach((qq, i) => {
        if (qq.theme !== 'jeuxvideo') return;
        if (i % 2 === 0) p1Jeuxvideo++;
        else p2Jeuxvideo++;
      });
    }
    // p1 (non souhaité) quasiment jamais ; p2 (aucune restriction) librement.
    expect(p1Jeuxvideo).toBeLessThan(p2Jeuxvideo * 0.2);
  });

  test('soft : un univers non souhaité reste utilisé quand il ne reste que lui', () => {
    const soloUniverse = Array.from({ length: 5 }, (_, i) => tq(`V${i}`, 'jeuxvideo', 'Solo'));
    const out = selectQuestions(soloUniverse, { themes: ['jeuxvideo'], difficulties: [1], count: 3 }, {}, mulberry32(1), {
      order: ['p1'],
      turnMode: 'turn',
      unwantedUniversesByPlayer: { p1: ['Solo'] },
    });
    expect(out).toHaveLength(3);
  });

  test('respecte toujours le nombre et ne renvoie pas de doublons', () => {
    const out = selectQuestions(
      twoThemes,
      { themes: ['manga', 'jeuxvideo'], difficulties: [1], count: 30 },
      {},
      mulberry32(3),
      { order: ['p1'], turnMode: 'turn', unwantedUniversesByPlayer: { p1: vUniverses } },
    );
    expect(out).toHaveLength(30);
    expect(new Set(out.map((x) => x.id)).size).toBe(30);
  });
});

describe('anti-doublon (jamais deux fois la même question)', () => {
  test('deux entrées au même énoncé et à la même réponse ne sortent jamais ensemble', () => {
    // La même question rangée dans deux thèmes différents (ex. le marteau de Thor).
    const dup: Question[] = [
      { id: 'a1', theme: 'manga', difficulty: 1, universe: 'U1', text: 'Le marteau de Thor ?', answer: 'Mjöllnir', distractors: ['x', 'y', 'z'] },
      { id: 'b1', theme: 'jeuxvideo', difficulty: 1, universe: 'U2', text: 'le  marteau de THOR ?', answer: 'Mjöllnir', distractors: ['x', 'y', 'z'] },
      { id: 'c1', theme: 'culture', difficulty: 1, text: 'Autre question ?', answer: 'Autre', distractors: ['x', 'y', 'z'] },
    ];
    for (let seed = 1; seed <= 40; seed++) {
      const out = selectQuestions(
        dup,
        { themes: ['manga', 'jeuxvideo', 'culture'], difficulties: [1], count: 3 },
        {},
        mulberry32(seed),
      );
      const ids = out.map((x) => x.id);
      // a1 et b1 sont la même question (casse/espaces mis à part) → jamais les deux.
      expect(ids.includes('a1') && ids.includes('b1')).toBe(false);
      // Aucun énoncé répété dans le lot.
      const keys = out.map((x) => x.text.toLowerCase().replace(/\s+/g, ' ').trim());
      expect(new Set(keys).size).toBe(out.length);
    }
  });

  test('même énoncé mais réponses différentes restent deux questions distinctes', () => {
    // Deux drapeaux : même question, réponses différentes → doivent coexister.
    const flags: Question[] = [
      { id: 'f1', theme: 'culture', difficulty: 1, universe: 'Géo', text: 'Quel pays ?', answer: 'France', distractors: ['x', 'y', 'z'] },
      { id: 'f2', theme: 'culture', difficulty: 1, universe: 'Géo', text: 'Quel pays ?', answer: 'Italie', distractors: ['x', 'y', 'z'] },
    ];
    const out = selectQuestions(flags, { themes: ['culture'], difficulties: [1], count: 2 }, {}, mulberry32(1));
    expect(out).toHaveLength(2);
    expect(new Set(out.map((x) => x.id)).size).toBe(2);
  });
});

describe('lot personnalisé par joueur (historique par joueur)', () => {
  const p: Question[] = [
    ...Array.from({ length: 10 }, (_, i) => uq(`A${i}`, 'A')),
    ...Array.from({ length: 10 }, (_, i) => uq(`B${i}`, 'B')),
  ];
  // p1 has already seen every question of universe A; p2 is brand new.
  const historyByPlayer = {
    p1: Object.fromEntries(p.filter((q) => q.universe === 'A').map((q) => [q.id, { timesUsed: 1, lastUsedAt: 1 }])),
  };

  test('a player only gets questions THEY have not seen, while a new player still gets them', () => {
    let p1GotSeen = 0;
    let seenServedToNewPlayer = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const out = selectQuestions(p, { themes: ['manga'], difficulties: [1], count: 8 }, {}, mulberry32(seed), {
        order: ['p1', 'p2'],
        turnMode: 'turn',
        historyByPlayer,
      });
      out.forEach((q, i) => {
        const player = i % 2 === 0 ? 'p1' : 'p2';
        if (q.universe === 'A') {
          if (player === 'p1') p1GotSeen++;
          else seenServedToNewPlayer++;
        }
      });
    }
    // p1 is never served a question they had already seen…
    expect(p1GotSeen).toBe(0);
    // …but universe A is still used — for p2, to whom it is new.
    expect(seenServedToNewPlayer).toBeGreaterThan(0);
  });
});
