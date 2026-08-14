import type { StatAnswer, StatResult } from './stats';

/**
 * Hauts faits (badges) par joueur — logique pure et testable, calculée à partir
 * des mêmes données que les stats. Chaque haut fait est un seuil sur une mesure
 * cumulée (parties, victoires, bonnes réponses…). On additionne sur toute la vie
 * du joueur (pas de filtre de période) : un badge, une fois gagné, reste acquis.
 */

export interface AchievementDef {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  target: number;
}

export interface AchievementProgress {
  def: AchievementDef;
  /** Progression bornée à la cible (pour une barre) : min(mesure, cible). */
  current: number;
  target: number;
  done: boolean;
}

interface PlayerAgg {
  games: number;
  wins: number;
  winsByGame: Record<string, number>;
  questions: number;
  correct: number;
  themes: Set<string>;
  sipsDrunk: number;
  sipsGiven: number;
  fastCorrect: number;
}

/** Une bonne réponse « éclair » : correcte en moins de 3 secondes. */
const FAST_MS = 3000;

type Metric = (a: PlayerAgg) => number;

const ACHIEVEMENTS: (AchievementDef & { metric: Metric })[] = [
  { id: 'first-game', emoji: '🎉', title: 'Première soirée', desc: 'Jouer ta première partie', target: 1, metric: (a) => a.games },
  { id: 'regular', emoji: '🔥', title: 'Habitué', desc: 'Jouer 10 parties', target: 10, metric: (a) => a.games },
  { id: 'veteran', emoji: '🎖️', title: 'Vétéran', desc: 'Jouer 50 parties', target: 50, metric: (a) => a.games },
  { id: 'first-win', emoji: '🏆', title: 'Première victoire', desc: 'Gagner une partie', target: 1, metric: (a) => a.wins },
  { id: 'champion', emoji: '👑', title: 'Champion', desc: 'Gagner 10 parties', target: 10, metric: (a) => a.wins },
  { id: 'curious', emoji: '🧠', title: 'Curieux', desc: 'Répondre à 50 questions', target: 50, metric: (a) => a.questions },
  { id: 'scholar', emoji: '📚', title: 'Érudit', desc: 'Trouver 300 bonnes réponses', target: 300, metric: (a) => a.correct },
  { id: 'polyglot', emoji: '🌍', title: 'Touche-à-tout', desc: 'Répondre dans 8 thèmes différents', target: 8, metric: (a) => a.themes.size },
  { id: 'lightning', emoji: '⚡', title: 'Éclair', desc: 'Une bonne réponse en moins de 3 s', target: 1, metric: (a) => a.fastCorrect },
  { id: 'bombe', emoji: '💣', title: 'Démineur', desc: 'Gagner une partie de Bombe', target: 1, metric: (a) => a.winsByGame.bombe ?? 0 },
  { id: 'duel', emoji: '⚔️', title: 'Duelliste', desc: 'Gagner un Duel', target: 1, metric: (a) => a.winsByGame.duel ?? 0 },
  { id: 'ultimate', emoji: '🥊', title: 'Maître ultime', desc: 'Gagner un Duel Ultime', target: 1, metric: (a) => a.winsByGame.duelultime ?? 0 },
  { id: 'drinker', emoji: '🍺', title: 'Bonne descente', desc: 'Boire 30 gorgées en tout', target: 30, metric: (a) => a.sipsDrunk },
  { id: 'generous', emoji: '🤙', title: 'Généreux', desc: 'Distribuer 20 gorgées', target: 20, metric: (a) => a.sipsGiven },
];

function emptyAgg(): PlayerAgg {
  return { games: 0, wins: 0, winsByGame: {}, questions: 0, correct: 0, themes: new Set(), sipsDrunk: 0, sipsGiven: 0, fastCorrect: 0 };
}

function aggregate(results: readonly StatResult[], answers: readonly StatAnswer[]): Map<string, PlayerAgg> {
  const map = new Map<string, PlayerAgg>();
  const get = (id: string): PlayerAgg => {
    let a = map.get(id);
    if (!a) {
      a = emptyAgg();
      map.set(id, a);
    }
    return a;
  };

  for (const r of results) {
    // On ignore les lignes d'ÉQUIPE (playerId = id d'équipe) : les hauts faits
    // sont personnels. Les vraies réponses (answers) restent comptées.
    if ((r.details as { team?: boolean } | undefined)?.team) continue;
    const a = get(r.playerId);
    a.games += 1;
    a.sipsDrunk += r.sipsDrunk;
    a.sipsGiven += r.sipsGiven;
    if (r.rank === 1) {
      a.wins += 1;
      a.winsByGame[r.gameId] = (a.winsByGame[r.gameId] ?? 0) + 1;
    }
  }

  for (const ans of answers) {
    const a = get(ans.playerId);
    a.questions += 1;
    if (ans.correct) {
      a.correct += 1;
      if (ans.timeMs != null && ans.timeMs < FAST_MS) a.fastCorrect += 1;
    }
    a.themes.add(ans.theme);
  }

  return map;
}

/** Progression de tous les hauts faits, par joueur. */
export function playerAchievements(
  results: readonly StatResult[],
  answers: readonly StatAnswer[],
): Record<string, AchievementProgress[]> {
  const agg = aggregate(results, answers);
  const out: Record<string, AchievementProgress[]> = {};
  for (const [pid, a] of agg) {
    out[pid] = ACHIEVEMENTS.map((d) => {
      const value = d.metric(a);
      return {
        def: { id: d.id, emoji: d.emoji, title: d.title, desc: d.desc, target: d.target },
        current: Math.min(value, d.target),
        target: d.target,
        done: value >= d.target,
      };
    });
  }
  return out;
}

/** Résumé compact pour un joueur : nombre de badges gagnés / total. */
export function achievementSummary(list: readonly AchievementProgress[] | undefined): { earned: number; total: number } {
  const total = ACHIEVEMENTS.length;
  if (!list) return { earned: 0, total };
  return { earned: list.filter((a) => a.done).length, total };
}
