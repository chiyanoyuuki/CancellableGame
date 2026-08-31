/**
 * « Question du jour » — logique pure et testable (aucun import natif).
 *
 * Une seule question par jour (déterministe), à laquelle chaque joueur du
 * téléphone répond une fois. On garde un petit registre local (par date, par
 * joueur : bonne réponse ou non) pour afficher un mini-classement entre amis et
 * des totaux à vie. Aucun serveur : tout vit dans la base locale.
 */

/** Registre : pour chaque jour (clé « AAAA-MM-JJ »), la justesse par joueur. */
export type QotdRecord = Record<string, Record<string, boolean>>;

export interface QotdBoardRow {
  playerId: string;
  answeredToday: boolean;
  correctToday: boolean;
  totalCorrect: number;
  totalAnswered: number;
}

/** Enregistre (immuablement) la réponse d'un joueur pour un jour donné. */
export function recordQotd(data: QotdRecord, day: string, playerId: string, correct: boolean): QotdRecord {
  const dayMap = { ...(data[day] ?? {}), [playerId]: correct };
  return { ...data, [day]: dayMap };
}

/** Vrai si ce joueur a déjà répondu aujourd'hui. */
export function hasAnswered(data: QotdRecord, day: string, playerId: string): boolean {
  return data[day]?.[playerId] !== undefined;
}

/** Vrai si tous les joueurs fournis ont répondu aujourd'hui. */
export function allAnsweredToday(data: QotdRecord, playerIds: readonly string[], day: string): boolean {
  if (playerIds.length === 0) return false;
  return playerIds.every((id) => hasAnswered(data, day, id));
}

/** Mini-classement : état du jour + totaux à vie, trié par bonnes réponses. */
export function qotdBoard(data: QotdRecord, playerIds: readonly string[], day: string): QotdBoardRow[] {
  const rows = playerIds.map((playerId) => {
    let totalCorrect = 0;
    let totalAnswered = 0;
    for (const dayMap of Object.values(data)) {
      const v = dayMap[playerId];
      if (v === undefined) continue;
      totalAnswered += 1;
      if (v) totalCorrect += 1;
    }
    const todayVal = data[day]?.[playerId];
    return {
      playerId,
      answeredToday: todayVal !== undefined,
      correctToday: todayVal === true,
      totalCorrect,
      totalAnswered,
    };
  });
  rows.sort((a, b) => b.totalCorrect - a.totalCorrect || b.totalAnswered - a.totalAnswered);
  return rows;
}
