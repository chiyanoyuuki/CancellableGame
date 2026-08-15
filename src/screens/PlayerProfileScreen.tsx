import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AchievementTrackCard } from '../components/AchievementTrackCard';
import { Card, EmptyState, PlayerAvatar, ProgressBar, Screen, SectionHeader, Txt } from '../components/ui';
import { achievementScore, achievementSummary, MAX_POINTS, playerAchievements } from '../core/achievements';
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
            <AchievementTrackCard key={t.track.id} t={t} />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) },
});
