import { DevSettings } from 'react-native';

import { kvSetJSON } from '../db';
import { themeMode, type ThemeMode } from '../theme/theme';

/** Thème actif de la session en cours (résolu au démarrage dans theme.ts). */
export function currentThemeMode(): ThemeMode {
  return themeMode;
}

/**
 * Recharge le bundle JS pour que le nouveau thème soit pris en compte partout
 * (les `StyleSheet.create` de niveau module se réévaluent au redémarrage).
 * Ne fonctionne qu'avec le rechargeur de développement ; en build de
 * production, il faut relancer l'application manuellement. Renvoie true si un
 * rechargement a pu être déclenché.
 */
export function reloadApp(): boolean {
  try {
    if (typeof DevSettings?.reload === 'function') {
      DevSettings.reload();
      return true;
    }
  } catch {
    // pas de rechargeur disponible (build de prod)
  }
  return false;
}

/**
 * Enregistre le thème choisi. Le thème n'est appliqué qu'au (re)démarrage : on
 * tente un rechargement immédiat, sinon l'appli s'ouvrira dans le bon thème au
 * prochain lancement. Renvoie true si un rechargement immédiat a été déclenché.
 */
export async function setAppTheme(mode: ThemeMode): Promise<boolean> {
  await kvSetJSON('ui:theme', mode);
  return reloadApp();
}
