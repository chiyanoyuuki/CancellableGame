import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, Txt } from '../../components/ui';
import type { Player } from '../../core/models';
import { randomSeed } from '../../core/rng';
import {
  type TuPreferesAction,
  type TuPreferesConfig,
  type TuPreferesState,
  type Vote,
  createTuPreferesState,
  tuPreferesRanking,
  tuPreferesReducer,
  tuPreferesToSessionResult,
} from '../../core/tupreferesEngine';
import { haptics } from '../../lib/haptics';
import { sounds } from '../../lib/sounds';
import { useT } from '../../lib/i18nProvider';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';
import { DILEMMAS } from './dilemmas';

export function TuPreferesPlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const t = useT();
  const cfg = config as TuPreferesConfig;
  const [game, setGame] = useState<TuPreferesState>(() =>
    createTuPreferesState({ config: cfg, players, pool: DILEMMAS, seed: randomSeed() }),
  );
  const [showVote, setShowVote] = useState(false);
  const startedAtRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  const dispatch = (a: TuPreferesAction) => setGame((s) => tuPreferesReducer(s, a));

  useEffect(() => {
    if (game.phase === 'result') {
      if (game.lastOutcome?.tie) haptics.warn();
      else haptics.correct();
      sounds.reveal();
    }
  }, [game.phase, game.round, game.lastOutcome?.tie]);

  useEffect(() => {
    if (game.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(tuPreferesToSessionResult(game, startedAtRef.current, Date.now()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase, onFinish]);

  const vote = (v: Vote) => {
    haptics.select();
    sounds.tick();
    setShowVote(false);
    dispatch({ type: 'VOTE', vote: v });
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
            {t('🤔 Manche {n}/{total}', { n: game.round, total: game.totalRounds })}
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
      <View style={{ gap: spacing(2), paddingTop: spacing(2) }}>
        <Txt faint weight="800" size={fontSize.sm} center>
          {t('TU PRÉFÈRES…')}
        </Txt>
        <Pressable style={[styles.option, { borderColor: colors.primary }]} onPress={() => vote('a')}>
          <Txt weight="900" size={fontSize.lg} color={colors.primary}>
            A
          </Txt>
          <Txt weight="700" size={fontSize.lg} style={{ flex: 1 }}>
            {game.dilemma.a}
          </Txt>
        </Pressable>
        <Txt faint weight="800" center>
          {t('— ou —')}
        </Txt>
        <Pressable style={[styles.option, { borderColor: colors.accent }]} onPress={() => vote('b')}>
          <Txt weight="900" size={fontSize.lg} color={colors.accent}>
            B
          </Txt>
          <Txt weight="700" size={fontSize.lg} style={{ flex: 1 }}>
            {game.dilemma.b}
          </Txt>
        </Pressable>
      </View>
    );
  }

  function renderResult() {
    const o = game.lastOutcome;
    if (!o) return null;
    const total = o.votesA + o.votesB || 1;
    const pctA = Math.round((o.votesA / total) * 100);
    const drinkerNames = o.drinkers.map((id) => byId[id]?.name ?? '?').join(', ');
    const ranked = tuPreferesRanking(game);
    const last = game.round >= game.totalRounds;
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(1) }}>
        <Txt faint weight="800" size={fontSize.xs} center>
          {t('RÉSULTAT')}
        </Txt>

        {/* Barre de partage A / B */}
        <View style={{ gap: spacing(0.5) }}>
          <View style={styles.splitRow}>
            <Txt weight="800" color={colors.primary}>
              A · {o.votesA}
            </Txt>
            <Txt weight="800" color={colors.accent}>
              {o.votesB} · B
            </Txt>
          </View>
          <View style={styles.splitBar}>
            <View style={{ flex: Math.max(o.votesA, 0.001), backgroundColor: colors.primary }} />
            <View style={{ flex: Math.max(o.votesB, 0.001), backgroundColor: colors.accent }} />
          </View>
          <Txt faint size={fontSize.xs} center>
            {t('{pct}% ont préféré A', { pct: pctA })}
          </Txt>
        </View>

        <Card>
          <View style={styles.optLine}>
            <Txt weight="900" color={colors.primary}>A</Txt>
            <Txt weight="700" style={{ flex: 1 }}>{o.a}</Txt>
          </View>
          <View style={[styles.optLine, { marginTop: spacing(0.5) }]}>
            <Txt weight="900" color={colors.accent}>B</Txt>
            <Txt weight="700" style={{ flex: 1 }}>{o.b}</Txt>
          </View>
        </Card>

        {o.tie ? (
          <Card accent={colors.warning}>
            <Txt weight="800" center>{t('🥂 Égalité — tout le monde trinque !')}</Txt>
          </Card>
        ) : o.sips > 0 && o.drinkers.length > 0 ? (
          <Card accent={colors.sip}>
            <Txt weight="800" color={colors.sip}>
              {t(o.sips > 1 ? '🍺 {names} : {n} gorgées' : '🍺 {names} : {n} gorgée', { names: drinkerNames, n: o.sips })}
            </Txt>
            <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
              {cfg.drinkingSide === 'minority' ? t('Le camp minoritaire boit.') : t('Le camp majoritaire boit.')}
            </Txt>
          </Card>
        ) : null}

        <View>
          <Txt faint weight="800" size={fontSize.xs} style={{ marginBottom: spacing(0.5) }}>
            {t('CLASSEMENT')}
          </Txt>
          {ranked.map((id, i) => {
            const p = byId[id];
            return (
              <View key={id} style={styles.standRow}>
                <Txt weight="800" style={{ width: 22 }}>
                  {i + 1}
                </Txt>
                {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={28} playerId={p.id} />}
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    padding: spacing(2),
  },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  splitBar: { flexDirection: 'row', height: 16, borderRadius: radius.sm, overflow: 'hidden' },
  optLine: { flexDirection: 'row', alignItems: 'center', gap: spacing(1) },
  standRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), paddingVertical: spacing(0.5) },
});
