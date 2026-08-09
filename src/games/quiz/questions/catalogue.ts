import { THEME_META, THEMES, type Theme } from '../../../core/models';
import { QUESTIONS } from './index';

/**
 * Catalogue des univers jouables, groupés par thème. Source de vérité partagée :
 * l'app (écran profils, import) et le formulaire web des invités affichent la
 * même liste, dans le même ordre (thèmes dans l'ordre officiel, univers triés
 * par ordre alphabétique). Le thème « Image mystère » est exclu.
 */
export interface UniverseGroup {
  theme: Theme;
  label: string;
  emoji: string;
  universes: string[];
}

const EXCLUDED_THEMES: Theme[] = ['images'];

export function getUniverseGroups(): UniverseGroup[] {
  const byTheme = new Map<Theme, Set<string>>();
  for (const q of QUESTIONS) {
    if (!q.universe || EXCLUDED_THEMES.includes(q.theme)) continue;
    let set = byTheme.get(q.theme);
    if (!set) {
      set = new Set<string>();
      byTheme.set(q.theme, set);
    }
    set.add(q.universe);
  }
  return THEMES.filter((t) => byTheme.has(t)).map((t) => ({
    theme: t,
    label: THEME_META[t].label,
    emoji: THEME_META[t].emoji,
    universes: [...byTheme.get(t)!].sort((a, b) => a.localeCompare(b, 'fr')),
  }));
}

/** Liste à plat de tous les noms d'univers jouables, dans l'ordre du catalogue. */
export function getUniverseCatalogue(): string[] {
  return getUniverseGroups().flatMap((g) => g.universes);
}
