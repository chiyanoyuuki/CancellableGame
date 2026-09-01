import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Chip, Txt } from './ui';
import { normalizeSearch } from '../core/universePrefs';
import { type Question, type Theme, THEME_META, THEMES } from '../core/models';
import { getQuizPool } from '../games/quiz/pool';
import { useT } from '../lib/i18nProvider';
import { useStore } from '../store/StoreProvider';
import { colors, fontSize, radius, spacing } from '../theme/theme';

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
  const [showUniverses, setShowUniverses] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let alive = true;
    void getQuizPool().then((p) => alive && setPool(p));
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

  const q = normalizeSearch(search);
  const themeUniverses = (th: Theme) => {
    const list = [...(byTheme.groups.get(th) ?? [])].sort((a, b) => a.localeCompare(b, 'fr'));
    return q ? list.filter((u) => normalizeSearch(u).includes(q)) : list;
  };

  return (
    <View style={{ gap: spacing(1) }}>
      {/* Thèmes */}
      <View style={{ flexDirection: 'row', gap: spacing(1) }}>
        <Button size="sm" variant="ghost" title={t('Tout')} onPress={() => emitThemes(new Set(presentThemes))} />
        <Button size="sm" variant="ghost" title={t('Aucun')} onPress={() => props.onChange({ themes: [], excludedUniverses: props.value.excludedUniverses })} />
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

      {/* Univers précis (repliable) */}
      <Pressable onPress={() => setShowUniverses((v) => !v)}>
        <Txt weight="800" size={fontSize.sm} color={colors.primary} style={{ marginTop: spacing(0.5) }}>
          {t('Choisir des univers précis')} {showUniverses ? '▾' : '▸'}
        </Txt>
      </Pressable>

      {showUniverses && (
        <View style={{ gap: spacing(1) }}>
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder={t('Rechercher un univers…')}
            placeholderTextColor={colors.textFaint}
            autoCorrect={false}
          />
          {presentThemes
            .filter((th) => selectedThemes.has(th))
            .map((th) => {
              const universes = themeUniverses(th);
              if (universes.length === 0) return null;
              return (
                <View key={th} style={{ marginBottom: spacing(0.5) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(0.5) }}>
                    <Txt faint size={fontSize.xs} weight="800">
                      {THEME_META[th].emoji} {t(THEME_META[th].label).toUpperCase()}
                    </Txt>
                    <View style={{ flexDirection: 'row', gap: spacing(0.5) }}>
                      <Button size="sm" variant="ghost" title={t('tout')} onPress={() => bulkTheme(universes, false)} />
                      <Button size="sm" variant="ghost" title={t('rien')} onPress={() => bulkTheme(universes, true)} />
                    </View>
                  </View>
                  <View style={styles.wrap}>
                    {universes.map((u) => (
                      <Chip key={u} label={u} selected={!excluded.has(u)} onPress={() => toggleUniverse(u)} />
                    ))}
                  </View>
                </View>
              );
            })}
          <Txt faint size={fontSize.xs}>
            {t('Les univers décochés sont exclus. Un thème entièrement décoché ne sort plus.')}
          </Txt>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  search: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
  },
});
