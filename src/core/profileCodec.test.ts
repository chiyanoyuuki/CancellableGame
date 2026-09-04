import { decodeProfile, encodeProfile, encodeProfileCompact, encodeProfileHashed, isProfileCode, type RemoteProfile, universeCode } from './profileCodec';

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

  describe('format v3 (univers par hash de nom, robuste au décalage)', () => {
    const catalogue = ['Naruto', 'One Piece', 'La gauche', "Assassin's Creed", 'Théories du complot', 'Bleach'];

    test('aller-retour avec catalogue', () => {
      const code = encodeProfileHashed(sample);
      expect(decodeProfile(code, catalogue)).toEqual(sample);
    });

    test('décodage correct MÊME si le catalogue a changé de taille et d’ordre', () => {
      const code = encodeProfileHashed(sample);
      // Catalogue de décodage : réordonné + de nouveaux univers ajoutés au milieu.
      const shifted = ['Nouveau A', "Assassin's Creed", 'Nouveau B', 'La gauche', 'One Piece', 'Naruto', 'Nouveau C'];
      // Les 3 univers du profil sont présents (peu importe leur position) → retrouvés.
      expect(decodeProfile(code, shifted)?.unwanted?.sort()).toEqual([...sample.unwanted].sort());
    });

    test('un univers absent du catalogue de décodage est simplement ignoré', () => {
      const code = encodeProfileHashed({ ...sample, unwanted: ['Naruto', 'Univers Inconnu'] });
      expect(decodeProfile(code, catalogue)?.unwanted).toEqual(['Naruto']);
    });

    test('sans catalogue, un v3 se décode sans exclusions', () => {
      expect(decodeProfile(encodeProfileHashed(sample))).toEqual({ ...sample, unwanted: [] });
    });

    test('reste 100 % ASCII (le corps échappé n’altère pas les codes hex)', () => {
      const code = encodeProfileHashed(sample);
      // Les codes sont hexadécimaux (ASCII) ; seuls nom/emoji nécessitent l’échappement.
      const body = code.slice(code.indexOf('|', code.indexOf('|') + 1) + 1);
      const u = (JSON.parse(body) as { u: string }).u;
      expect(/^[0-9a-f]*$/.test(u)).toBe(true);
      expect(u.length).toBe(sample.unwanted.length * 8);
    });

    test('universeCode est déterministe et stable (garde-fou anti-régression)', () => {
      expect(universeCode('Naruto')).toBe('d45cd9b8');
      expect(universeCode('Naruto')).toBe(universeCode('Naruto'));
    });
  });

  describe('robustesse du scan (QR reels)', () => {
    // Reproduit l'echappement ASCII du formulaire web : le QR ne contient QUE de
    // l'ASCII, pour ne jamais declencher l'encodeur UTF-8 fragile de la biblio QR.
    // JSON.parse reconstitue emojis et accents a l'identique.
    const asciiEscape = (str: string) =>
      str.replace(/[\u0080-\uffff]/g, (ch) => '\\u' + ('0000' + ch.charCodeAt(0).toString(16)).slice(-4));

    test('un corps echappe (formulaire web) reste 100 pourcent ASCII et se decode a l identique', () => {
      const catalogue = ['Naruto', 'La gauche', "Assassin's Creed"];
      const escaped = asciiEscape(encodeProfileCompact(sample, catalogue));
      expect([...escaped].every((c) => c.charCodeAt(0) < 128)).toBe(true);
      expect(decodeProfile(escaped, catalogue)).toEqual(sample);
    });

    test('emoji hors BMP echappe (paire de substitution) restitue intact', () => {
      const dragon: RemoteProfile = { name: 'Lea', emoji: '\ud83d\udc32', color: '#ff5c8a', unwanted: [] };
      const escaped = asciiEscape(encodeProfile(dragon));
      expect(escaped).toContain('\\ud83d\\udc32'); // dragon hors BMP, ecrit en ASCII
      expect(decodeProfile(escaped)).toEqual(dragon);
    });

    test('tolere un BOM (U+FEFF) en tete, comme certains scanners', () => {
      expect(decodeProfile('\uFEFF' + encodeProfile(sample))).toEqual(sample);
    });

    test('tolere un caractere parasite U+FFFD colle avant le prefixe', () => {
      expect(decodeProfile('\uFFFD' + encodeProfile(sample))).toEqual(sample);
    });

    test('isProfileCode reconnait un code precede d un BOM', () => {
      expect(isProfileCode('\uFEFF' + encodeProfile(sample))).toBe(true);
    });
  });
});
