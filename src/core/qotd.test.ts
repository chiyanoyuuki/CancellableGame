import { allAnsweredToday, hasAnswered, qotdBoard, type QotdRecord, recordQotd } from './qotd';

describe('qotd', () => {
  const base: QotdRecord = {
    '2026-08-30': { p1: true, p2: false },
    '2026-08-31': { p1: true },
  };

  it('recordQotd ajoute sans muter l\'original', () => {
    const next = recordQotd(base, '2026-08-31', 'p2', true);
    expect(next['2026-08-31']).toEqual({ p1: true, p2: true });
    expect(base['2026-08-31']).toEqual({ p1: true }); // original intact
  });

  it('hasAnswered détecte une réponse existante', () => {
    expect(hasAnswered(base, '2026-08-31', 'p1')).toBe(true);
    expect(hasAnswered(base, '2026-08-31', 'p2')).toBe(false);
  });

  it('allAnsweredToday vrai seulement si tous ont répondu', () => {
    expect(allAnsweredToday(base, ['p1'], '2026-08-31')).toBe(true);
    expect(allAnsweredToday(base, ['p1', 'p2'], '2026-08-31')).toBe(false);
    expect(allAnsweredToday(base, [], '2026-08-31')).toBe(false);
  });

  it('qotdBoard calcule le jour et les totaux, trié par bonnes réponses', () => {
    const board = qotdBoard(base, ['p1', 'p2'], '2026-08-31');
    expect(board[0]!.playerId).toBe('p1'); // 2 bonnes
    expect(board[0]!.totalCorrect).toBe(2);
    expect(board[0]!.answeredToday).toBe(true);
    expect(board[0]!.correctToday).toBe(true);
    const p2 = board.find((r) => r.playerId === 'p2')!;
    expect(p2.totalCorrect).toBe(0);
    expect(p2.totalAnswered).toBe(1);
    expect(p2.answeredToday).toBe(false);
  });
});
