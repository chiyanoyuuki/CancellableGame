import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, View } from 'react-native';

import { Button, Screen, SectionHeader, Txt } from '../components/ui';
import { dateKey, EMPTY_STREAK, liveStreak, previousDateKey, type StreakState } from '../core/dailyChallenge';
import { deleteSavedGame, getMissedCount, getSessionCount, kvGetJSON, listSavedGames, type SavedGame } from '../db';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { fontSize, spacing } from '../theme/theme';

export function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const t = useT();
  const [games, setGames] = useState<number | null>(null);
  const [saved, setSaved] = useState<SavedGame[]>([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [missed, setMissed] = useState(0);

  const refreshSaved = useCallback(() => {
    void listSavedGames().then(setSaved);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void getSessionCount().then(setGames);
      void kvGetJSON<StreakState>('daily:streak', EMPTY_STREAK).then((s) =>
        setDailyStreak(liveStreak(s, dateKey(), previousDateKey())),
      );
      void getMissedCount().then(setMissed);
      refreshSaved();
    }, [refreshSaved]),
  );

  const confirmDelete = (g: SavedGame) =>
    Alert.alert(t('Supprimer cette partie ?'), g.name, [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Supprimer'),
        style: 'destructive',
        onPress: async () => {
          await deleteSavedGame(g.slotId);
          refreshSaved();
        },
      },
    ]);

  return (
    <Screen scroll>
      <View style={{ alignItems: 'center', marginTop: spacing(1), marginBottom: spacing(2) }}>
        <Txt size={fontSize.huge}>🔒</Txt>
        <Txt size={fontSize.xxl} weight="900">
          Cancellable
        </Txt>
        <Txt dim center>
          {t('Le jeu de vos soirées entre amis')}
        </Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t('par Arma Cos')}
        </Txt>
      </View>

      {saved.length > 0 && (
        <View style={{ gap: spacing(1), marginBottom: spacing(1) }}>
          <SectionHeader title={t('Reprendre')} />
          {saved.map((g) => (
            <View key={g.slotId} style={{ flexDirection: 'row', gap: spacing(1), alignItems: 'center' }}>
              <Button
                title={g.name}
                emoji="▶️"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() =>
                  navigation.navigate('GamePlay', {
                    gameId: g.gameId,
                    players: g.players,
                    config: g.config,
                    resume: true,
                    slotId: g.slotId,
                  })
                }
              />
              <Button title="🗑" variant="ghost" onPress={() => confirmDelete(g)} />
            </View>
          ))}
        </View>
      )}

      {/* Actions principales, mises en avant. */}
      <View style={{ gap: spacing(1) }}>
        <Button title={saved.length > 0 ? t('Nouvelle partie') : t('Jouer')} emoji="🎮" variant="primary" size="lg" onPress={() => navigation.navigate('GameSelect')} />
        <Button
          title={dailyStreak > 0 ? t('Défi du jour · 🔥 {n}', { n: dailyStreak }) : t('Défi du jour')}
          emoji="🎯"
          variant="accent"
          size="lg"
          onPress={() => navigation.navigate('DailyChallenge')}
        />
        {missed > 0 && (
          <Button
            title={t('Réviser mes erreurs ({n})', { n: missed })}
            emoji="🧠"
            variant="secondary"
            onPress={() => navigation.navigate('Revision')}
          />
        )}
      </View>

      {/* Sous-menus : l'accueil reste léger, chaque tuile ouvre une catégorie. */}
      <SectionHeader title={t('Explorer')} />
      <View style={{ gap: spacing(1) }}>
        <View style={{ flexDirection: 'row', gap: spacing(1) }}>
          <Button title={t('Jeux solo')} emoji="🕹️" variant="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('Hub', { hub: 'solo' })} />
          <Button title={t('Soirée & outils')} emoji="🎉" variant="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('Hub', { hub: 'party' })} />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing(1) }}>
          <Button title={t('Stats & profils')} emoji="📊" variant="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('Hub', { hub: 'manage' })} />
          <Button title={t('Réglages')} emoji="⚙️" variant="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('Settings')} />
        </View>
      </View>

      {games !== null && games > 0 && (
        <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(2) }}>
          {t(games > 1 ? "{n} parties jouées jusqu'ici 🍻" : "{n} partie jouée jusqu'ici 🍻", { n: games })}
        </Txt>
      )}
    </Screen>
  );
}
