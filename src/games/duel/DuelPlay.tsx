import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, Txt } from '../../components/ui';
import { DIFFICULTY_LABELS, type DuelConfig, type Player, THEME_META } from '../../core/models';
import { type DuelAction, type DuelState, createDuelState, duelReducer, duelToSessionResult } from '../../core/duelEngine';
import { mulberry32, randomSeed, shuffle } from '../../core/rng';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';
import { getQuizPool } from '../quiz/pool';

function haptic(success: boolean) {
  try {
    void Haptics.notificationAsync(
      success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );
  } catch {
    // best-effort
  }
}

export function DuelPlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const cfg = config as DuelConfig;
  const [game, setGame] = useState<DuelState | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState(false);

  const startedAtRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const pool = await getQuizPool();
      const seed = randomSeed();
      const order = shuffle(players, mulberry32(seed)).map((p) => p.id);
      if (!alive) return;
      startedAtRef.current = Date.now();
      setGame(createDuelState({ config: cfg, players, pool, seed, order }));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = (a: DuelAction) => setGame((s) => (s ? duelReducer(s, a) : s));

  // Reset the free-answer reveal whenever a new question appears.
  useEffect(() => {
    if (game?.phase === 'question') setRevealedAnswer(false);
  }, [game?.activeId, game?.phase, game?.current?.id]);

  useEffect(() => {
    if (game?.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(duelToSessionResult(game, startedAtRef.current, Date.now()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, onFinish]);

  const confirmQuit = () =>
    Alert.alert('Quitter le duel ?', 'La partie en cours sera perdue.', [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: onQuit },
    ]);

  const answer = (correct: boolean) => {
    haptic(correct);
    dispatch({ type: 'ANSWER', correct });
  };

  if (!game) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Txt dim style={{ marginTop: spacing(2) }}>
            Préparation du duel…
          </Txt>
        </View>
      </SafeAreaView>
    );
  }

  const q = game.current;
  const active = game.activeId ? byId[game.activeId] : undefined;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={confirmQuit} hitSlop={12}>
          <Txt color={colors.textDim} weight="700">
            ✕ Quitter
          </Txt>
        </Pressable>
        <Txt faint size={fontSize.sm} weight="700">
          ⚔️ {game.alive.length} en jeu
        </Txt>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {game.phase === 'reveal' ? renderReveal() : q ? renderQuestion() : null}
      </ScrollView>
    </SafeAreaView>
  );

  function renderQuestion() {
    if (!q) return null;
    const theme = THEME_META[q.theme];
    return (
      <View style={{ gap: spacing(2) }}>
        <View style={styles.metaRow}>
          <Txt weight="800" color={colors.accent}>
            {theme.emoji} {theme.label}
          </Txt>
          <Txt faint weight="700" size={fontSize.xs}>
            {DIFFICULTY_LABELS[q.difficulty].toUpperCase()}
          </Txt>
        </View>

        {active && (
          <View style={styles.activeBanner}>
            <PlayerAvatar emoji={active.emoji} color={active.color} size={32} />
            <Txt weight="800">À toi, {active.name} !</Txt>
          </View>
        )}

        {q.media?.type === 'emoji' && !!q.media.emoji && (
          <Txt center style={styles.rebus}>
            {q.media.emoji}
          </Txt>
        )}

        <Txt size={fontSize.xl} weight="800">
          {q.text}
        </Txt>

        {cfg.allowPropositions && renderHelpBar()}
        {renderAnswerControls()}
      </View>
    );
  }

  function renderHelpBar() {
    return (
      <View style={styles.helpRow}>
        <Button
          title="4 propositions"
          variant="secondary"
          size="sm"
          style={{ flex: 1 }}
          disabled={game!.propsShown !== 0}
          onPress={() => dispatch({ type: 'REVEAL_PROPS', count: 4 })}
        />
        <Button
          title="2 propositions"
          variant="secondary"
          size="sm"
          style={{ flex: 1 }}
          disabled={game!.propsShown === 2}
          onPress={() => dispatch({ type: 'REVEAL_PROPS', count: 2 })}
        />
      </View>
    );
  }

  function renderOptions() {
    const opts = game!.propsShown === 4 ? game!.currentOptions : game!.propsShown === 2 ? game!.pairOptions : [];
    if (opts.length === 0) return null;
    return (
      <View style={{ gap: spacing(1) }}>
        {opts.map((opt) => (
          <Pressable key={opt} style={styles.option} onPress={() => answer(opt === q!.answer)}>
            <Txt weight="700">{opt}</Txt>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderAnswerControls() {
    if (!q) return null;
    if (game!.propsShown > 0) return renderOptions();

    if (!revealedAnswer) {
      return <Button title="Révéler la réponse" onPress={() => setRevealedAnswer(true)} />;
    }
    return (
      <View style={{ gap: spacing(1) }}>
        <Card accent={colors.success}>
          <Txt faint size={fontSize.xs}>
            RÉPONSE
          </Txt>
          <Txt size={fontSize.lg} weight="800">
            {q.answer}
          </Txt>
        </Card>
        <View style={{ flexDirection: 'row', gap: spacing(1) }}>
          <Button title="✅ Réussi" variant="primary" style={{ flex: 1 }} onPress={() => answer(true)} />
          <Button title="❌ Raté" variant="danger" style={{ flex: 1 }} onPress={() => answer(false)} />
        </View>
      </View>
    );
  }

  function renderReveal() {
    const survived = game!.lastCorrect === true;
    const elim = game!.lastEliminatedId ? byId[game!.lastEliminatedId] : undefined;
    const stillIn = game!.alive.filter((id) => id !== game!.lastEliminatedId);
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(2) }}>
        <View style={{ alignItems: 'center', gap: spacing(1) }}>
          <Txt size={fontSize.huge}>{survived ? '✅' : '💥'}</Txt>
          <Txt size={fontSize.lg} weight="800" center>
            {survived ? `${active?.name ?? 'Le joueur'} reste en jeu !` : `${elim?.name ?? 'Le joueur'} est éliminé !`}
          </Txt>
        </View>

        {q && (
          <Card accent={colors.success}>
            <Txt faint size={fontSize.xs}>
              RÉPONSE
            </Txt>
            <Txt size={fontSize.lg} weight="800">
              {q.answer}
            </Txt>
          </Card>
        )}

        <View>
          <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.5) }}>
            ENCORE EN LICE ({stillIn.length})
          </Txt>
          <View style={styles.aliveWrap}>
            {stillIn.map((id) => {
              const pl = byId[id];
              if (!pl) return null;
              return (
                <View key={id} style={styles.aliveChip}>
                  <PlayerAvatar emoji={pl.emoji} color={pl.color} size={24} />
                  <Txt weight="700" size={fontSize.sm}>
                    {pl.name}
                  </Txt>
                </View>
              );
            })}
          </View>
        </View>

        <Button title="Continuer" size="lg" onPress={() => dispatch({ type: 'CONTINUE' })} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
  },
  body: { padding: spacing(2), paddingBottom: spacing(4) },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rebus: { fontSize: 60, lineHeight: 72 },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    backgroundColor: colors.cardAlt,
    padding: spacing(1.5),
    borderRadius: radius.md,
  },
  option: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpRow: { flexDirection: 'row', gap: spacing(1) },
  aliveWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  aliveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.75),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.75),
  },
});
