# Profil à distance — formulaire web des invités

Ce dossier contient **`profil.html`** : une page web autonome que les invités
ouvrent sur **leur** téléphone (dans le navigateur, sans installer l'appli) pour
remplir leur profil. La page génère un **QR code** que l'hôte scanne dans
l'appli pour importer le profil.

## Pourquoi c'est bien

- **Chacun remplit son profil en parallèle**, dans son coin, sans se passer le tel.
- **Aucune donnée ne transite par un serveur** : le profil voyage uniquement
  dans le QR code. Donc pas de base de données, pas de coût récurrent, et rien à
  déclarer côté RGPD.
- L'appli reste **uniquement sur le téléphone de l'hôte**.

## Le parcours complet

1. L'hôte ouvre « Ajouter des joueurs → Profil à distance » : l'appli affiche un
   **QR = le lien vers cette page**.
2. Chaque invité scanne ce QR (appareil photo) → la page s'ouvre dans son
   navigateur → il remplit **prénom, avatar, couleur** et, s'il veut, les
   **univers qu'il ne veut pas voir**.
3. Il touche « Générer mon QR code » → son téléphone affiche un QR.
4. L'hôte fait « Scanner un profil » dans l'appli et scanne le QR de l'invité →
   le profil est importé. On recommence pour chaque invité (le scan prend ~2 s).

## Héberger la page (une seule fois, gratuit)

La page est un simple fichier statique. Déposez `profil.html` sur n'importe quel
hébergement statique gratuit, par exemple :

- **Cloudflare Pages** ou **Netlify** : glissez-déposez le dossier `webform/`.
- **GitHub Pages** : activez Pages sur le dépôt et pointez sur ce dossier.

Vous obtenez une URL du type `https://vos-profils.pages.dev/profil.html`.
**Renseignez cette URL dans l'appli** (constante `REMOTE_PROFILE_URL`, voir
l'étape 2 de l'intégration) : c'est elle que le QR de l'hôte encodera.

> La page a besoin d'Internet uniquement pour se charger la première fois (elle
> récupère une petite librairie de génération de QR). Le profil, lui, ne quitte
> jamais le téléphone de l'invité : il est encodé localement dans le QR.

## Mettre à jour la liste des univers

La liste des univers proposés est figée dans `profil.html` au moment de sa
génération. Quand vous ajoutez de nouveaux univers au jeu, régénérez la page
pour que les invités puissent aussi les exclure (le catalogue provient de
`getUniverseGroups()` dans `src/games/quiz/questions/catalogue.ts`). Ce n'est
pas bloquant : un univers absent de la page reste simplement non exclu, et
l'import fonctionne quand même — les noms d'univers inconnus sont ignorés sans
casser le profil.

## Format du QR (pour info)

Le QR contient une simple chaîne de texte, lisible par `decodeProfile()` de
`src/core/profileCodec.ts` :

```
CANCELLABLE-PROFILE|1|{"n":"Sofiane","e":"🦊","c":"#7c5cff","u":["Naruto","La gauche"]}
```

Rien d'autre n'est transmis. Le contenu scanné est validé et borné à l'import.
