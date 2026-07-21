import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, SectionHeader, Txt } from '../../components/ui';
import { type DuelConfig, type DuelJoker, type Question, type Theme, THEME_META, THEMES } from '../../core/models';
import { shuffle } from '../../core/rng';
import { getPlayerChosenUniverses } from '../../db';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from '../quiz/pool';

// Thèmes qui demandent un rendu spécial (image distante / audio) : exclus du duel.
const EXCLUDED_THEMES: Theme[] = ['images', 'blindtest'];

const JOKER_META: { key: DuelJoker; label: string; desc: string }[] = [
  { key: 'props4', label: '🔎 4 propositions', desc: 'Révéler 4 propositions.' },
  { key: 'props2', label: '🔍 2 propositions', desc: 'Révéler 2 propositions.' },
  { key: 'playerHelp', label: "🆘 Aide d'un joueur", desc: "Demander l'aide d'un autre joueur." },
  { key: 'otherUniverse', label: '🔄 Autre univers', desc: "Obtenir une question d'un autre univers." },
];

export function DuelConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const [pool, setPool] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [chosenMap, setChosenMap] = useState<Record<string, string[]>>({});
  const [randomMode, setRandomMode] = useState(false);
  const [jokers, setJokers] = useState<Record<DuelJoker, boolean>>({
    props4: true,
    props2: true,
    playerHelp: true,
    otherUniverse: true,
  });

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [p, c] = await Promise.all([getQuizPool(), getPlayerChosenUniverses()]);
      if (alive) {
        setPool(p);
        setChosenMap(c);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Union des univers favoris des joueurs de cette partie.
  const favoritesUnion = useMemo(() => {
    const s = new Set<string>();
    for (const p of players) for (const u of chosenMap[p.id] ?? []) s.add(u);
    return s;
  }, [players, chosenMap]);

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

  const valid = players.length >= 2 && (randomMode ? favoritesUnion.size >= 1 : selected.size >= 1);
  const launch = () => {
    const universes = randomMode ? shuffle([...favoritesUnion], Math.random).slice(0, 10) : [...selected];
    onStart({ universes, jokers, randomFromProfiles: randomMode } satisfies DuelConfig);
  };

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
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">🎲 Univers aléatoires</Txt>
            <Txt faint size={fontSize.xs}>Tirés au hasard parmi les univers favoris des profils des joueurs.</Txt>
          </View>
          <Switch
            value={randomMode}
            onValueChange={setRandomMode}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      {randomMode ? (
        <Txt faint size={fontSize.xs}>
          {favoritesUnion.size > 0
            ? `${favoritesUnion.size} univers favori${favoritesUnion.size > 1 ? 's' : ''} dans les profils — quelques-uns seront tirés au hasard à chaque partie.`
            : "Aucun univers favori dans les profils. Ajoute-en dans l'écran Joueurs (⋯ → Univers favoris)."}
        </Txt>
      ) : (
        <Txt faint size={fontSize.xs}>
          {selected.size} univers choisi{selected.size > 1 ? 's' : ''} · {eligibleCount} question
          {eligibleCount > 1 ? 's' : ''}
        </Txt>
      )}

      {!randomMode &&
        universesByTheme.map(({ theme, universes }) => {
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

      <SectionHeader title="Jokers — un de chaque par joueur" />
      {JOKER_META.map(({ key, label, desc }) => (
        <Card key={key}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Txt weight="700">{label}</Txt>
              <Txt faint size={fontSize.xs}>{desc}</Txt>
            </View>
            <Switch
              value={jokers[key]}
              onValueChange={(v) => setJokers((jk) => ({ ...jk, [key]: v }))}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        </Card>
      ))}

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
