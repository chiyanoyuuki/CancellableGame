import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, Txt } from '../../components/ui';
import { type BombeConfig, DIFFICULTY_LABELS, type Player, type SessionResult, THEME_META } from '../../core/models';
import {
  type BombeAction,
  type BombeState,
  bombeReducer,
  bombeToSessionResult,
  createBombeState,
  randomFuseMs,
} from '../../core/bombeEngine';
import { getQuestionHistory } from '../../db';
import { selectQuestions } from '../../core/questionSelection';
import { mulberry32, randomSeed, shuffle } from '../../core/rng';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';
import { getQuizPool } from '../quiz/pool';

function haptic(type: 'ok' | 'warn' | 'boom') {
  try {
    if (type === 'boom') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (type === 'warn') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // best-effort
  }
}

const TICK_MS = 100;
const POOL_COUNT = 250;

/** Graine numérique stable dérivée d'un identifiant de question. */
function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h >>> 0;
}

export function BombePlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const cfg = config as BombeConfig;
  const [game, setGame] = useState<BombeState | null>(null);
  const [revealed, setRevealed] = useState(false);

  const rngRef = useRef<() => number>(() => Math.random());
  const startedAtRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const lastTickRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const autoSkipped = useRef<Set<string>>(new Set());

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  // Propositions affichées quand le joueur demande de l'aide (stables par question).
  const options = useMemo(() => {
    const q = game?.current;
    if (!q || !game || game.propsShown === 0) return [] as string[];
    const r = mulberry32(seedFromId(q.id) + game.propsShown);
    if (game.propsShown === 4) return shuffle([q.answer, ...q.distractors], r);
    const distractor = shuffle([...q.distractors], r)[0] ?? q.distractors[0] ?? '';
    return shuffle([q.answer, distractor], r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.current?.id, game?.propsShown]);

  // --- Animations -----------------------------------------------------------
  const pulse = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const boom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 480, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 480, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const penaltyAnim = useCallback(() => {
    haptic('warn');
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    flash.setValue(0.5);
    Animated.timing(flash, { toValue: 0, duration: 350, useNativeDriver: true }).start();
  }, [shake, flash]);

  const boomAnim = useCallback(() => {
    haptic('boom');
    boom.setValue(0);
    flash.setValue(0.85);
    Animated.parallel([
      Animated.timing(boom, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]).start();
  }, [boom, flash]);

  // --- Build the game -------------------------------------------------------
  useEffect(() => {
    let alive = true;
    void (async () => {
      const [history, pool] = await Promise.all([getQuestionHistory(), getQuizPool()]);
      const seed = randomSeed();
      const rng = mulberry32(seed);
      rngRef.current = rng;
      const selected = selectQuestions(
        pool,
        { themes: cfg.themes, difficulties: cfg.difficulties, count: POOL_COUNT, excludedUniverses: cfg.excludedUniverses },
        history,
        rng,
      );
      const order = shuffle(players, rng).map((p) => p.id);
      const startIndex = Math.floor(rng() * order.length);
      const firstFuseMs = randomFuseMs(cfg, order.length, rng);
      if (!alive) return;
      startedAtRef.current = Date.now();
      questionStartRef.current = Date.now();
      lastTickRef.current = Date.now();
      setGame(createBombeState({ config: cfg, players, questions: selected, order, startIndex, firstFuseMs }));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = useCallback((a: BombeAction) => setGame((s) => (s ? bombeReducer(s, a) : s)), []);

  // Reset per-question local state when the question or the active player changes.
  useEffect(() => {
    if (game?.phase === 'question') {
      setRevealed(false);
      questionStartRef.current = Date.now();
    }
  }, [game?.current?.id, game?.activeId, game?.phase]);

  // Real-time fuse: burn the fuse while a question is on screen.
  useEffect(() => {
    if (game?.phase !== 'question') {
      lastTickRef.current = Date.now();
      return;
    }
    const iv = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      dispatch({ type: 'TICK', deltaMs: delta });
    }, TICK_MS);
    return () => clearInterval(iv);
  }, [game?.phase, dispatch]);

  // Explosion animation when a round blows up.
  const prevPhase = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (game && game.phase !== prevPhase.current) {
      if (game.phase === 'exploded' || game.phase === 'finished') boomAnim();
      prevPhase.current = game.phase;
    }
  }, [game, boomAnim]);

  // Fire onFinish exactly once.
  useEffect(() => {
    if (game?.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      const result: SessionResult = bombeToSessionResult(game, startedAtRef.current, Date.now());
      const t = setTimeout(() => onFinish(result), 1400); // laisser jouer l'explosion finale
      return () => clearTimeout(t);
    }
  }, [game, onFinish]);

  if (!game) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Txt dim style={{ marginTop: spacing(2) }}>
            On amorce la bombe…
          </Txt>
        </View>
      </SafeAreaView>
    );
  }

  const active = game.activeId ? byId[game.activeId] : undefined;
  const pct = game.roundMax > 0 ? Math.max(0, Math.min(1, game.fuseMs / game.roundMax)) : 0;
  const fuseColor = pct > 0.5 ? colors.success : pct > 0.25 ? colors.sip : colors.danger;
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] });
  const boomScale = boom.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.4] });
  const boomOpacity = boom.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />

      <View style={styles.topBar}>
        <Pressable onPress={onQuit} hitSlop={12}>
          <Txt color={colors.textDim} weight="700">
            ✕ Quitter
          </Txt>
        </Pressable>
        <Txt faint size={fontSize.sm} weight="700">
          💣 {game.aliveIds.length} en lice
        </Txt>
      </View>

      {/* Bombe + mèche */}
      <View style={styles.bombZone}>
        <Animated.Text style={[styles.bomb, { transform: [{ scale: pct < 0.25 ? pulse : 1 }, { translateX: shakeX }] }]}>
          💣
        </Animated.Text>
        <Animated.Text style={[styles.boom, { opacity: boomOpacity, transform: [{ scale: boomScale }] }]}>💥</Animated.Text>
        <View style={styles.fuseTrack}>
          <View style={[styles.fuseFill, { width: `${pct * 100}%`, backgroundColor: fuseColor }]} />
        </View>
        <Txt faint size={fontSize.xs} center>
          {pct < 0.2 ? '⚠️ Ça va péter !' : 'La mèche brûle…'}
        </Txt>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {game.phase === 'exploded' ? renderExploded() : game.phase === 'finished' ? renderFinished() : renderQuestion()}
      </ScrollView>
    </SafeAreaView>
  );

  // -------------------------------------------------------------------------

  function renderQuestion() {
    const q = game!.current;
    if (!q || !active) return null;
    const theme = THEME_META[q.theme];
    return (
      <View style={{ gap: spacing(2) }}>
        <View style={styles.activeBanner}>
          <PlayerAvatar emoji={active.emoji} color={active.color} size={34} />
          <Txt weight="800">À toi, {active.name} !</Txt>
        </View>

        <View style={styles.metaRow}>
          <Txt weight="800" color={colors.accent}>
            {theme.emoji} {q.universe ?? theme.label}
          </Txt>
          <Txt faint weight="700" size={fontSize.xs}>
            {DIFFICULTY_LABELS[q.difficulty].toUpperCase()}
          </Txt>
        </View>

        {q.media?.type === 'emoji' && !!q.media.emoji && <Txt center style={styles.rebus}>{q.media.emoji}</Txt>}
        {q.media?.type === 'image' && !!q.media.uri && (
          <Image
            source={{ uri: q.media.uri }}
            style={styles.media}
            resizeMode="contain"
            onError={() => {
              if (!autoSkipped.current.has(q.id)) {
                autoSkipped.current.add(q.id);
                dispatch({ type: 'IMAGE_FAILED' });
              }
            }}
          />
        )}
        {q.media?.type === 'audio' && (
          <Card>
            <Txt center style={{ fontSize: 40 }}>🎧</Txt>
            <Txt faint size={fontSize.xs} center>
              Blind test — le meneur lance l'extrait.
            </Txt>
          </Card>
        )}

        <Txt size={fontSize.xl} weight="800">
          {q.text}
        </Txt>

        {renderControls(q)}

        <Button title={`⏭️ Passer  (−${cfg.penaltySkipSec} s)`} variant="ghost" size="sm" onPress={onSkip} />
      </View>
    );
  }

  function renderControls(q: NonNullable<BombeState['current']>) {
    // Propositions révélées : on tape la bonne.
    if (game!.propsShown > 0) {
      return (
        <View style={{ gap: spacing(1) }}>
          {options.map((opt) => (
            <Pressable key={opt} style={styles.option} onPress={() => answer(opt === q.answer)}>
              <Txt weight="700">{opt}</Txt>
            </Pressable>
          ))}
        </View>
      );
    }
    if (!revealed) {
      return (
        <View style={{ gap: spacing(1) }}>
          <Button title="Révéler la réponse" onPress={() => setRevealed(true)} />
          <View style={styles.helpRow}>
            <Button
              title={`4 props  −${cfg.penaltyProps4Sec}s`}
              variant="secondary"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => onProps(4)}
            />
            <Button
              title={`2 props  −${cfg.penaltyProps2Sec}s`}
              variant="secondary"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => onProps(2)}
            />
          </View>
        </View>
      );
    }
    return (
      <View style={{ gap: spacing(1) }}>
        <Card accent={colors.success}>
          <Txt faint size={fontSize.xs}>RÉPONSE</Txt>
          <Txt size={fontSize.lg} weight="800">
            {q.answer}
          </Txt>
        </Card>
        <View style={{ flexDirection: 'row', gap: spacing(1) }}>
          <Button title="✅ Réussi" variant="primary" style={{ flex: 1 }} onPress={() => answer(true)} />
          <Button title={`❌ Raté  −${cfg.penaltyWrongSec}s`} variant="danger" style={{ flex: 1 }} onPress={() => answer(false)} />
        </View>
      </View>
    );
  }

  function renderExploded() {
    const gone = game!.lastEliminatedId ? byId[game!.lastEliminatedId] : undefined;
    return (
      <View style={{ gap: spacing(2), alignItems: 'center', paddingTop: spacing(2) }}>
        <Txt size={fontSize.huge}>💥</Txt>
        <Txt size={fontSize.xl} weight="800" center color={colors.danger}>
          BOOM ! {gone?.name ?? 'Le joueur'} est éliminé
        </Txt>
        {gone && <PlayerAvatar emoji={gone.emoji} color={gone.color} size={56} />}
        {cfg.drinksEnabled && (
          <Txt weight="700" color={colors.sip}>
            🍻 {gone?.name ?? 'Le joueur'} boit !
          </Txt>
        )}
        <Txt faint center>
          Encore {game!.aliveIds.length} joueur{game!.aliveIds.length > 1 ? 's' : ''} en lice.
        </Txt>
        <Button title="Manche suivante 💣" size="lg" variant="accent" onPress={onNextRound} />
      </View>
    );
  }

  function renderFinished() {
    const winner = game!.winnerId ? byId[game!.winnerId] : undefined;
    return (
      <View style={{ gap: spacing(2), alignItems: 'center', paddingTop: spacing(3) }}>
        <Txt size={fontSize.huge}>🏆</Txt>
        <Txt size={fontSize.xl} weight="800" center>
          {winner?.name ?? 'Le survivant'} survit et gagne !
        </Txt>
        {winner && <PlayerAvatar emoji={winner.emoji} color={winner.color} size={64} />}
        <Txt dim>Résultats…</Txt>
      </View>
    );
  }

  // --- Actions --------------------------------------------------------------

  function answer(correct: boolean) {
    const timeMs = Date.now() - questionStartRef.current;
    if (correct) haptic('ok');
    else penaltyAnim();
    dispatch({ type: 'ANSWER', correct, timeMs });
  }
  function onProps(count: 2 | 4) {
    penaltyAnim();
    dispatch({ type: 'REVEAL_PROPS', count });
  }
  function onSkip() {
    penaltyAnim();
    dispatch({ type: 'SKIP' });
  }
  function onNextRound() {
    const fuseMs = randomFuseMs(cfg, Math.max(1, game!.aliveIds.length), rngRef.current);
    lastTickRef.current = Date.now();
    dispatch({ type: 'NEXT_ROUND', fuseMs });
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.danger, zIndex: 10 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
  },
  bombZone: { alignItems: 'center', gap: spacing(1), paddingHorizontal: spacing(3), paddingBottom: spacing(1) },
  bomb: { fontSize: 68, lineHeight: 78 },
  boom: { position: 'absolute', top: 0, fontSize: 68, lineHeight: 78 },
  fuseTrack: {
    width: '100%',
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fuseFill: { height: '100%', borderRadius: radius.pill },
  body: { padding: spacing(2), paddingBottom: spacing(4) },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    backgroundColor: colors.cardAlt,
    padding: spacing(1.5),
    borderRadius: radius.md,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rebus: { fontSize: 60, lineHeight: 72 },
  media: { width: '100%', height: 200, borderRadius: radius.md, backgroundColor: colors.card },
  option: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpRow: { flexDirection: 'row', gap: spacing(1) },
});
