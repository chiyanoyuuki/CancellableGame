import type { Difficulty, Player, Question, QuizConfig, Theme } from './models';
import {
  availableHints,
  createQuizState,
  currentQuestion,
  getRanking,
  potentialPoints,
  quizReducer,
  type QuizState,
  toSessionResult,
  visibleOptions,
} from './quizEngine';

const players: Player[] = [
  { id: 'p1', name: 'Alice', emoji: '🦊', color: '#f00' },
  { id: 'p2', name: 'Bob', emoji: '🐼', color: '#0f0' },
  { id: 'p3', name: 'Cléo', emoji: '🐸', color: '#00f' },
];

function q(id: string, theme: Theme, difficulty: Difficulty, hints: string[] = []): Question {
  return { id, theme, difficulty, text: `Q ${id}`, answer: 'bonne', distractors: ['x', 'y', 'z'], hints };
}

const questions: Question[] = [
  q('q1', 'manga', 1, ['indice A', 'indice B']),
  q('q2', 'culture', 2),
  q('q3', 'films', 3),
];

function config(overrides: Partial<QuizConfig> = {}): QuizConfig {
  return {
    themes: ['manga', 'culture', 'films'],
    difficulties: [1, 2, 3],
    questionCount: 3,
    turnMode: 'turn',
    drinksEnabled: false, // keep CONTINUE deterministic (no random challenge)
    drinkIntensity: 'normal',
    fastestTimeLimitMs: 20000,
    showUniverse: true,
    excludedUniverses: [],
    teamMode: false,
    teams: [],
    questionTimerSec: 0,
    ...overrides,
  };
}

function start(overrides: Partial<QuizConfig> = {}): QuizState {
  return createQuizState({ config: config(overrides), players, questions, seed: 12345 });
}

describe('createQuizState', () => {
  test('prepares the four options but reveals none (free answer by default)', () => {
    const s = start();
    expect(s.phase).toBe('question');
    expect(s.index).toBe(0);
    expect(s.currentOptions).toHaveLength(4);
    expect(s.currentOptions).toContain('bonne');
    expect(s.propsShown).toBe(0);
    expect(visibleOptions(s)).toHaveLength(0);
    expect(currentQuestion(s)?.id).toBe('q1');
  });

  test('turn mode assigns an active player', () => {
    const s = start({ turnMode: 'turn' });
    expect(s.activePlayerId).not.toBeNull();
    expect(players.map((p) => p.id)).toContain(s.activePlayerId);
  });

  test('fastest mode has no active player until someone buzzes', () => {
    const s = start({ turnMode: 'fastest' });
    expect(s.activePlayerId).toBeNull();
  });

  test('empty question list ends immediately', () => {
    const s = createQuizState({ config: config(), players, questions: [], seed: 1 });
    expect(s.phase).toBe('finished');
  });
});

describe('propositions (help on demand)', () => {
  test('revealing 4 propositions shows the full QCM', () => {
    let s = start();
    s = quizReducer(s, { type: 'REVEAL_PROPS', count: 4 });
    expect(s.propsShown).toBe(4);
    expect(visibleOptions(s)).toHaveLength(4);
    expect(visibleOptions(s)).toContain('bonne');
  });

  test('revealing 2 propositions shows a pair including the answer', () => {
    let s = start();
    s = quizReducer(s, { type: 'REVEAL_PROPS', count: 2 });
    expect(s.propsShown).toBe(2);
    expect(visibleOptions(s)).toHaveLength(2);
    expect(visibleOptions(s)).toContain('bonne');
  });

  test('2 propositions supersedes 4, and 4 cannot downgrade from 2', () => {
    let s = start();
    s = quizReducer(s, { type: 'REVEAL_PROPS', count: 4 });
    s = quizReducer(s, { type: 'REVEAL_PROPS', count: 2 });
    expect(s.propsShown).toBe(2);
    s = quizReducer(s, { type: 'REVEAL_PROPS', count: 4 });
    expect(s.propsShown).toBe(2);
  });

  test('each help level lowers the potential points', () => {
    const free = potentialPoints(start());
    const four = potentialPoints(quizReducer(start(), { type: 'REVEAL_PROPS', count: 4 }));
    const two = potentialPoints(quizReducer(start(), { type: 'REVEAL_PROPS', count: 2 }));
    expect(four).toBeLessThan(free);
    expect(two).toBeLessThan(four);
  });
});

describe('hints', () => {
  test('reveal up to the available count, never beyond', () => {
    let s = start();
    expect(availableHints(s)).toBe(2);
    s = quizReducer(s, { type: 'REVEAL_HINT' });
    expect(s.hintsRevealed).toBe(1);
    s = quizReducer(s, { type: 'REVEAL_HINT' });
    s = quizReducer(s, { type: 'REVEAL_HINT' });
    expect(s.hintsRevealed).toBe(2);
  });

  test('a question without hints exposes none', () => {
    let s = start();
    // advance to q2 (no hints)
    s = quizReducer(s, { type: 'SUBMIT', playerId: 'p1', correct: true });
    s = quizReducer(s, { type: 'CONTINUE' });
    expect(availableHints(s)).toBe(0);
    const after = quizReducer(s, { type: 'REVEAL_HINT' });
    expect(after.hintsRevealed).toBe(0);
  });

  test('revealing a hint lowers the potential points', () => {
    const before = potentialPoints(start());
    const after = potentialPoints(quizReducer(start(), { type: 'REVEAL_HINT' }));
    expect(after).toBeLessThan(before);
  });
});

describe('answering', () => {
  test('a correct answer scores points and moves to reveal', () => {
    let s = start();
    s = quizReducer(s, { type: 'SUBMIT', playerId: 'p1', correct: true });
    expect(s.phase).toBe('reveal');
    expect(s.scores.p1?.points).toBeGreaterThan(0);
    expect(s.scores.p1?.correct).toBe(1);
    expect(s.answers).toHaveLength(1);
    expect(s.lastOutcome?.correct).toBe(true);
  });

  test('taking propositions reduces the points earned', () => {
    let free = start();
    free = quizReducer(free, { type: 'SUBMIT', playerId: 'p1', correct: true });

    let helped = start();
    helped = quizReducer(helped, { type: 'REVEAL_PROPS', count: 2 });
    helped = quizReducer(helped, { type: 'SUBMIT', playerId: 'p1', correct: true });

    expect(helped.scores.p1!.points).toBeLessThan(free.scores.p1!.points);
    expect(helped.answers[0]?.propsShown).toBe(2);
  });

  test('a wrong answer scores nothing and counts as wrong', () => {
    let s = start();
    s = quizReducer(s, { type: 'SUBMIT', playerId: 'p1', correct: false });
    expect(s.scores.p1?.points).toBe(0);
    expect(s.scores.p1?.wrong).toBe(1);
  });

  test('CONTINUE from reveal advances to the next question and resets help', () => {
    let s = start();
    s = quizReducer(s, { type: 'REVEAL_PROPS', count: 4 });
    s = quizReducer(s, { type: 'SUBMIT', playerId: 'p1', correct: true });
    s = quizReducer(s, { type: 'CONTINUE' });
    expect(s.phase).toBe('question');
    expect(s.index).toBe(1);
    expect(currentQuestion(s)?.id).toBe('q2');
    expect(s.propsShown).toBe(0);
  });

  test('SKIP reveals the answer without scoring anyone', () => {
    let s = start({ turnMode: 'fastest' });
    s = quizReducer(s, { type: 'SKIP' });
    expect(s.phase).toBe('reveal');
    expect(s.lastOutcome?.correct).toBe(false);
    expect(s.answers).toHaveLength(0);
    expect(s.scores.p1?.points).toBe(0);
    s = quizReducer(s, { type: 'CONTINUE' });
    expect(s.index).toBe(1);
  });

  test('fastest mode records the buzzer as active player', () => {
    let s = start({ turnMode: 'fastest' });
    s = quizReducer(s, { type: 'SUBMIT', playerId: 'p2', correct: true, timeMs: 1000 });
    expect(s.activePlayerId).toBe('p2');
    expect(s.answers[0]?.timeMs).toBe(1000);
  });
});

describe('broken-image auto-skip', () => {
  const order = ['p1', 'p2', 'p3'];
  const reserveQ = q('qr', 'culture', 2);

  function startWithReserve(reserve: Question[]): QuizState {
    return createQuizState({ config: config({ turnMode: 'turn' }), players, questions, seed: 999, order, reserve });
  }

  test('IMAGE_FAILED swaps in a reserve, keeps the same player and adds a question', () => {
    let s = startWithReserve([reserveQ]);
    expect(s.activePlayerId).toBe('p1');
    expect(currentQuestion(s)?.id).toBe('q1');
    const before = s.questions.length;

    s = quizReducer(s, { type: 'IMAGE_FAILED' });
    expect(s.phase).toBe('question');
    expect(currentQuestion(s)?.id).toBe('qr'); // replacement swapped in
    expect(s.activePlayerId).toBe('p1'); // same player still up
    expect(s.questions.length).toBe(before + 1); // « +1 au total »
    expect(s.voids).toBe(1);
    expect(s.answers).toHaveLength(0); // nothing scored for the voided one
  });

  test('rotation resumes correctly after a void', () => {
    let s = startWithReserve([reserveQ]);
    s = quizReducer(s, { type: 'IMAGE_FAILED' }); // p1 now on the replacement
    s = quizReducer(s, { type: 'SUBMIT', playerId: 'p1', correct: true });
    s = quizReducer(s, { type: 'CONTINUE' });
    // The next real question goes to p2 (the player who follows p1).
    expect(s.activePlayerId).toBe('p2');
    expect(currentQuestion(s)?.id).toBe('q2');
  });

  test('without a reserve it skips to the next question, same player up', () => {
    let s = startWithReserve([]);
    expect(s.activePlayerId).toBe('p1');
    s = quizReducer(s, { type: 'IMAGE_FAILED' });
    expect(currentQuestion(s)?.id).toBe('q2');
    expect(s.activePlayerId).toBe('p1'); // still p1's turn
    expect(s.questions.length).toBe(questions.length); // no reserve → no growth
    expect(s.voids).toBe(1);
  });

  test('the whole turn order stays correct after a mid-game void', () => {
    const qs: Question[] = [
      q('a', 'manga', 1), q('b', 'culture', 1), q('c', 'films', 1),
      q('d', 'manga', 1), q('e', 'culture', 1), q('f', 'films', 1),
    ];
    let s = createQuizState({
      config: config({ turnMode: 'turn' }), players, questions: qs, seed: 1,
      order, reserve: [q('r1', 'culture', 1)],
    });
    const seen: (string | null)[] = [s.activePlayerId]; // p1 is up for 'a'
    s = quizReducer(s, { type: 'IMAGE_FAILED' }); // 'a' voided → same player on the replacement
    seen.push(s.activePlayerId);
    while (s.phase !== 'finished') {
      s = quizReducer(s, { type: 'SUBMIT', playerId: s.activePlayerId as string, correct: true });
      s = quizReducer(s, { type: 'CONTINUE' });
      if (s.phase === 'question') seen.push(s.activePlayerId);
    }
    // p1 keeps the voided slot (replacement), then the rotation continues cleanly.
    expect(seen).toEqual(['p1', 'p1', 'p2', 'p3', 'p1', 'p2', 'p3']);
  });
});

describe('full playthrough', () => {
  test('runs to finished, ranks players and builds a session result', () => {
    let s = start();
    // p1 answers everything correctly; nobody else scores.
    for (let i = 0; i < questions.length; i++) {
      s = quizReducer(s, { type: 'SUBMIT', playerId: 'p1', correct: true });
      s = quizReducer(s, { type: 'CONTINUE' });
    }
    expect(s.phase).toBe('finished');

    const ranking = getRanking(s);
    expect(ranking[0]?.playerId).toBe('p1');
    expect(ranking[0]?.correct).toBe(3);

    const result = toSessionResult(s, 1000, 2000);
    expect(result.gameId).toBe('quiz');
    expect(result.mode).toBe('turn');
    expect(result.players).toHaveLength(3);
    expect(result.players[0]?.rank).toBe(1);
    expect(result.players[0]?.playerId).toBe('p1');
    expect(result.events).toHaveLength(3);
    expect(result.startedAt).toBe(1000);
    expect(result.endedAt).toBe(2000);
  });
});

describe('mise en pause d’un joueur (standby)', () => {
  const order = ['p1', 'p2', 'p3'];
  const qs = Array.from({ length: 9 }, (_, i) => q(`s${i}`, 'manga', 1));
  const startTurn = () =>
    createQuizState({ config: config({ turnMode: 'turn' }), players, questions: qs, seed: 7, order });
  const next = (s: QuizState) =>
    quizReducer(quizReducer(s, { type: 'SUBMIT', playerId: s.activePlayerId as string, correct: true }), {
      type: 'CONTINUE',
    });

  test('un joueur en pause est sauté et sa dette de tours grandit ; les autres jouent', () => {
    let s = startTurn();
    expect(s.activePlayerId).toBe('p1');
    s = quizReducer(s, { type: 'TOGGLE_STANDBY', playerId: 'p2' });
    s = next(s); // Q2
    expect(s.activePlayerId).toBe('p3'); // p2 sauté
    expect(s.owed.p2).toBe(1);
    s = next(s); // Q3
    expect(s.activePlayerId).toBe('p1');
    s = next(s); // Q4
    expect(s.activePlayerId).toBe('p3'); // p2 sauté à nouveau
    expect(s.owed.p2).toBe(2);
  });

  test('au retour, le joueur rattrape tous ses tours d’un coup, puis la rotation reprend', () => {
    let s = startTurn();
    s = quizReducer(s, { type: 'TOGGLE_STANDBY', playerId: 'p2' });
    s = next(s); // Q2 p3, owed p2=1
    s = next(s); // Q3 p1
    s = next(s); // Q4 p3, owed p2=2
    s = quizReducer(s, { type: 'TOGGLE_STANDBY', playerId: 'p2' }); // p2 revient
    s = next(s); // Q5 rattrapage p2
    expect(s.activePlayerId).toBe('p2');
    expect(s.activeCatchUp).toBe(true);
    s = next(s); // Q6 rattrapage p2
    expect(s.activePlayerId).toBe('p2');
    expect(s.activeCatchUp).toBe(true);
    s = next(s); // Q7 rotation normale
    expect(s.activePlayerId).toBe('p1');
    expect(s.activeCatchUp).toBe(false);
    expect(s.owed.p2 ?? 0).toBe(0);
  });

  test('sur toute la partie, chacun obtient le même nombre de tours', () => {
    let s = startTurn();
    s = quizReducer(s, { type: 'TOGGLE_STANDBY', playerId: 'p2' });
    const seen: (string | null)[] = [s.activePlayerId];
    let back = false;
    while (s.phase !== 'finished') {
      s = next(s);
      if (!back && s.owed.p2 === 2) {
        s = quizReducer(s, { type: 'TOGGLE_STANDBY', playerId: 'p2' }); // p2 revient
        back = true;
      }
      if (s.phase === 'question') seen.push(s.activePlayerId);
    }
    const counts = { p1: 0, p2: 0, p3: 0 } as Record<string, number>;
    for (const p of seen) if (p) counts[p] = (counts[p] ?? 0) + 1;
    expect(counts).toEqual({ p1: 3, p2: 3, p3: 3 });
  });
});
