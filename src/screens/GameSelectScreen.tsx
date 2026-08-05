import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { Card, Screen, Txt } from '../components/ui';
import { MINI_GAMES } from '../games/registry';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { isModeUnlocked } from '../store/products';
import { colors, fontSize, spacing } from '../theme/theme';

export function GameSelectScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'GameSelect'>) {
  const { ent } = useStore();
  return (
    <Screen title="Choisir un jeu" subtitle="Un mini-jeu à la fois (pour l'instant)" onBack={() => navigation.goBack()} scroll>
      <View style={{ gap: spacing(1.5) }}>
        {MINI_GAMES.map((g) => {
          const locked = !isModeUnlocked(g.id, ent);
          const playable = g.available && !locked;
          const onPress = !g.available
            ? undefined
            : locked
              ? () => navigation.navigate('Store')
              : () => navigation.navigate('Lobby', { gameId: g.id });
          return (
            <Card
              key={g.id}
              accent={playable ? colors.primary : colors.border}
              onPress={onPress}
              style={{ opacity: playable ? 1 : 0.6 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) }}>
                <Txt size={fontSize.xxl}>{locked && g.available ? '🔒' : g.emoji}</Txt>
                <View style={{ flex: 1 }}>
                  <Txt size={fontSize.lg} weight="800">
                    {g.title}
                  </Txt>
                  <Txt dim size={fontSize.sm}>
                    {g.description}
                  </Txt>
                  {!g.available ? (
                    <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(0.5) }}>
                      BIENTÔT
                    </Txt>
                  ) : locked ? (
                    <Txt weight="800" size={fontSize.xs} color={colors.accent} style={{ marginTop: spacing(0.5) }}>
                      🔒 Débloquer dans la boutique — 1,99 €
                    </Txt>
                  ) : null}
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
