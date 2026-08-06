# Publier Cancellable sur le Play Store — achats & pubs réels (pas à pas)

Ce guide remplace le **simulateur** (voir `MONETISATION.md`) par les **vrais**
achats (RevenueCat → Google Play Billing) et les **vraies** pubs (AdMob). Toute
la logique de l'app est déjà prête : tu n'ajoutes que la « plomberie » native et
tu colles tes clés.

> ⚠️ Les achats et pubs **ne fonctionnent PAS dans Expo Go** : il faut un
> *development build* ou un build de production **EAS**. Fais tout ce guide sur
> ton ordinateur (macOS/Windows/Linux) avec Node installé.

- Package de l'app (à ne **jamais** changer) : `com.soireegames.party`
- Choix techniques : **RevenueCat** (`react-native-purchases`) pour les achats,
  **`react-native-google-mobile-ads`** pour les pubs.

---

## Partie 0 — Comptes à créer (une fois)

1. **Compte développeur Google Play** — https://play.google.com/console — frais
   uniques de **25 $**. Validation d'identité : compte 1 à 2 jours.
2. **Compte AdMob** (gratuit) — https://admob.google.com — pour les pubs.
3. **Compte RevenueCat** (gratuit jusqu'à un gros chiffre d'affaires) —
   https://www.revenuecat.com — simplifie énormément les achats.
4. **Compte Expo / EAS** (gratuit) — https://expo.dev — pour compiler l'app.
   Installe l'outil : `npm install -g eas-cli` puis `eas login`.

---

## Partie 1 — Installer les dépendances

Dans le dossier du projet :

```bash
npx expo install react-native-purchases
npx expo install react-native-google-mobile-ads
```

> `npx expo install` choisit les versions compatibles avec Expo SDK 53.

---

## Partie 2 — Configurer `app.json`

Ajoute la config AdMob et le plugin. Remplace les identifiants par les tiens
(obtenus en Partie 7). Tu peux mettre des ID de test au début.

```jsonc
{
  "expo": {
    // …tout le reste inchangé…
    "plugins": [
      "expo-sqlite",
      "react-native-google-mobile-ads"
    ],
    "react-native-google-mobile-ads": {
      "androidAppId": "ca-app-pub-3940256099942544~3347511713"
    }
  }
}
```

> `ca-app-pub-3940256099942544~3347511713` est l'**App ID de TEST** officiel
> d'AdMob : parfait pour développer. Tu le remplaceras par le tien avant la
> publication finale.

À chaque changement de plugin/config native, il faut **re-builder** (Partie 8) —
un simple rechargement JS ne suffit pas.

---

## Partie 3 — Tes clés au même endroit

Crée **`src/store/config.ts`** :

```ts
/**
 * Clés de monétisation. Récupérées dans les tableaux de bord :
 *  - REVENUECAT_ANDROID_KEY : RevenueCat → Project → API keys → « Public app-specific » (Android), commence par « goog_ ».
 *  - ADMOB_INTERSTITIAL_UNIT_ID : AdMob → ton app → Blocs d'annonces → interstitiel.
 */
export const REVENUECAT_ANDROID_KEY = 'goog_XXXXXXXXXXXXXXXXXXXXXXXX';

// ID de bloc interstitiel. En développement on force l'ID de TEST (voir ads.admob.ts).
export const ADMOB_INTERSTITIAL_UNIT_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY';
```

---

## Partie 4 — Le vrai code des achats (RevenueCat)

Crée **`src/store/billing.rc.ts`** :

```ts
import Purchases from 'react-native-purchases';

import type { BillingProvider } from './billing';
import { REVENUECAT_ANDROID_KEY } from './config';
import type { ProductId } from './products';

let configured = false;

/** À appeler une fois au démarrage (avant tout achat). */
export async function initRevenueCat(): Promise<void> {
  if (configured) return;
  Purchases.configure({ apiKey: REVENUECAT_ANDROID_KEY });
  configured = true;
}

/** Implémentation réelle de l'interface BillingProvider (cf. billing.ts). */
export const rcBilling: BillingProvider = {
  async purchase(id: ProductId): Promise<boolean> {
    try {
      const products = await Purchases.getProducts([id]);
      const product = products.find((p) => p.identifier === id) ?? products[0];
      if (!product) return false;
      const { customerInfo } = await Purchases.purchaseStoreProduct(product);
      return customerInfo.allPurchasedProductIdentifiers.includes(id);
    } catch (e: unknown) {
      // Achat annulé par l'utilisateur → simplement « non acheté ».
      if (typeof e === 'object' && e && (e as { userCancelled?: boolean }).userCancelled) return false;
      throw e;
    }
  },

  async restore(): Promise<string[]> {
    const info = await Purchases.restorePurchases();
    return [...info.allPurchasedProductIdentifiers];
  },
};
```

> Les identifiants de produits (`all_themes`, `no_ads`, `unlock_all`, …) sont
> ceux de `src/store/products.ts` : ce sont **exactement** les mêmes chaînes que
> tu créeras dans la Play Console et RevenueCat.

---

## Partie 5 — Le vrai code des pubs (AdMob)

Crée **`src/store/ads.admob.ts`** :

```ts
import mobileAds, { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

import { ADMOB_INTERSTITIAL_UNIT_ID } from './config';

// En dev, on utilise TOUJOURS l'ID de test (obligatoire : sinon risque de bannissement AdMob).
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
```

---

## Partie 6 — Brancher le tout dans `StoreProvider.tsx`

Trois petites modifications dans **`src/store/StoreProvider.tsx`**.

**1) Imports** — ajoute en haut :

```ts
import { rcBilling, initRevenueCat } from './billing.rc';
import { initAdmob, showAdmobInterstitial } from './ads.admob';
```

**2) Initialisation** — dans le `useEffect(() => { … }, [])` de chargement
(celui qui appelle `loadOwned()`), ajoute au début du bloc `async` :

```ts
      try {
        await initRevenueCat();
        await initAdmob();
      } catch (e) {
        console.warn('Monétisation indisponible (build sans SDK ?)', e);
      }
```

**3) Utiliser le vrai fournisseur** — remplace les deux appels au simulateur :

```ts
// dans purchase() :  const ok = await localBilling.purchase(id);
const ok = await rcBilling.purchase(id);

// dans restore() :   const ids = await localBilling.restore();
const ids = await rcBilling.restore();
```

**4) Vraie pub** — remplace le corps de `showInterstitial` par :

```ts
  const showInterstitial = useCallback(
    () =>
      showAdmobInterstitial().catch(
        () =>
          new Promise<void>((resolve) => {
            adResolver.current = resolve;
            setAdVisible(true); // repli sur l'écran simulé si AdMob échoue
          }),
      ),
    [],
  );
```

Tu peux garder l'écran simulé `<InterstitialAd>` (repli) ou le supprimer une fois
AdMob validé. Le reste de l'app (blocages, boutique, « 1re partie gratuite »)
ne change pas.

> Astuce dev : tu peux importer `localBilling` tant que RevenueCat n'est pas
> configuré, et basculer sur `rcBilling` une fois tes produits créés.

---

## Partie 7 — Créer les produits dans la Play Console

1. Va sur https://play.google.com/console → **Créer une application**
   (nom « Cancellable », gratuite).
2. Fais d'abord un **premier upload** (Partie 8) : Google exige un build signé
   présent avant d'activer les achats intégrés.
3. **Monétiser → Produits → Produits intégrés à l'application → Créer un produit.**
   Crée les **6 produits** avec **exactement** ces identifiants et ces prix :

   | ID du produit         | Prix   |
   |-----------------------|--------|
   | `all_themes`          | 1,99 € |
   | `all_modes`           | 1,99 € |
   | `unlimited_profiles`  | 1,99 € |
   | `all_stats`           | 1,99 € |
   | `no_ads`              | 0,99 € |
   | `unlock_all`          | 4,99 € |

   Type : **produit géré** (achat unique, non consommable). **Active** chaque produit.
4. **Configuration → Test de licence** : ajoute ton adresse Gmail comme testeur
   (achats gratuits pendant les tests).

---

## Partie 8 — Configurer RevenueCat

1. Sur https://app.revenuecat.com → **Create Project**.
2. **Add app → Play Store** : renseigne le package `com.soireegames.party`.
3. RevenueCat te demande un **Service Account Google** (JSON) pour valider les
   achats : suis leur assistant (Play Console → Utilisateurs et autorisations →
   inviter le compte de service RevenueCat). Étape la plus technique, bien guidée
   par leur doc.
4. **Products** : importe / crée les 6 produits (mêmes IDs qu'en Partie 7).
   *(Optionnel : tu peux créer une « Offering », mais notre code lit directement
   les produits par ID, donc ce n'est pas obligatoire.)*
5. **API keys** → copie la clé **publique Android** (commence par `goog_`) et
   colle-la dans `REVENUECAT_ANDROID_KEY` (`src/store/config.ts`).

---

## Partie 9 — Configurer AdMob

1. Sur https://admob.google.com → **Apps → Add app → Android** → « oui, publiée »
   plus tard, ou « non » pour commencer. Lie le package `com.soireegames.party`.
2. Récupère l'**App ID** (`ca-app-pub-…~…`) → mets-le dans `app.json`
   (`androidAppId`, Partie 2).
3. **Ad units → Create → Interstitiel** → récupère l'**ID de bloc** (`ca-app-pub-…/…`)
   → mets-le dans `ADMOB_INTERSTITIAL_UNIT_ID` (`src/store/config.ts`).
4. Laisse le code utiliser `TestIds.INTERSTITIAL` en développement (déjà géré).

---

## Partie 10 — Compiler avec EAS

Ton `eas.json` est déjà prêt (profils `development`, `preview`, `production`).

```bash
# 1) Build de DEV pour tester achats + pubs sur ton téléphone (une fois)
eas build -p android --profile development
# installe l'APK/AAB sur ton appareil, puis :
npx expo start --dev-client

# 2) Build de PRODUCTION quand tout marche
eas build -p android --profile production
```

> Incrémente `android.versionCode` (app.json) à chaque nouvel envoi au Play
> Store (le profil `production` a `autoIncrement`, donc EAS s'en charge).

---

## Partie 11 — Tester

**Achats** (avec un compte testeur de licence de la Partie 7) :
- Ouvre la Boutique → achète un produit → vérifie que le contenu se débloque.
- Ferme/rouvre l'app → toujours débloqué (cache local).
- « Restaurer mes achats » sur un appareil neuf → tout revient.

**Pubs** (ID de test) :
- Lance une 1re partie → **pas** de pub.
- Lance une 2e partie → **pub** de test (« Test Ad »).
- Achète « Sans pub » (ou le pack 4,99 €) → **plus** de pub.

> N'utilise **jamais** tes vrais IDs AdMob pour tes propres tests : clique sur de
> vraies pubs = risque de suspension du compte. Toujours les `TestIds` en dev.

---

## Partie 12 — Publier

1. Play Console → **Test → Test interne** : crée une release, envoie l'AAB EAS,
   ajoute des testeurs (leurs Gmail), partage le lien d'opt-in.
2. Remplis la **fiche Play Store** (description, captures, icône), le
   **questionnaire de contenu**, la **confidentialité**, la **déclaration de
   données** (tu utilises AdMob → déclare la collecte publicitaire) et la
   **déclaration « Annonces »**.
3. Quand le test interne est concluant : **Production → Créer une release** →
   soumets pour examen (compte quelques heures à quelques jours).

Avant la prod, **remplace les IDs de test** par tes vrais IDs AdMob (`app.json`
`androidAppId` + `ADMOB_INTERSTITIAL_UNIT_ID`) — le code bascule automatiquement
hors `__DEV__`.

---

## Annexe — Dépannage

- **« Achat impossible / produit introuvable »** : le build doit être **signé et
  déjà envoyé** sur une piste (même interne), les produits **actifs**, et tu dois
  tester avec un **compte testeur de licence**. Le package doit correspondre.
- **La pub ne s'affiche pas** : normal si aucune n'est préchargée ; le code ne
  bloque pas la partie. Vérifie l'App ID AdMob dans `app.json` et re-build.
- **Ça marche pas dans Expo Go** : attendu. Utilise un *development build*
  (`eas build --profile development`).
- **RevenueCat renvoie 0 achat** : vérifie le Service Account Google et que les
  produits portent les mêmes IDs des deux côtés.
- **Après une mise à jour d'APK, les achats semblent perdus** : lance
  « Restaurer mes achats » ; ils reviennent depuis Google Play.

## Récapitulatif des fichiers touchés

| Fichier                     | Action                                   |
|-----------------------------|------------------------------------------|
| `app.json`                  | plugin + `androidAppId` AdMob            |
| `src/store/config.ts`       | **créer** — tes clés                     |
| `src/store/billing.rc.ts`   | **créer** — achats RevenueCat            |
| `src/store/ads.admob.ts`    | **créer** — interstitiel AdMob           |
| `src/store/StoreProvider.tsx` | 4 petites modifs (init + swap)         |

Rien d'autre ne change : blocages, boutique, onboarding et « 1re partie gratuite »
sont déjà en place.
