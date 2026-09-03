import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Chip } from './ui';
import { UniversePickerModal } from './UniversePickerModal';
import { type Question, type Theme, THEME_META, THEMES } from '../core/models';
import { getQuizPool } from '../games/quiz/pool';
import { useT } from '../lib/i18nProvider';
import { useStore } from '../store/StoreProvider';
import { spacing } from '../theme/theme';

export interface ContentSelection {
  /** Thèmes en jeu ([] = tous). */
  themes: string[];
  /** Univers désactivés au sein des thèmes en jeu. */
  excludedUniverses: string[];
}

/**
 * Sélecteur de contenu réutilisable (thèmes ET univers), calqué sur celui du
 * quiz : chips de thèmes (défaut = tous) + une section repliable pour choisir
 * des univers précis (recherche, « tout / rien » par thème). Contrôlé : émet
 * { themes, excludedUniverses } que l'écran de jeu applique pour filtrer.
 */
export function ContentPicker(props: { value: ContentSelection; onChange: (v: ContentSelection) => void }) {
  const t = useT();
  const store = useStore();
  const [pool, setPool] = useState<Question[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    void getQuizPool()
      .then((p) => alive && setPool(p))
      .catch(() => {
        // Pool indisponible : on laisse la liste vide plutôt que de planter le
        // sélecteur (l'écran de config reste utilisable).
      });
    return () => {
      alive = false;
    };
  }, []);

  // Univers jouables groupés par thème (débloqués en version gratuite).
  const byTheme = useMemo(() => {
    const m = new Map<Theme, Set<string>>();
    const present = new Set<Theme>();
    for (const q of pool) {
      present.add(q.theme);
      if (!q.universe) continue;
      if (!store.ent.allThemes && !store.isUniverseUnlocked(q.universe)) continue;
      const s = m.get(q.theme) ?? new Set<string>();
      s.add(q.universe);
      m.set(q.theme, s);
    }
    return { present, groups: m };
  }, [pool, store]);

  const presentThemes = THEMES.filter((th) => byTheme.present.has(th));
  const selectedThemes = props.value.themes.length ? new Set(props.value.themes) : new Set<string>(presentThemes);
  const excluded = new Set(props.value.excludedUniverses);

  const emitThemes = (next: Set<string>) => {
    // Tous sélectionnés → on stocke [] (= tous), sinon la liste explicite.
    const all = presentThemes.every((th) => next.has(th));
    props.onChange({ themes: all ? [] : [...next], excludedUniverses: props.value.excludedUniverses });
  };
  const toggleTheme = (th: Theme) => {
    const next = new Set(selectedThemes);
    if (next.has(th)) next.delete(th);
    else next.add(th);
    emitThemes(next);
  };

  const setExcluded = (next: Set<string>) =>
    props.onChange({ themes: props.value.themes, excludedUniverses: [...next] });
  const toggleUniverse = (u: string) => {
    const next = new Set(excluded);
    if (next.has(u)) next.delete(u);
    else next.add(u);
    setExcluded(next);
  };
  const bulkTheme = (universes: string[], exclude: boolean) => {
    const next = new Set(excluded);
    for (const u of universes) {
      if (exclude) next.add(u);
      else next.delete(u);
    }
    setExcluded(next);
  };

  // Univers proposés dans la fenêtre : ceux des thèmes sélectionnés (déjà
  // filtrés aux univers débloqués par le memo `byTheme`).
  const modalGroups = presentThemes
    .filter((th) => selectedThemes.has(th))
    .map((th) => ({ theme: th, universes: [...(byTheme.groups.get(th) ?? [])].sort((a, b) => a.localeCompare(b, 'fr')) }))
    .filter((g) => g.universes.length > 0);
  const totalU = modalGroups.reduce((n, g) => n + g.universes.length, 0);
  const activeU = modalGroups.reduce((n, g) => n + g.universes.filter((u) => !excluded.has(u)).length, 0);

  return (
    <View style={{ gap: spacing(1) }}>
      {/* Thèmes */}
      <View style={{ flexDirection: 'row', gap: spacing(1) }}>
        <Button size="sm" variant="secondary" title={t('Tout')} onPress={() => emitThemes(new Set(presentThemes))} />
        <Button size="sm" variant="secondary" title={t('Aucun')} onPress={() => props.onChange({ themes: [], excludedUniverses: props.value.excludedUniverses })} />
      </View>
      <View style={styles.wrap}>
        {presentThemes.map((th) => (
          <Chip
            key={th}
            label={`${THEME_META[th].emoji} ${t(THEME_META[th].label)}`}
            selected={selectedThemes.has(th)}
            onPress={() => toggleTheme(th)}
          />
        ))}
      </View>

      {/* Univers précis : ouvre la fenêtre dédiée (thèmes → univers). */}
      {modalGroups.length > 0 && (
        <>
          <Button
            title={
              activeU === totalU
                ? t('Choisir les univers')
                : t('Choisir les univers ({n}/{total})', { n: activeU, total: totalU })
            }
            emoji="🎛️"
            size="sm"
            variant="secondary"
            onPress={() => setPickerOpen(true)}
          />
          <UniversePickerModal
            visible={pickerOpen}
            onClose={() => setPickerOpen(false)}
            groups={modalGroups}
            excluded={excluded}
            onToggle={toggleUniverse}
            onBulk={bulkTheme}
            isUnlocked={() => true}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
});
