import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen, Txt } from '../components/ui';
import { getGame } from '../games/registry';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';

/** Generic wrapper that renders the chosen mini-game's config component. */
export function GameConfigScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'GameConfig'>) {
  const t = useT();
  const { gameId, players, soiree } = route.params;
  const game = getGame(gameId);
  const { requestGameStart } = useStore();

  if (!game) {
    return (
      <Screen title={t('Erreur')} onBack={() => navigation.goBack()}>
        <Txt>{t('Jeu introuvable.')}</Txt>
      </Screen>
    );
  }

  const Config = game.ConfigComponent;
  return (
    <Screen
      title={`${game.emoji} ${t(game.title)}`}
      subtitle={t(players.length > 1 ? '{n} joueurs' : '{n} joueur', { n: players.length })}
      onBack={() => navigation.goBack()}
      scroll
    >
      <Config
        players={players}
        onCancel={() => navigation.goBack()}
        onStart={(config) =>
          // Pub avant chaque partie au-delà de la première de la session.
          requestGameStart(() => navigation.navigate('GamePlay', { gameId, players, config, soiree }))
        }
      />
    </Screen>
  );
}
