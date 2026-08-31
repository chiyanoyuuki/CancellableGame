import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card, EmptyState, PlayerAvatar, Screen, SectionHeader, Txt } from '../components/ui';
import type { Player } from '../core/models';
import { playerTotals, seasonChampion, seasonKey, seasonKeys, seasonRef, type StatResult } from '../core/stats';
import { listPlayers, loadStatResults } from '../db';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, RANK_MEDALS, spacing } from '../theme/theme';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/** Classement mensuel qui repart à zéro chaque mois + palmarès des champions. */
export function SeasonsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Seasons'>) {
  const t = useT();
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<StatResult[]>([]);

  useEffect(() => {
    void (async () => {
      const [pl, r] = await Promise.all([listPlayers(true), loadStatResults()]);
      setPlayers(pl);
      setResults(r);
    })();
  }, []);

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  const label = (key: string) => {
    const [y, mm] = key.split('-').map(Number);
    return `${t(MONTHS[(mm ?? 1) - 1] ?? '')} ${y}`;
  };

  const currentKey = seasonKey(Date.now());
  const current = useMemo(
    () =>
      [...playerTotals(results, { period: 'month', ref: seasonRef(currentKey) })].sort(
        (a, b) => b.wins - a.wins || b.points - a.points,
      ),
    [results, currentKey],
  );

  const pastChampions = useMemo(
    () => seasonKeys(results).filter((k) => k !== currentKey).map((k) => seasonChampion(results, k)),
    [results, currentKey],
  );

  return (
    <Screen title={t('Saisons')} subtitle={t('Un classement qui repart chaque mois')} onBack={() => navigation.goBack()} scroll>
      <SectionHeader title={t('Saison en cours · {month}', { month: label(currentKey) })} />
      {current.length === 0 ? (
        <EmptyState emoji="📅" title={t('Pas encore de partie ce mois-ci')} subtitle={t('Jouez pour lancer la course au titre !')} />
      ) : (
        <>
          {current.slice(0, 10).map((row, i) => {
            const p = byId[row.playerId];
            return (
              <Card
                key={row.playerId}
                accent={i === 0 ? colors.warning : p?.color}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginBottom: spacing(0.75) }}
                onPress={p ? () => navigation.navigate('PlayerProfile', { playerId: p.id }) : undefined}
              >
                <Txt size={fontSize.lg} weight="900" style={{ width: 30 }}>
                  {RANK_MEDALS[i] ?? `${i + 1}`}
                </Txt>
                {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={36} playerId={p.id} />}
                <View style={{ flex: 1 }}>
                  <Txt weight="800" numberOfLines={1}>{p?.name ?? row.playerId}</Txt>
                  <Txt faint size={fontSize.xs}>
                    {t('{w} victoires · {g} parties', { w: row.wins, g: row.games })}
                  </Txt>
                </View>
                <Txt weight="900" color={colors.primary}>{row.points}</Txt>
              </Card>
            );
          })}
        </>
      )}

      {pastChampions.length > 0 && (
        <>
          <SectionHeader title={t('Champions des saisons passées')} />
          {pastChampions.map((c) => {
            const p = c.playerId ? byId[c.playerId] : undefined;
            return (
              <Card key={c.key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginBottom: spacing(0.75) }}>
                <Txt size={fontSize.lg}>🏆</Txt>
                <View style={{ flex: 1 }}>
                  <Txt weight="800" numberOfLines={1}>{label(c.key)}</Txt>
                  <Txt faint size={fontSize.xs}>
                    {p ? t('{w} victoires', { w: c.wins }) : t('Aucune donnée')}
                  </Txt>
                </View>
                {p ? (
                  <>
                    <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={30} playerId={p.id} />
                    <Txt weight="800" numberOfLines={1} style={{ maxWidth: 110 }}>{p.name}</Txt>
                  </>
                ) : (
                  <Txt faint>—</Txt>
                )}
              </Card>
            );
          })}
        </>
      )}
    </Screen>
  );
}
