import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen, Txt } from '../components/ui';
import { getGame } from '../games/registry';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';

/** Generic wrapper that renders the chosen mini-game's config component. */
export function GameConfigScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'GameConfig'>) {
  const { gameId, players, soiree } = route.params;
  const game = getGame(gameId);
  const { requestGameStart } = useStore();

  if (!game) {
    return (
      <Screen title="Erreur" onBack={() => navigation.goBack()}>
        <Txt>Jeu introuvable.</Txt>
      </Screen>
    );
  }

  const Config = game.ConfigComponent;
  return (
    <Screen
      title={`${game.emoji} ${game.title}`}
      subtitle={`${players.length} joueur${players.length > 1 ? 's' : ''}`}
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
