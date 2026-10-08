/**
 * Implémentation RÉELLE des achats : RevenueCat → Google Play Billing.
 *
 * Remplit l'interface `BillingProvider` de billing.ts. Activée seulement quand
 * `USE_REAL_BILLING` est à true (voir config.ts et StoreProvider). Les
 * identifiants de produits sont EXACTEMENT ceux de products.ts : ce sont les
 * mêmes chaînes à créer dans la Play Console et dans RevenueCat.
 */
import Purchases from 'react-native-purchases';

import type { BillingProvider } from './billing';
import { REVENUECAT_ANDROID_KEY } from './config';
import type { ProductId } from './products';

let configured = false;

/** À appeler une fois au démarrage, avant tout achat. */
export async function initRevenueCat(): Promise<void> {
  if (configured) return;
  Purchases.configure({ apiKey: REVENUECAT_ANDROID_KEY });
  configured = true;
}

export const rcBilling: BillingProvider = {
  async purchase(id: ProductId): Promise<boolean> {
    try {
      const products = await Purchases.getProducts([id]);
      const product = products.find((p) => p.identifier === id) ?? products[0];
      if (!product) return false;
      const { customerInfo } = await Purchases.purchaseStoreProduct(product);
      return customerInfo.allPurchasedProductIdentifiers.includes(id);
    } catch (e: unknown) {
      // Achat annulé par l'utilisateur → simplement « non acheté », pas une erreur.
      if (typeof e === 'object' && e && (e as { userCancelled?: boolean }).userCancelled) return false;
      throw e;
    }
  },

  async restore(): Promise<string[]> {
    const info = await Purchases.restorePurchases();
    return [...info.allPurchasedProductIdentifiers];
  },
};
