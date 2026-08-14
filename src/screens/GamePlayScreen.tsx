import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';

import { Screen, Txt } from '../components/ui';
import type { SessionResult } from '../core/models';
import { applyRound } from '../core/soiree';
import { getActiveSoiree, saveActiveSoiree, saveSessionResult } from '../db';
import { getGame } from '../games/registry';
import type { RootStackParamList } from '../navigation';

/** Generic wrapper that renders the chosen mini-game's play component. */
export function GamePlayScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'GamePlay'>) {
  const { gameId, players, config, resume, slotId, soiree } = route.params;
  const game = getGame(gameId);

  const handleFinish = useCallback(
    async (result: SessionResult) => {
      try {
        await saveSessionResult(result);
      } catch (e) {
        console.warn('Impossible d\'enregistrer la partie', e);
      }
      // Manche de « Mode Soirée » : on crédite le classement cumulé et on revient
      // au tableau de la soirée plutôt qu'à l'écran de résultats normal.
      if (soiree) {
        try {
          const active = await getActiveSoiree();
          if (active) await saveActiveSoiree(applyRound(active, result));
        } catch (e) {
          console.warn('Impossible de mettre à jour la soirée', e);
        }
        // Revient au tableau de la soirée déjà présent dans la pile (dépile la config + le jeu).
        navigation.navigate('Soiree');
        return;
      }
      // Le nettoyage du slot sauvegardé est géré par le jeu lui-même.
      navigation.replace('Results', { result, players });
    },
    [navigation, players, soiree],
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
  return <Play players={players} config={config} onFinish={handleFinish} onQuit={handleQuit} resume={resume} slotId={slotId} />;
}
