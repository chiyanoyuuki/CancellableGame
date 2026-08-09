/**
 * Réglages d'intégration à renseigner avant publication.
 *
 * REMOTE_PROFILE_URL : adresse publique du formulaire web de profil
 * (le fichier `webform/profil.html`, déposé sur un hébergement statique gratuit
 * — Cloudflare Pages, Netlify, GitHub Pages…). C'est le lien encodé dans le QR
 * que l'hôte montre aux invités pour qu'ils remplissent leur profil chacun de
 * leur côté. REMPLACEZ la valeur ci-dessous par votre URL après déploiement.
 */
export const REMOTE_PROFILE_URL = 'https://cancellable.example/profil.html';

/** Faux tant que l'URL n'a pas été personnalisée (garde-fou pour l'écran). */
export const REMOTE_PROFILE_CONFIGURED = !REMOTE_PROFILE_URL.includes('example');
