import { decodeProfile, encodeProfile, isProfileCode, type RemoteProfile } from './profileCodec';

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
});
