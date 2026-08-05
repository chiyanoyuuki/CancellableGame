# Monétisation — publicités & achats intégrés

Toute la **logique** (droits débloqués, blocages, boutique, écran de pub, onboarding)
est déjà en place et fonctionne avec un **simulateur local** : rien n'est facturé,
les achats sont mémorisés localement pour tester le parcours. Ce document décrit
ce qu'il reste à brancher pour passer en production sur le Play Store.

## Ce qui est déjà fait (dans l'app)

- **`src/store/products.ts`** — catalogue des 6 produits + dérivation des droits
  (module pur, testé dans `products.test.ts`).
- **`src/store/persistence.ts`** — cache local des achats (kv SQLite, conservé
  entre les mises à jour d'APK).
- **`src/store/billing.ts`** — interfaces `BillingProvider` / `AdsProvider` +
  **simulateur `localBilling`** (à remplacer).
- **`src/store/StoreProvider.tsx`** — contexte React (droits, achat, restauration,
  onboarding) + **interstitiel simulé** + logique « pub après la 1re partie ».
- **Écrans** : `OnboardingScreen` (choix des 20 univers gratuits au 1er lancement)
  et `StoreScreen` (Boutique).
- **Blocages** câblés partout : pub avant chaque partie après la première, 10
  profils max, Quiz seul gratuit, 20 univers gratuits, stats du soir seulement.

### Les 6 produits (identifiants à réutiliser tels quels dans la Play Console)

| Produit (ID)          | Prix    | Débloque                                        |
|-----------------------|---------|-------------------------------------------------|
| `all_themes`          | 1,99 €  | Tous les univers, actuels et futurs             |
| `all_modes`           | 1,99 €  | La Bombe, le Duel et les modes futurs           |
| `unlimited_profiles`  | 1,99 €  | Profils illimités (au-delà de 10)               |
| `all_stats`           | 1,99 €  | Stats mois / année / total                      |
| `no_ads`              | 0,99 €  | Suppression des publicités                      |
| `unlock_all`          | 4,99 €  | **Tout** ce qui précède, publicité comprise**   |

> Ce sont des achats **non consommables** (« one-time products » / « In-app products »
> non consommables), pas des abonnements.

## Étapes pour passer en production

### 1. Google Play Console

1. Créer l'application (garder le **même `android.package`** que les builds
   actuels, sinon les stats/achats repartent de zéro).
2. Dans **Monétiser → Produits intégrés**, créer les 6 produits avec **exactement**
   les identifiants du tableau ci-dessus, et fixer les prix.
3. Ajouter des **testeurs de licence** (Paramètres → Test de licence) pour tester
   les achats sans payer, et publier une piste de **test interne**.

### 2. Achats intégrés (remplacer le simulateur)

Option recommandée : **RevenueCat** (`react-native-purchases`, plugin config Expo,
le plus simple) ou **`react-native-iap`** directement.

1. `npx expo install react-native-purchases` (ou `react-native-iap`).
2. Ajouter le plugin dans `app.json` puis lancer un **build EAS** (les achats ne
   marchent pas dans Expo Go).
3. Dans **`src/store/billing.ts`**, remplacer `localBilling` par une implémentation
   réelle qui respecte l'interface `BillingProvider` :
   - `purchase(id)` → déclenche l'achat du produit `id` et renvoie `true` si confirmé.
   - `restore()` → renvoie les identifiants déjà possédés (achats restaurés).
   Le reste de l'app ne change pas (le `StoreProvider` met à jour les droits et le
   cache local automatiquement).
4. Afficher les **prix localisés** renvoyés par le store plutôt que les prix par
   défaut du catalogue (optionnel mais recommandé).
5. (Recommandé) Validation côté serveur des reçus pour la sécurité.

### 3. Publicités (remplacer l'interstitiel simulé)

1. Créer un compte **AdMob**, une app AdMob et une **unité interstitielle**.
2. `npx expo install react-native-google-mobile-ads`, configurer le plugin
   (App ID AdMob) dans `app.json`, puis **build EAS**.
3. Dans **`src/store/StoreProvider.tsx`**, remplacer le composant `InterstitialAd`
   (et la promesse `showInterstitial`) par un vrai interstitiel AdMob : précharger
   une pub, l'afficher dans `requestGameStart`, résoudre la promesse à sa fermeture.
   La règle « 1re partie gratuite, pub ensuite, sauf `no_ads` » est déjà en place.
4. Ajouter le **consentement (UMP / RGPD)** avant de charger des pubs en Europe.

### 4. Détails de comportement (déjà implémentés)

- La **1re partie** de chaque session est sans pub ; les suivantes affichent une
  pub, sauf si `no_ads` (ou `unlock_all`) est acheté.
- Le pack **`unlock_all` (4,99 €)** débloque tout **et** retire les pubs.
- Les **20 univers gratuits** sont choisis au 1er lancement ; les autres restent
  visibles mais grisés (Boutique → `all_themes` pour tout débloquer).
- Les droits sont mis en cache localement mais la **source de vérité** en
  production reste Google Play : `restore()` resynchronise.
