import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { Card, Screen, SectionHeader, Txt } from '../components/ui';
import { getGame, MINI_GAMES } from '../games/registry';
import type { MiniGameDefinition } from '../games/types';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { isModeUnlocked } from '../store/products';
import { colors, fontSize, spacing } from '../theme/theme';

/** Familles de mini-jeux, pour un catalogue lisible plutôt qu'une longue liste. */
const CATEGORIES: { title: string; ids: string[] }[] = [
  { title: 'Quiz & culture', ids: ['quiz', 'cultureougage'] },
  { title: 'Ambiance & soirée', ids: ['tupreferes', 'quidenous'] },
  { title: 'Duel & bluff', ids: ['duel', 'duelultime', 'imposteur', 'bombe'] },
  { title: 'En équipe', ids: ['alias'] },
];

export function GameSelectScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'GameSelect'>) {
  const t = useT();
  const { ent } = useStore();

  const renderCard = (g: MiniGameDefinition) => {
    const locked = !isModeUnlocked(g.id, ent);
    const playable = g.available && !locked;
    const onPress = !g.available
      ? undefined
      : locked
        ? () => navigation.navigate('Store')
        : () => navigation.navigate('Lobby', { gameId: g.id });
    return (
      <Card key={g.id} accent={playable ? colors.primary : colors.border} onPress={onPress} style={{ opacity: playable ? 1 : 0.6, marginBottom: spacing(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) }}>
          <Txt size={fontSize.xxl}>{locked && g.available ? '🔒' : g.emoji}</Txt>
          <View style={{ flex: 1 }}>
            <Txt size={fontSize.lg} weight="800">
              {t(g.title)}
            </Txt>
            <Txt dim size={fontSize.sm}>
              {t(g.description)}
            </Txt>
            {!g.available ? (
              <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(0.5) }}>
                {t('BIENTÔT')}
              </Txt>
            ) : locked ? (
              <Txt weight="800" size={fontSize.xs} color={colors.accent} style={{ marginTop: spacing(0.5) }}>
                {t('🔒 Débloquer dans la boutique — 1,99 €')}
              </Txt>
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

  // Modes non catégorisés (nouveaux jeux non listés) : regroupés sous « Autres ».
  const categorized = new Set(CATEGORIES.flatMap((c) => c.ids));
  const others = MINI_GAMES.filter((g) => !categorized.has(g.id));

  return (
    <Screen title={t('Choisir un jeu')} subtitle={t("Un mini-jeu à la fois (pour l'instant)")} onBack={() => navigation.goBack()} scroll>
      {CATEGORIES.map((cat) => {
        const games = cat.ids.map((id) => getGame(id)).filter((g): g is MiniGameDefinition => !!g);
        if (games.length === 0) return null;
        return (
          <View key={cat.title}>
            <SectionHeader title={t(cat.title)} />
            {games.map(renderCard)}
          </View>
        );
      })}
      {others.length > 0 && (
        <View>
          <SectionHeader title={t('Autres')} />
          {others.map(renderCard)}
        </View>
      )}
    </Screen>
  );
}
