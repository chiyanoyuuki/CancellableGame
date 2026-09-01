import { makeTeams } from './teams';

describe('makeTeams', () => {
  const ids = ['a', 'b', 'c', 'd', 'e'];

  it('crée le bon nombre d\'équipes équilibrées', () => {
    const teams = makeTeams(ids, 2, 1);
    expect(teams.length).toBe(2);
    const sizes = teams.map((t) => t.length).sort();
    expect(sizes).toEqual([2, 3]); // 5 joueurs → 3 + 2
  });

  it('répartit tous les joueurs, sans doublon ni perte', () => {
    const teams = makeTeams(ids, 3, 42);
    const all = teams.flat().sort();
    expect(all).toEqual([...ids].sort());
    expect(new Set(all).size).toBe(ids.length);
  });

  it('est déterministe pour une même graine', () => {
    expect(makeTeams(ids, 2, 7)).toEqual(makeTeams(ids, 2, 7));
  });

  it('borne le nombre d\'équipes au nombre de joueurs', () => {
    const teams = makeTeams(['a', 'b'], 5, 1);
    expect(teams.length).toBe(2);
    expect(teams.every((t) => t.length === 1)).toBe(true);
  });

  it('gère la liste vide', () => {
    expect(makeTeams([], 2, 1)).toEqual([]);
  });
});
