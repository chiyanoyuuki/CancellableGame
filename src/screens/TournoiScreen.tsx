import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button, Card, EmptyState, PlayerAvatar, Screen, SectionHeader, Segmented, Txt } from '../components/ui';
import type { Player } from '../core/models';
import { mulberry32, randomSeed, shuffle } from '../core/rng';
import {
  createSoiree,
  isTournoi,
  isTournoiComplete,
  nextPlannedGameId,
  plannedRemaining,
  type SoireeState,
  soireeChampion,
  soireeStandings,
} from '../core/soiree';
import { clearActiveSoiree, getActiveSoiree, listPlayers, saveActiveSoiree } from '../db';
import { getGame, MINI_GAMES } from '../games/registry';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { isModeUnlocked } from '../store/products';
import { colors, fontSize, RANK_MEDALS, spacing } from '../theme/theme';

const ROUND_OPTIONS = [3, 5, 7];

export function TournoiScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Tournoi'>) {
  const t = useT();
  const { ent } = useStore();
  const [state, setState] = useState<SoireeState | null | undefined>(undefined);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rounds, setRounds] = useState(5);

  const load = useCallback(async () => {
    const [s, pl] = await Promise.all([getActiveSoiree(), listPlayers(false)]);
    setState(s);
    setPlayers(pl);
    if (!s || !isTournoi(s)) setSelected((prev) => (prev.size === 0 ? new Set(pl.map((p) => p.id)) : prev));
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  // Programme « surprise » : mélange les jeux débloqués et en prend `rounds`
  // (on recommence la liste mélangée si le tournoi est plus long que le catalogue).
  const buildPlan = (): string[] => {
    const rng = mulberry32(randomSeed());
    const pool = MINI_GAMES.filter((g) => g.available && isModeUnlocked(g.id, ent)).map((g) => g.id);
    if (pool.length === 0) return [];
    const plan: string[] = [];
    while (plan.length < rounds) plan.push(...shuffle(pool, rng));
    return plan.slice(0, rounds);
  };

  const start = async () => {
    const chosen = players.filter((p) => selected.has(p.id));
    if (chosen.length < 2) return;
    const plan = buildPlan();
    if (plan.length === 0) {
      navigation.navigate('Store');
      return;
    }
    const s = createSoiree(chosen, Date.now(), plan);
    await saveActiveSoiree(s);
    setState(s);
  };

  const newTournoi = async () => {
    await clearActiveSoiree();
    setState(null);
    setSelected(new Set(players.map((p) => p.id)));
  };

  const playNext = (gameId: string) => {
    if (!isModeUnlocked(gameId, ent)) {
      navigation.navigate('Store');
      return;
    }
    if (!state) return;
    navigation.navigate('GameConfig', { gameId, players: state.players, soiree: true });
  };

  if (state === undefined) {
    return <Screen title={t('Tournoi')} onBack={() => navigation.goBack()} scroll><View /></Screen>;
  }

  // Une soirée LIBRE est en cours → on n'écrase pas sans prévenir.
  if (state && !isTournoi(state)) {
    return (
      <Screen title={t('Tournoi')} onBack={() => navigation.goBack()} scroll>
        <EmptyState emoji="🎉" title={t('Une soirée libre est en cours')} subtitle={t('Termine-la (ou démarre un nouveau tournoi, ce qui la remplacera).')} />
        <View style={{ gap: spacing(1), marginTop: spacing(2) }}>
          <Button title={t('Ouvrir la soirée')} emoji="🎉" onPress={() => navigation.navigate('Soiree')} />
          <Button title={t('Nouveau tournoi')} emoji="🏆" variant="secondary" onPress={() => void newTournoi()} />
        </View>
      </Screen>
    );
  }

  // Cérémonie de fin.
  if (state && isTournoiComplete(state)) {
    const standings = soireeStandings(state);
    const champ = soireeChampion(state);
    return (
      <Screen
        title={t('Fin du tournoi')}
        onBack={() => navigation.navigate('Home')}
        scroll
        footer={
          <>
            <Button title={t('Nouveau tournoi')} emoji="🏆" onPress={() => void newTournoi()} />
            <Button title={t('Accueil')} variant="ghost" onPress={() => navigation.navigate('Home')} />
          </>
        }
      >
        <View style={{ alignItems: 'center', gap: spacing(1), marginBottom: spacing(2) }}>
          <Txt size={fontSize.huge}>🏆</Txt>
          {champ ? (
            <>
              <PlayerAvatar emoji={champ.emoji} color={champ.color} photoUri={champ.photoUri} size={80} />
              <Txt size={fontSize.xl} weight="900">{champ.name}</Txt>
              <Txt dim>{t('remporte le tournoi ! 🎊')}</Txt>
            </>
          ) : (
            <Txt weight="800">{t('Égalité en tête, pas de vainqueur unique !')}</Txt>
          )}
        </View>
        {standings.map((s, i) => (
          <StandingRow key={s.player.id} rank={i} standing={s} />
        ))}
      </Screen>
    );
  }

  // Tournoi EN COURS.
  if (state && isTournoi(state)) {
    const standings = soireeStandings(state);
    const nextId = nextPlannedGameId(state);
    const nextGame = nextId ? getGame(nextId) : null;
    const total = state.plan!.length;
    const roundNo = state.rounds.length + 1;
    return (
      <Screen
        title={t('Tournoi')}
        subtitle={t('Manche {n}/{total}', { n: roundNo, total })}
        onBack={() => navigation.navigate('Home')}
        scroll
        footer={
          nextGame ? (
            <Button
              title={t('Jouer : {game}', { game: t(nextGame.title) })}
              emoji={nextGame.emoji}
              size="lg"
              onPress={() => playNext(nextGame.id)}
            />
          ) : undefined
        }
      >
        <SectionHeader title={t('Programme')} />
        <Card>
          {state.plan!.map((gid, i) => {
            const g = getGame(gid);
            const done = i < state.rounds.length;
            const isCurrent = i === state.rounds.length;
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), paddingVertical: spacing(0.5), opacity: done ? 0.5 : 1 }}>
                <Txt weight="800" style={{ width: 28 }}>{done ? '✓' : `${i + 1}`}</Txt>
                <Txt>{g?.emoji ?? '🎲'}</Txt>
                <Txt weight={isCurrent ? '900' : '700'} color={isCurrent ? colors.primary : colors.text} style={{ flex: 1 }}>
                  {g ? t(g.title) : gid}
                </Txt>
                {isCurrent && <Txt faint size={fontSize.xs}>{t('à jouer')}</Txt>}
              </View>
            );
          })}
        </Card>

        <SectionHeader title={t('Classement')} />
        {standings.map((s, i) => (
          <StandingRow key={s.player.id} rank={i} standing={s} />
        ))}
        <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(1) }}>
          {t(plannedRemaining(state) > 1 ? 'Encore {n} manches' : 'Dernière manche', { n: plannedRemaining(state) })}
        </Txt>
      </Screen>
    );
  }

  // Mise en place (aucun tournoi en cours).
  const chosenCount = players.filter((p) => selected.has(p.id)).length;
  return (
    <Screen
      title={t('Tournoi')}
      subtitle={t('Un programme de manches, un champion à la fin')}
      onBack={() => navigation.goBack()}
      scroll
      footer={
        <Button
          title={`${t('Lancer le tournoi')}${chosenCount >= 2 ? ` (${chosenCount})` : ''}`}
          emoji="🏆"
          size="lg"
          disabled={chosenCount < 2}
          onPress={() => void start()}
        />
      }
    >
      <Card accent={colors.accent}>
        <Txt weight="800">{t('🏆 Un vrai tournoi de soirée')}</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t('Une sélection surprise de mini-jeux enchaînés. Chaque manche rapporte des points selon le classement ; le meilleur cumul est sacré champion.')}
        </Txt>
      </Card>

      <SectionHeader title={t('Nombre de manches')} />
      <Segmented<string>
        value={String(rounds)}
        onChange={(v) => setRounds(Number(v))}
        options={ROUND_OPTIONS.map((r) => ({ label: `${r}`, value: String(r) }))}
      />

      {players.length < 2 ? (
        <EmptyState emoji="👥" title={t('Pas assez de joueurs')} subtitle={t("Ajoute au moins 2 joueurs dans l'écran Joueurs.")} />
      ) : (
        <>
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

function StandingRow({ rank, standing }: { rank: number; standing: ReturnType<typeof soireeStandings>[number] }) {
  const { player, points } = standing;
  return (
    <Card
      accent={rank === 0 ? colors.warning : player.color}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), marginBottom: spacing(1) }}
    >
      <Txt size={fontSize.lg} weight="900" style={{ width: 30 }}>
        {RANK_MEDALS[rank] ?? `${standing.rank}`}
      </Txt>
      <PlayerAvatar emoji={player.emoji} color={player.color} photoUri={player.photoUri} size={36} />
      <Txt weight="800" style={{ flex: 1 }} numberOfLines={1}>{player.name}</Txt>
      <Txt size={fontSize.lg} weight="900" color={colors.primary}>{points}</Txt>
    </Card>
  );
}
