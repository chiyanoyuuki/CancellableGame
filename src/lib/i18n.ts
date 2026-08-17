/**
 * Cœur i18n — sans dépendance React ni base de données, donc importable partout
 * (y compris dans `core/`, testé sous jest).
 *
 * Principe : les chaînes SOURCE sont en français et servent de clés. La table
 * `EN` ne contient que les traductions anglaises. Une chaîne non encore traduite
 * retombe automatiquement sur le français, si bien que l'app reste toujours
 * cohérente pendant que la couverture anglaise se complète, vague par vague.
 *
 * Les questions du quiz ne passent PAS par ici : ce sont du contenu français.
 */
import { EN } from './translations';

export type Lang = 'fr' | 'en';

// Langue courante, miroir de celle du provider React. Permet à `t()` d'être
// appelée depuis du code hors composant (modules de données) tout en restant
// synchronisée avec le choix de l'utilisateur.
let _lang: Lang = 'fr';

export function currentLang(): Lang {
  return _lang;
}

export function setModuleLang(l: Lang): void {
  _lang = l;
}

/** Remplace les gabarits `{clef}` par les valeurs fournies. */
function interpolate(s: string, params?: Record<string, string | number>): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_m, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

/**
 * Traduit une chaîne source française vers la langue active.
 * @param fr     Chaîne française (clé de traduction).
 * @param params Valeurs d'interpolation pour les gabarits `{clef}`.
 * @param lang   Force une langue (par défaut : la langue courante du module).
 */
export function t(fr: string, params?: Record<string, string | number>, lang: Lang = _lang): string {
  const base = lang === 'en' ? EN[fr] ?? fr : fr;
  return interpolate(base, params);
}

/**
 * Devine la langue de l'appareil : anglais si l'OS est en anglais, français
 * sinon (le contenu du jeu étant français, c'est le repli le plus naturel).
 */
export function detectDeviceLang(): Lang {
  try {
    const loc =
      (typeof Intl !== 'undefined' && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().locale) || '';
    return /^en\b/i.test(loc) ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}
