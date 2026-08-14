import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, HowToPlay, PlayerUnseenList, Segmented, SectionHeader, Txt } from '../../components/ui';
import { type DrinkIntensity, type DuelConfig, type DuelJoker, type Question, type Theme, THEME_META, THEMES } from '../../core/models';
import { countUnseenGroups, identityGroups, type QuestionHistory } from '../../core/questionSelection';
import { shuffle } from '../../core/rng';
import { getPlayerUnwantedUniverses, getQuestionHistoryByPlayer } from '../../db';
import { useStore } from '../../store/StoreProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from '../quiz/pool';

// Thèmes qui demandent un rendu spécial (image distante) : exclus du duel.
const EXCLUDED_THEMES: Theme[] = ['images'];

// Mode de choix des univers : manuel, tous les univers, ou tous ceux non exclus
// par les profils des joueurs de la partie.
type UniverseMode = 'manual' | 'all' | 'profiles';

const JOKER_META: { key: DuelJoker; label: string; desc: string }[] = [
  { key: 'props4', label: '🔎 4 propositions', desc: 'Révéler 4 propositions.' },
  { key: 'props2', label: '🔍 2 propositions', desc: 'Révéler 2 propositions.' },
  { key: 'playerHelp', label: "🆘 Aide d'un joueur", desc: "Demander l'aide d'un autre joueur." },
  { key: 'otherUniverse', label: '🔄 Autre univers', desc: "Obtenir une question d'un autre univers." },
];

export function DuelConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const store = useStore();
  const [pool, setPool] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [unwantedMap, setUnwantedMap] = useState<Record<string, string[]>>({});
  const [historyByPlayer, setHistoryByPlayer] = useState<Record<string, QuestionHistory>>({});
  const [mode, setMode] = useState<UniverseMode>('manual');
  const [jokers, setJokers] = useState<Record<DuelJoker, boolean>>({
    props4: true,
    props2: true,
    playerHelp: true,
    otherUniverse: true,
  });
  const [drinksEnabled, setDrinksEnabled] = useState(true);
  const [drinkIntensity, setDrinkIntensity] = useState<DrinkIntensity>('normal');

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [p, u, hbp] = await Promise.all([
        getQuizPool(),
        getPlayerUnwantedUniverses(),
        getQuestionHistoryByPlayer(),
      ]);
      if (alive) {
        setPool(p);
        setUnwantedMap(u);
        setHistoryByPlayer(hbp);
      }
    })();
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
    return THEMES.filter((t) => byTheme.has(t))
      .map((t) => ({
        theme: t,
        // Version gratuite : on ne propose que les univers débloqués.
        universes: [...byTheme.get(t)!]
          .filter((u) => store.isUniverseUnlocked(u))
          .sort((a, b) => a.localeCompare(b, 'fr')),
      }))
      .filter((g) => g.universes.length > 0);
  }, [pool, store]);

  // Tous les univers jouables du jeu (hors thèmes exclus).
  const allUniverses = useMemo(() => universesByTheme.flatMap((g) => g.universes), [universesByTheme]);

  // Univers « voulus » du groupe = tous ceux présents qu'AU MOINS un joueur n'a
  // pas mis dans ses non souhaités. Aucune liste de favoris : le souhaité est le
  // complément du non souhaité. On n'exclut donc qu'un univers rejeté par tous.
  const wantedUnion = useMemo(() => {
    const s = new Set<string>();
    for (const u of allUniverses) {
      if (players.some((p) => !(unwantedMap[p.id] ?? []).includes(u))) s.add(u);
    }
    return s;
  }, [allUniverses, players, unwantedMap]);

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

  const available =
    mode === 'manual' ? selected.size : mode === 'all' ? allUniverses.length : wantedUnion.size;
  const valid = players.length >= 2 && available >= 1;

  // Univers effectivement en jeu selon le mode choisi.
  const effectiveUniverses = useMemo(() => {
    if (mode === 'all') return new Set(allUniverses);
    if (mode === 'profiles') return wantedUnion;
    return selected;
  }, [mode, allUniverses, wantedUnion, selected]);

  // Inédites PAR JOUEUR sur les univers effectivement en jeu (historique propre à chacun).
  const unseenGroups = useMemo(
    () => identityGroups(pool.filter((q) => q.universe !== undefined && effectiveUniverses.has(q.universe))),
    [pool, effectiveUniverses],
  );
  const unseenByPlayer = useMemo(
    () => players.map((p) => ({ player: p, unseen: countUnseenGroups(unseenGroups, historyByPlayer[p.id] ?? {}) })),
    [players, unseenGroups, historyByPlayer],
  );
  const launch = () => {
    // Tous les univers du mode choisi, sans limite : le duel puise dedans.
    const universes =
      mode === 'all'
        ? shuffle([...allUniverses], Math.random)
        : mode === 'profiles'
          ? shuffle([...wantedUnion], Math.random)
          : [...selected];
    onStart({ universes, jokers, randomFromProfiles: mode === 'profiles', drinksEnabled, drinkIntensity } satisfies DuelConfig);
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

      <HowToPlay
        lines={[
          'Chacun son tour, sur les univers choisis pour le duel.',
          'La difficulté monte : 3 faciles, 3 moyennes, 2 dures, puis tout le reste en pro.',
          'Une mauvaise réponse élimine le joueur. Utilise tes jokers au bon moment.',
          'Le dernier joueur encore en lice remporte le duel.',
        ]}
      />

      <SectionHeader title="Univers du duel" />
      <Segmented<UniverseMode>
        value={mode}
        onChange={setMode}
        options={[
          { label: 'Manuel', value: 'manual' },
          { label: 'Tous', value: 'all' },
          { label: 'Profils', value: 'profiles' },
        ]}
      />

      {mode === 'all' ? (
        <Txt faint size={fontSize.xs}>
          🎲 Tous les univers du jeu — {allUniverses.length} au total. Le duel puise ses questions dans l'ensemble.
        </Txt>
      ) : mode === 'profiles' ? (
        <Txt faint size={fontSize.xs}>
          {wantedUnion.size > 0
            ? `🎲 ${wantedUnion.size} univers — tous ceux qu'au moins un joueur n'a pas exclus dans son profil.`
            : "Aucun univers disponible : les joueurs ont tout exclu dans leur profil."}
        </Txt>
      ) : (
        <Txt faint size={fontSize.xs}>
          {selected.size} univers choisi{selected.size > 1 ? 's' : ''} · {eligibleCount} question
          {eligibleCount > 1 ? 's' : ''}
        </Txt>
      )}

      {mode === 'manual' &&
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

      {players.length > 0 && available >= 1 && (
        <>
          <SectionHeader title="Inédites par joueur" />
          <PlayerUnseenList rows={unseenByPlayer} />
          <Txt faint size={fontSize.xs}>
            Questions jamais vues par chaque joueur avec les univers du duel.
          </Txt>
        </>
      )}

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

      <SectionHeader title="Mode alcool" />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">🍺 Gorgées</Txt>
            <Txt faint size={fontSize.xs}>Le joueur éliminé boit ; sans-faute sur une dure, tu distribues.</Txt>
          </View>
          <Switch
            value={drinksEnabled}
            onValueChange={setDrinksEnabled}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
        {drinksEnabled && (
          <View style={{ marginTop: spacing(1) }}>
            <Segmented<DrinkIntensity>
              value={drinkIntensity}
              onChange={setDrinkIntensity}
              options={[
                { label: 'Soft', value: 'soft' },
                { label: 'Normal', value: 'normal' },
                { label: 'Hardcore', value: 'hardcore' },
              ]}
            />
          </View>
        )}
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
