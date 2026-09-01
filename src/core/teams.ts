import { mulberry32, shuffle } from './rng';

/**
 * Répartition d'équipes équilibrées — pur et testable. On mélange les joueurs
 * puis on distribue en tourniquet : les équipes diffèrent d'un joueur au plus.
 */
export function makeTeams(playerIds: readonly string[], teamCount: number, seed: number): string[][] {
  if (playerIds.length === 0) return [];
  const n = Math.max(1, Math.min(Math.floor(teamCount), playerIds.length));
  const shuffled = shuffle([...playerIds], mulberry32(seed >>> 0));
  const teams: string[][] = Array.from({ length: n }, () => []);
  shuffled.forEach((id, i) => teams[i % n]!.push(id));
  return teams;
}
