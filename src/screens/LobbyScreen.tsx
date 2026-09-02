import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, PlayerAvatar, Screen, Txt } from '../components/ui';
import type { Player } from '../core/models';
import { getGame } from '../games/registry';
import { listPlayers } from '../db';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

export function LobbyScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Lobby'>) {
  const t = useT();
  const { gameId } = route.params;
  const game = getGame(gameId);
  const [roster, setRoster] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    let list: Player[];
    try {
      list = await listPlayers(false);
    } catch {
      // lecture impossible : on garde le roster précédent
      return;
    }
    setRoster(list);
    // Aucun joueur coché par défaut : chaque nouvelle partie démarre sans
    // sélection. On garde seulement les sélections déjà faites et encore valides.
    setSelected((prev) => new Set([...prev].filter((id) => list.some((p) => p.id === id))));
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
      title={t('Qui joue ?')}
      subtitle={game ? t(game.title) : undefined}
      onBack={() => navigation.goBack()}
      scroll
      footer={
        <Button
          title={t(
            activePlayers.length > 1 ? 'Configurer ({n} joueurs)' : 'Configurer ({n} joueur)',
            { n: activePlayers.length },
          )}
          size="lg"
          disabled={!enough}
          onPress={() => navigation.navigate('GameConfig', { gameId, players: activePlayers })}
        />
      }
    >
      {roster.length === 0 ? (
        <View>
          <EmptyState emoji="👥" title={t('Aucun joueur')} subtitle={t('Ajoute des joueurs avant de lancer une partie.')} />
          <Button title={t('Gérer les joueurs')} onPress={() => navigation.navigate('Players')} />
        </View>
      ) : (
        <View style={{ gap: spacing(1) }}>
          {!enough && (
            <Txt faint size={fontSize.xs} center>
              {t(
                minPlayers > 1 ? 'Sélectionne au moins {n} joueurs.' : 'Sélectionne au moins {n} joueur.',
                { n: minPlayers },
              )}
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
                  <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} selected={on} playerId={p.id} />
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
