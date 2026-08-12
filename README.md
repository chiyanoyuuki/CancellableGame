# Profil à distance — formulaire web des invités

Ce dossier contient **`index.html`** : une page web autonome que les invités
ouvrent sur **leur** téléphone (dans le navigateur, sans installer l'appli) pour
remplir leur profil. La page génère un **QR code** que l'hôte scanne dans
l'appli pour importer le profil.

## Pourquoi c'est bien

- **Chacun remplit son profil en parallèle**, dans son coin, sans se passer le tel.
- **Aucune donnée ne transite par un serveur** : le profil voyage uniquement
  dans le QR code. Pas de base de données, pas de coût récurrent, rien à
  déclarer côté RGPD.
- L'appli reste **uniquement sur le téléphone de l'hôte**.

## Déploiement automatique (GitHub Pages)

Ce dossier est **publié tout seul sur GitHub Pages** par le workflow
`.github/workflows/pages.yml` : à chaque push qui modifie `webform/`, le site est
redéployé. Un seul push met donc à jour **le code de l'app ET la page web**.

**Réglage à faire une seule fois** (le dépôt doit être **public** — Pages est
gratuit sur les dépôts publics) :

1. Pousse une fois (le workflow crée la branche `gh-pages`).
2. GitHub → **Settings → Pages → Build and deployment → Source =
   « Deploy from a branch »**, puis **Branch = `gh-pages` / `/ (root)`**, Save.
3. Attends ~1 min : ton site est en ligne à
   `https://<utilisateur>.github.io/<dépôt>/`.
4. Vérifie l'URL exacte affichée sur cette page Settings → Pages et, si elle
   diffère, corrige `REMOTE_PROFILE_URL` dans `src/config.ts`.

> ⚠️ Rendre le dépôt public expose tout le code source. Avant de le faire,
> assure-toi de **ne jamais committer de secrets** (clés AdMob/RevenueCat,
> keystore…) : ils doivent rester dans les *Secrets* GitHub Actions, pas dans
> le code. (À ce stade, le dépôt n'en contient pas.)

## Le parcours complet

1. Dans l'appli : « Joueurs → Profil à distance (QR) » affiche le **QR = le lien**
   vers cette page. Ce lien embarque aussi la **liste des joueurs déjà
   enregistrés** (nom, avatar, univers exclus), dans son ancre `#r=`.
2. Chaque invité scanne ce QR → la page s'ouvre dans son navigateur. **S'il est
   déjà enregistré**, il touche son profil dans « Choisis ton profil » : prénom,
   avatar et **univers déjà exclus sont pré-cochés** (triés comme dans l'appli,
   les plus récents en premier au-delà de 20 exclusions). Sinon il remplit un
   nouveau profil : **prénom, avatar, couleur** et, s'il veut, les **univers
   qu'il ne veut pas voir**.
3. Il touche « Générer mon QR code » → son téléphone affiche un QR.
4. L'hôte fait « Scanner un profil » dans l'appli et scanne le QR de l'invité → une
   **pop-up de validation** montre le nom + le nombre d'univers évités, puis le
   profil est créé (ou mis à jour s'il existe déjà). ~2 s par invité.

> Le roster tient dans le QR de l'hôte tant qu'il reste raisonnable ; s'il y a
> beaucoup de joueurs avec beaucoup d'exclusions, les univers pré-cochés sont
> omis (les invités restent sélectionnables par leur nom) pour garder le QR
> facilement scannable.

## Mise à jour de la liste des univers

La liste des univers est figée dans `index.html` au moment de sa génération. Elle
est régénérée depuis `getUniverseGroups()`
(`src/games/quiz/questions/catalogue.ts`) : quand de nouveaux univers sont
ajoutés au jeu, `index.html` est mis à jour dans le même patch, et le prochain
push le redéploie automatiquement. Ce n'est jamais bloquant : un univers absent
de la page reste simplement non exclu, et l'import fonctionne quand même.

## Format du QR (pour info)

Le QR contient une simple chaîne de texte, lue par `decodeProfile()`
(`src/core/profileCodec.ts`) :

```
CANCELLABLE-PROFILE|1|{"n":"Sofiane","e":"🦊","c":"#7c5cff","u":["Naruto","La gauche"]}
```

Rien d'autre n'est transmis. Le contenu scanné est validé et borné à l'import.
