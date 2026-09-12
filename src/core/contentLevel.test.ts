import { blendByCancelLevel, filterHot, type Leveled } from './contentLevel';
import type { CancelLevel, Question } from './models';
import { mulberry32 } from './rng';

const hot: (Leveled & { id: string })[] = [
  { id: 'a', lvl: 2 },
  { id: 'b', lvl: 2 },
  { id: 'c', lvl: 3 },
  { id: 'd', lvl: 4 },
];

describe('filterHot (contenu par niveau de cancellabilité)', () => {
  test('niveau 1 : aucun contenu osé', () => {
    expect(filterHot(hot, 1)).toEqual([]);
  });

  test('cumulatif : chaque niveau inclut tous les niveaux inférieurs', () => {
    const ids = (lvl: CancelLevel) => filterHot(hot, lvl).map((h) => h.id);
    expect(ids(2)).toEqual(['a', 'b']); // 2
    expect(ids(3)).toEqual(['a', 'b', 'c']); // ≤ 3
    expect(ids(4)).toEqual(['a', 'b', 'c', 'd']); // tout
  });

  test('ne remonte jamais au-dessus du plafond', () => {
    expect(filterHot(hot, 3).some((h) => h.lvl > 3)).toBe(false);
  });

  test('un banc vide reste vide', () => {
    expect(filterHot([], 4)).toEqual([]);
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

  test('niveau 1 : pool inchangé', () => {
    const out = blendByCancelLevel([...chill, ...s2], 1, mulberry32(1));
    expect(out).toHaveLength(110);
  });

  test('niveau 4 : ~30 % de contenu osé, et tout l’osé conservé', () => {
    const out = blendByCancelLevel([...chill, ...s2, ...s3, ...s4], 4, mulberry32(3));
    expect(spicyShare(out)).toBeGreaterThan(0.25);
    expect(spicyShare(out)).toBeLessThan(0.35);
    expect(out.filter((x) => (x.cancelLevel ?? 1) > 1)).toHaveLength(30);
  });

  test('niveau 2 (un seul palier osé présent) : ~10 %', () => {
    const out = blendByCancelLevel([...chill, ...s2], 2, mulberry32(2));
    expect(spicyShare(out)).toBeGreaterThan(0.06);
    expect(spicyShare(out)).toBeLessThan(0.16);
  });

  test('aucun contenu osé : pool renvoyé tel quel (pas de pénurie)', () => {
    expect(blendByCancelLevel(chill, 4, mulberry32(5))).toHaveLength(100);
  });
});
