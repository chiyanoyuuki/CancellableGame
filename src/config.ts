/**
 * Réglages d'intégration.
 *
 * REMOTE_PROFILE_URL : adresse publique du formulaire web de profil (le dossier
 * `webform/`, publié automatiquement sur GitHub Pages par
 * `.github/workflows/pages.yml`). C'est le lien encodé dans le QR que l'hôte
 * montre aux invités.
 *
 * ⚠️ Vérifiez l'URL EXACTE affichée dans GitHub → Settings → Pages après le
 * premier déploiement (la casse du nom de dépôt compte) et corrigez ici si
 * besoin. Format d'un site de projet : https://<utilisateur>.github.io/<dépôt>/
 */
export const REMOTE_PROFILE_URL = 'https://chiyanoyuuki.github.io/CancellableGame/';

/** Faux tant que l'URL n'a pas été personnalisée (garde-fou pour l'écran). */
export const REMOTE_PROFILE_CONFIGURED = !REMOTE_PROFILE_URL.includes('example');

/**
 * Version du formulaire web, ajoutée en `?v=` à l'URL encodée dans le QR de
 * l'hôte. Sert de « cache-buster » : une ancre `#r=` seule ne casse pas le
 * cache du navigateur de l'invité, donc sans ce paramètre un invité qui a déjà
 * ouvert l'ancienne page en garde une version périmée. À incrémenter à chaque
 * changement notable de `webform/index.html`.
 */
export const REMOTE_FORM_VERSION = 108;
