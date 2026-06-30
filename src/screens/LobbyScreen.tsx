import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, PlayerAvatar, Screen, Txt } from '../components/ui';
import type { Player } from '../core/models';
import { getGame } from '../games/registry';
import { listPlayers } from '../db';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

export function LobbyScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Lobby'>) {
  const { gameId } = route.params;
  const game = getGame(gameId);
  const [roster, setRoster] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    const list = await listPlayers(false);
    setRoster(list);
    // Keep selection valid; default to selecting everyone the first time.
    setSelected((prev) => {
      if (prev.size === 0) return new Set(list.map((p) => p.id));
      return new Set([...prev].filter((id) => list.some((p) => p.id === id)));
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const activePlayers = useMemo(() => roster.filter((p) => selected.has(p.id)), [roster, selected]);
  const minPlayers = game?.minPlayers ?? 1;
  const enough = activePlayers.length >= minPlayers;

  return (
    <Screen
      title="Qui joue ?"
      subtitle={game ? game.title : undefined}
      onBack={() => navigation.goBack()}
      scroll
      footer={
        <Button
          title={`Configurer (${activePlayers.length} joueur${activePlayers.length > 1 ? 's' : ''})`}
          size="lg"
          disabled={!enough}
          onPress={() => navigation.navigate('GameConfig', { gameId, players: activePlayers })}
        />
      }
    >
      {roster.length === 0 ? (
        <View>
          <EmptyState emoji="👥" title="Aucun joueur" subtitle="Ajoute des joueurs avant de lancer une partie." />
          <Button title="Gérer les joueurs" onPress={() => navigation.navigate('Players')} />
        </View>
      ) : (
        <View style={{ gap: spacing(1) }}>
          {!enough && (
            <Txt faint size={fontSize.xs} center>
              Sélectionne au moins {minPlayers} joueur{minPlayers > 1 ? 's' : ''}.
            </Txt>
          )}
          {roster.map((p) => {
            const on = selected.has(p.id);
            return (
              <Pressable key={p.id} onPress={() => toggle(p.id)}>
                <Card
                  accent={on ? p.color : colors.border}
                  style={[styles.row, { opacity: on ? 1 : 0.5 }]}
                >
                  <PlayerAvatar emoji={p.emoji} color={p.color} selected={on} />
                  <Txt weight="700" style={{ flex: 1 }}>
                    {p.name}
                  </Txt>
                  <View style={[styles.check, on && { backgroundColor: colors.success, borderColor: colors.success }]}>
                    {on && <Txt weight="900" color={colors.white}>✓</Txt>}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
