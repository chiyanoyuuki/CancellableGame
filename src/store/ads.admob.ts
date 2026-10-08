/**
 * Implémentation RÉELLE des pubs : interstitiel Google AdMob.
 *
 * Activée seulement quand `USE_REAL_ADS` est à true (voir config.ts et
 * StoreProvider). En développement (__DEV__), on force TOUJOURS l'ID de TEST
 * d'AdMob : cliquer sur de vraies pubs pendant les tests peut faire bannir le
 * compte AdMob.
 */
import mobileAds, { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

import { ADMOB_INTERSTITIAL_UNIT_ID } from './config';

const UNIT_ID = __DEV__ ? TestIds.INTERSTITIAL : ADMOB_INTERSTITIAL_UNIT_ID;

let interstitial: InterstitialAd | null = null;
let loaded = false;

function preload(): void {
  loaded = false;
  interstitial = InterstitialAd.createForAdRequest(UNIT_ID, { requestNonPersonalizedAdsOnly: true });
  const unsub = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
    unsub();
  });
  interstitial.load();
}

/** À appeler une fois au démarrage : initialise le SDK et précharge une pub. */
export async function initAdmob(): Promise<void> {
  await mobileAds().initialize();
  preload();
}

/**
 * Affiche l'interstitiel et se résout quand il se ferme. Si aucune pub n'est
 * prête, on NE bloque PAS la partie (on relance juste un préchargement).
 */
export function showAdmobInterstitial(): Promise<void> {
  return new Promise((resolve) => {
    if (!interstitial || !loaded) {
      preload();
      resolve();
      return;
    }
    const done = () => {
      unsubClosed();
      unsubError();
      preload(); // recharge la suivante
      resolve();
    };
    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, done);
    const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, done);
    interstitial.show();
  });
}
