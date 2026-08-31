import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, Txt } from '../../components/ui';
import type { Player } from '../../core/models';
import { randomSeed } from '../../core/rng';
import {
  type QuiDeNousAction,
  type QuiDeNousConfig,
  type QuiDeNousState,
  createQuiDeNousState,
  quiDeNousRanking,
  quiDeNousReducer,
  quiDeNousToSessionResult,
} from '../../core/quidenousEngine';
import { haptics } from '../../lib/haptics';
import { sounds } from '../../lib/sounds';
import { useT } from '../../lib/i18nProvider';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';
import { PROMPTS } from './prompts';

export function QuiDeNousPlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const t = useT();
  const cfg = config as QuiDeNousConfig;
  const [game, setGame] = useState<QuiDeNousState>(() =>
    createQuiDeNousState({ config: cfg, players, pool: PROMPTS, seed: randomSeed() }),
  );
  const [showVote, setShowVote] = useState(false);
  const startedAtRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  const dispatch = (a: QuiDeNousAction) => setGame((s) => quiDeNousReducer(s, a));

  useEffect(() => {
    if (game.phase === 'result') {
      haptics.warn();
      sounds.reveal();
    }
  }, [game.phase, game.round]);

  useEffect(() => {
    if (game.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(quiDeNousToSessionResult(game, startedAtRef.current, Date.now()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase, onFinish]);

  const voteFor = (targetId: string) => {
    haptics.select();
    sounds.tick();
    setShowVote(false);
    dispatch({ type: 'VOTE', targetId });
  };

  const confirmQuit = () =>
    Alert.alert(t('Quitter la partie ?'), t('La partie en cours sera perdue.'), [
      { text: t('Continuer'), style: 'cancel' },
      { text: t('Quitter'), style: 'destructive', onPress: onQuit },
    ]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={confirmQuit} hitSlop={12}>
          <Txt color={colors.textDim} weight="700">
            {t('✕ Quitter')}
          </Txt>
        </Pressable>
        {game.phase !== 'finished' && (
          <Txt faint size={fontSize.sm} weight="700">
            {t('🙋 Manche {n}/{total}', { n: game.round, total: game.totalRounds })}
          </Txt>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {game.phase === 'vote' ? renderVote() : game.phase === 'result' ? renderResult() : null}
      </ScrollView>
    </SafeAreaView>
  );

  function renderVote() {
    const id = game.order[game.voterIdx];
    const p = id ? byId[id] : undefined;
    if (!p) return null;
    if (!showVote) {
      return (
        <View style={{ gap: spacing(2), paddingTop: spacing(5), alignItems: 'center' }}>
          <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={72} playerId={p.id} />
          <Txt faint weight="800" size={fontSize.sm}>
            {t('PASSE LE TÉLÉPHONE')}
          </Txt>
          <Txt size={fontSize.xxl} weight="900" center>
            {t('{name}, à toi', { name: p.name })}
          </Txt>
          <Txt dim center>
            {t('Toi seul(e) votes, puis tu passes au suivant.')}
          </Txt>
          <View style={{ height: spacing(1) }} />
          <Button title={t('Voter en secret')} emoji="🗳️" size="lg" variant="accent" onPress={() => setShowVote(true)} style={{ alignSelf: 'stretch' }} />
        </View>
      );
    }
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(1) }}>
        <Txt faint weight="800" size={fontSize.sm} center>
          {t('QUI EST LE PLUS SUSCEPTIBLE…')}
        </Txt>
        <Txt size={fontSize.xl} weight="900" center>
          {game.prompt} ?
        </Txt>
        <View style={styles.voteGrid}>
          {game.order.map((pid) => {
            const pl = byId[pid];
            if (!pl) return null;
            return (
              <Pressable key={pid} style={styles.voteCell} onPress={() => voteFor(pid)}>
                <PlayerAvatar emoji={pl.emoji} color={pl.color} photoUri={pl.photoUri} size={54} playerId={pl.id} />
                <Txt weight="800" numberOfLines={1}>
                  {pl.name}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderResult() {
    const o = game.lastOutcome;
    if (!o) return null;
    const winnerNames = o.winners.map((id) => byId[id]?.name ?? '?').join(', ');
    const ranked = quiDeNousRanking(game);
    const last = game.round >= game.totalRounds;
    // Décompte trié (les plus désignés d'abord), joueurs sans vote omis.
    const tally = [...game.order]
      .map((id) => ({ id, n: o.votesByTarget[id] ?? 0 }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(1) }}>
        <Txt faint weight="800" size={fontSize.xs} center>
          {t('QUI EST LE PLUS SUSCEPTIBLE…')}
        </Txt>
        <Txt size={fontSize.lg} weight="900" center>
          {o.prompt} ?
        </Txt>

        <Card accent={colors.accent}>
          <Txt weight="800" center size={fontSize.lg}>
            {t(o.winners.length > 1 ? '🌟 Ex æquo : {names}' : '🌟 {names}', { names: winnerNames })}
          </Txt>
          <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(0.5) }}>
            {t(o.maxVotes > 1 ? '{n} doigts pointés' : '{n} doigt pointé', { n: o.maxVotes })}
          </Txt>
        </Card>

        {o.sips > 0 && o.winners.length > 0 && (
          <Card accent={colors.sip}>
            <Txt weight="800" color={colors.sip}>
              {t(o.sips > 1 ? '🍺 {names} : {n} gorgées' : '🍺 {names} : {n} gorgée', { names: winnerNames, n: o.sips })}
            </Txt>
          </Card>
        )}

        {tally.length > 0 && (
          <View>
            <Txt faint weight="800" size={fontSize.xs} style={{ marginBottom: spacing(0.5) }}>
              {t('DÉCOMPTE')}
            </Txt>
            {tally.map(({ id, n }) => {
              const p = byId[id];
              return (
                <View key={id} style={styles.standRow}>
                  {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={26} playerId={p.id} />}
                  <Txt weight="700" style={{ flex: 1 }} numberOfLines={1}>
                    {p?.name ?? id}
                  </Txt>
                  <Txt weight="900" color={colors.accent}>
                    {n}
                  </Txt>
                </View>
              );
            })}
          </View>
        )}

        <View>
          <Txt faint weight="800" size={fontSize.xs} style={{ marginBottom: spacing(0.5) }}>
            {t('VEDETTES DE LA SOIRÉE')}
          </Txt>
          {ranked.map((id, i) => {
            const p = byId[id];
            return (
              <View key={id} style={styles.standRow}>
                <Txt weight="800" style={{ width: 22 }}>
                  {i + 1}
                </Txt>
                {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={26} playerId={p.id} />}
                <Txt weight="700" style={{ flex: 1 }} numberOfLines={1}>
                  {p?.name ?? id}
                </Txt>
                <Txt weight="900" color={colors.primary}>
                  {game.scores[id] ?? 0}
                </Txt>
              </View>
            );
          })}
        </View>

        <Button
          title={last ? t('Voir les résultats') : t('Manche suivante')}
          emoji={last ? '🏁' : '➡️'}
          size="lg"
          onPress={() => dispatch({ type: 'NEXT' })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
  },
  body: { padding: spacing(2), paddingBottom: spacing(4) },
  voteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5), justifyContent: 'center' },
  voteCell: {
    width: 96,
    alignItems: 'center',
    gap: spacing(0.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(0.5),
  },
  standRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), paddingVertical: spacing(0.5) },
});
