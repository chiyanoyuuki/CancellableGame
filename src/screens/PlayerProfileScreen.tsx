import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AchievementTrackCard } from '../components/AchievementTrackCard';
import { ThemeRadar, type RadarAxis } from '../components/ThemeRadar';
import { Button, Card, EmptyState, PlayerAvatar, ProgressBar, Screen, SectionHeader, Txt } from '../components/ui';
import { achievementScore, achievementSummary, MAX_POINTS, playerAchievements } from '../core/achievements';
import { type Player, type Theme, THEME_META } from '../core/models';
import { type StatAnswer, type StatResult, themeAccuracy } from '../core/stats';
import { listPlayers, loadStatAnswers, loadStatResults } from '../db';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { colors, fontSize, spacing } from '../theme/theme';

export function PlayerProfileScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'PlayerProfile'>) {
  const t = useT();
  const { playerId } = route.params;
  const { ent } = useStore();
  const [player, setPlayer] = useState<Player | null>(null);
  const [results, setResults] = useState<StatResult[]>([]);
  const [answers, setAnswers] = useState<StatAnswer[]>([]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          const pl = await listPlayers(true);
          setPlayer(pl.find((p) => p.id === playerId) ?? null);
        } catch {
          // profil indisponible : on garde l'état précédent
        }
        try {
          const [r, a] = await Promise.all([loadStatResults(), loadStatAnswers()]);
          setResults(r);
          setAnswers(a);
        } catch {
          // stats indisponibles : hauts faits/radar resteront vides
        }
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

  const locked = !ent.allAchievements;

  // Radar « forces par thème » : les thèmes les plus joués par ce joueur.
  const radarAxes = useMemo<RadarAxis[]>(() => {
    const acc = themeAccuracy(answers, playerId).filter((x) => x.total >= 3);
    return [...acc]
      .sort((a, b) => b.total - a.total)
      .slice(0, 7)
      .map((x) => ({ label: THEME_META[x.theme as Theme]?.emoji ?? x.theme.slice(0, 3), a: x.accuracy }));
  }, [answers, playerId]);

  return (
    <Screen title={player?.name ?? t('Profil')} onBack={() => navigation.goBack()} scroll>
      {!player ? (
        <EmptyState emoji="👤" title={t('Joueur introuvable')} />
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: spacing(1), marginBottom: spacing(1) }}>
            <PlayerAvatar emoji={player.emoji} color={player.color} photoUri={player.photoUri} size={84} playerId={player.id} />
            <Txt size={fontSize.xxl} weight="900">{player.name}</Txt>
            <Txt dim size={fontSize.sm}>
              {t(games > 1 ? '{n} parties' : '{n} partie', { n: games })} · {wins} 🏆
              {locked ? '' : ` · ${t(summary.tiers > 1 ? '{n} paliers' : '{n} palier', { n: summary.tiers })}`}
            </Txt>
          </View>

          {radarAxes.length >= 3 && (
            <>
              <SectionHeader title={t('Forces par thème')} />
              <Card>
                <ThemeRadar axes={radarAxes} colorA={player.color} />
                <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
                  {t('Taux de bonnes réponses par thème (le plus large = le plus fort).')}
                </Txt>
              </Card>
            </>
          )}

          {locked ? (
            <Card accent={colors.accent} onPress={() => navigation.navigate('Store')}>
              <Txt weight="800">{t('🔒 Hauts faits verrouillés')}</Txt>
              <Txt faint size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
                {t('Débloque tous les hauts faits, leurs paliers et le classement dans la Boutique — 1,99 €.')}
              </Txt>
              <View style={{ marginTop: spacing(1.5) }}>
                <Button title={t('Voir la Boutique')} emoji="🎖️" onPress={() => navigation.navigate('Store')} />
              </View>
            </Card>
          ) : (
            <>
              <Card accent={colors.accent}>
                <View style={styles.row}>
                  <Txt weight="800">{t('⭐ Points de hauts faits')}</Txt>
                  <Txt weight="900" size={fontSize.lg} color={colors.accent}>
                    {achievementScore(tracks)}
                  </Txt>
                </View>
                <View style={{ marginTop: spacing(1) }}>
                  <ProgressBar value={achievementScore(tracks)} total={MAX_POINTS} color={colors.accent} />
                </View>
                <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
                  {t('{score} / {max} points possibles', { score: achievementScore(tracks), max: MAX_POINTS })}
                </Txt>
              </Card>

              <SectionHeader title={t('Hauts faits')} />
              {sorted.map((t) => (
                <AchievementTrackCard key={t.track.id} t={t} />
              ))}
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) },
});
