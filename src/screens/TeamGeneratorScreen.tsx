import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, EmptyState, PlayerAvatar, Screen, SectionHeader, Segmented, Txt } from '../components/ui';
import type { Player } from '../core/models';
import { randomSeed } from '../core/rng';
import { makeTeams } from '../core/teams';
import { listPlayers } from '../db';
import { haptics } from '../lib/haptics';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, PLAYER_COLORS, spacing } from '../theme/theme';

const TEAM_EMOJIS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];

export function TeamGeneratorScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'TeamGenerator'>) {
  const t = useT();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][] | null>(null);

  useEffect(() => {
    void (async () => {
      const pl = await listPlayers(false);
      setPlayers(pl);
      setSelected(new Set(pl.map((p) => p.id)));
    })();
  }, []);

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  const chosen = players.filter((p) => selected.has(p.id));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const generate = () => {
    if (chosen.length < 2) return;
    haptics.heavy();
    setTeams(makeTeams(chosen.map((p) => p.id), teamCount, randomSeed()));
  };

  if (players.length < 2) {
    return (
      <Screen title={t("Générateur d'équipes")} onBack={() => navigation.goBack()}>
        <EmptyState emoji="👥" title={t('Pas assez de joueurs')} subtitle={t("Ajoute au moins 2 joueurs dans l'écran Joueurs.")} />
      </Screen>
    );
  }

  return (
    <Screen
      title={t("Générateur d'équipes")}
      subtitle={t('Des équipes équilibrées en un tap')}
      onBack={() => navigation.goBack()}
      scroll
      footer={
        <Button
          title={teams ? t('Re-générer 🎲') : t('Générer les équipes')}
          emoji={teams ? undefined : '🎲'}
          size="lg"
          variant="accent"
          disabled={chosen.length < 2}
          onPress={generate}
        />
      }
    >
      {teams ? (
        <>
          <SectionHeader title={t('Équipes')} />
          {teams.map((team, i) => (
            <Card key={i} accent={PLAYER_COLORS[i % PLAYER_COLORS.length]} style={{ marginBottom: spacing(1) }}>
              <Txt weight="800" style={{ marginBottom: spacing(1) }}>
                {TEAM_EMOJIS[i % TEAM_EMOJIS.length]} {t('Équipe {n}', { n: i + 1 })} · {t('{n} joueurs', { n: team.length })}
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5) }}>
                {team.map((pid) => {
                  const p = byId[pid];
                  return (
                    <View key={pid} style={{ alignItems: 'center', width: 64, gap: spacing(0.5) }}>
                      {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={40} playerId={p.id} />}
                      <Txt size={fontSize.xs} weight="700" numberOfLines={1}>{p?.name ?? pid}</Txt>
                    </View>
                  );
                })}
              </View>
            </Card>
          ))}
          <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(1) }}>
            {t('Pas convaincu ? Re-génère pour un autre tirage.')}
          </Txt>
        </>
      ) : (
        <>
          <SectionHeader title={t('Nombre d\'équipes')} />
          <Segmented<string>
            value={String(teamCount)}
            onChange={(v) => setTeamCount(Number(v))}
            options={[2, 3, 4].filter((n) => n <= Math.max(2, chosen.length)).map((n) => ({ label: `${n}`, value: String(n) }))}
          />

          <SectionHeader title={t('Qui participe ?')} />
          {players.map((p) => {
            const on = selected.has(p.id);
            return (
              <Pressable key={p.id} onPress={() => toggle(p.id)}>
                <Card
                  accent={on ? p.color : colors.border}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), marginBottom: spacing(1), opacity: on ? 1 : 0.5 }}
                >
                  <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={40} selected={on} />
                  <Txt weight="700" style={{ flex: 1 }}>{p.name}</Txt>
                  <Txt weight="900" color={on ? colors.success : colors.textFaint}>{on ? '✓' : '+'}</Txt>
                </Card>
              </Pressable>
            );
          })}
        </>
      )}
    </Screen>
  );
}
