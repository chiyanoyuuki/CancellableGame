/**
 * Couche d'abstraction des achats et de la publicité.
 *
 * L'app ne parle qu'à ces interfaces ; l'implémentation par défaut est un
 * SIMULATEUR local (aucun réseau, aucun SDK natif) pour développer et tester
 * tout le parcours. Pour passer en production, remplacez `localBilling` par une
 * implémentation Google Play Billing et branchez un vrai interstitiel AdMob
 * (voir MONETISATION.md) — le reste de l'app ne change pas.
 */
import { loadOwned } from './persistence';
import type { ProductId } from './products';

export interface BillingProvider {
  /** Lance l'achat d'un produit. Retourne true si l'achat est confirmé. */
  purchase(id: ProductId): Promise<boolean>;
  /** Restaure les achats déjà effectués ; retourne les identifiants possédés. */
  restore(): Promise<string[]>;
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Simulateur : l'achat « réussit » toujours après un court délai ; la
 * restauration relit simplement le cache local. À REMPLACER en production.
 */
export const localBilling: BillingProvider = {
  async purchase(_id: ProductId): Promise<boolean> {
    await delay(350);
    return true;
  },
  async restore(): Promise<string[]> {
    await delay(350);
    return loadOwned();
  },
};

export interface AdsProvider {
  /** Affiche une pub interstitielle ; se résout quand elle est fermée. */
  showInterstitial(): Promise<void>;
}
