import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, SectionHeader, Txt } from '../../components/ui';
import { type DuelConfig, type Question, type Theme, THEME_META, THEMES } from '../../core/models';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from '../quiz/pool';

// Thèmes qui demandent un rendu spécial (image distante / audio) : exclus du duel.
const EXCLUDED_THEMES: Theme[] = ['images', 'blindtest'];

export function DuelConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const [pool, setPool] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allowPropositions, setAllowPropositions] = useState(true);

  useEffect(() => {
    let alive = true;
    void getQuizPool().then((p) => alive && setPool(p));
    return () => {
      alive = false;
    };
  }, []);

  // Univers présents dans le pool, groupés par thème (hors thèmes exclus).
  const universesByTheme = useMemo(() => {
    const byTheme = new Map<Theme, Set<string>>();
    for (const q of pool) {
      if (!q.universe || EXCLUDED_THEMES.includes(q.theme)) continue;
      let s = byTheme.get(q.theme);
      if (!s) {
        s = new Set<string>();
        byTheme.set(q.theme, s);
      }
      s.add(q.universe);
    }
    return THEMES.filter((t) => byTheme.has(t)).map((t) => ({
      theme: t,
      universes: [...byTheme.get(t)!].sort((a, b) => a.localeCompare(b, 'fr')),
    }));
  }, [pool]);

  const toggle = (u: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(u)) n.delete(u);
      else n.add(u);
      return n;
    });
  const toggleTheme = (universes: string[]) =>
    setSelected((prev) => {
      const n = new Set(prev);
      const allIn = universes.every((u) => n.has(u));
      for (const u of universes) allIn ? n.delete(u) : n.add(u);
      return n;
    });

  const eligibleCount = useMemo(
    () => pool.filter((q) => q.universe !== undefined && selected.has(q.universe)).length,
    [pool, selected],
  );

  const valid = players.length >= 2 && selected.size >= 1;
  const launch = () => onStart({ universes: [...selected], allowPropositions } satisfies DuelConfig);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">⚔️ Duel — élimination</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Chacun son tour, sur les univers choisis. La difficulté monte pour chaque joueur : 3 faciles,
          3 moyennes, 2 dures, puis tout le reste en pro. Une mauvaise réponse élimine. Dernier debout gagne !
        </Txt>
      </Card>

      <SectionHeader title="Univers du duel" />
      <Txt faint size={fontSize.xs}>
        {selected.size} univers choisi{selected.size > 1 ? 's' : ''} · {eligibleCount} question
        {eligibleCount > 1 ? 's' : ''}
      </Txt>

      {universesByTheme.map(({ theme, universes }) => {
        const allIn = universes.every((u) => selected.has(u));
        return (
          <View key={theme} style={{ marginBottom: spacing(1) }}>
            <Chip
              label={`${allIn ? '✓ ' : ''}${THEME_META[theme].label.toUpperCase()}`}
              emoji={THEME_META[theme].emoji}
              selected={allIn}
              onPress={() => toggleTheme(universes)}
            />
            <View style={[styles.wrap, { marginTop: spacing(0.75) }]}>
              {universes.map((u) => (
                <Chip key={u} label={u} selected={selected.has(u)} onPress={() => toggle(u)} />
              ))}
            </View>
          </View>
        );
      })}

      <SectionHeader title="Aide" />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Autoriser les propositions 🔎</Txt>
            <Txt faint size={fontSize.xs}>Si activé, chaque joueur peut demander 4 puis 2 propositions.</Txt>
          </View>
          <Switch
            value={allowPropositions}
            onValueChange={setAllowPropositions}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      <View style={{ height: spacing(1) }} />
      <Button title="Lancer le duel" emoji="⚔️" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          {players.length < 2 ? 'Il faut au moins 2 joueurs pour un duel.' : 'Choisis au moins un univers.'}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) },
});
