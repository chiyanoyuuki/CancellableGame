# 🎉 Soirée

Une appli mobile (Android) pour animer vos soirées entre amis : une collection
de **mini-jeux** reliés par un **système de statistiques commun** (par jeu, par
joueur, par soir / mois / année).

Le premier mini-jeu est un **quiz** (manga, jeux vidéo, séries, films, musique,
culture générale) avec gorgées à boire, modes de jeu variés, indices, et un
palmarès rigolo.

> Construite avec **Expo (React Native) + TypeScript**. Toute la logique de jeu
> et de stats est testée (`npm test`, 49 tests).

---

## 🚀 Démarrer en développement

```bash
npm install
# aligne les versions natives sur le SDK Expo installé (recommandé)
npx expo install --fix

# lancer le bundler ; ouvrez avec l'app Expo Go ou un émulateur
npx expo start
```

## 📦 Générer un APK

Le **plus simple** (build dans le cloud, aucune config Android locale, et la clé
de signature reste la même à chaque build — donc **les stats sont conservées**
d'une mise à jour à l'autre) :

```bash
npm i -g eas-cli
eas login
eas build -p android --profile preview   # produit un .apk téléchargeable
```

En **local** (nécessite Android Studio / le SDK Android) :

```bash
npx expo prebuild --platform android      # génère le dossier android/
cd android
./gradlew assembleRelease                 # APK signé release
# ou, plus rapide pour un usage perso :
./gradlew assembleDebug                    # APK signé avec la clé debug
# APK : android/app/build/outputs/apk/.../app-*.apk
```

> ⚠️ **Pour conserver les statistiques entre deux APK**, gardez toujours le
> **même `android.package`** (`com.soireegames.party`, dans `app.json`) **et la
> même clé de signature**. EAS s'en occupe tout seul ; en local, réutilisez le
> même keystore (la clé debug `~/.android/debug.keystore` est stable par machine).

---

## 💾 Où sont stockées les données ?

Tout est local, dans une base **SQLite** (`expo-sqlite`) rangée dans le sandbox
de l'application. Conséquence :

- ✅ Les stats **survivent à une mise à jour** (réinstallation d'un APK plus
  récent avec le même identifiant + même clé).
- ❌ Elles ne survivent **pas** à une désinstallation complète.

Filet de sécurité : **Réglages → Exporter une sauvegarde** crée un fichier JSON
que vous pouvez réimporter (nouveau téléphone, réinstallation…).

---

## 🧩 Architecture

```
src/
  core/      Logique pure, SANS React Native — 100% testée (jest)
             rng, scoring, drinks, questionSelection, quizEngine, stats
  db/        Persistance SQLite + migrations + dépôts + sauvegarde
  games/     Mini-jeux + registre
    quiz/    1er mini-jeu (config, jeu, banque de questions)
  components/ Primitives UI (Button, Card, …)
  screens/   Écrans (Accueil, Joueurs, Lobby, Stats, Réglages, …)
  theme/     Couleurs, espacements, polices
App.tsx      Navigation
```

**Idée clé :** chaque mini-jeu produit un `SessionResult` générique (points,
classement, gorgées, événements). La base et les stats ne connaissent que ce
format — c'est ce qui rend les statistiques **communes à tous les jeux** et
ventilables par période. Pour l'instant on ne lance **qu'un mini-jeu à la
fois** ; l'enchaînement aléatoire de plusieurs mini-jeux pourra être ajouté
plus tard sans toucher au stockage.

---

## ➕ Étendre le jeu

### Ajouter des questions / un thème de quiz
- **Questions** : éditez `src/games/quiz/questions.ts` (le format est documenté
  en haut du fichier).
- **Thème** : ajoutez-le à `THEMES` + `THEME_META` dans `src/core/models.ts`,
  puis taguez de nouvelles questions avec.

### Ajouter un mini-jeu
1. Créez deux composants : un de configuration (`MiniGameConfigProps`) et un de
   jeu (`MiniGamePlayProps`) — voir `src/games/types.ts`.
2. Le composant de jeu appelle `onFinish(result)` avec un `SessionResult`.
3. Enregistrez la définition dans `src/games/registry.ts`.

Rien d'autre à faire : sélection, stats et persistance sont génériques.

---

## 🛠️ Workflow patch

Le dépôt est conçu pour un travail par patchs (`git am`). Pour régénérer les
patchs à partir des commits de la branche :

```bash
git format-patch origin/main..claude/mobile-party-game-pacvqn
```

---

## ✅ Tests & vérifications

```bash
npm test            # logique de jeu et de stats (jest)
npm run typecheck   # vérification TypeScript de tout le projet
```
