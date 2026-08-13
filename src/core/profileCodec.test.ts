import { decodeProfile, encodeProfile, encodeProfileCompact, isProfileCode, type RemoteProfile } from './profileCodec';

const sample: RemoteProfile = {
  name: 'Sofiane',
  emoji: '🦊',
  color: '#7c5cff',
  unwanted: ['Naruto', 'La gauche', "Assassin's Creed"],
};

describe('profileCodec', () => {
  test('aller-retour : encode puis decode redonne le profil', () => {
    const decoded = decodeProfile(encodeProfile(sample));
    expect(decoded).toEqual(sample);
  });

  test('conserve les accents et emojis', () => {
    const p: RemoteProfile = { name: 'Léa 👑', emoji: '🐲', color: '#ff5c8a', unwanted: ['Théories du complot'] };
    expect(decodeProfile(encodeProfile(p))).toEqual(p);
  });

  test('isProfileCode reconnaît un code valide et rejette le reste', () => {
    expect(isProfileCode(encodeProfile(sample))).toBe(true);
    expect(isProfileCode('https://example.com')).toBe(false);
    expect(isProfileCode('')).toBe(false);
  });

  test('rejette un QR étranger (mauvais préfixe)', () => {
    expect(decodeProfile('https://cancellable.app/profil')).toBeNull();
    expect(decodeProfile('coucou')).toBeNull();
  });

  test('rejette un JSON invalide', () => {
    expect(decodeProfile('CANCELLABLE-PROFILE|1|{pas du json')).toBeNull();
  });

  test('rejette une version future inconnue', () => {
    expect(decodeProfile('CANCELLABLE-PROFILE|9|{"n":"Tom"}')).toBeNull();
  });

  test('exige un nom non vide', () => {
    expect(decodeProfile('CANCELLABLE-PROFILE|1|{"n":"   ","e":"🦊","c":"#fff","u":[]}')).toBeNull();
  });

  test('tolère les champs manquants sauf le nom', () => {
    const decoded = decodeProfile('CANCELLABLE-PROFILE|1|{"n":"Tom"}');
    expect(decoded).toEqual({ name: 'Tom', emoji: '', color: '', unwanted: [] });
  });

  test('nettoie un emoji corrompu (caractère de remplacement) importé', () => {
    const code = 'CANCELLABLE-PROFILE|1|{"n":"Zoé","e":"��","c":"#fff","u":[]}';
    expect(decodeProfile(code)?.emoji).toBe('');
  });

  test('conserve un emoji valide', () => {
    const code = 'CANCELLABLE-PROFILE|1|{"n":"Zoé","e":"🦊","c":"#fff","u":[]}';
    expect(decodeProfile(code)?.emoji).toBe('🦊');
  });

  test('filtre les entrées non-chaînes de la liste des univers', () => {
    const decoded = decodeProfile('CANCELLABLE-PROFILE|1|{"n":"Tom","u":["Naruto",42,null,"Bleach"]}');
    expect(decoded?.unwanted).toEqual(['Naruto', 'Bleach']);
  });

  test('borne la longueur du nom', () => {
    const longName = 'a'.repeat(200);
    const decoded = decodeProfile(encodeProfile({ ...sample, name: longName }));
    expect(decoded?.name.length).toBe(40);
  });

  test('borne le nombre d’univers non souhaités', () => {
    const many = Array.from({ length: 1000 }, (_, i) => `U${i}`);
    const decoded = decodeProfile(encodeProfile({ ...sample, unwanted: many }));
    expect((decoded?.unwanted.length ?? 0) <= 400).toBe(true);
  });

  describe('format v2 (univers par indices)', () => {
    const catalogue = ['Naruto', 'One Piece', 'La gauche', "Assassin's Creed", 'Théories du complot', 'Bleach'];

    test('aller-retour compact avec catalogue', () => {
      const code = encodeProfileCompact(sample, catalogue);
      expect(decodeProfile(code, catalogue)).toEqual(sample);
    });

    test('plus court que le v1 quand il y a beaucoup d’univers', () => {
      const big: RemoteProfile = { ...sample, unwanted: catalogue };
      expect(encodeProfileCompact(big, catalogue).length).toBeLessThan(encodeProfile(big).length);
    });

    test('sans catalogue, un v2 se décode sans exclusions', () => {
      const code = encodeProfileCompact(sample, catalogue);
      expect(decodeProfile(code)).toEqual({ ...sample, unwanted: [] });
    });

    test('catalogue de taille différente (décalage) → aucune exclusion', () => {
      const code = encodeProfileCompact(sample, catalogue);
      expect(decodeProfile(code, catalogue.slice(0, 4))?.unwanted).toEqual([]);
    });

    test('ignore les indices hors bornes', () => {
      const code = `CANCELLABLE-PROFILE|2|{"n":"Tom","v":${catalogue.length},"u":[0,99,-1,5]}`;
      expect(decodeProfile(code, catalogue)?.unwanted).toEqual(['Naruto', 'Bleach']);
    });
  });
});
