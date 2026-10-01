import { getUniverseCatalogue } from './catalogue';
import { QUESTIONS } from './index';

/**
 * Le catalogue partagé (`getUniverseCatalogue`) est la source de vérité des
 * univers évitables dans les profils (écran Joueurs, profil à distance, QR).
 * Pour que le tri par profil concorde partout, il doit couvrir TOUS les univers
 * réellement jouables : si un univers manquait, il serait impossible à éviter.
 */
test('le catalogue partagé couvre TOUS les univers du jeu', () => {
  const catalogue = new Set(getUniverseCatalogue());
  const missing = new Set<string>();
  for (const q of QUESTIONS) {
    if (q.universe && !catalogue.has(q.universe)) missing.add(q.universe);
  }
  expect([...missing]).toEqual([]);
});

/**
 * Le quiz est devenu 100 % soft : plus aucune question ne porte de `cancelLevel`
 * (> 1). Le contenu osé vit désormais uniquement dans les banques de soirée
 * (défis / tu préfères / qui de nous), pas dans la banque de quiz.
 */
test('la banque de quiz ne contient plus de contenu « cancellable » (cancelLevel > 1)', () => {
  const ose = QUESTIONS.filter((q) => (q.cancelLevel ?? 1) > 1);
  expect(ose).toEqual([]);
});
