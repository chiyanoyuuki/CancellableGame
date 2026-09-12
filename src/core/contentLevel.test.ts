import { blendByCancelLevel, filterHot, type Leveled } from './contentLevel';
import type { CancelLevel, Question } from './models';
import { mulberry32 } from './rng';

const hot: (Leveled & { id: string })[] = [
  { id: 'a', lvl: 2 },
  { id: 'b', lvl: 2 },
  { id: 'c', lvl: 3 },
  { id: 'd', lvl: 4 },
];

describe('filterHot (contenu par niveaux actifs, indépendants)', () => {
  test('aucun niveau osé actif : rien', () => {
    expect(filterHot(hot, [1])).toEqual([]);
  });

  test('ne renvoie que les niveaux ACTIFS (pas cumulatif)', () => {
    const ids = (levels: CancelLevel[]) => filterHot(hot, levels).map((h) => h.id);
    expect(ids([2])).toEqual(['a', 'b']);
    expect(ids([2, 4])).toEqual(['a', 'b', 'd']); // 2 et 4, PAS 3
    expect(ids([4])).toEqual(['d']);
    expect(ids([2, 3, 4])).toEqual(['a', 'b', 'c', 'd']);
  });

  test('un banc vide reste vide', () => {
    expect(filterHot([], [4])).toEqual([]);
  });
});

describe('blendByCancelLevel (dosage ~70/10/10/10)', () => {
  const q = (id: string, lvl?: CancelLevel): Question => ({
    id, theme: 'culture', difficulty: 1, text: id, answer: id, distractors: ['b', 'c', 'd'],
    ...(lvl ? { cancelLevel: lvl } : {}),
  });
  const chill = Array.from({ length: 100 }, (_, i) => q(`c${i}`));
  const s2 = Array.from({ length: 10 }, (_, i) => q(`s2_${i}`, 2));
  const s3 = Array.from({ length: 10 }, (_, i) => q(`s3_${i}`, 3));
  const s4 = Array.from({ length: 10 }, (_, i) => q(`s4_${i}`, 4));
  const spicyShare = (arr: Question[]) => arr.filter((x) => (x.cancelLevel ?? 1) > 1).length / arr.length;

  test('pas de contenu osé : pool inchangé', () => {
    expect(blendByCancelLevel([...chill], mulberry32(1))).toHaveLength(100);
  });

  test('chill + 3 paliers : ~30 % de contenu osé, et tout l’osé conservé', () => {
    const out = blendByCancelLevel([...chill, ...s2, ...s3, ...s4], mulberry32(3));
    expect(spicyShare(out)).toBeGreaterThan(0.25);
    expect(spicyShare(out)).toBeLessThan(0.35);
    expect(out.filter((x) => (x.cancelLevel ?? 1) > 1)).toHaveLength(30);
  });

  test('chill + 1 palier : ~10 %', () => {
    const out = blendByCancelLevel([...chill, ...s2], mulberry32(2));
    expect(spicyShare(out)).toBeGreaterThan(0.06);
    expect(spicyShare(out)).toBeLessThan(0.16);
  });

  test('niveaux osés seuls (sans chill) : pool inchangé (aucun plafonnement)', () => {
    const out = blendByCancelLevel([...s2, ...s4], mulberry32(5));
    expect(out).toHaveLength(20);
  });
});
