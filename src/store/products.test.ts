import {
  canAddProfile,
  deriveEntitlements,
  isModeUnlocked,
  isProductOwned,
  isStatsPeriodUnlocked,
  isUniverseUnlocked,
  profileLimit,
} from './products';

describe('deriveEntitlements', () => {
  test('rien acheté = tout verrouillé', () => {
    expect(deriveEntitlements([])).toEqual({
      unlimitedProfiles: false,
      allThemes: false,
      allModes: false,
      allStats: false,
      allAchievements: false,
      noAds: false,
    });
  });

  test('un achat direct débloque le droit correspondant', () => {
    const e = deriveEntitlements(['all_themes']);
    expect(e.allThemes).toBe(true);
    expect(e.allModes).toBe(false);
  });

  test('le pack « tout » débloque tout, publicité comprise', () => {
    expect(deriveEntitlements(['unlock_all'])).toEqual({
      unlimitedProfiles: true,
      allThemes: true,
      allModes: true,
      allStats: true,
      allAchievements: true,
      noAds: true,
    });
  });

  test('les hauts faits se débloquent à l\'achat direct ou via le pack', () => {
    expect(deriveEntitlements([]).allAchievements).toBe(false);
    expect(deriveEntitlements(['all_achievements']).allAchievements).toBe(true);
    expect(deriveEntitlements(['unlock_all']).allAchievements).toBe(true);
  });
});

describe('isProductOwned', () => {
  test('le pack couvre les produits individuels mais pas l’inverse', () => {
    expect(isProductOwned('all_modes', ['unlock_all'])).toBe(true);
    expect(isProductOwned('no_ads', ['unlock_all'])).toBe(true);
    expect(isProductOwned('unlock_all', ['all_modes', 'all_themes', 'all_stats', 'unlimited_profiles', 'no_ads'])).toBe(false);
  });
});

describe('profils', () => {
  test('limite à 10 en gratuit, illimité si acheté', () => {
    expect(profileLimit(deriveEntitlements([]))).toBe(10);
    expect(profileLimit(deriveEntitlements(['unlimited_profiles']))).toBe(Infinity);
  });
  test('canAddProfile respecte la limite', () => {
    const free = deriveEntitlements([]);
    expect(canAddProfile(9, free)).toBe(true);
    expect(canAddProfile(10, free)).toBe(false);
    expect(canAddProfile(999, deriveEntitlements(['unlock_all']))).toBe(true);
  });
});

describe('modes de jeu', () => {
  test('quiz gratuit, bombe/duel verrouillés sans achat', () => {
    const free = deriveEntitlements([]);
    expect(isModeUnlocked('quiz', free)).toBe(true);
    expect(isModeUnlocked('bombe', free)).toBe(false);
    expect(isModeUnlocked('duel', free)).toBe(false);
    expect(isModeUnlocked('duel', deriveEntitlements(['all_modes']))).toBe(true);
  });
});

describe('statistiques', () => {
  test('seule la période « today » est gratuite', () => {
    const free = deriveEntitlements([]);
    expect(isStatsPeriodUnlocked('today', free)).toBe(true);
    expect(isStatsPeriodUnlocked('month', free)).toBe(false);
    expect(isStatsPeriodUnlocked('all', deriveEntitlements(['all_stats']))).toBe(true);
  });
});

describe('univers', () => {
  const free = deriveEntitlements([]);
  const paid = deriveEntitlements(['all_themes']);
  const chosen = new Set(['Naruto', '#rebus']);
  test('gratuit : seuls les univers choisis sont débloqués', () => {
    expect(isUniverseUnlocked('Naruto', free, chosen)).toBe(true);
    expect(isUniverseUnlocked('#rebus', free, chosen)).toBe(true);
    expect(isUniverseUnlocked('Marvel', free, chosen)).toBe(false);
  });
  test('all_themes débloque tout, quel que soit le choix', () => {
    expect(isUniverseUnlocked('Marvel', paid, new Set())).toBe(true);
  });
});
