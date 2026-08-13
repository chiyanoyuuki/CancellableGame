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
import { type DrinkOutcome, rollAnswerDrink } from '../../core/drinks';
import { randomSeed } from '../../core/rng';
import { getQuestionHistoryByPlayer } from '../../db';
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
  // Réponse révélée (l'invité se juge : trouvé / raté) — pas de propositions.
  const [revealed, setRevealed] = useState(false);
  // Chrono par question (0 = désactivé) : à 0, la réponse est révélée d'office.
  const [remaining, setRemaining] = useState<number | null>(null);
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
      const [fullPool, historyByPlayer] = await Promise.all([getQuizPool(), getQuestionHistoryByPlayer()]);
      const pool = store.ent.allThemes
        ? fullPool
        : fullPool.filter((q) => store.isUniverseUnlocked(q.universe ?? `#${q.theme}`));
      const seed = randomSeed();
      const order = players.map((p) => p.id);
      if (!alive) return;
      startedAtRef.current = Date.now();
      setGame(createDuelUltimeState({ config: cfg, players, pool, seed, order, historyByPlayer }));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = (a: DuelUltimeAction) => setGame((s) => (s ? duelUltimeReducer(s, a) : s));

  // Chrono par question : (re)démarre à chaque nouvelle question, s'arrête à la
  // révélation ; à 0, on révèle la réponse d'office.
  useEffect(() => {
    if (cfg.questionTimerSec <= 0 || game?.phase !== 'question' || revealed || handoff) {
      setRemaining(null);
      return;
    }
    setRemaining(cfg.questionTimerSec);
    const id = setInterval(() => setRemaining((r) => (r !== null && r > 0 ? r - 1 : r)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.qNumber, game?.activeId, game?.phase, revealed, handoff, cfg.questionTimerSec]);

  useEffect(() => {
    if (remaining === 0 && game?.phase === 'question' && !revealed) setRevealed(true);
  }, [remaining, game?.phase, revealed]);

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

  // Gorgées (mode alcool) : calculées à la réponse, affichées à la révélation.
  const [lastDrink, setLastDrink] = useState<DrinkOutcome | null>(null);

  // L'invité déclare s'il a trouvé la réponse (aucune proposition affichée).
  const judge = (correct: boolean) => {
    haptic(correct);
    if (cfg.drinksEnabled) {
      setLastDrink(
        rollAnswerDrink({
          correct,
          difficulty: game?.current?.difficulty ?? 4,
          turnMode: 'turn',
          hintsUsed: 0,
          intensity: cfg.drinkIntensity,
          rng: Math.random,
        }),
      );
    }
    dispatch({ type: 'ANSWER', correct });
  };

  const next = () => {
    setRevealed(false);
    setLastDrink(null);
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
    const unis = cfg.universesByPlayer[handoff.id] ?? [];
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(6), alignItems: 'center' }}>
        <PlayerAvatar emoji={handoff.emoji} color={handoff.color} size={72} />
        <Txt faint weight="800" size={fontSize.sm}>
          PASSE LE TÉLÉPHONE
        </Txt>
        <Txt size={fontSize.xxl} weight="900" center>
          À toi, {handoff.name} !
        </Txt>
        {unis.length > 0 && (
          <Txt dim center>
            🎯 {total} questions pro sur {unis.join(', ')}
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

        {!revealed ? (
          <View style={{ gap: spacing(1) }}>
            {remaining !== null && (
              <Txt center weight="900" size={fontSize.xxl} color={remaining <= 5 ? colors.danger : colors.accent}>
                {remaining}s
              </Txt>
            )}
            <Txt faint size={fontSize.sm}>
              Réfléchis (ou dis ta réponse à voix haute), puis révèle la bonne réponse.
            </Txt>
            <Button title="Voir la réponse" emoji="👀" size="lg" onPress={() => setRevealed(true)} />
          </View>
        ) : (
          <View style={{ gap: spacing(1.5) }}>
            <Card accent={colors.success}>
              <Txt faint size={fontSize.xs}>
                RÉPONSE
              </Txt>
              <Txt size={fontSize.lg} weight="800">
                {q.answer}
              </Txt>
            </Card>
            <Txt center weight="800">
              Tu l'avais ?
            </Txt>
            <View style={styles.judgeRow}>
              <Pressable style={[styles.judge, styles.judgeWrong]} onPress={() => judge(false)}>
                <Txt weight="800" size={fontSize.lg} color={colors.white}>
                  ❌ Raté
                </Txt>
              </Pressable>
              <Pressable style={[styles.judge, styles.judgeRight]} onPress={() => judge(true)}>
                <Txt weight="800" size={fontSize.lg} color={colors.white}>
                  ✅ Trouvé
                </Txt>
              </Pressable>
            </View>
          </View>
        )}
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

        {lastDrink && !!lastDrink.reason && (lastDrink.sipsDrunk > 0 || lastDrink.sipsGiven > 0) && (
          <Card accent={colors.warning}>
            <Txt weight="800" color={colors.warning}>🍺 {lastDrink.reason}</Txt>
            {lastDrink.sipsDrunk > 0 && (
              <Txt weight="700" style={{ marginTop: spacing(0.5) }}>
                {active?.name ?? 'Tu'} bois {lastDrink.sipsDrunk} gorgée{lastDrink.sipsDrunk > 1 ? 's' : ''}.
              </Txt>
            )}
            {lastDrink.sipsGiven > 0 && (
              <Txt weight="700" style={{ marginTop: spacing(0.5) }}>
                {active?.name ?? 'Tu'} distribue {lastDrink.sipsGiven} gorgée{lastDrink.sipsGiven > 1 ? 's' : ''}.
              </Txt>
            )}
          </Card>
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
  judgeRow: { flexDirection: 'row', gap: spacing(1.5) },
  judge: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing(2.25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  judgeRight: { backgroundColor: colors.success },
  judgeWrong: { backgroundColor: colors.danger },
});
