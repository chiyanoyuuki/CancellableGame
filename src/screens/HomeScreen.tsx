import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, View } from 'react-native';

import { Button, Screen, Txt } from '../components/ui';
import { deleteSavedGame, getSessionCount, listSavedGames, type SavedGame } from '../db';
import type { RootStackParamList } from '../navigation';
import { fontSize, spacing } from '../theme/theme';

export function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const [games, setGames] = useState<number | null>(null);
  const [saved, setSaved] = useState<SavedGame[]>([]);

  const refreshSaved = useCallback(() => {
    void listSavedGames().then(setSaved);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void getSessionCount().then(setGames);
      refreshSaved();
    }, [refreshSaved]),
  );

  const confirmDelete = (g: SavedGame) =>
    Alert.alert('Supprimer cette partie ?', g.name, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteSavedGame(g.slotId);
          refreshSaved();
        },
      },
    ]);

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing(1.5) }}>
        <View style={{ alignItems: 'center', marginBottom: spacing(3) }}>
          <Txt size={fontSize.huge}>🔒</Txt>
          <Txt size={fontSize.xxl} weight="900">
            Cancellable
          </Txt>
          <Txt dim center>
            Le jeu de vos soirées entre amis
          </Txt>
          <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
            par Arma Cos
          </Txt>
        </View>

        {saved.length > 0 && (
          <View style={{ gap: spacing(1) }}>
            <Txt faint size={fontSize.xs} weight="800">
              PARTIES EN COURS
            </Txt>
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
        <Button title={saved.length > 0 ? 'Nouvelle partie' : 'Jouer'} emoji="🎮" variant={saved.length > 0 ? 'secondary' : 'primary'} size="lg" onPress={() => navigation.navigate('GameSelect')} />
        <Button title="Joueurs" emoji="👥" variant="secondary" size="lg" onPress={() => navigation.navigate('Players')} />
        <Button title="Statistiques" emoji="📊" variant="secondary" size="lg" onPress={() => navigation.navigate('Stats')} />
        <Button title="Mon contenu" emoji="✏️" variant="secondary" size="lg" onPress={() => navigation.navigate('CustomContent')} />
        <Button title="Réglages" emoji="⚙️" variant="ghost" onPress={() => navigation.navigate('Settings')} />

        {games !== null && games > 0 && (
          <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(2) }}>
            {games} partie{games > 1 ? 's' : ''} jouée{games > 1 ? 's' : ''} jusqu'ici 🍻
          </Txt>
        )}
      </View>
    </Screen>
  );
}
