import { identityKey } from '../../../core/questionSelection';
import { QUESTIONS } from './index';

/**
 * Garde-fou qualité : au sein d'UN MÊME univers, deux questions à l'énoncé ET la
 * réponse identiques (à la casse/accents près) sont un doublon involontaire — ça
 * gaspille un créneau et réduit la variété. Le tirage dédoublonne à l'exécution,
 * mais autant repérer ces copier-coller dès la construction.
 *
 * NB : deux univers différents PEUVENT légitimement partager une même question
 * (elle est alors dédoublonnée au tirage) ; on ne vérifie donc qu'à l'intérieur
 * d'un univers, et on ignore le thème « images » (regroupement libre).
 */
describe('doublons de questions', () => {
  test('aucun doublon (énoncé + réponse) au sein d’un même univers', () => {
    const seen = new Map<string, string>(); // clé "univers|identité" -> premier id
    const problems: string[] = [];
    for (const q of QUESTIONS) {
      if (!q.universe || q.theme === 'images') continue;
      const key = `${q.universe}||${identityKey(q)}`;
      const first = seen.get(key);
      if (first) problems.push(`${q.universe} : « ${q.text} » (${q.id} = ${first})`);
      else seen.set(key, q.id);
    }
    expect(problems).toEqual([]);
  });
});
