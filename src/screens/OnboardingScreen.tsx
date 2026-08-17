import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Chip, Txt } from '../components/ui';
import { type Question, type Theme, THEME_META, THEMES } from '../core/models';
import { shuffle } from '../core/rng';
import { getQuizPool } from '../games/quiz/pool';
import { useT } from '../lib/i18nProvider';
import { FREE_UNIVERSE_COUNT } from '../store/products';
import { colors, fontSize, radius, spacing } from '../theme/theme';

/**
 * Premier lancement : l'utilisateur choisit FREE_UNIVERSE_COUNT univers gratuits.
 * Les autres restent visibles mais verrouillés jusqu'à l'achat « Tous les thèmes ».
 */
export function OnboardingScreen({ onDone }: { onDone: (universes: string[]) => void | Promise<void> }) {
  const t = useT();
  const [pool, setPool] = useState<Question[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    void getQuizPool().then((p) => alive && setPool(p));
    return () => {
      alive = false;
    };
  }, []);

  // Catégories (univers ou « #thème ») groupées par thème, comme l'écran Joueurs.
  const categoriesByTheme = useMemo(() => {
    const univ = new Map<Theme, Set<string>>();
    const bare = new Set<Theme>();
    const present = new Set<Theme>();
    for (const q of pool) {
      present.add(q.theme);
      if (q.universe) {
        let s = univ.get(q.theme);
        if (!s) {
          s = new Set<string>();
          univ.set(q.theme, s);
        }
        s.add(q.universe);
      } else {
        bare.add(q.theme);
      }
    }
    return THEMES.filter((t) => present.has(t))
      .map((t) => {
        const us = univ.get(t);
        const items = us
          ? [...us].sort((a, b) => a.localeCompare(b, 'fr')).map((u) => ({ key: u, label: u }))
          : [];
        if (items.length === 0 && bare.has(t)) items.push({ key: `#${t}`, label: THEME_META[t].label });
        return { theme: t, items };
      })
      .filter((g) => g.items.length > 0);
  }, [pool]);

  const allKeys = useMemo(
    () => categoriesByTheme.flatMap((g) => g.items.map((it) => it.key)),
    [categoriesByTheme],
  );

  const LIMIT = FREE_UNIVERSE_COUNT;
  const atLimit = sel.size >= LIMIT;

  const toggle = (k: string) =>
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k);
      else if (n.size < LIMIT) n.add(k);
      return n;
    });

  const randomFill = () => setSel(new Set(shuffle([...allKeys], Math.random).slice(0, LIMIT)));

  const finish = async () => {
    setSaving(true);
    await onDone([...sel]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Txt size={fontSize.xxl} weight="900">
          {t('Bienvenue 👋')}
        </Txt>
        <Txt dim style={{ marginTop: spacing(0.5) }}>
          {t(
            'Choisis {n} univers à jouer gratuitement. Les autres restent visibles mais verrouillés — tu pourras tout débloquer plus tard dans la Boutique.',
            { n: LIMIT },
          )}
        </Txt>
        <View style={styles.counter}>
          <Txt weight="900" size={fontSize.lg} color={atLimit ? colors.success : colors.primary}>
            {sel.size} / {LIMIT}
          </Txt>
          <Txt dim size={fontSize.sm} style={{ flex: 1 }}>
            {atLimit ? t('Parfait ! Tu peux commencer.') : t('univers sélectionnés')}
          </Txt>
          <Button title={t('🎲 Au hasard')} size="sm" variant="secondary" onPress={randomFill} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {categoriesByTheme.map(({ theme, items }) => (
          <View key={theme} style={{ marginBottom: spacing(1.5) }}>
            <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.75) }}>
              {THEME_META[theme].emoji} {t(THEME_META[theme].label).toUpperCase()}
            </Txt>
            <View style={styles.wrap}>
              {items.map((it) => {
                const on = sel.has(it.key);
                // Un univers garde son nom (contenu) ; un thème « #… » est traduit.
                const label = it.key.startsWith('#') ? t(it.label) : it.label;
                return <Chip key={it.key} label={label} selected={on} onPress={() => toggle(it.key)} />;
              })}
            </View>
          </View>
        ))}
        <View style={{ height: spacing(2) }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={sel.size === LIMIT ? t('Commencer 🎉') : t('Choisis encore {n} univers', { n: LIMIT - sel.size })}
          size="lg"
          disabled={sel.size !== LIMIT || saving}
          loading={saving}
          onPress={() => void finish()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing(2.5), paddingTop: spacing(1) },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    marginTop: spacing(1.5),
    padding: spacing(1.5),
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  body: { paddingHorizontal: spacing(2.5), paddingTop: spacing(1.5) },
  footer: { padding: spacing(2.5), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
});
