import { decodeProfile, encodeProfileHashed, universeCode } from '../../../core/profileCodec';
import { getUniverseCatalogue } from './catalogue';

/**
 * Le format v3 des profils encode chaque univers évité par `universeCode(nom)`.
 * Si deux univers du catalogue partageaient le même code, un profil scanné
 * exclurait le mauvais univers. Ce test garantit qu'aucune collision n'existe
 * dans le catalogue courant (à re-vérifier à chaque ajout d'univers).
 */
test('universeCode est unique sur tout le catalogue (pas de collision v3)', () => {
  const seen = new Map<string, string>();
  const collisions: string[] = [];
  for (const name of getUniverseCatalogue()) {
    const code = universeCode(name);
    const prev = seen.get(code);
    if (prev) collisions.push(`${name} == ${prev} (${code})`);
    else seen.set(code, name);
  }
  expect(collisions).toEqual([]);
});

test('un profil v3 (comme celui du formulaire web) se décode avec le vrai catalogue', () => {
  const cat = getUniverseCatalogue();
  // Prend quelques univers réels du catalogue courant, à des positions variées.
  const unwanted = [cat[0]!, cat[Math.floor(cat.length / 2)]!, cat[cat.length - 1]!];
  const code = encodeProfileHashed({ name: 'Amie', emoji: '🦊', color: '#7c5cff', unwanted });
  const decoded = decodeProfile(code, cat);
  expect(decoded?.name).toBe('Amie');
  expect(decoded?.unwanted.sort()).toEqual([...unwanted].sort());
});
