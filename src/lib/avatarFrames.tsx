import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { achievementScoresByPlayer, generalTier, TIER_META } from '../core/achievements';
import { kvGetJSON, kvSetJSON, loadStatAnswers, loadStatResults } from '../db';

/**
 * Cadre de palier autour des avatars : un anneau coloré selon le palier
 * « général » du profil (déduit du total de points de hauts faits). Le calcul
 * vit ici, dans un contexte, pour que n'importe quel PlayerAvatar l'affiche
 * automatiquement — partout dans l'app — sans le câbler écran par écran.
 *
 * Le cadre ne s'affiche que si : l'option est activée (Réglages), le pack
 * « Hauts faits » est possédé, et le joueur a atteint au moins un palier.
 */
interface AvatarFramesValue {
  /** Couleur du cadre pour un joueur (undefined = pas de cadre). */
  frameColorFor: (playerId?: string) => string | undefined;
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  /** Recharge les paliers (après une partie, par exemple). */
  refresh: () => void;
}

const FALLBACK: AvatarFramesValue = {
  frameColorFor: () => undefined,
  enabled: false,
  setEnabled: () => {},
  refresh: () => {},
};

const AvatarFramesContext = createContext<AvatarFramesValue>(FALLBACK);

export function useAvatarFrames(): AvatarFramesValue {
  return useContext(AvatarFramesContext);
}

const PREF_KEY = 'ui:avatarFrames';

export function AvatarFramesProvider({
  allAchievements,
  children,
}: {
  allAchievements: boolean;
  children: ReactNode;
}) {
  const [enabled, setEnabledState] = useState(true);
  const [colors, setColors] = useState<Record<string, string>>({});

  const refresh = useCallback(() => {
    void (async () => {
      try {
        const [results, answers] = await Promise.all([loadStatResults(), loadStatAnswers()]);
        const scores = achievementScoresByPlayer(results, answers);
        const map: Record<string, string> = {};
        for (const [pid, s] of Object.entries(scores)) {
          const tier = generalTier(s.points);
          if (tier) map[pid] = TIER_META[tier].color;
        }
        setColors(map);
      } catch {
        // best-effort : pas de cadre si le chargement échoue
      }
    })();
  }, []);

  useEffect(() => {
    void kvGetJSON<boolean>(PREF_KEY, true).then(setEnabledState);
    refresh();
    // Recalcule au retour au premier plan (les paliers ont pu changer).
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const setEnabled = useCallback((on: boolean) => {
    setEnabledState(on);
    void kvSetJSON(PREF_KEY, on);
  }, []);

  const frameColorFor = useCallback(
    (playerId?: string): string | undefined =>
      enabled && allAchievements && playerId ? colors[playerId] : undefined,
    [enabled, allAchievements, colors],
  );

  const value = useMemo<AvatarFramesValue>(
    () => ({ frameColorFor, enabled, setEnabled, refresh }),
    [frameColorFor, enabled, setEnabled, refresh],
  );

  return <AvatarFramesContext.Provider value={value}>{children}</AvatarFramesContext.Provider>;
}
