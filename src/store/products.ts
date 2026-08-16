/**
 * Boutique : catalogue de produits et dérivation des « entitlements » (droits
 * débloqués). Module PUR — aucune dépendance à React Native ou à la base — pour
 * rester testable sous Node. La persistance et le vrai achat vivent ailleurs.
 *
 * Modèle « freemium » :
 *  - Quiz jouable gratuitement ; les autres modes exigent `all_modes`.
 *  - 20 univers gratuits choisis au 1er lancement ; le reste exige `all_themes`.
 *  - 10 profils max ; au-delà il faut `unlimited_profiles`.
 *  - Stats du soir seulement ; le reste exige `all_stats`.
 *  - Hauts faits verrouillés tant que `all_achievements` n'est pas acheté.
 *  - Publicité avant chaque partie après la première ; `no_ads` la retire.
 *  - `unlock_all` (pack) débloque tout ce qui précède, publicité comprise.
 */

export type ProductId =
  | 'all_themes'
  | 'all_modes'
  | 'unlimited_profiles'
  | 'all_stats'
  | 'all_achievements'
  | 'no_ads'
  | 'unlock_all';

export interface Product {
  id: ProductId;
  title: string;
  description: string;
  /** Prix affiché par défaut ; en production le vrai prix vient du store. */
  price: string;
  emoji: string;
}

export const PRODUCTS: Product[] = [
  { id: 'all_themes', title: 'Tous les thèmes', description: 'Débloque tous les univers, actuels et à venir.', price: '1,99 €', emoji: '🎨' },
  { id: 'all_modes', title: 'Tous les modes de jeu', description: 'Débloque La Bombe, le Duel et les modes futurs.', price: '1,99 €', emoji: '🎮' },
  { id: 'unlimited_profiles', title: 'Profils illimités', description: 'Crée autant de joueurs que tu veux, au-delà de 10.', price: '1,99 €', emoji: '👥' },
  { id: 'all_stats', title: 'Toutes les statistiques', description: 'Mois, année, total et tous les palmarès.', price: '1,99 €', emoji: '📊' },
  { id: 'all_achievements', title: 'Hauts faits', description: 'Débloque tous les hauts faits, leurs paliers et le classement.', price: '1,99 €', emoji: '🎖️' },
  { id: 'no_ads', title: 'Sans publicité', description: 'Retire les publicités pour toujours.', price: '0,99 €', emoji: '🚫' },
  { id: 'unlock_all', title: 'Tout débloquer', description: 'Profils, modes, thèmes, stats — et sans publicité.', price: '4,99 €', emoji: '✨' },
];

/** Ce que le pack « tout débloquer » accorde implicitement. */
export const UNLOCK_ALL_GRANTS: ProductId[] = [
  'unlimited_profiles',
  'all_themes',
  'all_modes',
  'all_stats',
  'all_achievements',
  'no_ads',
];

export interface Entitlements {
  unlimitedProfiles: boolean;
  allThemes: boolean;
  allModes: boolean;
  allStats: boolean;
  allAchievements: boolean;
  noAds: boolean;
}

/** True si `id` est couvert par les produits possédés (achat direct ou pack). */
export function isProductOwned(id: ProductId, owned: Iterable<string>): boolean {
  const set = owned instanceof Set ? owned : new Set(owned);
  if (set.has(id)) return true;
  if (id === 'unlock_all') return false; // le pack n'est « possédé » que s'il est acheté
  return set.has('unlock_all') && UNLOCK_ALL_GRANTS.includes(id);
}

export function deriveEntitlements(owned: Iterable<string>): Entitlements {
  const set = owned instanceof Set ? owned : new Set(owned);
  return {
    unlimitedProfiles: isProductOwned('unlimited_profiles', set),
    allThemes: isProductOwned('all_themes', set),
    allModes: isProductOwned('all_modes', set),
    allStats: isProductOwned('all_stats', set),
    allAchievements: isProductOwned('all_achievements', set),
    noAds: isProductOwned('no_ads', set),
  };
}

// --- Gating helpers (purs) -------------------------------------------------

/** Nombre de profils gratuits ; au-delà il faut `unlimited_profiles`. */
export const FREE_PROFILE_LIMIT = 10;
/** Nombre d'univers gratuits choisis au premier lancement. */
export const FREE_UNIVERSE_COUNT = 20;
/** Modes jouables gratuitement (les autres exigent `all_modes`). */
export const FREE_GAME_IDS = ['quiz'];

export function profileLimit(ent: Entitlements): number {
  return ent.unlimitedProfiles ? Infinity : FREE_PROFILE_LIMIT;
}

export function canAddProfile(currentCount: number, ent: Entitlements): boolean {
  return currentCount < profileLimit(ent);
}

export function isModeUnlocked(gameId: string, ent: Entitlements): boolean {
  return ent.allModes || FREE_GAME_IDS.includes(gameId);
}

/** Seule la période « today » (soir) est gratuite. */
export function isStatsPeriodUnlocked(period: string, ent: Entitlements): boolean {
  return ent.allStats || period === 'today';
}

/**
 * Un univers / une catégorie (« univers » ou « #thème ») est-il débloqué ?
 * `allThemes` débloque tout ; sinon seuls les univers gratuits le sont.
 */
export function isUniverseUnlocked(
  category: string,
  ent: Entitlements,
  freeUniverses: ReadonlySet<string>,
): boolean {
  return ent.allThemes || freeUniverses.has(category);
}
