import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, EmptyState, PlayerAvatar, Screen, SectionHeader, Segmented, Txt } from '../components/ui';
import type { Player } from '../core/models';
import { THEME_META, type Theme } from '../core/models';
import {
  funFacts,
  type Period,
  playerTotals,
  type StatAnswer,
  type StatResult,
  type StatSession,
  superlatives,
  themeAccuracy,
} from '../core/stats';
import { listPlayers, loadStatAnswers, loadStatResults, loadStatSessions } from '../db';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, RANK_MEDALS, radius, spacing } from '../theme/theme';

interface Data {
  sessions: StatSession[];
  results: StatResult[];
  answers: StatAnswer[];
  players: Player[];
}

const EMPTY: Data = { sessions: [], results: [], answers: [], players: [] };

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Soir', value: 'today' },
  { label: 'Mois', value: 'month' },
  { label: 'Année', value: 'year' },
  { label: 'Total', value: 'all' },
];

export function StatsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Stats'>) {
  const [data, setData] = useState<Data>(EMPTY);
  const [period, setPeriod] = useState<Period>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const [sessions, results, answers, players] = await Promise.all([
          loadStatSessions(),
          loadStatResults(),
          loadStatAnswers(),
          listPlayers(true),
        ]);
        setData({ sessions, results, answers, players });
      })();
    }, []),
  );

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of data.players) m[p.id] = p;
    return m;
  }, [data.players]);

  // Team display info (name, emoji, members) rebuilt from team result rows.
  type TeamInfo = { name: string; emoji: string; color: string; members: { name: string; emoji: string }[] };
  const teamInfo = useMemo(() => {
    const m = new Map<string, TeamInfo>();
    for (const r of data.results) {
      const d = r.details as (Record<string, unknown> & { team?: boolean }) | undefined;
      if (!d?.team) continue;
      m.set(r.playerId, {
        name: (d.name as string) ?? r.playerId,
        emoji: (d.emoji as string) ?? '🏳️',
        color: (d.color as string) ?? colors.primary,
        members: (d.members as { name: string; emoji: string }[]) ?? [],
      });
    }
    return m;
  }, [data.results]);

  const filter = useMemo(() => ({ period }), [period]);
  const totals = useMemo(() => playerTotals(data.results, filter), [data.results, filter]);
  const facts = useMemo(() => funFacts(data.sessions, data.results, data.answers, filter), [data, filter]);
  const titles = useMemo(
    () => superlatives(data.players, data.results, data.answers, filter),
    [data, filter],
  );
  const themes = useMemo(() => themeAccuracy(data.answers, undefined, filter), [data.answers, filter]);

  const nameOf = (id: string) => byId[id]?.name ?? teamInfo.get(id)?.name ?? '???';
  const hasData = facts.totalGames > 0;

  return (
    <Screen title="Statistiques" subtitle="Le palmarès de vos soirées" onBack={() => navigation.goBack()} scroll>
      <Segmented<Period> value={period} onChange={setPeriod} options={PERIODS} />

      {!hasData ? (
        <EmptyState emoji="📊" title="Pas encore de stats" subtitle="Jouez une partie et revenez admirer le palmarès !" />
      ) : (
        <>
          <View style={styles.factsRow}>
            <FactCard emoji="🎮" value={String(facts.totalGames)} label="parties" />
            <FactCard emoji="🍺" value={String(facts.totalSips)} label="gorgées" />
            <FactCard emoji="❓" value={String(facts.totalQuestions)} label="questions" />
          </View>
          {facts.favouriteTheme && (
            <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
              Thème favori : {THEME_META[facts.favouriteTheme as Theme]?.label ?? facts.favouriteTheme}
            </Txt>
          )}

          <SectionHeader title="Classement" />
          {totals.map((t, i) => {
            const p = byId[t.playerId];
            const team = teamInfo.get(t.playerId);
            const emoji = p?.emoji ?? team?.emoji ?? '🏳️';
            const color = p?.color ?? team?.color;
            const open = expanded === t.playerId;
            return (
              <View key={t.playerId}>
                <Card
                  accent={i === 0 ? colors.warning : color}
                  style={styles.rankRow}
                  onPress={team ? () => setExpanded(open ? null : t.playerId) : undefined}
                >
                  <Txt size={fontSize.lg} weight="900" style={{ width: 30 }}>
                    {RANK_MEDALS[i] ?? `${i + 1}`}
                  </Txt>
                  {(p || team) && <PlayerAvatar emoji={emoji} color={color ?? colors.primary} size={36} />}
                  <View style={{ flex: 1 }}>
                    <Txt weight="800">
                      {nameOf(t.playerId)}
                      {team ? '  👥' : ''}
                    </Txt>
                    <Txt faint size={fontSize.xs}>
                      {t.games} partie{t.games > 1 ? 's' : ''} · {t.wins} 🏆 · 🍺 {t.sipsDrunk}
                      {team ? ' · appuie pour voir les membres' : ''}
                    </Txt>
                  </View>
                  <Txt size={fontSize.lg} weight="900" color={colors.primary}>
                    {t.points}
                  </Txt>
                </Card>
                {team && open && (
                  <Card style={styles.membersCard}>
                    <Txt faint size={fontSize.xs}>
                      {team.members.length > 0
                        ? team.members.map((m) => `${m.emoji} ${m.name}`).join('   ·   ')
                        : 'Composition inconnue'}
                    </Txt>
                  </Card>
                )}
              </View>
            );
          })}

          {titles.length > 0 && (
            <>
              <SectionHeader title="Les titres de la soirée" />
              <View style={styles.titlesWrap}>
                {titles.map((s) => (
                  <Card key={s.id} style={styles.titleCard}>
                    <Txt size={fontSize.xl}>{s.emoji}</Txt>
                    <Txt weight="800" size={fontSize.sm}>
                      {s.title}
                    </Txt>
                    <Txt color={colors.accent} weight="800" size={fontSize.sm} numberOfLines={1}>
                      {s.playerId ? nameOf(s.playerId) : '—'}
                    </Txt>
                    <Txt faint size={fontSize.xs}>
                      {s.value}
                    </Txt>
                  </Card>
                ))}
              </View>
            </>
          )}

          {themes.length > 0 && (
            <>
              <SectionHeader title="Réussite par thème (groupe)" />
              {themes.map((t) => (
                <View key={t.theme} style={{ marginBottom: spacing(1) }}>
                  <View style={styles.themeLabel}>
                    <Txt size={fontSize.sm} weight="700">
                      {THEME_META[t.theme as Theme]?.emoji ?? '•'} {THEME_META[t.theme as Theme]?.label ?? t.theme}
                    </Txt>
                    <Txt faint size={fontSize.xs}>
                      {Math.round(t.accuracy * 100)}% · {t.correct}/{t.total}
                    </Txt>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.round(t.accuracy * 100)}%` }]} />
                  </View>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </Screen>
  );
}

function FactCard(props: { emoji: string; value: string; label: string }) {
  return (
    <Card style={styles.factCard}>
      <Txt size={fontSize.xl}>{props.emoji}</Txt>
      <Txt size={fontSize.xl} weight="900">
        {props.value}
      </Txt>
      <Txt faint size={fontSize.xs}>
        {props.label}
      </Txt>
    </Card>
  );
}

const styles = StyleSheet.create({
  factsRow: { flexDirection: 'row', gap: spacing(1), marginTop: spacing(1.5) },
  factCard: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing(1.5) },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), marginBottom: spacing(1) },
  membersCard: { marginTop: -spacing(0.5), marginBottom: spacing(1), marginLeft: spacing(3), paddingVertical: spacing(1) },
  titlesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  titleCard: { width: '47.5%', gap: 2 },
  themeLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing(0.5) },
  barTrack: { height: 12, backgroundColor: colors.card, borderRadius: radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.success, borderRadius: radius.pill },
});
