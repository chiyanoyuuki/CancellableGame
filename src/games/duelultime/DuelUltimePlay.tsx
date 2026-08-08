import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, Txt } from '../../components/ui';
import { type DuelUltimeConfig, type Player, THEME_META } from '../../core/models';
import {
  type DuelUltimeAction,
  type DuelUltimeState,
  createDuelUltimeState,
  duelUltimeReducer,
  duelUltimeToSessionResult,
} from '../../core/duelUltimeEngine';
import { randomSeed } from '../../core/rng';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import { useStore } from '../../store/StoreProvider';
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

export function DuelUltimePlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const store = useStore();
  const cfg = config as DuelUltimeConfig;
  const [game, setGame] = useState<DuelUltimeState | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  // Écran « passe le téléphone » affiché au début du bloc de chaque joueur.
  const [handoff, setHandoff] = useState<Player | null>(null);

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
      const fullPool = await getQuizPool();
      const pool = store.ent.allThemes
        ? fullPool
        : fullPool.filter((q) => store.isUniverseUnlocked(q.universe ?? `#${q.theme}`));
      const seed = randomSeed();
      const order = players.map((p) => p.id);
      if (!alive) return;
      startedAtRef.current = Date.now();
      setGame(createDuelUltimeState({ config: cfg, players, pool, seed, order }));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = (a: DuelUltimeAction) => setGame((s) => (s ? duelUltimeReducer(s, a) : s));

  // Au début du bloc d'un nouveau joueur (hors tout premier), on passe le tel.
  useEffect(() => {
    if (game?.phase !== 'question' || !game.activeId) return;
    if (game.qNumber === 1 && game.playerIdx > 0) {
      setHandoff(byId[game.activeId] ?? null);
    }
  }, [game?.activeId, game?.qNumber, game?.playerIdx, game?.phase, byId]);

  useEffect(() => {
    if (game?.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(duelUltimeToSessionResult(game, startedAtRef.current, Date.now()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, onFinish]);

  const confirmQuit = () =>
    Alert.alert('Quitter le duel ?', 'La partie en cours sera perdue.', [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: onQuit },
    ]);

  const answer = (opt: string) => {
    if (!game?.current) return;
    const correct = opt === game.current.answer;
    setPicked(opt);
    haptic(correct);
    dispatch({ type: 'ANSWER', correct });
  };

  const next = () => {
    setPicked(null);
    dispatch({ type: 'CONTINUE' });
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
  const total = cfg.questionsPerPlayer;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={confirmQuit} hitSlop={12}>
          <Txt color={colors.textDim} weight="700">
            ✕ Quitter
          </Txt>
        </Pressable>
        {active && game.phase !== 'finished' && (
          <Txt faint size={fontSize.sm} weight="700">
            🥊 {active.name} · {Math.min(game.qNumber, total)}/{total}
          </Txt>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {handoff
          ? renderHandoff()
          : game.phase === 'reveal'
            ? renderReveal()
            : q
              ? renderQuestion()
              : null}
      </ScrollView>
    </SafeAreaView>
  );

  function renderHandoff() {
    if (!handoff) return null;
    const uni = cfg.universeByPlayer[handoff.id];
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(6), alignItems: 'center' }}>
        <PlayerAvatar emoji={handoff.emoji} color={handoff.color} size={72} />
        <Txt faint weight="800" size={fontSize.sm}>
          PASSE LE TÉLÉPHONE
        </Txt>
        <Txt size={fontSize.xxl} weight="900" center>
          À toi, {handoff.name} !
        </Txt>
        {uni && (
          <Txt dim center>
            🎯 {total} questions pro sur {uni}
          </Txt>
        )}
        <View style={{ height: spacing(2) }} />
        <Button title="C'est parti" size="lg" variant="accent" onPress={() => setHandoff(null)} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  function renderQuestion() {
    if (!q) return null;
    const theme = THEME_META[q.theme];
    return (
      <View style={{ gap: spacing(2) }}>
        <View style={styles.metaRow}>
          <Txt weight="800" color={colors.accent}>
            {theme.emoji} {q.universe ?? theme.label}
          </Txt>
          <Txt faint weight="700" size={fontSize.xs}>
            PRO
          </Txt>
        </View>

        {active && (
          <View style={styles.activeBanner}>
            <PlayerAvatar emoji={active.emoji} color={active.color} size={32} />
            <Txt weight="800">
              {active.name} · question {Math.min(game!.qNumber, total)}/{total}
            </Txt>
          </View>
        )}

        <Txt size={fontSize.xl} weight="800">
          {q.text}
        </Txt>

        <View style={{ gap: spacing(1) }}>
          {game!.currentOptions.map((opt) => (
            <Pressable key={opt} style={styles.option} onPress={() => answer(opt)}>
              <Txt weight="700">{opt}</Txt>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  function renderReveal() {
    const correct = game!.lastCorrect === true;
    const correctAnswer = q?.answer ?? '';
    const score = game!.activeId ? game!.correctById[game!.activeId] ?? 0 : 0;
    const done = Math.min(game!.qNumber, total);
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(2) }}>
        <View style={{ alignItems: 'center', gap: spacing(1) }}>
          <Txt size={fontSize.huge}>{correct ? '✅' : '❌'}</Txt>
          <Txt size={fontSize.lg} weight="800" center>
            {correct ? 'Bonne réponse !' : 'Raté !'}
          </Txt>
        </View>

        {!correct && !!picked && (
          <Card>
            <Txt faint size={fontSize.xs}>
              TA RÉPONSE
            </Txt>
            <Txt size={fontSize.lg} weight="800" color={colors.danger}>
              {picked}
            </Txt>
          </Card>
        )}

        <Card accent={colors.success}>
          <Txt faint size={fontSize.xs}>
            RÉPONSE
          </Txt>
          <Txt size={fontSize.lg} weight="800">
            {correctAnswer}
          </Txt>
        </Card>

        {active && (
          <Txt center faint weight="700">
            {active.name} : {score} bonne{score > 1 ? 's' : ''} sur {done}
          </Txt>
        )}

        <Button title="Continuer" size="lg" onPress={next} />
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
});
