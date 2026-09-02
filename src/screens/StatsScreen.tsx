import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { achievementScoresByPlayer } from '../core/achievements';
import { Card, Chip, EmptyState, PlayerAvatar, Screen, Segmented, Txt } from '../components/ui';
import { getFlag } from '../lib/featureFlags';
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
    () => [
      { label: tr('Tous'), value: 'all', emoji: '📊' },
      ...MINI_GAMES.map((g) => ({ label: tr(g.title), value: g.id, emoji: g.emoji })),
    ],
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

  // --- Récap de la semaine (carte partageable en image) ---
  const weekFacts = useMemo(
    () => funFacts(data.sessions, data.results, data.answers, { period: 'week' }),
    [data],
  );
  const weekLeader = useMemo(() => {
    const rows = [...playerTotals(data.results, { period: 'week' })].sort(
      (a, b) => b.wins - a.wins || b.points - a.points,
    );
    return rows[0] ?? null;
  }, [data.results]);
  const recapRef = useRef<View>(null);
  const [sharingWeek, setSharingWeek] = useState(false);
  const shareWeek = async () => {
    if (sharingWeek) return;
    setSharingWeek(true);
    try {
      const uri = await captureRef(recapRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: tr('Ma semaine Cancellable') });
      } else {
        await Share.share({ url: uri });
      }
    } catch {
      Alert.alert(tr('Oups'), tr("Impossible de générer l'image du récap."));
    } finally {
      setSharingWeek(false);
    }
  };
  const weekLeaderPlayer = weekLeader ? byId[weekLeader.playerId] : undefined;

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
      <Card onPress={() => navigation.navigate('FaceAFace')} style={{ marginTop: spacing(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1) }}>
          <Txt size={fontSize.xl}>🤝</Txt>
          <View style={{ flex: 1 }}>
            <Txt weight="800">{tr('Face-à-face')}</Txt>
            <Txt faint size={fontSize.xs}>{tr('Compare deux joueurs : victoires, vitesse et forces par thème.')}</Txt>
          </View>
          <Txt faint>›</Txt>
        </View>
      </Card>
      <Card onPress={() => navigation.navigate('Seasons')} style={{ marginTop: spacing(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1) }}>
          <Txt size={fontSize.xl}>📅</Txt>
          <View style={{ flex: 1 }}>
            <Txt weight="800">{tr('Saisons')}</Txt>
            <Txt faint size={fontSize.xs}>{tr('Le classement du mois et les champions passés.')}</Txt>
          </View>
          <Txt faint>›</Txt>
        </View>
      </Card>
      {getFlag('weeklyRecap') && weekFacts.totalGames > 0 && (
        <Card onPress={() => void shareWeek()} style={{ marginTop: spacing(1) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1) }}>
            <Txt size={fontSize.xl}>📈</Txt>
            <View style={{ flex: 1 }}>
              <Txt weight="800">{tr('Récap de la semaine')}</Txt>
              <Txt faint size={fontSize.xs}>{tr('Partage ta semaine en image.')}</Txt>
            </View>
            <Txt faint>{sharingWeek ? '…' : '📤'}</Txt>
          </View>
        </Card>
      )}
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
      {/* Filtre par mode de jeu : une rangée de puces qui défile
          horizontalement (une dizaine de modes tiendraient à l'étroit dans un
          Segmented, textes tassés et illisibles). */}
      {gameOptions.length > 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing(1) }}
          contentContainerStyle={styles.gameFilterRow}
        >
          {gameOptions.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              emoji={o.emoji}
              selected={gameId === o.value}
              onPress={() => setGameId(o.value)}
            />
          ))}
        </ScrollView>
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

      {/* Carte « ma semaine » rendue hors-écran, capturée en image à la demande. */}
      {getFlag('weeklyRecap') && (
        <View style={styles.shotWrap} pointerEvents="none">
          <View ref={recapRef} collapsable={false} style={styles.weekCard}>
            <Txt weight="900" size={fontSize.lg} color={colors.white}>🔒 Cancellable</Txt>
            <Txt weight="700" color={colors.white} style={{ opacity: 0.85, marginBottom: spacing(1.5) }}>
              {tr('Ma semaine 📈')}
            </Txt>
            <WeekStat label={tr('parties')} value={String(weekFacts.totalGames)} />
            <WeekStat label={tr('questions')} value={String(weekFacts.totalQuestions)} />
            <WeekStat label={tr('gorgées')} value={String(weekFacts.totalSips)} />
            {weekLeaderPlayer && (
              <WeekStat label={tr('en tête')} value={`${weekLeaderPlayer.emoji} ${weekLeaderPlayer.name}`} />
            )}
            {weekFacts.favouriteTheme && (
              <WeekStat
                label={tr('thème favori')}
                value={THEME_META[weekFacts.favouriteTheme as Theme] ? tr(THEME_META[weekFacts.favouriteTheme as Theme].label) : weekFacts.favouriteTheme}
              />
            )}
            <Txt size={fontSize.xs} color={colors.white} style={{ opacity: 0.7, marginTop: spacing(1.5) }}>
              {tr('Le jeu de vos soirées entre amis 🎉')}
            </Txt>
          </View>
        </View>
      )}
    </Screen>
  );
}

function WeekStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing(0.5) }}>
      <Txt color={colors.white} style={{ opacity: 0.85 }}>{label}</Txt>
      <Txt weight="900" color={colors.white}>{value}</Txt>
    </View>
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
  shotWrap: { position: 'absolute', left: -9999, top: 0 },
  gameFilterRow: { flexDirection: 'row', gap: spacing(1), paddingRight: spacing(1) },
  weekCard: { width: 340, backgroundColor: colors.primaryDark, padding: spacing(3), borderRadius: radius.lg },
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
