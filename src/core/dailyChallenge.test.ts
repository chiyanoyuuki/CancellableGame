import type { Question } from './models';
import {
  buildDaily,
  completeDay,
  dateKey,
  previousDateKey,
  liveStreak,
  isDoneToday,
  seedFromString,
  randomChallengeCode,
  normalizeCode,
  EMPTY_STREAK,
  DAILY_COUNT,
} from './dailyChallenge';
import { mulberry32 } from './rng';

const Q = (id: string, answer: string, distractors: string[], extra: Partial<Question> = {}): Question => ({
  id,
  theme: 'culture',
  difficulty: 2,
  text: `Q ${id}`,
  answer,
  distractors,
  ...extra,
});

const bank: Question[] = Array.from({ length: 40 }, (_, i) => Q(`q${i}`, `a${i}`, [`x${i}0`, `x${i}1`, `x${i}2`]));

describe('dailyChallenge', () => {
  test('dateKey / previousDateKey', () => {
    expect(dateKey(new Date('2026-08-31T10:00:00'))).toBe('2026-08-31');
    expect(previousDateKey(new Date('2026-08-31T10:00:00'))).toBe('2026-08-30');
    expect(seedFromString('2026-08-31')).toBe(seedFromString('2026-08-31'));
    expect(seedFromString('2026-08-31')).not.toBe(seedFromString('2026-09-01'));
  });

  test('buildDaily est déterministe par date et change de jour en jour', () => {
    const a = buildDaily(bank, '2026-08-31');
    const b = buildDaily(bank, '2026-08-31');
    const c = buildDaily(bank, '2026-09-01');
    expect(a.map((d) => d.question.id)).toEqual(b.map((d) => d.question.id));
    expect(a.map((d) => d.question.id)).not.toEqual(c.map((d) => d.question.id));
    expect(a).toHaveLength(DAILY_COUNT);
    // options = réponse + 3 distracteurs, mélangées, contiennent la bonne réponse
    for (const dq of a) {
      expect(dq.options).toHaveLength(4);
      expect(dq.options).toContain(dq.question.answer);
    }
  });

  test('buildDaily exclut média et QCM mal formés', () => {
    const pool: Question[] = [
      Q('ok', 'a', ['b', 'c', 'd']),
      Q('media', 'a', ['b', 'c', 'd'], { media: { type: 'image', uri: 'x' } }),
      Q('short', 'a', ['b', 'c']),
      Q('dup', 'a', ['a', 'c', 'd']),
    ];
    const ids = buildDaily(pool, 'k', 10).map((d) => d.question.id);
    expect(ids).toEqual(['ok']);
  });

  test('série : complétion, incrément, reset, idempotence', () => {
    let s = EMPTY_STREAK;
    s = completeDay(s, '2026-08-31', '2026-08-30');
    expect(s).toEqual({ lastDate: '2026-08-31', current: 1, best: 1 });
    // rejouer le même jour ne change rien
    expect(completeDay(s, '2026-08-31', '2026-08-30')).toBe(s);
    // jour suivant -> +1
    s = completeDay(s, '2026-09-01', '2026-08-31');
    expect(s).toEqual({ lastDate: '2026-09-01', current: 2, best: 2 });
    // saut d'un jour -> reset à 1, mais best conservé
    s = completeDay(s, '2026-09-05', '2026-09-04');
    expect(s).toEqual({ lastDate: '2026-09-05', current: 1, best: 2 });
  });

  test('code de défi : format, alphabet non ambigu, déterminisme, normalisation', () => {
    const code = randomChallengeCode(mulberry32(42));
    expect(code).toHaveLength(5);
    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/);
    expect(randomChallengeCode(mulberry32(42))).toBe(code); // déterministe à graine égale
    expect(normalizeCode('  ab-2 z ')).toBe('AB2Z');
    // même code -> même défi
    const pool = bank;
    expect(buildDaily(pool, code).map((d) => d.question.id)).toEqual(
      buildDaily(pool, code).map((d) => d.question.id),
    );
  });

  test('isDoneToday / liveStreak', () => {
    const s = { lastDate: '2026-08-31', current: 3, best: 5 };
    expect(isDoneToday(s, '2026-08-31')).toBe(true);
    expect(isDoneToday(s, '2026-09-01')).toBe(false);
    // encore vivante hier
    expect(liveStreak(s, '2026-09-01', '2026-08-31')).toBe(3);
    // rompue (ni aujourd'hui ni hier)
    expect(liveStreak(s, '2026-09-03', '2026-09-02')).toBe(0);
  });
});
