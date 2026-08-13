import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, PlayerAvatar, Segmented, SectionHeader, Txt } from '../../components/ui';
import { type DrinkIntensity, type DuelUltimeConfig, type Question, type Theme, THEME_META, THEMES } from '../../core/models';
import { useStore } from '../../store/StoreProvider';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from '../quiz/pool';

// Thèmes au rendu spécial (image distante) : exclus du Duel Ultime.
const EXCLUDED_THEMES: Theme[] = ['images'];

const QUESTION_OPTIONS = [5, 10, 15];

export function DuelUltimeConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const store = useStore();
  const [pool, setPool] = useState<Question[]>([]);
  const [n, setN] = useState(10);
  const [drinksEnabled, setDrinksEnabled] = useState(true);
  const [drinkIntensity, setDrinkIntensity] = useState<DrinkIntensity>('normal');
  const [timerSec, setTimerSec] = useState(0);
  const [universesByPlayer, setUniversesByPlayer] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState<string>(players[0]?.id ?? '');

  useEffect(() => {
    let alive = true;
    void (async () => {
      const p = await getQuizPool();
      if (alive) setPool(p);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Nombre de questions pro (difficulté 4) par univers présent dans le pool.
  const proCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of pool) {
      if (!q.universe || q.difficulty !== 4 || EXCLUDED_THEMES.includes(q.theme)) continue;
      m.set(q.universe, (m.get(q.universe) ?? 0) + 1);
    }
    return m;
  }, [pool]);

  // Univers jouables (au moins une question pro + débloqués), groupés par thème.
  // Multi-sélection : plusieurs petits univers se combinent pour atteindre N.
  const universesByTheme = useMemo(() => {
    const byTheme = new Map<Theme, Set<string>>();
    for (const q of pool) {
      if (!q.universe || EXCLUDED_THEMES.includes(q.theme)) continue;
      if ((proCount.get(q.universe) ?? 0) < 1) continue;
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
        universes: [...byTheme.get(t)!]
          .filter((u) => store.isUniverseUnlocked(u))
          .sort((a, b) => a.localeCompare(b, 'fr')),
      }))
      .filter((g) => g.universes.length > 0);
  }, [pool, proCount, store]);

  // Ajoute/retire un univers pour le joueur en cours d'édition (multi-sélection).
  const toggle = (u: string) => {
    setUniversesByPlayer((prev) => {
      const cur = prev[editing] ?? [];
      const next = cur.includes(u) ? cur.filter((x) => x !== u) : [...cur, u];
      return { ...prev, [editing]: next };
    });
  };

  const valid = players.length >= 1 && players.every((p) => (universesByPlayer[p.id]?.length ?? 0) > 0);

  const launch = () =>
    onStart({ universesByPlayer, questionsPerPlayer: n, drinksEnabled, drinkIntensity, questionTimerSec: timerSec } satisfies DuelUltimeConfig);

  const editingName = players.find((p) => p.id === editing)?.name ?? '';
  const editingUniverses = universesByPlayer[editing] ?? [];
  const editingProTotal = editingUniverses.reduce((sum, u) => sum + (proCount.get(u) ?? 0), 0);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">🥊 Duel Ultime</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Chaque joueur choisit un ou plusieurs univers et affronte {n} questions pro dessus,
          <Txt weight="800" size={fontSize.xs}> sans propositions</Txt> : on révèle la réponse, tu dis
          si tu l'avais. Priorité aux questions jamais vues. Le meilleur score gagne — jouable en solo.
        </Txt>
      </Card>

      <SectionHeader title="Questions par joueur" />
      <Segmented<string>
        value={String(n)}
        onChange={(v) => setN(Number(v))}
        options={QUESTION_OPTIONS.map((q) => ({ label: `${q}`, value: String(q) }))}
      />

      <SectionHeader title="Mode alcool" />
      <View style={styles.rowBetween}>
        <Txt weight="700">🍺 Gorgées</Txt>
        <Switch value={drinksEnabled} onValueChange={setDrinksEnabled} />
      </View>
      {drinksEnabled && (
        <Segmented<DrinkIntensity>
          value={drinkIntensity}
          onChange={setDrinkIntensity}
          options={[
            { label: 'Soft', value: 'soft' },
            { label: 'Normal', value: 'normal' },
            { label: 'Hardcore', value: 'hardcore' },
          ]}
        />
      )}

      <SectionHeader title="Chrono par question" />
      <Segmented<string>
        value={String(timerSec)}
        onChange={(v) => setTimerSec(Number(v))}
        options={[
          { label: 'Aucun', value: '0' },
          { label: '15 s', value: '15' },
          { label: '30 s', value: '30' },
          { label: '45 s', value: '45' },
        ]}
      />

      <SectionHeader title="Univers de chaque joueur (un ou plusieurs)" />
      <View style={{ gap: spacing(1) }}>
        {players.map((p) => {
          const chosen = universesByPlayer[p.id] ?? [];
          const isEditing = p.id === editing;
          return (
            <Pressable
              key={p.id}
              onPress={() => setEditing(p.id)}
              style={[styles.playerRow, isEditing && styles.playerRowActive]}
            >
              <PlayerAvatar emoji={p.emoji} color={p.color} size={32} />
              <View style={{ flex: 1 }}>
                <Txt weight="800">{p.name}</Txt>
                <Txt faint size={fontSize.xs} numberOfLines={1}>
                  {chosen.length ? `🎯 ${chosen.join(', ')}` : 'Univers à choisir…'}
                </Txt>
              </View>
              {isEditing && (
                <Txt weight="800" size={fontSize.xs} color={colors.accent}>
                  EN COURS
                </Txt>
              )}
            </Pressable>
          );
        })}
      </View>

      <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(0.5) }}>
        {editingUniverses.length
          ? `${editingName} : ${editingUniverses.length} univers · ${editingProTotal} questions pro dispo${editingProTotal < n ? ` (moins que ${n})` : ''}. Touche pour ajouter/retirer.`
          : `Choisis un ou plusieurs univers pour ${editingName}.`}
      </Txt>

      {universesByTheme.map(({ theme, universes }) => (
        <View key={theme} style={{ marginBottom: spacing(0.5) }}>
          <Txt weight="800" size={fontSize.xs} faint style={{ marginBottom: spacing(0.75) }}>
            {THEME_META[theme].emoji} {THEME_META[theme].label.toUpperCase()}
          </Txt>
          <View style={styles.wrap}>
            {universes.map((u) => (
              <Chip key={u} label={u} selected={editingUniverses.includes(u)} onPress={() => toggle(u)} />
            ))}
          </View>
        </View>
      ))}

      <View style={{ height: spacing(1) }} />
      <Button title="Lancer le Duel Ultime" emoji="🥊" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          Chaque joueur doit choisir au moins un univers.
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing(0.5) },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(1.5),
    borderWidth: 2,
    borderColor: colors.border,
  },
  playerRowActive: { borderColor: colors.accent, backgroundColor: colors.cardAlt },
});
