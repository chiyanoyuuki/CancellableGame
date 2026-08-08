import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Chip, PlayerAvatar, Segmented, SectionHeader, Txt } from '../../components/ui';
import { type DuelUltimeConfig, type Question, type Theme, THEME_META, THEMES } from '../../core/models';
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
  const [universeByPlayer, setUniverseByPlayer] = useState<Record<string, string>>({});
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

  // Univers jouables (assez de questions pro + débloqués), groupés par thème.
  const universesByTheme = useMemo(() => {
    const byTheme = new Map<Theme, Set<string>>();
    for (const q of pool) {
      if (!q.universe || EXCLUDED_THEMES.includes(q.theme)) continue;
      if ((proCount.get(q.universe) ?? 0) < n) continue;
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
  }, [pool, proCount, n, store]);

  // Choisir un univers pour le joueur en cours d'édition, puis avancer vers le
  // prochain joueur sans univers (le tirage se fait ainsi de proche en proche).
  const pick = (u: string) => {
    setUniverseByPlayer((prev) => {
      const next = { ...prev, [editing]: u };
      const nextPlayer = players.find((p) => !next[p.id]);
      if (nextPlayer) setEditing(nextPlayer.id);
      return next;
    });
  };

  const allAssigned = players.length >= 1 && players.every((p) => universeByPlayer[p.id]);
  const valid = allAssigned;

  const launch = () =>
    onStart({ universeByPlayer, questionsPerPlayer: n } satisfies DuelUltimeConfig);

  const editingPick = universeByPlayer[editing];

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">🥊 Duel Ultime</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Chaque joueur choisit SON univers et répond à {n} questions pro dessus. Le meilleur score
          l'emporte ! Jouable à un seul joueur en défi solo.
        </Txt>
      </Card>

      <SectionHeader title="Questions par joueur" />
      <Segmented<string>
        value={String(n)}
        onChange={(v) => setN(Number(v))}
        options={QUESTION_OPTIONS.map((q) => ({ label: `${q}`, value: String(q) }))}
      />

      <SectionHeader title="Univers de chaque joueur" />
      <View style={{ gap: spacing(1) }}>
        {players.map((p) => {
          const chosen = universeByPlayer[p.id];
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
                <Txt faint size={fontSize.xs}>
                  {chosen ? `🎯 ${chosen}` : 'Univers à choisir…'}
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
        {editingPick
          ? `Univers de ${players.find((p) => p.id === editing)?.name ?? ''} : ${editingPick}. Touche un autre pour changer.`
          : `Choisis l'univers de ${players.find((p) => p.id === editing)?.name ?? ''} ci-dessous.`}
      </Txt>

      {universesByTheme.map(({ theme, universes }) => (
        <View key={theme} style={{ marginBottom: spacing(0.5) }}>
          <Txt weight="800" size={fontSize.xs} faint style={{ marginBottom: spacing(0.75) }}>
            {THEME_META[theme].emoji} {THEME_META[theme].label.toUpperCase()}
          </Txt>
          <View style={styles.wrap}>
            {universes.map((u) => (
              <Chip key={u} label={u} selected={editingPick === u} onPress={() => pick(u)} />
            ))}
          </View>
        </View>
      ))}

      <View style={{ height: spacing(1) }} />
      <Button title="Lancer le Duel Ultime" emoji="🥊" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          Chaque joueur doit choisir un univers.
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
