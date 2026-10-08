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

> ✅ **Le code est DÉJÀ FAIT** (Parties 1 à 6) : les libs sont installées, et
> `src/store/config.ts`, `billing.rc.ts`, `ads.admob.ts`, le plugin AdMob dans
> `app.json` et le branchement dans `StoreProvider.tsx` sont en place. **Tu n'as
> pas de code à écrire.** Il te reste, en résumé :
> 1. créer les comptes (Partie 0) + ton **profil de paiement** (Partie 13-A) ;
> 2. créer les **8 produits** (Partie 7) et configurer **RevenueCat**/**AdMob**
>    (Parties 8-9) ;
> 3. coller tes clés dans **`src/store/config.ts`** (`REVENUECAT_ANDROID_KEY`,
>    `ADMOB_INTERSTITIAL_UNIT_ID`) + ton **App ID AdMob** dans `app.json`
>    (remplace l'ID de test `…~3347511713`) ;
> 4. passer **`USE_REAL_BILLING`** et **`USE_REAL_ADS`** à `true` dans
>    `src/store/config.ts` ;
> 5. remplir la **conformité** (Partie 13) et **publier** (Parties 10-12).
>
> Tant que les deux interrupteurs sont à `false`, l'app tourne sur le simulateur
> (aucun paiement réel) — pratique pour continuer à développer sans rien casser.

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
(obtenus en Partie 9). **Déjà fait dans le dépôt** avec l'ID de **test** — tu n'as
qu'à remplacer par ton vrai App ID. L'`androidAppId` se passe **dans les options
du plugin** (pas dans une clé séparée), sinon le SDK AdMob plante au démarrage.

```jsonc
{
  "expo": {
    // …tout le reste inchangé…
    "plugins": [
      "expo-sqlite",
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-3940256099942544~3347511713",
          "iosAppId": "ca-app-pub-3940256099942544~1458002511"
        }
      ]
    ]
  }
}
```

> `ca-app-pub-3940256099942544~3347511713` est l'**App ID de TEST** officiel
> d'AdMob (Android) : parfait pour développer. Tu le remplaceras par le tien avant
> la publication finale (Partie 9).

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
   Crée les **8 produits** avec **exactement** ces identifiants et ces prix :

   | ID du produit         | Prix   |
   |-----------------------|--------|
   | `all_themes`          | 1,99 € |
   | `all_modes`           | 1,99 € |
   | `unlimited_profiles`  | 1,99 € |
   | `all_stats`           | 1,99 € |
   | `all_achievements`    | 1,99 € |
   | `no_ads`              | 0,99 € |
   | `cancellable`         | 1,99 € |
   | `unlock_all`          | 4,99 € |

   Type : **produit géré** (achat unique, non consommable). **Active** chaque produit.
   *(La source de vérité est `src/store/products.ts` : si tu ajoutes un produit là,
   crée-le aussi ici avec le même identifiant.)*
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

| Fichier                     | État                                              |
|-----------------------------|---------------------------------------------------|
| `app.json`                  | ✅ plugin AdMob + `androidAppId` (ID de **test**) — remplace par le tien |
| `src/store/config.ts`       | ✅ créé — **colle tes clés** + passe les flags à `true` |
| `src/store/billing.rc.ts`   | ✅ créé — achats RevenueCat (rien à faire)        |
| `src/store/ads.admob.ts`    | ✅ créé — interstitiel AdMob (rien à faire)       |
| `src/store/StoreProvider.tsx` | ✅ branché (init + bascule simulateur/réel)     |
| `eas.json`                  | ✅ build `production` en AAB                       |
| `webform/privacy.html`      | ✅ politique de confidentialité — **mets ton email** |

Rien d'autre ne change : blocages, boutique, onboarding et « 1re partie gratuite »
sont déjà en place.

---

## Partie 13 — OBLIGATOIRE : être payé, confidentialité, âge (souvent oublié)

Ces étapes se font dans la **Play Console** et font rejeter l'app si elles
manquent. À faire **en parallèle** des Parties 7–12.

### A. Profil de paiement marchand (pour RECEVOIR l'argent)

Vendre des achats intégrés exige un **profil de paiement** (sinon les achats
sont impossibles et tu n'es pas payé).
Play Console → **Paramètres → Profil de paiement → Créer un profil de paiement** :
renseigne ton **adresse**, tes **coordonnées bancaires** (IBAN) et tes
**informations fiscales**. À faire une seule fois, tôt dans le processus.

### B. Politique de confidentialité (URL obligatoire, surtout avec AdMob)

Une URL publique de politique de confidentialité est **exigée**. Elle est déjà
prête dans le dépôt : **`webform/privacy.html`**, publiée automatiquement sur
GitHub Pages (même workflow que le formulaire de profil).

1. Ouvre `webform/privacy.html` et remplace `[REMPLACE-PAR-TON-EMAIL]` /
   `[REPLACE-WITH-YOUR-EMAIL]` par une adresse de contact (idéalement **dédiée**,
   pas ton mail perso — elle sera publique).
2. Pousse : la page sera en ligne à
   `https://chiyanoyuuki.github.io/CancellableGame/privacy.html`
   (vérifie l'URL exacte dans **Settings → Pages**).
3. Play Console → **Contenu de l'application → Politique de confidentialité** :
   colle cette URL.

### C. Classification du contenu (questionnaire IARC)

Play Console → **Contenu de l'application → Classification du contenu**. Réponds
**honnêtement** : l'app contient de l'**humour adulte**, des **références
sexuelles** et à l'**alcool** (défis / tu préfères / qui de nous, mode gorgées).
→ L'app sera classée **adultes / 18+ (PEGI 18)**. C'est voulu et autorisé ; mal
classer une app = retrait.

### D. Public cible & contenu

Play Console → **Contenu de l'application → Public cible et contenu** : choisis
**uniquement « 18 ans et plus »**. Ne rejoins **pas** le programme « Conçu pour
les familles ». La fiche (titre, captures, description) ne doit pas viser les
enfants.

### E. Sécurité des données (Data safety)

Play Console → **Contenu de l'application → Sécurité des données**. À déclarer :
- Données de jeu (profils, scores) : stockées **sur l'appareil**, **non
  collectées** au sens Google (rien n'est transmis).
- **Identifiant publicitaire** : *collecté* par AdMob pour la publicité (coche
  « Publicité ou marketing »). **Si tu publies sans pub, ne le déclare pas.**
- **Achats** : traités par Google Play (pas besoin de les re-déclarer comme
  collecte de ta part).
- Coche **« Les données sont chiffrées en transit »** et propose un moyen de
  demander la suppression (ici : désinstaller l'app, car tout est local).

### F. Déclaration « Annonces »

Play Console → **Contenu de l'application → Annonces** : réponds **« Oui, mon
application contient des annonces »** (si tu actives AdMob).

### G. Format du build : AAB (pas APK)

Le Play Store exige un **Android App Bundle (.aab)** pour une nouvelle app. Le
profil `production` de `eas.json` est réglé sur **`app-bundle`** → `eas build
-p android --profile production` produit directement le bon fichier. (Le profil
`preview` reste en `apk` pour t'installer l'app à la main pendant les tests.)

### H. Signature (Play App Signing)

Avec EAS, la clé de signature est **gérée pour toi** (EAS Managed credentials) et
Google active **Play App Signing** au premier envoi. Tu n'as pas de keystore à
gérer à la main. Garde juste le même compte EAS/Google pour les mises à jour.

### Ordre conseillé (vue d'ensemble)

1. Compte Google Play (25 $) + **vérification d'identité** (1–2 j).
2. **Profil de paiement** (A) — pour pouvoir vendre.
3. Créer l'app ; remplir **Public cible 18+** (D), **Classification** (C),
   **Confidentialité** (B), **Data safety** (E), **Annonces** (F).
4. Coder les **vrais achats + pubs** (Parties 1–6) et brancher les clés
   (RevenueCat / AdMob, Parties 8–9).
5. **Build AAB** (Partie 10) + **1er envoi** sur la piste **Test interne**.
6. Créer les **6 produits** (Partie 7) — possible seulement après ce 1er envoi.
7. **Tester** achats + pubs avec un compte testeur (Partie 11).
8. **Production → release** → examen Google (quelques heures à quelques jours).

> État actuel du code : l'intégration **RevenueCat + AdMob est déjà écrite et
> branchée**, mais **désactivée** (`USE_REAL_BILLING` / `USE_REAL_ADS` à `false`
> dans `src/store/config.ts`) → c'est encore le simulateur. Passe les deux à
> `true` une fois tes clés collées et tes produits créés : c'est l'étape qui
> « lie » réellement les paiements.

