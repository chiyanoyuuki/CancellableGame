import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';

import { Screen, Txt } from '../components/ui';
import type { SessionResult } from '../core/models';
import { clearCurrentGame, saveSessionResult } from '../db';
import { getGame } from '../games/registry';
import type { RootStackParamList } from '../navigation';

/** Generic wrapper that renders the chosen mini-game's play component. */
export function GamePlayScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'GamePlay'>) {
  const { gameId, players, config, resume } = route.params;
  const game = getGame(gameId);

  const handleFinish = useCallback(
    async (result: SessionResult) => {
      try {
        await saveSessionResult(result);
      } catch (e) {
        console.warn('Impossible d\'enregistrer la partie', e);
      }
      // La partie est terminée et ses stats enregistrées : plus rien à reprendre.
      await clearCurrentGame().catch(() => undefined);
      navigation.replace('Results', { result, players });
    },
    [navigation, players],
  );

  const handleQuit = useCallback(() => navigation.navigate('Home'), [navigation]);

  if (!game) {
    return (
      <Screen title="Erreur" onBack={() => navigation.goBack()}>
        <Txt>Jeu introuvable.</Txt>
      </Screen>
    );
  }

  const Play = game.PlayComponent;
  return <Play players={players} config={config} onFinish={handleFinish} onQuit={handleQuit} resume={resume} />;
}
