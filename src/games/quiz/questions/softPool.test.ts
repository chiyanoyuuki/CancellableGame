import { QUESTIONS } from './index';

/**
 * Régression (partie qui démarre « gagnée d'office ») : le quiz FIGE son pool sur
 * le niveau 1 dans QuizConfig ET QuizPlay, car il est 100 % soft. Si la banque ne
 * contenait plus aucune question de niveau 1, ce pool figé serait vide et chaque
 * partie démarrerait en phase « finished » (gagnée directement). Ce test garde
 * l'invariant : il reste du contenu niveau 1 à tirer.
 */
describe('pool quiz (soft)', () => {
  it('contient du contenu de niveau 1', () => {
    const soft = QUESTIONS.filter((q) => (q.cancelLevel ?? 1) === 1);
    expect(soft.length).toBeGreaterThan(0);
  });
});
