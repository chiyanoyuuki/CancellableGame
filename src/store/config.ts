/**
 * Clés et interrupteurs de monétisation (production).
 *
 * MARCHE À SUIVRE (toi) :
 *  1. REVENUECAT_ANDROID_KEY : RevenueCat → Project → API keys → clé publique
 *     Android (commence par « goog_ »).
 *  2. ADMOB_INTERSTITIAL_UNIT_ID : AdMob → ton app → Blocs d'annonces →
 *     interstitiel (« ca-app-pub-…/… »). L'App ID (« …~… ») va, lui, dans app.json.
 *  3. Passe USE_REAL_BILLING / USE_REAL_ADS à true UNE FOIS tes clés collées et
 *     tes 8 produits créés dans la Play Console + RevenueCat. Avant ça, laisse-les
 *     à false : l'app utilise le simulateur et rien ne casse.
 *
 * Tout le reste du code (billing.rc.ts, ads.admob.ts, StoreProvider) est déjà
 * branché : tu n'as que ces 4 valeurs à changer, puis à recompiler avec EAS.
 */

export const REVENUECAT_ANDROID_KEY = 'goog_XXXXXXXXXXXXXXXXXXXXXXXX';

export const ADMOB_INTERSTITIAL_UNIT_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY';

/** Vrais achats (RevenueCat → Google Play) au lieu du simulateur. */
export const USE_REAL_BILLING = false;

/** Vraies pubs interstitielles (AdMob) au lieu de l'écran simulé. */
export const USE_REAL_ADS = false;
