import { QUESTIONS } from './index';

/**
 * Lint qualité de la banque — complète `questions.test.ts` (structure, trio de
 * traduction) et `duplicates.test.ts` (doublons intra-univers) avec des
 * garde-fous plus fins qui attrapent des coquilles de copier-coller :
 *   1. distracteurs répétés dans une même question (FR et EN) ;
 *   2. réponse figurant dans ses propres distracteurs (FR) ;
 *   3. champ anglais qui a gardé une typographie française (espace avant « ? ! ; »,
 *      guillemets « ») ou un énoncé anglais identique au français — signes qu'une
 *      traduction a été oubliée.
 *
 * On garde des règles à FAIBLE taux de faux positifs : les noms propres accentués
 * (Beyoncé, La La Land…) restent valides en anglais et ne sont donc pas signalés.
 */

const FRENCH_TYPO = /\s[?!;]|[«»]/; // espace avant ponctuation double, ou guillemets

describe('lint qualité de la banque', () => {
  test('aucun distracteur répété dans une question (FR)', () => {
    const problems: string[] = [];
    for (const q of QUESTIONS) {
      if (new Set(q.distractors).size !== q.distractors.length)
        problems.push(`${q.id}: distracteurs FR en double`);
      if (q.distractors.includes(q.answer)) problems.push(`${q.id}: la réponse est aussi un distracteur`);
    }
    expect(problems).toEqual([]);
  });

  test('aucun distracteur répété dans la version anglaise', () => {
    const problems: string[] = [];
    for (const q of QUESTIONS) {
      if (!q.distractors_en) continue;
      if (new Set(q.distractors_en).size !== q.distractors_en.length)
        problems.push(`${q.id}: distracteurs EN en double`);
    }
    expect(problems).toEqual([]);
  });

  test("les champs anglais ne gardent pas de typographie française ni d'énoncé non traduit", () => {
    const problems: string[] = [];
    for (const q of QUESTIONS) {
      const enStrings: [string, string | undefined][] = [
        ['text_en', q.text_en],
        ['answer_en', q.answer_en],
        ...(q.distractors_en ?? []).map((d, i): [string, string] => [`distractors_en[${i}]`, d]),
      ];
      for (const [field, val] of enStrings) {
        if (val && FRENCH_TYPO.test(val)) problems.push(`${q.id}: ${field} garde une typographie française « ${val} »`);
      }
      if (q.text_en !== undefined && q.text_en === q.text)
        problems.push(`${q.id}: text_en identique au français (traduction oubliée)`);
    }
    expect(problems).toEqual([]);
  });
});
