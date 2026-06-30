import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen, Txt } from '../components/ui';
import { getGame } from '../games/registry';
import type { RootStackParamList } from '../navigation';

/** Generic wrapper that renders the chosen mini-game's config component. */
export function GameConfigScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'GameConfig'>) {
  const { gameId, players } = route.params;
  const game = getGame(gameId);

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
        onStart={(config) => navigation.navigate('GamePlay', { gameId, players, config })}
      />
    </Screen>
  );
}
