/**
 * Statistics aggregation.
 *
 * These functions operate on plain rows (the shapes the DB hands back), never
 * on the database itself, so they are pure and unit tested. The persistence
 * layer loads rows, these functions crunch them, and the UI renders them.
 */

import { t } from '../lib/i18n';
import type { Player } from './models';

export type Period = 'today' | 'week' | 'month' | 'year' | 'all';

export interface StatSession {
  id: number;
  gameId: string;
  mode: string;
  startedAt: number;
  endedAt: number;
  playerCount: number;
}

export interface StatResult {
  sessionId: number;
  gameId: string;
  startedAt: number;
  playerId: string;
  points: number;
  rank: number;
  sipsDrunk: number;
  sipsGiven: number;
  /** Free-form per-result data. For a team result: { team, name, emoji, color, members }. */
  details?: Record<string, unknown>;
}

export interface StatAnswer {
  gameId: string;
  startedAt: number;
  playerId: string;
  theme: string;
  difficulty: number;
  correct: boolean;
  hintsUsed: number;
  timeMs: number | null;
  points: number;
}

// ---------------------------------------------------------------------------
// Period filtering (local time)
// ---------------------------------------------------------------------------

export function periodStart(period: Period, ref: number = Date.now()): number {
  const d = new Date(ref);
  switch (period) {
    case 'today':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    case 'week': {
      // Début de la semaine courante (lundi), heure locale.
      const daysSinceMonday = (d.getDay() + 6) % 7;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysSinceMonday).getTime();
    }
    case 'month':
      return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    case 'year':
      return new Date(d.getFullYear(), 0, 1).getTime();
    case 'all':
      return 0;
  }
}

export function periodEnd(period: Period, ref: number = Date.now()): number {
  const d = new Date(ref);
  switch (period) {
    case 'today':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    case 'week': {
      const daysSinceMonday = (d.getDay() + 6) % 7;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysSinceMonday + 7).getTime();
    }
    case 'month':
      return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    case 'year':
      return new Date(d.getFullYear() + 1, 0, 1).getTime();
    case 'all':
      return Number.POSITIVE_INFINITY;
  }
}

/** Whether a timestamp falls inside the current period relative to `ref`. */
export function inPeriod(ts: number, period: Period, ref: number = Date.now()): boolean {
  return ts >= periodStart(period, ref) && ts < periodEnd(period, ref);
}

export interface StatFilter {
  period?: Period;
  gameId?: string;
  ref?: number;
}

function matchResult(r: StatResult, f: StatFilter): boolean {
  if (f.gameId && r.gameId !== f.gameId) return false;
  if (f.period && f.period !== 'all' && !inPeriod(r.startedAt, f.period, f.ref)) return false;
  return true;
}

function matchSession(s: StatSession, f: StatFilter): boolean {
  if (f.gameId && s.gameId !== f.gameId) return false;
  if (f.period && f.period !== 'all' && !inPeriod(s.startedAt, f.period, f.ref)) return false;
  return true;
}

function matchAnswer(a: StatAnswer, f: StatFilter): boolean {
  if (f.gameId && a.gameId !== f.gameId) return false;
  if (f.period && f.period !== 'all' && !inPeriod(a.startedAt, f.period, f.ref)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Leaderboard / per-player totals
// ---------------------------------------------------------------------------

export interface PlayerTotals {
  playerId: string;
  points: number;
  games: number;
  wins: number;
  podiums: number;
  sipsDrunk: number;
  sipsGiven: number;
  bestPoints: number;
  avgRank: number;
}

export function playerTotals(results: readonly StatResult[], filter: StatFilter = {}): PlayerTotals[] {
  const acc = new Map<string, PlayerTotals & { rankSum: number }>();

  for (const r of results) {
    if (!matchResult(r, filter)) continue;
    let t = acc.get(r.playerId);
    if (!t) {
      t = {
        playerId: r.playerId,
        points: 0,
        games: 0,
        wins: 0,
        podiums: 0,
        sipsDrunk: 0,
        sipsGiven: 0,
        bestPoints: 0,
        avgRank: 0,
        rankSum: 0,
      };
      acc.set(r.playerId, t);
    }
    t.points += r.points;
    t.games += 1;
    if (r.rank === 1) t.wins += 1;
    if (r.rank <= 3) t.podiums += 1;
    t.sipsDrunk += r.sipsDrunk;
    t.sipsGiven += r.sipsGiven;
    t.bestPoints = Math.max(t.bestPoints, r.points);
    t.rankSum += r.rank;
  }

  const out: PlayerTotals[] = [];
  for (const t of acc.values()) {
    const { rankSum, ...rest } = t;
    out.push({ ...rest, avgRank: t.games > 0 ? rankSum / t.games : 0 });
  }
  out.sort((a, b) => b.points - a.points || b.wins - a.wins);
  return out;
}

// ---------------------------------------------------------------------------
// Dernière partie jouée par joueur
// ---------------------------------------------------------------------------

/**
 * Horodatage (startedAt) de la dernière partie jouée par chaque joueur, d'après
 * les lignes de résultats. Un joueur sans résultat est absent de l'objet.
 */
export function lastPlayedByPlayer(results: readonly StatResult[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of results) {
    const prev = out[r.playerId];
    if (prev === undefined || r.startedAt > prev) out[r.playerId] = r.startedAt;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Time series (for charts) — buckets by day/month/year
// ---------------------------------------------------------------------------

export type Granularity = 'day' | 'month' | 'year';

function bucketKey(ts: number, g: Granularity): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (g === 'year') return `${y}`;
  if (g === 'month') return `${y}-${m}`;
  return `${y}-${m}-${day}`;
}

export interface Bucket {
  key: string;
  games: number;
  points: number;
  sips: number;
}

export function timeSeries(
  sessions: readonly StatSession[],
  results: readonly StatResult[],
  granularity: Granularity,
  filter: StatFilter = {},
): Bucket[] {
  const map = new Map<string, Bucket>();
  const ensure = (key: string): Bucket => {
    let b = map.get(key);
    if (!b) {
      b = { key, games: 0, points: 0, sips: 0 };
      map.set(key, b);
    }
    return b;
  };

  for (const s of sessions) {
    if (!matchSession(s, filter)) continue;
    ensure(bucketKey(s.startedAt, granularity)).games += 1;
  }
  for (const r of results) {
    if (!matchResult(r, filter)) continue;
    const b = ensure(bucketKey(r.startedAt, granularity));
    b.points += r.points;
    b.sips += r.sipsDrunk;
  }

  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

// ---------------------------------------------------------------------------
// Theme accuracy (quiz-specific, from answer events)
// ---------------------------------------------------------------------------

export interface ThemeAccuracy {
  theme: string;
  total: number;
  correct: number;
  accuracy: number; // 0..1
}

export function themeAccuracy(
  answers: readonly StatAnswer[],
  playerId?: string,
  filter: StatFilter = {},
): ThemeAccuracy[] {
  const map = new Map<string, { total: number; correct: number }>();
  for (const a of answers) {
    if (playerId && a.playerId !== playerId) continue;
    if (!matchAnswer(a, filter)) continue;
    let t = map.get(a.theme);
    if (!t) {
      t = { total: 0, correct: 0 };
      map.set(a.theme, t);
    }
    t.total += 1;
    if (a.correct) t.correct += 1;
  }
  const out: ThemeAccuracy[] = [];
  for (const [theme, t] of map) {
    out.push({ theme, total: t.total, correct: t.correct, accuracy: t.total > 0 ? t.correct / t.total : 0 });
  }
  out.sort((a, b) => b.accuracy - a.accuracy);
  return out;
}

// ---------------------------------------------------------------------------
// Fun superlatives — the soul of the stats screen
// ---------------------------------------------------------------------------

export interface Superlative {
  id: string;
  title: string;
  emoji: string;
  description: string;
  playerId: string | null;
  value: string;
}

interface AnswerAgg {
  answers: number;
  correct: number;
  wrong: number;
  hints: number;
  timeSum: number;
  timeCount: number;
}

/**
 * Award funny titles. Combines generic results (for sips/wins) with quiz answer
 * events (for accuracy/speed). Players with no eligible data are skipped.
 */
export function superlatives(
  players: readonly Player[],
  results: readonly StatResult[],
  answers: readonly StatAnswer[],
  filter: StatFilter = {},
): Superlative[] {
  const totals = playerTotals(results, filter);
  const totalsById = new Map(totals.map((t) => [t.playerId, t]));

  const ans = new Map<string, AnswerAgg>();
  for (const a of answers) {
    if (!matchAnswer(a, filter)) continue;
    let g = ans.get(a.playerId);
    if (!g) {
      g = { answers: 0, correct: 0, wrong: 0, hints: 0, timeSum: 0, timeCount: 0 };
      ans.set(a.playerId, g);
    }
    g.answers += 1;
    if (a.correct) g.correct += 1;
    else g.wrong += 1;
    g.hints += a.hintsUsed;
    if (a.timeMs != null) {
      g.timeSum += a.timeMs;
      g.timeCount += 1;
    }
  }

  const nameOf = new Map(players.map((p) => [p.id, p.name]));
  const out: Superlative[] = [];

  // Les titres, descriptions et valeurs sont traduits à l'exécution (via t()) :
  // la fonction est appelée au rendu, donc réactive au changement de langue.
  const award = (
    id: string,
    title: string,
    emoji: string,
    description: string,
    playerId: string | null,
    value: string,
  ) => out.push({ id, title: t(title), emoji, description: t(description), playerId, value });

  // Sips drunk
  const sponge = [...totalsById.values()].filter((t) => t.sipsDrunk > 0).sort((a, b) => b.sipsDrunk - a.sipsDrunk)[0];
  if (sponge) award('sponge', "L'éponge", '🧽', 'A bu le plus de gorgées', sponge.playerId, t('{n} gorgées', { n: sponge.sipsDrunk }));

  // Sips given
  const barman = [...totalsById.values()].filter((t) => t.sipsGiven > 0).sort((a, b) => b.sipsGiven - a.sipsGiven)[0];
  if (barman) award('barman', 'Le barman', '🍷', 'A distribué le plus de gorgées', barman.playerId, t('{n} gorgées', { n: barman.sipsGiven }));

  // Most wins
  const boss = totals.filter((t) => t.wins > 0).sort((a, b) => b.wins - a.wins)[0];
  if (boss) award('boss', 'Le boss', '🏆', 'A gagné le plus de parties', boss.playerId, t('{n} victoires', { n: boss.wins }));

  // Best accuracy (min 5 answers)
  const brain = [...ans.entries()]
    .filter(([, g]) => g.answers >= 5)
    .map(([id, g]) => ({ id, acc: g.correct / g.answers }))
    .sort((a, b) => b.acc - a.acc)[0];
  if (brain) award('brain', 'Le cerveau', '🧠', 'Meilleur taux de bonnes réponses', brain.id, t('{n} %', { n: Math.round(brain.acc * 100) }));

  // Most wrong answers
  const clown = [...ans.entries()].filter(([, g]) => g.wrong > 0).sort((a, b) => b[1].wrong - a[1].wrong)[0];
  if (clown) award('clown', 'Le boulet', '🤡', 'A donné le plus de mauvaises réponses', clown[0], t('{n} ratés', { n: clown[1].wrong }));

  // Fastest average (min 3 timed answers)
  const flash = [...ans.entries()]
    .filter(([, g]) => g.timeCount >= 3)
    .map(([id, g]) => ({ id, avg: g.timeSum / g.timeCount }))
    .sort((a, b) => a.avg - b.avg)[0];
  if (flash) award('flash', "L'éclair", '⚡', 'Réponse la plus rapide en moyenne', flash.id, t('{n} s', { n: (flash.avg / 1000).toFixed(1) }));

  // Most hints used
  const cheater = [...ans.entries()].filter(([, g]) => g.hints > 0).sort((a, b) => b[1].hints - a[1].hints)[0];
  if (cheater) award('hints', "L'assisté", '👀', "A utilisé le plus d'indices", cheater[0], t('{n} indices', { n: cheater[1].hints }));

  // Most games played
  const pillar = totals.filter((t) => t.games > 0).sort((a, b) => b.games - a.games)[0];
  if (pillar) award('pilier', 'Le pilier', '🏛️', 'A joué le plus de parties', pillar.playerId, t('{n} parties', { n: pillar.games }));

  // Best single-game score
  const comet = totals.filter((t) => t.bestPoints > 0).sort((a, b) => b.bestPoints - a.bestPoints)[0];
  if (comet) award('comete', 'La comète', '☄️', 'Meilleur score en une partie', comet.playerId, t('{n} pts', { n: comet.bestPoints }));

  // Best average rank (min 3 games)
  const strat = totals.filter((t) => t.games >= 3).sort((a, b) => a.avgRank - b.avgRank)[0];
  if (strat) award('stratege', 'Le stratège', '♟️', 'Meilleur classement moyen', strat.playerId, t('rang moyen {n}', { n: strat.avgRank.toFixed(1) }));

  // Most answers overall
  const marathon = [...ans.entries()].filter(([, g]) => g.answers > 0).sort((a, b) => b[1].answers - a[1].answers)[0];
  if (marathon) award('marathonien', 'Le marathonien', '🏃', 'A répondu au plus de questions', marathon[0], t('{n} questions', { n: marathon[1].answers }));

  // Most correct answers overall
  const encyclo = [...ans.entries()].filter(([, g]) => g.correct > 0).sort((a, b) => b[1].correct - a[1].correct)[0];
  if (encyclo) award('encyclopedie', "L'encyclopédie", '📚', 'Le plus de bonnes réponses', encyclo[0], t('{n} bonnes', { n: encyclo[1].correct }));

  // Most podium finishes (top 3)
  const podium = totals.filter((t) => t.podiums > 0).sort((a, b) => b.podiums - a.podiums)[0];
  if (podium) award('podium', 'Le podium ambulant', '🏅', 'Le plus de podiums (top 3)', podium.playerId, t('{n} podiums', { n: podium.podiums }));

  // Fewest sips among regulars (min 3 games)
  const sober = totals.filter((t) => t.games >= 3).sort((a, b) => a.sipsDrunk - b.sipsDrunk)[0];
  if (sober) award('sobre', 'Le sobre', '🚱', 'A le moins bu (parmi les habitués)', sober.playerId, t('{n} gorgées', { n: sober.sipsDrunk }));

  // Resolve names for display convenience downstream (kept in description).
  for (const s of out) {
    if (s.playerId && nameOf.has(s.playerId)) {
      s.description = `${nameOf.get(s.playerId)} — ${s.description}`;
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Group fun facts
// ---------------------------------------------------------------------------

export interface FunFacts {
  totalGames: number;
  totalSips: number;
  totalQuestions: number;
  totalPoints: number;
  favouriteTheme: string | null;
}

export function funFacts(
  sessions: readonly StatSession[],
  results: readonly StatResult[],
  answers: readonly StatAnswer[],
  filter: StatFilter = {},
): FunFacts {
  let totalGames = 0;
  for (const s of sessions) if (matchSession(s, filter)) totalGames += 1;

  let totalSips = 0;
  let totalPoints = 0;
  for (const r of results) {
    if (!matchResult(r, filter)) continue;
    totalSips += r.sipsDrunk;
    totalPoints += r.points;
  }

  const themeCount = new Map<string, number>();
  let totalQuestions = 0;
  for (const a of answers) {
    if (!matchAnswer(a, filter)) continue;
    totalQuestions += 1;
    themeCount.set(a.theme, (themeCount.get(a.theme) ?? 0) + 1);
  }
  let favouriteTheme: string | null = null;
  let best = -1;
  for (const [theme, c] of themeCount) {
    if (c > best) {
      best = c;
      favouriteTheme = theme;
    }
  }

  return { totalGames, totalSips, totalQuestions, totalPoints, favouriteTheme };
}

// ---------------------------------------------------------------------------
// Titres détenus par joueur (pour l'affichage sous le pseudo)
// ---------------------------------------------------------------------------

/** Ordre de prestige : le premier titre détenu par un joueur est mis en avant. */
const TITLE_PRIORITY: string[] = [
  'boss', 'brain', 'comete', 'stratege', 'pilier', 'encyclopedie', 'marathonien',
  'flash', 'podium', 'sponge', 'barman', 'sobre', 'clown', 'hints',
];

/**
 * Regroupe les titres (superlatifs) par joueur qui les détient, triés du plus
 * prestigieux au moins. Sert à afficher un titre sous le pseudo d'un joueur.
 */
export function titlesByPlayer(
  players: readonly Player[],
  results: readonly StatResult[],
  answers: readonly StatAnswer[],
  filter: StatFilter = {},
): Record<string, Superlative[]> {
  const list = superlatives(players, results, answers, filter);
  const rank = (id: string) => {
    const i = TITLE_PRIORITY.indexOf(id);
    return i < 0 ? TITLE_PRIORITY.length : i;
  };
  const out: Record<string, Superlative[]> = {};
  for (const s of list) {
    if (!s.playerId) continue;
    (out[s.playerId] ??= []).push(s);
  }
  for (const id of Object.keys(out)) {
    out[id]!.sort((a, b) => rank(a.id) - rank(b.id));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Face-à-face (rivalités) & vitesse de réponse
// ---------------------------------------------------------------------------

export interface HeadToHead {
  /** Sessions où les DEUX joueurs ont joué. */
  meetings: number;
  /** Fois où A a fini devant B (rang plus petit). */
  aWins: number;
  bWins: number;
  ties: number;
}

/**
 * Bilan tête-à-tête entre deux joueurs, à partir de leur rang dans les sessions
 * où ils ont joué tous les deux. Un rang plus petit = meilleure place.
 */
export function headToHead(results: readonly StatResult[], aId: string, bId: string): HeadToHead {
  const bySession = new Map<number, Record<string, number>>();
  for (const r of results) {
    if (r.playerId !== aId && r.playerId !== bId) continue;
    let m = bySession.get(r.sessionId);
    if (!m) {
      m = {};
      bySession.set(r.sessionId, m);
    }
    m[r.playerId] = r.rank;
  }
  let meetings = 0;
  let aWins = 0;
  let bWins = 0;
  let ties = 0;
  for (const m of bySession.values()) {
    const ra = m[aId];
    const rb = m[bId];
    if (ra === undefined || rb === undefined) continue;
    meetings += 1;
    if (ra < rb) aWins += 1;
    else if (rb < ra) bWins += 1;
    else ties += 1;
  }
  return { meetings, aWins, bWins, ties };
}

// ---------------------------------------------------------------------------
// Saisons (classement mensuel qui repart à zéro)
// ---------------------------------------------------------------------------

/** Clé de saison « AAAA-MM » (mois sur 2 chiffres) pour un instant donné. */
export function seasonKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Instant de référence (milieu du mois) pour une clé de saison. */
export function seasonRef(key: string): number {
  const [y, m] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, 15, 12).getTime();
}

/** Clés de saison ayant des données, de la plus récente à la plus ancienne. */
export function seasonKeys(results: readonly StatResult[]): string[] {
  const set = new Set<string>();
  for (const r of results) set.add(seasonKey(r.startedAt));
  return [...set].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
}

export interface SeasonChampion {
  key: string;
  playerId: string | null;
  wins: number;
  points: number;
}

/** Champion d'une saison : plus de victoires, puis plus de points, ce mois-là. */
export function seasonChampion(results: readonly StatResult[], key: string): SeasonChampion {
  const totals = playerTotals(results, { period: 'month', ref: seasonRef(key) });
  let best: PlayerTotals | null = null;
  for (const tt of totals) {
    if (!best || tt.wins > best.wins || (tt.wins === best.wins && tt.points > best.points)) best = tt;
  }
  return { key, playerId: best?.playerId ?? null, wins: best?.wins ?? 0, points: best?.points ?? 0 };
}

export interface AnswerSpeed {
  avgMs: number;
  bestMs: number;
  count: number;
}

/** Vitesse de réponse (moyenne, meilleur temps) d'un joueur, sur les réponses chronométrées. */
export function answerSpeed(answers: readonly StatAnswer[], playerId?: string): AnswerSpeed {
  let sum = 0;
  let count = 0;
  let best = Infinity;
  for (const a of answers) {
    if (playerId && a.playerId !== playerId) continue;
    if (a.timeMs == null) continue;
    sum += a.timeMs;
    count += 1;
    if (a.timeMs < best) best = a.timeMs;
  }
  return { avgMs: count > 0 ? sum / count : 0, bestMs: count > 0 ? best : 0, count };
}
