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

Dans l'appli, l'écran « Profil à distance » propose **deux sortes de QR** :

- **Créer un profil** : un QR unique vers le formulaire **vierge**. Pour les
  nouveaux joueurs.
- **Mettre à jour un joueur** : un QR **par joueur** (touche un joueur pour
  l'afficher). Ce QR ne contient qu'**un seul** profil (nom, avatar, univers
  exclus, encodés dans l'ancre `#r=`) → petit et toujours scannable.

1. L'hôte montre (ou envoie une capture d')un QR à l'invité.
2. L'invité le scanne → la page s'ouvre dans son navigateur :
   - QR **créer** → formulaire vierge : il remplit **prénom, avatar, couleur** et,
     s'il veut, les **univers qu'il ne veut pas voir**.
   - QR **mettre à jour** → formulaire **déjà rempli** (bandeau « Mise à jour du
     profil de … ») : avatar et univers déjà exclus **pré-cochés**, il n'a plus
     qu'à ajuster.
3. Il touche « Générer mon QR code » → son téléphone affiche un QR retour.
4. L'hôte fait « Scanner un profil » et scanne ce QR → une **pop-up de
   validation** montre le nom + le nombre d'univers évités, puis le profil est
   créé (ou mis à jour s'il existe déjà). ~2 s par invité.

> Le formulaire accepte aussi un ancien lien « multi-profils » (`#r=` avec
> plusieurs profils) : il affiche alors une liste « Choisis ton profil ». Le lien
> par joueur (un seul profil) pré-remplit directement, sans étape de sélection.

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
