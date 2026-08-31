import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { achievementScoresByPlayer } from '../core/achievements';
import { Card, Chip, EmptyState, PlayerAvatar, Screen, Segmented, Txt } from '../components/ui';
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
import { MINI_GAMES } from '../games/registry';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
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
  { label: 'Semaine', value: 'week' },
  { label: 'Mois', value: 'month' },
  { label: 'Année', value: 'year' },
  { label: 'Total', value: 'all' },
];

type Tab = 'classement' | 'titres' | 'hautsfaits' | 'themes';
const TABS: { label: string; emoji: string; value: Tab }[] = [
  { label: 'Classement', emoji: '🏆', value: 'classement' },
  { label: 'Titres', emoji: '⭐', value: 'titres' },
  { label: 'Hauts faits', emoji: '🎖️', value: 'hautsfaits' },
  { label: 'Thèmes', emoji: '🎯', value: 'themes' },
];

export function StatsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Stats'>) {
  const tr = useT();
  const { ent } = useStore();
  const [data, setData] = useState<Data>(EMPTY);
  const [period, setPeriod] = useState<Period>('all');
  const [gameId, setGameId] = useState<string>('all');
  const [tab, setTab] = useState<Tab>('classement');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Version gratuite : seules les stats du soir sont visibles.
  useEffect(() => {
    if (!ent.allStats && period !== 'today') setPeriod('today');
  }, [ent.allStats, period]);

  // Changer de période : bloqué (renvoi Boutique) tant que « all_stats » n'est pas acheté.
  const changePeriod = (p: Period) => {
    if (p !== 'today' && !ent.allStats) {
      navigation.navigate('Store');
      return;
    }
    setPeriod(p);
  };

  const gameOptions = useMemo(
    () => [{ label: tr('Tous'), value: 'all' }, ...MINI_GAMES.map((g) => ({ label: tr(g.title), value: g.id }))],
    [tr],
  );

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

  const filter = useMemo(() => ({ period, gameId: gameId === 'all' ? undefined : gameId }), [period, gameId]);
  const totals = useMemo(() => playerTotals(data.results, filter), [data.results, filter]);
  const facts = useMemo(() => funFacts(data.sessions, data.results, data.answers, filter), [data, filter]);
  const titles = useMemo(
    () => superlatives(data.players, data.results, data.answers, filter),
    [data, filter],
  );
  const themes = useMemo(() => themeAccuracy(data.answers, undefined, filter), [data.answers, filter]);

  // Classement par hauts faits : calculé sur TOUTE la vie du joueur (pas de
  // filtre de période), chaque palier valant ses points. Vrais joueurs seulement.
  const achLeaderboard = useMemo(() => {
    const scores = achievementScoresByPlayer(data.results, data.answers);
    return Object.entries(scores)
      .filter(([id]) => byId[id])
      .map(([id, s]) => ({ player: byId[id] as Player, points: s.points, tiers: s.tiers }))
      .sort((a, b) => b.points - a.points);
  }, [data.results, data.answers, byId]);

  const nameOf = (id: string) => byId[id]?.name ?? teamInfo.get(id)?.name ?? '???';
  const hasData = facts.totalGames > 0;

  // --- Tab renderers -------------------------------------------------------

  const renderClassement = () => {
    if (totals.length === 0) return <TabEmpty text={tr('Aucune partie sur cette période.')} />;
    return (
      <>
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
                {(p || team) && <PlayerAvatar emoji={emoji} color={color ?? colors.primary} size={36} playerId={t.playerId} />}
                <View style={{ flex: 1 }}>
                  <Txt weight="800">
                    {nameOf(t.playerId)}
                    {team ? '  👥' : ''}
                  </Txt>
                  <Txt faint size={fontSize.xs}>
                    {tr(t.games > 1 ? '{n} parties' : '{n} partie', { n: t.games })} · {t.wins} 🏆 · 🍺 {t.sipsDrunk}
                    {team ? tr(' · appuie pour les membres') : ''}
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
                      : tr('Composition inconnue')}
                  </Txt>
                </Card>
              )}
            </View>
          );
        })}
      </>
    );
  };

  const renderTitres = () => {
    if (titles.length === 0) return <TabEmpty text={tr('Pas encore de titres sur cette période.')} />;
    return (
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
    );
  };

  const renderHautsFaits = () => {
    if (!ent.allAchievements) {
      return (
        <Card accent={colors.accent} onPress={() => navigation.navigate('Store')}>
          <Txt weight="800">{tr('🔒 Hauts faits verrouillés')}</Txt>
          <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
            {tr('Le classement et les paliers sont dans la Boutique — 1,99 €. Touche pour débloquer.')}
          </Txt>
        </Card>
      );
    }
    if (achLeaderboard.length === 0) return <TabEmpty text={tr('Pas encore de hauts faits débloqués.')} />;
    return (
      <>
        <Txt faint size={fontSize.xs} style={{ marginBottom: spacing(1) }}>
          {tr('Classement à vie (toutes périodes). Chaque palier rapporte des points ; touche un joueur pour ses badges.')}
        </Txt>
        {achLeaderboard.map((row, i) => (
          <Card
            key={row.player.id}
            accent={i === 0 ? colors.warning : row.player.color}
            style={styles.rankRow}
            onPress={() => navigation.navigate('PlayerProfile', { playerId: row.player.id })}
          >
            <Txt size={fontSize.lg} weight="900" style={{ width: 30 }}>
              {RANK_MEDALS[i] ?? `${i + 1}`}
            </Txt>
            <PlayerAvatar emoji={row.player.emoji} color={row.player.color} photoUri={row.player.photoUri} size={36} playerId={row.player.id} />
            <View style={{ flex: 1 }}>
              <Txt weight="800">{row.player.name}</Txt>
              <Txt faint size={fontSize.xs}>
                {tr(row.tiers > 1 ? '{n} paliers' : '{n} palier', { n: row.tiers })} · {tr('appuie pour le profil')}
              </Txt>
            </View>
            <Txt size={fontSize.lg} weight="900" color={colors.accent}>
              {row.points}
            </Txt>
          </Card>
        ))}
      </>
    );
  };

  const renderThemes = () => {
    if (themes.length === 0) return <TabEmpty text={tr('Pas de réponses sur cette période.')} />;
    return (
      <>
        {themes.map((t) => (
          <View key={t.theme} style={{ marginBottom: spacing(1) }}>
            <View style={styles.themeLabel}>
              <Txt size={fontSize.sm} weight="700">
                {THEME_META[t.theme as Theme]?.emoji ?? '•'} {THEME_META[t.theme as Theme] ? tr(THEME_META[t.theme as Theme].label) : t.theme}
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
    );
  };

  return (
    <Screen title={tr('Statistiques')} subtitle={tr('Le palmarès de vos soirées')} onBack={() => navigation.goBack()} scroll>
      <Segmented<Period> value={period} onChange={changePeriod} options={PERIODS.map((o) => ({ label: tr(o.label), value: o.value }))} />
      {!ent.allStats && (
        <Card accent={colors.accent} onPress={() => navigation.navigate('Store')} style={{ marginTop: spacing(1) }}>
          <Txt weight="800" size={fontSize.sm}>
            {tr('🔒 Stats du soir uniquement')}
          </Txt>
          <Txt faint size={fontSize.xs}>
            {tr("Débloque le mois, l'année et le total dans la Boutique — 1,99 €.")}
          </Txt>
        </Card>
      )}
      {gameOptions.length > 2 && (
        <View style={{ marginTop: spacing(1) }}>
          <Segmented<string> value={gameId} onChange={setGameId} options={gameOptions} />
        </View>
      )}

      {!hasData ? (
        <EmptyState emoji="📊" title={tr('Pas encore de stats')} subtitle={tr('Jouez une partie et revenez admirer le palmarès !')} />
      ) : (
        <>
          <View style={styles.factsRow}>
            <FactCard emoji="🎮" value={String(facts.totalGames)} label={tr('parties')} />
            <FactCard emoji="🍺" value={String(facts.totalSips)} label={tr('gorgées')} />
            <FactCard emoji="❓" value={String(facts.totalQuestions)} label={tr('questions')} />
          </View>
          {facts.favouriteTheme && (
            <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
              {tr('Thème favori : {theme}', { theme: THEME_META[facts.favouriteTheme as Theme] ? tr(THEME_META[facts.favouriteTheme as Theme].label) : facts.favouriteTheme })}
            </Txt>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: spacing(1.5) }}
            contentContainerStyle={{ gap: spacing(1), paddingRight: spacing(2) }}
          >
            {TABS.map((t) => (
              <Chip key={t.value} label={tr(t.label)} emoji={t.emoji} selected={tab === t.value} onPress={() => setTab(t.value)} />
            ))}
          </ScrollView>

          <View style={{ marginTop: spacing(1.5) }}>
            {tab === 'classement' && renderClassement()}
            {tab === 'titres' && renderTitres()}
            {tab === 'hautsfaits' && renderHautsFaits()}
            {tab === 'themes' && renderThemes()}
          </View>
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

function TabEmpty({ text }: { text: string }) {
  return (
    <Txt dim center style={{ paddingVertical: spacing(3) }}>
      {text}
    </Txt>
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
