import { filterHot, type Leveled } from './contentLevel';
import type { CancelLevel } from './models';

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
