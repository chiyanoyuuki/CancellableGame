import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button, Card, EmptyState, PlayerAvatar, Screen, SectionHeader, Txt } from '../components/ui';
import type { Player } from '../core/models';
import { createSoiree, type SoireeState, soireeChampion, soireeStandings } from '../core/soiree';
import { clearActiveSoiree, getActiveSoiree, listPlayers, saveActiveSoiree } from '../db';
import { getGame, MINI_GAMES } from '../games/registry';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { isModeUnlocked } from '../store/products';
import { colors, fontSize, RANK_MEDALS, spacing } from '../theme/theme';

export function SoireeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Soiree'>) {
  const t = useT();
  const { ent } = useStore();
  const [soiree, setSoiree] = useState<SoireeState | null | undefined>(undefined);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [picking, setPicking] = useState(false);
  const [finished, setFinished] = useState(false);

  const load = useCallback(async () => {
    const [s, pl] = await Promise.all([getActiveSoiree(), listPlayers(false)]);
    setSoiree(s);
    setPlayers(pl);
    if (!s) setSelected((prev) => (prev.size === 0 ? new Set(pl.map((p) => p.id)) : prev));
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const start = async () => {
    const chosen = players.filter((p) => selected.has(p.id));
    if (chosen.length < 2) return;
    const s = createSoiree(chosen);
    await saveActiveSoiree(s);
    setFinished(false);
    setSoiree(s);
  };

  const endSoiree = () =>
    Alert.alert(t('Terminer la soirée ?'), t('Le classement final sera affiché.'), [
      { text: t('Annuler'), style: 'cancel' },
      { text: t('Terminer'), onPress: () => setFinished(true) },
    ]);

  const newSoiree = async () => {
    await clearActiveSoiree();
    setFinished(false);
    setSoiree(null);
    setSelected(new Set(players.map((p) => p.id)));
  };

  const playRound = (gameId: string) => {
    const g = getGame(gameId);
    if (!g || !soiree) return;
    if (!isModeUnlocked(gameId, ent)) {
      navigation.navigate('Store');
      return;
    }
    setPicking(false);
    navigation.navigate('GameConfig', { gameId, players: soiree.players, soiree: true });
  };

  // --- Chargement ---
  if (soiree === undefined) {
    return <Screen title={t('Mode Soirée')} onBack={() => navigation.goBack()} scroll><View /></Screen>;
  }

  // --- Classement final ---
  if (soiree && finished) {
    const standings = soireeStandings(soiree);
    const champ = soireeChampion(soiree);
    return (
      <Screen
        title={t('Fin de la soirée')}
        onBack={() => navigation.navigate('Home')}
        scroll
        footer={
          <>
            <Button title={t('Nouvelle soirée')} emoji="🎉" onPress={() => void newSoiree()} />
            <Button title={t('Accueil')} variant="ghost" onPress={() => navigation.navigate('Home')} />
          </>
        }
      >
        <View style={{ alignItems: 'center', gap: spacing(1), marginBottom: spacing(2) }}>
          <Txt size={fontSize.huge}>🏆</Txt>
          {champ ? (
            <>
              <PlayerAvatar emoji={champ.emoji} color={champ.color} photoUri={champ.photoUri} size={72} />
              <Txt size={fontSize.xl} weight="900">{champ.name}</Txt>
              <Txt dim>{t('champion de la soirée !')}</Txt>
            </>
          ) : (
            <Txt weight="800">{t('Égalité en tête, pas de champion unique !')}</Txt>
          )}
        </View>
        {standings.map((s, i) => (
          <StandingRow key={s.player.id} rank={i} standing={s} />
        ))}
        <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(2) }}>
          {t(soiree.rounds.length > 1 ? '{n} manches jouées' : '{n} manche jouée', { n: soiree.rounds.length })}
        </Txt>
      </Screen>
    );
  }

  // --- Mise en place (aucune soirée en cours) ---
  if (!soiree) {
    const chosenCount = players.filter((p) => selected.has(p.id)).length;
    return (
      <Screen
        title={t('Mode Soirée')}
        subtitle={t('Un fil rouge pour toute la soirée')}
        onBack={() => navigation.goBack()}
        scroll
        footer={
          <Button
            title={`${t('Démarrer la soirée')}${chosenCount >= 2 ? ` (${chosenCount})` : ''}`}
            emoji="🎉"
            size="lg"
            disabled={chosenCount < 2}
            onPress={() => void start()}
          />
        }
      >
        <Card accent={colors.accent}>
          <Txt weight="800">{t('🎉 Enchaînez les mini-jeux, un seul classement')}</Txt>
          <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
            {t(
              'Jouez plusieurs manches (Quiz, Bombe, Duel…) : chaque manche rapporte des points selon le classement. À la fin, un champion de la soirée est couronné.',
            )}
          </Txt>
        </Card>

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

  // --- Un tournoi occupe l'état de soirée : on renvoie vers son écran dédié. ---
  if (soiree.plan && soiree.plan.length > 0) {
    return (
      <Screen title={t('Mode Soirée')} onBack={() => navigation.navigate('Home')} scroll>
        <EmptyState emoji="🏆" title={t('Un tournoi est en cours')} subtitle={t('Reprends-le pour continuer les manches.')} />
        <View style={{ marginTop: spacing(2) }}>
          <Button title={t('Reprendre le tournoi')} emoji="🏆" onPress={() => navigation.navigate('Tournoi')} />
        </View>
      </Screen>
    );
  }

  // --- Soirée en cours (tableau de bord) ---
  const standings = soireeStandings(soiree);
  return (
    <Screen
      title={t('Mode Soirée')}
      subtitle={`${t('{n} joueurs', { n: soiree.players.length })} · ${t(soiree.rounds.length > 1 ? '{n} manches' : '{n} manche', { n: soiree.rounds.length })}`}
      onBack={() => navigation.navigate('Home')}
      scroll
      footer={
        <>
          <Button title={t('Jouer une manche')} emoji="🎮" size="lg" onPress={() => setPicking((v) => !v)} />
          <Button title={t('Terminer la soirée')} variant="ghost" onPress={endSoiree} />
        </>
      }
    >
      {picking && (
        <Card style={{ marginBottom: spacing(1) }}>
          <Txt weight="800" style={{ marginBottom: spacing(1) }}>{t('Choisis un mini-jeu')}</Txt>
          <View style={{ gap: spacing(1) }}>
            {MINI_GAMES.filter((g) => g.available).map((g) => {
              const locked = !isModeUnlocked(g.id, ent);
              return (
                <Pressable key={g.id} onPress={() => playRound(g.id)}>
                  <Card accent={locked ? colors.border : colors.primary} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) }}>
                    <Txt size={fontSize.xl}>{locked ? '🔒' : g.emoji}</Txt>
                    <View style={{ flex: 1 }}>
                      <Txt weight="800">{t(g.title)}</Txt>
                      <Txt faint size={fontSize.xs} numberOfLines={1}>{t(g.description)}</Txt>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </Card>
      )}

      <SectionHeader title={t('Classement de la soirée')} />
      {standings.map((s, i) => (
        <StandingRow key={s.player.id} rank={i} standing={s} />
      ))}

      {soiree.rounds.length > 0 && (
        <>
          <SectionHeader title={t('Manches jouées')} />
          {soiree.rounds.map((r, i) => {
            const g = getGame(r.gameId);
            const winner = soiree.players.find((p) => p.id === r.winnerId);
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), paddingVertical: spacing(0.5) }}>
                <Txt>{g?.emoji ?? '🎲'}</Txt>
                <Txt weight="700" style={{ flex: 1 }}>{g ? t(g.title) : r.gameId}</Txt>
                <Txt faint size={fontSize.xs}>{winner ? `🏆 ${winner.name}` : '—'}</Txt>
              </View>
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
