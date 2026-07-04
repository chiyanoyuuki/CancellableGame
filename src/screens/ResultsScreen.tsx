import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Button, Card, PlayerAvatar, Screen, Txt } from '../components/ui';
import type { Player, PlayerSessionResult } from '../core/models';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, RANK_MEDALS, spacing } from '../theme/theme';

export function ResultsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Results'>) {
  const { result, players } = route.params;

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  // Resolve display info for either a real player or a team (from its details).
  const disp = (r: PlayerSessionResult) => {
    const p = byId[r.playerId];
    const d = (r.details ?? {}) as { name?: string; emoji?: string; color?: string; members?: { name: string; emoji: string }[] };
    return {
      name: p?.name ?? d.name ?? r.playerId,
      emoji: p?.emoji ?? d.emoji ?? '🏳️',
      color: p?.color ?? d.color ?? colors.primary,
      members: d.members,
    };
  };

  const ranked = useMemo(() => [...result.players].sort((a, b) => a.rank - b.rank), [result.players]);
  const winner = ranked[0] ? disp(ranked[0]) : undefined;

  return (
    <Screen
      title="Résultats"
      onBack={() => navigation.navigate('Home')}
      scroll
      footer={
        <>
          <Button
            title="Rejouer"
            emoji="🔁"
            onPress={() => navigation.navigate('GameConfig', { gameId: result.gameId, players })}
          />
          <View style={{ flexDirection: 'row', gap: spacing(1) }}>
            <Button title="Statistiques" variant="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('Stats')} />
            <Button title="Accueil" variant="ghost" style={{ flex: 1 }} onPress={() => navigation.navigate('Home')} />
          </View>
        </>
      }
    >
      {winner && (
        <View style={{ alignItems: 'center', gap: spacing(1), marginBottom: spacing(2) }}>
          <Txt size={fontSize.huge}>🏆</Txt>
          <PlayerAvatar emoji={winner.emoji} color={winner.color} size={72} />
          <Txt size={fontSize.xl} weight="900">
            {winner.name}
          </Txt>
          <Txt dim>gagne la partie !</Txt>
        </View>
      )}

      {ranked.map((r, i) => {
        const d = disp(r);
        const details = (r.details ?? {}) as { correct?: number; wrong?: number };
        return (
          <Card key={r.playerId} accent={i === 0 ? colors.warning : d.color} style={{ marginBottom: spacing(1) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) }}>
              <Txt size={fontSize.lg} weight="900" style={{ width: 34 }}>
                {RANK_MEDALS[i] ?? `${i + 1}.`}
              </Txt>
              <PlayerAvatar emoji={d.emoji} color={d.color} />
              <View style={{ flex: 1 }}>
                <Txt weight="800">{d.name}</Txt>
                {d.members ? (
                  <Txt faint size={fontSize.xs} numberOfLines={2}>
                    {d.members.map((m) => `${m.emoji} ${m.name}`).join('  ·  ')}
                  </Txt>
                ) : (
                  <Txt faint size={fontSize.xs}>
                    {details.correct ?? 0} ✓ · {details.wrong ?? 0} ✗ · 🍺 {r.sipsDrunk} bu{r.sipsGiven > 0 ? ` · 🤙 ${r.sipsGiven} donné` : ''}
                  </Txt>
                )}
              </View>
              <Txt size={fontSize.xl} weight="900" color={colors.primary}>
                {r.points}
              </Txt>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
