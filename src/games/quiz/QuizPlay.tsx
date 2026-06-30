import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, ProgressBar, Txt } from '../../components/ui';
import { DIFFICULTY_LABELS, type Player, type QuizConfig, THEME_META } from '../../core/models';
import {
  createQuizState,
  currentQuestion,
  getRanking,
  progress,
  type QuizAction,
  type QuizState,
  quizReducer,
  toSessionResult,
} from '../../core/quizEngine';
import { mulberry32, randomSeed } from '../../core/rng';
import { selectQuestions } from '../../core/questionSelection';
import { getQuestionHistory } from '../../db';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';
import { QUESTIONS } from './questions';

function haptic(success: boolean) {
  try {
    void Haptics.notificationAsync(
      success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );
  } catch {
    // haptics are best-effort
  }
}

export function QuizPlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const cfg = config as QuizConfig;
  const [game, setGame] = useState<QuizState | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const [buzzed, setBuzzed] = useState<{ playerId: string; timeMs: number } | null>(null);
  const [imgError, setImgError] = useState(false);

  const startedAtRef = useRef<number>(Date.now());
  const questionStartRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  // --- Audio (blind test) -------------------------------------------------
  const player = useAudioPlayer(null);
  const audioStatus = useAudioPlayerStatus(player);
  const audioPlaying = audioStatus?.playing ?? false;

  const loadAudio = useCallback(
    (media?: { uri?: string; module?: number }) => {
      const src: number | { uri: string } | null = media?.module ?? (media?.uri ? { uri: media.uri } : null);
      try {
        if (src != null) player.replace(src);
        player.pause();
      } catch {
        // best-effort
      }
    },
    [player],
  );

  const toggleAudio = () => {
    try {
      if (audioPlaying) player.pause();
      else player.play();
    } catch {
      // best-effort
    }
  };

  const replayAudio = () => {
    try {
      player.seekTo(0);
      player.play();
    } catch {
      // best-effort
    }
  };

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
  }, []);

  // Build the round: pick anti-repeat questions, then create the engine state.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const history = await getQuestionHistory();
      const seed = randomSeed();
      const selected = selectQuestions(
        QUESTIONS,
        { themes: cfg.themes, difficulties: cfg.difficulties, count: cfg.questionCount },
        history,
        mulberry32(seed),
      );
      if (!alive) return;
      startedAtRef.current = Date.now();
      questionStartRef.current = Date.now();
      setGame(createQuizState({ config: cfg, players, questions: selected, seed }));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = useCallback((a: QuizAction) => setGame((s) => (s ? quizReducer(s, a) : s)), []);

  // Reset per-question local state when a new question appears.
  useEffect(() => {
    if (game?.phase === 'question') {
      setRevealedAnswer(false);
      setBuzzed(null);
      setImgError(false);
      questionStartRef.current = Date.now();
      const cq = game.questions[game.index];
      if (cq?.media?.type === 'audio') loadAudio(cq.media);
      else loadAudio(undefined);
    }
    // Only re-run when we actually move to a new question/phase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.index, game?.phase]);

  // Stop the audio whenever we leave the question phase (reveal, challenge…).
  useEffect(() => {
    if (game && game.phase !== 'question') {
      try {
        player.pause();
      } catch {
        // best-effort
      }
    }
  }, [game, player]);

  // Fire onFinish exactly once.
  useEffect(() => {
    if (game?.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(toSessionResult(game, startedAtRef.current, Date.now()));
    }
  }, [game, onFinish]);

  const confirmQuit = () =>
    Alert.alert('Quitter la partie ?', 'La partie en cours ne sera pas enregistrée.', [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: onQuit },
    ]);

  const answer = (playerId: string, correct: boolean, timeMs: number | null) => {
    haptic(correct);
    dispatch({ type: 'SUBMIT', playerId, correct, timeMs });
  };

  if (!game) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Txt dim style={{ marginTop: spacing(2) }}>
            Préparation des questions…
          </Txt>
        </View>
      </SafeAreaView>
    );
  }

  const prog = progress(game);
  const q = currentQuestion(game);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={confirmQuit} hitSlop={12}>
          <Txt color={colors.textDim} weight="700">
            ✕ Quitter
          </Txt>
        </Pressable>
        <Txt faint size={fontSize.sm} weight="700">
          {prog.current} / {prog.total}
        </Txt>
      </View>
      <View style={{ paddingHorizontal: spacing(2) }}>
        <ProgressBar value={prog.current} total={prog.total} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {game.phase === 'challenge'
          ? renderChallenge()
          : game.phase === 'reveal'
            ? renderReveal()
            : q
              ? renderQuestion()
              : null}
      </ScrollView>
    </SafeAreaView>
  );

  // -------------------------------------------------------------------------
  // Phase renderers (closures: `game` and `q` are in scope and non-null here)
  // -------------------------------------------------------------------------

  function renderQuestion() {
    if (!q) return null;
    const theme = THEME_META[q.theme];
    const canHint = cfg.hintsEnabled && (q.hints?.length ?? 0) > game!.hintsRevealed;
    const revealedHints = (q.hints ?? []).slice(0, game!.hintsRevealed);

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

        {q.media?.type === 'emoji' && !!q.media.emoji && (
          <Txt center style={styles.rebus}>
            {q.media.emoji}
          </Txt>
        )}
        {q.media?.type === 'image' && !!q.media.uri && (
          <View>
            <Image source={{ uri: q.media.uri }} style={styles.media} resizeMode="contain" onError={() => setImgError(true)} />
            {imgError && (
              <Txt faint size={fontSize.xs} center>
                (image indisponible — connexion requise)
              </Txt>
            )}
          </View>
        )}
        {q.media?.type === 'audio' && (
          <View style={styles.audioBox}>
            <Txt center style={{ fontSize: 44 }}>
              🎧
            </Txt>
            <View style={{ flexDirection: 'row', gap: spacing(1), justifyContent: 'center' }}>
              <Button title={audioPlaying ? '⏸  Pause' : '▶️  Écouter'} onPress={toggleAudio} />
              <Button title="⟲  Rejouer" variant="secondary" onPress={replayAudio} />
            </View>
          </View>
        )}

        <Txt size={fontSize.xl} weight="800">
          {q.text}
        </Txt>

        {revealedHints.map((h, i) => (
          <Txt key={i} dim>
            💡 {h}
          </Txt>
        ))}
        {canHint && (
          <Button
            title="Demander un indice (−25 %)"
            variant="secondary"
            size="sm"
            onPress={() => dispatch({ type: 'REVEAL_HINT' })}
          />
        )}

        {cfg.turnMode === 'turn' ? renderTurn() : renderFastest()}
      </View>
    );
  }

  function renderTurn() {
    const active = game!.activePlayerId ? byId[game!.activePlayerId] : undefined;
    return (
      <View style={{ gap: spacing(1.5) }}>
        {active && (
          <View style={styles.activeBanner}>
            <PlayerAvatar emoji={active.emoji} color={active.color} size={32} />
            <Txt weight="800">À toi, {active.name} !</Txt>
          </View>
        )}
        {renderAnswerControls(active?.id ?? null, null)}
      </View>
    );
  }

  function renderFastest() {
    if (!buzzed) {
      return (
        <View style={{ gap: spacing(1.5) }}>
          <Txt dim weight="700" center>
            Le plus rapide ! Qui a trouvé ?
          </Txt>
          <View style={styles.playerGrid}>
            {players.map((p) => (
              <Pressable
                key={p.id}
                style={styles.buzzBtn}
                onPress={() => setBuzzed({ playerId: p.id, timeMs: Date.now() - questionStartRef.current })}
              >
                <PlayerAvatar emoji={p.emoji} color={p.color} size={36} />
                <Txt weight="700" numberOfLines={1}>
                  {p.name}
                </Txt>
              </Pressable>
            ))}
          </View>
          <Button title="Personne n'a trouvé" variant="ghost" size="sm" onPress={() => dispatch({ type: 'SKIP' })} />
        </View>
      );
    }
    const p = byId[buzzed.playerId];
    return (
      <View style={{ gap: spacing(1.5) }}>
        <View style={styles.activeBanner}>
          {p && <PlayerAvatar emoji={p.emoji} color={p.color} size={32} />}
          <Txt weight="800">{p?.name} a buzzé en {(buzzed.timeMs / 1000).toFixed(1)} s</Txt>
        </View>
        {renderAnswerControls(buzzed.playerId, buzzed.timeMs)}
        <Button title="Annuler le buzz" variant="ghost" size="sm" onPress={() => setBuzzed(null)} />
      </View>
    );
  }

  function renderAnswerControls(playerId: string | null, timeMs: number | null) {
    if (!q || !playerId) return null;

    if (cfg.answerFormat === 'choices') {
      return (
        <View style={{ gap: spacing(1) }}>
          {game!.currentOptions.map((opt) => (
            <Pressable key={opt} style={styles.option} onPress={() => answer(playerId, opt === q.answer, timeMs)}>
              <Txt weight="700">{opt}</Txt>
            </Pressable>
          ))}
        </View>
      );
    }

    // Open answer: reveal, then the host judges.
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
          <Button title="✅ Réussi" variant="primary" style={{ flex: 1 }} onPress={() => answer(playerId, true, timeMs)} />
          <Button title="❌ Raté" variant="danger" style={{ flex: 1 }} onPress={() => answer(playerId, false, timeMs)} />
        </View>
      </View>
    );
  }

  function renderReveal() {
    const o = game!.lastOutcome;
    if (!o) return null;
    const who = game!.activePlayerId ? byId[game!.activePlayerId] : undefined;
    const ranking = getRanking(game!);

    return (
      <View style={{ gap: spacing(2) }}>
        <View style={{ alignItems: 'center', gap: spacing(1) }}>
          <Txt size={fontSize.huge}>{o.correct ? '✅' : who ? '❌' : '🤷'}</Txt>
          <Txt size={fontSize.lg} weight="800" center>
            {o.correct ? 'Bonne réponse !' : who ? 'Raté !' : "Personne n'a trouvé"}
          </Txt>
          <Card accent={colors.success} style={{ alignSelf: 'stretch' }}>
            <Txt faint size={fontSize.xs}>
              RÉPONSE
            </Txt>
            <Txt size={fontSize.lg} weight="800">
              {o.correctAnswer}
            </Txt>
          </Card>
        </View>

        {o.score.total > 0 && who && (
          <Card accent={colors.primary}>
            <Txt weight="800" color={colors.primary} size={fontSize.lg}>
              +{o.score.total} pts pour {who.name}
            </Txt>
            <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
              base {o.score.afterHints}
              {o.score.speedBonus > 0 ? ` + ${o.score.speedBonus} vitesse` : ''}
            </Txt>
          </Card>
        )}

        {!!o.drink.reason && (
          <Card accent={colors.sip}>
            <Txt weight="800" color={colors.sip}>
              🍻 {o.drink.reason}
            </Txt>
            {o.drink.sipsDrunk > 0 && (
              <Txt weight="700">{who?.name ?? 'Le joueur'} boit {o.drink.sipsDrunk} gorgée{o.drink.sipsDrunk > 1 ? 's' : ''}</Txt>
            )}
            {o.drink.sipsGiven > 0 && (
              <Txt weight="700">
                {who?.name ?? 'Le joueur'} distribue {o.drink.sipsGiven} gorgée{o.drink.sipsGiven > 1 ? 's' : ''}
              </Txt>
            )}
          </Card>
        )}

        <View>
          <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.5) }}>
            CLASSEMENT
          </Txt>
          {ranking.slice(0, 5).map((s, i) => {
            const pl = byId[s.playerId];
            return (
              <View key={s.playerId} style={styles.scoreRow}>
                <Txt dim weight="700">{i + 1}.</Txt>
                <Txt weight="700" style={{ flex: 1 }}>
                  {pl ? `${pl.emoji} ${pl.name}` : s.playerId}
                </Txt>
                <Txt weight="800">{s.points}</Txt>
              </View>
            );
          })}
        </View>

        <Button title={prog.current >= prog.total ? 'Voir les résultats' : 'Question suivante'} size="lg" onPress={() => dispatch({ type: 'CONTINUE' })} />
      </View>
    );
  }

  function renderChallenge() {
    const c = game!.pendingChallenge;
    if (!c) return null;
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(4) }}>
        <Txt size={fontSize.huge} center>
          🍻
        </Txt>
        <Txt size={fontSize.xl} weight="800" center color={colors.sip}>
          Défi !
        </Txt>
        <Card accent={colors.sip}>
          <Txt size={fontSize.lg} weight="600">
            {c.text}
          </Txt>
        </Card>
        <Button title="C'est fait, on continue !" size="lg" variant="accent" onPress={() => dispatch({ type: 'CONTINUE' })} />
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
  media: { width: '100%', height: 200, borderRadius: radius.md, backgroundColor: colors.card },
  audioBox: { gap: spacing(1.5), backgroundColor: colors.card, borderRadius: radius.md, padding: spacing(2) },
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
  playerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  buzzBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '47%',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    paddingVertical: spacing(0.75),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
