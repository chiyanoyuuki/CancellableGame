import { useCallback, useState } from 'react';

import type { Player } from '../core/models';
import { listPlayers } from '../db';

/** Loads the roster and exposes a refresh callback (call it in useFocusEffect). */
export function usePlayers(includeArchived = false) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await listPlayers(includeArchived);
    setPlayers(list);
    setLoading(false);
  }, [includeArchived]);

  return { players, loading, refresh };
}
