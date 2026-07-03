import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View } from 'react-native';

import { Button, Screen, Txt } from '../components/ui';
import { getSessionCount } from '../db';
import type { RootStackParamList } from '../navigation';
import { fontSize, spacing } from '../theme/theme';

export function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const [games, setGames] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getSessionCount().then(setGames);
    }, []),
  );

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

        <Button title="Jouer" emoji="🎮" size="lg" onPress={() => navigation.navigate('GameSelect')} />
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
