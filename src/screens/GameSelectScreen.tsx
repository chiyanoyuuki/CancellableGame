import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { Card, Screen, Txt } from '../components/ui';
import { MINI_GAMES } from '../games/registry';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, spacing } from '../theme/theme';

export function GameSelectScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'GameSelect'>) {
  return (
    <Screen title="Choisir un jeu" subtitle="Un mini-jeu à la fois (pour l'instant)" onBack={() => navigation.goBack()} scroll>
      <View style={{ gap: spacing(1.5) }}>
        {MINI_GAMES.map((g) => (
          <Card
            key={g.id}
            accent={g.available ? colors.primary : colors.border}
            onPress={g.available ? () => navigation.navigate('Lobby', { gameId: g.id }) : undefined}
            style={{ opacity: g.available ? 1 : 0.55 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) }}>
              <Txt size={fontSize.xxl}>{g.emoji}</Txt>
              <View style={{ flex: 1 }}>
                <Txt size={fontSize.lg} weight="800">
                  {g.title}
                </Txt>
                <Txt dim size={fontSize.sm}>
                  {g.description}
                </Txt>
                {!g.available && (
                  <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(0.5) }}>
                    BIENTÔT
                  </Txt>
                )}
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
