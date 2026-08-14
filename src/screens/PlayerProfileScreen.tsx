import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, EmptyState, PlayerAvatar, ProgressBar, Screen, SectionHeader, Txt } from '../components/ui';
import {
  achievementScore,
  achievementSummary,
  MAX_POINTS,
  playerAchievements,
  TIER_META,
  type TrackProgress,
} from '../core/achievements';
import type { Player } from '../core/models';
import type { StatAnswer, StatResult } from '../core/stats';
import { listPlayers, loadStatAnswers, loadStatResults } from '../db';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, spacing } from '../theme/theme';

export function PlayerProfileScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'PlayerProfile'>) {
  const { playerId } = route.params;
  const [player, setPlayer] = useState<Player | null>(null);
  const [results, setResults] = useState<StatResult[]>([]);
  const [answers, setAnswers] = useState<StatAnswer[]>([]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const [pl, r, a] = await Promise.all([listPlayers(true), loadStatResults(), loadStatAnswers()]);
        setPlayer(pl.find((p) => p.id === playerId) ?? null);
        setResults(r);
        setAnswers(a);
      })();
    }, [playerId]),
  );

  const tracks = useMemo(() => playerAchievements(results, answers)[playerId] ?? [], [results, answers, playerId]);
  const summary = useMemo(() => achievementSummary(tracks), [tracks]);
  const games = tracks.find((t) => t.track.id === 'games')?.value ?? 0;
  const wins = tracks.find((t) => t.track.id === 'wins')?.value ?? 0;

  // Pistes triées : celles où il y a de la progression d'abord.
  const sorted = useMemo(
    () => [...tracks].sort((a, b) => b.tiersReached - a.tiersReached || b.value - a.value),
    [tracks],
  );

  return (
    <Screen title={player?.name ?? 'Profil'} onBack={() => navigation.goBack()} scroll>
      {!player ? (
        <EmptyState emoji="👤" title="Joueur introuvable" />
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: spacing(1), marginBottom: spacing(1) }}>
            <PlayerAvatar emoji={player.emoji} color={player.color} photoUri={player.photoUri} size={84} />
            <Txt size={fontSize.xxl} weight="900">{player.name}</Txt>
            <Txt dim size={fontSize.sm}>
              {games} partie{games > 1 ? 's' : ''} · {wins} 🏆 · {summary.tiers} palier{summary.tiers > 1 ? 's' : ''}
            </Txt>
          </View>

          <Card accent={colors.accent}>
            <View style={styles.row}>
              <Txt weight="800">⭐ Points de hauts faits</Txt>
              <Txt weight="900" size={fontSize.lg} color={colors.accent}>
                {achievementScore(tracks)}
              </Txt>
            </View>
            <View style={{ marginTop: spacing(1) }}>
              <ProgressBar value={achievementScore(tracks)} total={MAX_POINTS} color={colors.accent} />
            </View>
            <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
              {achievementScore(tracks)} / {MAX_POINTS} points possibles
            </Txt>
          </Card>

          <SectionHeader title="Hauts faits" />
          {sorted.map((t) => (
            <TrackCard key={t.track.id} t={t} />
          ))}
        </>
      )}
    </Screen>
  );
}

function TrackCard({ t }: { t: TrackProgress }) {
  const tier = t.current ? TIER_META[t.current] : null;
  const prevTarget = t.tiersReached > 0 ? t.track.tiers[t.tiersReached - 1]!.target : 0;
  const nextTarget = t.next?.target ?? t.value;
  const span = Math.max(1, nextTarget - prevTarget);
  const within = Math.min(span, Math.max(0, t.value - prevTarget));
  return (
    <Card style={{ marginBottom: spacing(1) }} accent={tier?.color}>
      <View style={styles.row}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), flex: 1 }}>
          <Txt size={fontSize.lg}>{t.track.emoji}</Txt>
          <View style={{ flex: 1 }}>
            <Txt weight="800">{t.track.title}</Txt>
            <Txt faint size={fontSize.xs}>{t.track.desc}</Txt>
          </View>
        </View>
        {tier ? (
          <View style={[styles.tierPill, { borderColor: tier.color }]}>
            <Txt size={fontSize.xs} weight="800" color={tier.color}>
              {tier.emoji} {tier.label}
            </Txt>
          </View>
        ) : (
          <Txt faint size={fontSize.xs} weight="800">
            🔒 à débloquer
          </Txt>
        )}
      </View>
      <View style={{ marginTop: spacing(1) }}>
        <ProgressBar value={t.next ? within : 1} total={t.next ? span : 1} color={tier?.color ?? colors.primary} />
      </View>
      <View style={[styles.row, { marginTop: spacing(0.5) }]}>
        <Txt faint size={fontSize.xs}>
          {t.value} {t.track.unit}
          {t.next ? ` · prochain palier à ${t.next.target}` : ' · palier max atteint 👑'}
        </Txt>
        <Txt faint size={fontSize.xs} weight="800">
          {t.points} pts
        </Txt>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) },
  tierPill: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: spacing(1), paddingVertical: 2 },
});
