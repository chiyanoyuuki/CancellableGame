/**
 * Persistance de la boutique (produits possédés, univers gratuits choisis,
 * onboarding fait). Stockée dans le kv SQLite, donc conservée entre les mises
 * à jour d'APK — au même titre que les statistiques.
 *
 * ⚠️ En production, la SOURCE DE VÉRITÉ des achats reste le store (Google Play
 * Billing) : ce cache local sert d'accès rapide et est resynchronisé par
 * `restore()`. Voir MONETISATION.md.
 */
import { kvGet, kvGetJSON, kvSet, kvSetJSON } from '../db/kv';

const OWNED_KEY = 'store:owned';
const FREE_UNIVERSES_KEY = 'store:freeUniverses';
const ONBOARDED_KEY = 'store:onboarded';

export async function loadOwned(): Promise<string[]> {
  return kvGetJSON<string[]>(OWNED_KEY, []);
}

export async function saveOwned(owned: Iterable<string>): Promise<void> {
  await kvSetJSON(OWNED_KEY, [...new Set(owned)]);
}

export async function loadFreeUniverses(): Promise<string[]> {
  return kvGetJSON<string[]>(FREE_UNIVERSES_KEY, []);
}

export async function saveFreeUniverses(list: string[]): Promise<void> {
  await kvSetJSON(FREE_UNIVERSES_KEY, [...new Set(list)]);
}

export async function loadOnboarded(): Promise<boolean> {
  return (await kvGet(ONBOARDED_KEY)) === '1';
}

export async function saveOnboarded(done: boolean): Promise<void> {
  await kvSet(ONBOARDED_KEY, done ? '1' : '0');
}
