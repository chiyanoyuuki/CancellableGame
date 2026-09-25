import type { CancelLevel } from '../../../core/models';
import { getUniverseCatalogue } from './catalogue';
import { QUESTIONS } from './index';

/**
 * Régression « le tri par profil doit concorder partout ».
 *
 * Le profil d'un joueur (écran « Univers et thèmes évités », profil à distance,
 * QR) permet d'ÉVITER un univers. Pour qu'un univers soit évitable, il doit
 * figurer dans le catalogue partagé (`getUniverseCatalogue`). Or les parties
 * tirent, elles, dans TOUS les niveaux de cancellabilité actifs — y compris des
 * univers qui n'existent qu'aux niveaux osés (ex. « Prague interdite 🔞 »).
 *
 * Bug corrigé : l'éditeur de profil construisait sa liste depuis le pool
 * grand public (niveau 1 uniquement), si bien que ces univers osés étaient
 * INVISIBLES dans le profil et donc IMPOSSIBLES à éviter, alors qu'ils
 * sortaient bel et bien en jeu dès qu'un niveau osé était actif. Ces tests
 * garantissent que le catalogue reste COMPLET, tous niveaux confondus.
 */

test('le catalogue partagé couvre TOUS les univers du jeu, tous niveaux confondus', () => {
  const catalogue = new Set(getUniverseCatalogue());
  const missing = new Set<string>();
  for (const q of QUESTIONS) {
    if (q.universe && !catalogue.has(q.universe)) missing.add(q.universe);
  }
  // Aucun univers jouable ne doit manquer au catalogue : sinon il serait
  // inévitable depuis le profil (le bug d'origine).
  expect([...missing]).toEqual([]);
});

test('les univers osés (cancelLevel > 1) sont bien dans le catalogue évitable', () => {
  const catalogue = new Set(getUniverseCatalogue());
  // Tous les univers qui n'apparaissent qu'à un niveau osé (jamais au niveau 1).
  const levelsByUniverse = new Map<string, Set<CancelLevel>>();
  for (const q of QUESTIONS) {
    if (!q.universe) continue;
    const lv = (q.cancelLevel ?? 1) as CancelLevel;
    const set = levelsByUniverse.get(q.universe) ?? new Set<CancelLevel>();
    set.add(lv);
    levelsByUniverse.set(q.universe, set);
  }
  const cancelOnly = [...levelsByUniverse.entries()]
    .filter(([, lv]) => ![...lv].some((l) => l === 1))
    .map(([u]) => u);

  // Il en existe (sinon le test ne protège rien), et chacun est évitable.
  expect(cancelOnly.length).toBeGreaterThan(0);
  for (const u of cancelOnly) expect(catalogue.has(u)).toBe(true);
});

test('« Prague interdite 🔞 » (thème tchèque, contenu osé) est évitable via le profil', () => {
  const pragueQ = QUESTIONS.filter((q) => q.universe === 'Prague interdite 🔞');
  // L'univers existe et n'est QUE du contenu osé (niveau > 1).
  expect(pragueQ.length).toBeGreaterThan(0);
  expect(pragueQ.every((q) => (q.cancelLevel ?? 1) > 1)).toBe(true);
  // Et il figure bien dans le catalogue évitable partagé.
  expect(getUniverseCatalogue()).toContain('Prague interdite 🔞');
});
