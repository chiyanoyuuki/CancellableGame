import type { CustomQuestionInput } from '../db/customQuestions';
import { type CustomPack, decodePack, encodePack, isPackCode } from './packCodec';

const q = (over: Partial<CustomQuestionInput> = {}): CustomQuestionInput => ({
  theme: 'culture',
  difficulty: 2,
  text: 'Capitale de la France ?',
  answer: 'Paris',
  distractors: ['Lyon', 'Nice', 'Lille'],
  ...over,
});

const pack = (over: Partial<CustomPack> = {}): CustomPack => ({
  questions: [q()],
  challenges: ['Cul sec !'],
  ...over,
});

describe('packCodec', () => {
  it('fait un aller-retour encode/decode', () => {
    const decoded = decodePack(encodePack(pack()));
    expect(decoded).not.toBeNull();
    expect(decoded!.questions.length).toBe(1);
    expect(decoded!.questions[0]!.answer).toBe('Paris');
    expect(decoded!.challenges).toEqual(['Cul sec !']);
  });

  it('isPackCode reconnaît un pack', () => {
    expect(isPackCode(encodePack(pack()))).toBe(true);
    expect(isPackCode('n\'importe quoi')).toBe(false);
    expect(isPackCode('CANCELLABLE-PROFILE|1|{}')).toBe(false);
  });

  it('rejette le charabia et les mauvais magic/version', () => {
    expect(decodePack('')).toBeNull();
    expect(decodePack('bonjour')).toBeNull();
    expect(decodePack('CANCELLABLE-PACK|99|{"questions":[]}')).toBeNull();
    expect(decodePack('CANCELLABLE-PACK|1|pas du json')).toBeNull();
  });

  it('écarte les questions invalides (thème inconnu, difficulté, texte vide, 0 distracteur)', () => {
    const raw = encodePack({
      questions: [
        q(),
        q({ theme: 'inexistant' as never }),
        q({ difficulty: 9 as never }),
        q({ text: '   ' }),
        q({ distractors: [] }),
      ],
      challenges: [],
    });
    const decoded = decodePack(raw);
    expect(decoded).not.toBeNull();
    expect(decoded!.questions.length).toBe(1); // seule la valide survit
  });

  it('borne les longueurs et les listes', () => {
    const decoded = decodePack(
      encodePack({
        questions: [
          q({
            text: 'x'.repeat(9999),
            distractors: Array.from({ length: 50 }, (_, i) => `d${i}`),
            hints: Array.from({ length: 50 }, (_, i) => `h${i}`),
          }),
        ],
        challenges: [],
      }),
    );
    expect(decoded!.questions[0]!.text.length).toBeLessThanOrEqual(400);
    expect(decoded!.questions[0]!.distractors.length).toBeLessThanOrEqual(12);
    expect((decoded!.questions[0]!.hints ?? []).length).toBeLessThanOrEqual(12);
  });

  it('conserve les champs optionnels valides', () => {
    const decoded = decodePack(
      encodePack({ questions: [q({ universe: 'Naruto', acceptable: ['paris'], hints: ['indice'] })], challenges: [] }),
    );
    const dq = decoded!.questions[0]!;
    expect(dq.universe).toBe('Naruto');
    expect(dq.acceptable).toEqual(['paris']);
    expect(dq.hints).toEqual(['indice']);
  });

  it('renvoie null si tout est vide', () => {
    expect(decodePack(encodePack({ questions: [], challenges: [] }))).toBeNull();
  });

  it('importe un pack de défis seuls', () => {
    const decoded = decodePack(encodePack({ questions: [], challenges: ['Gage 1', '  ', 'Gage 2'] }));
    expect(decoded!.challenges).toEqual(['Gage 1', 'Gage 2']); // vide ignoré
  });
});
