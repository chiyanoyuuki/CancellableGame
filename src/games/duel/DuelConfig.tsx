import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, PlayerAvatar, SectionHeader, Txt } from '../../components/ui';
import { type DuelConfig, type Question, type Theme, THEME_META, THEMES } from '../../core/models';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from '../quiz/pool';

// Thèmes qui demandent un rendu spécial (image distante / audio) : exclus du duel.
const EXCLUDED_THEMES: Theme[] = ['images', 'blindtest'];

export function DuelConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const [pool, setPool] = useState<Question[]>([]);
  const [themesByPlayer, setThemesByPlayer] = useState<Record<string, Theme>>({});
  const [allowPropositions, setAllowPropositions] = useState(true);

  useEffect(() => {
    let alive = true;
    void getQuizPool().then((p) => alive && setPool(p));
    return () => {
      alive = false;
    };
  }, []);

  const availableThemes = useMemo(() => {
    const present = new Set<Theme>();
    for (const q of pool) present.add(q.theme);
    return THEMES.filter((t) => present.has(t) && !EXCLUDED_THEMES.includes(t));
  }, [pool]);

  // Défaut : chaque joueur reçoit un thème distinct, en tournant sur la liste.
  useEffect(() => {
    if (availableThemes.length === 0) return;
    setThemesByPlayer((prev) => {
      const next: Record<string, Theme> = {};
      players.forEach((p, i) => {
        const kept = prev[p.id];
        next[p.id] = kept && availableThemes.includes(kept) ? kept : (availableThemes[i % availableThemes.length] as Theme);
      });
      return next;
    });
  }, [players, availableThemes]);

  const setTheme = (pid: string, t: Theme) => setThemesByPlayer((m) => ({ ...m, [pid]: t }));

  const valid = players.length >= 2 && availableThemes.length > 0 && players.every((p) => themesByPlayer[p.id]);

  const launch = () => onStart({ themesByPlayer, allowPropositions } satisfies DuelConfig);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">⚔️ Duel — élimination</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Chacun son tour, chacun sur son thème. Les 2 premières questions sont faciles, puis 2 moyennes,
          2 dures, et tout le reste en pro. Une mauvaise réponse élimine le joueur. Dernier debout gagne !
        </Txt>
      </Card>

      <SectionHeader title="Le thème de chaque joueur" />
      {players.map((p) => (
        <Card key={p.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginBottom: spacing(1) }}>
            <PlayerAvatar emoji={p.emoji} color={p.color} size={28} />
            <Txt weight="800">{p.name}</Txt>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.wrap}>
              {availableThemes.map((t) => (
                <Chip
                  key={t}
                  label={THEME_META[t].label}
                  emoji={THEME_META[t].emoji}
                  selected={themesByPlayer[p.id] === t}
                  onPress={() => setTheme(p.id, t)}
                />
              ))}
            </View>
          </ScrollView>
        </Card>
      ))}

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
      {players.length < 2 && (
        <Txt faint size={fontSize.xs} center>
          Il faut au moins 2 joueurs pour un duel.
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: spacing(1) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) },
});
