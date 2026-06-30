import type { Difficulty, Player, Question, QuizConfig, Theme } from './models';
import {
  availableHints,
  createQuizState,
  currentQuestion,
  getRanking,
  quizReducer,
  type QuizState,
  toSessionResult,
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
    answerFormat: 'choices',
    hintsEnabled: true,
    drinksEnabled: false, // keep CONTINUE deterministic (no random challenge)
    drinkIntensity: 'normal',
    fastestTimeLimitMs: 20000,
    ...overrides,
  };
}

function start(overrides: Partial<QuizConfig> = {}): QuizState {
  return createQuizState({ config: config(overrides), players, questions, seed: 12345 });
}

describe('createQuizState', () => {
  test('starts on the first question with QCM options', () => {
    const s = start();
    expect(s.phase).toBe('question');
    expect(s.index).toBe(0);
    expect(s.currentOptions).toHaveLength(4);
    expect(s.currentOptions).toContain('bonne');
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
    expect(s.currentOptions).toHaveLength(4);
  });

  test('open answer format has no options', () => {
    const s = start({ answerFormat: 'open' });
    expect(s.currentOptions).toHaveLength(0);
  });

  test('empty question list ends immediately', () => {
    const s = createQuizState({ config: config(), players, questions: [], seed: 1 });
    expect(s.phase).toBe('finished');
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

  test('disabling hints exposes none', () => {
    const s = start({ hintsEnabled: false });
    expect(availableHints(s)).toBe(0);
    const after = quizReducer(s, { type: 'REVEAL_HINT' });
    expect(after.hintsRevealed).toBe(0);
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

  test('a wrong answer scores nothing and counts as wrong', () => {
    let s = start();
    s = quizReducer(s, { type: 'SUBMIT', playerId: 'p1', correct: false });
    expect(s.scores.p1?.points).toBe(0);
    expect(s.scores.p1?.wrong).toBe(1);
  });

  test('CONTINUE from reveal advances to the next question', () => {
    let s = start();
    s = quizReducer(s, { type: 'SUBMIT', playerId: 'p1', correct: true });
    s = quizReducer(s, { type: 'CONTINUE' });
    expect(s.phase).toBe('question');
    expect(s.index).toBe(1);
    expect(currentQuestion(s)?.id).toBe('q2');
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
    expect(result.players).toHaveLength(3);
    expect(result.players[0]?.rank).toBe(1);
    expect(result.players[0]?.playerId).toBe('p1');
    expect(result.events).toHaveLength(3);
    expect(result.startedAt).toBe(1000);
    expect(result.endedAt).toBe(2000);
  });
});
