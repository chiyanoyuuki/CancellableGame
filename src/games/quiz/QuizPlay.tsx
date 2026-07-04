import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, ProgressBar, Txt } from '../../components/ui';
import { DRINK_CHALLENGES } from '../../core/drinks';
import { DIFFICULTY_LABELS, type Player, type QuizConfig, type SessionResult, type Theme, THEME_META } from '../../core/models';
import {
  createQuizState,
  currentQuestion,
  getRanking,
  potentialPoints,
  progress,
  type QuizAction,
  type QuizState,
  quizReducer,
  toSessionResult,
  visibleOptions,
} from '../../core/quizEngine';
import { mulberry32, randomSeed, shuffle } from '../../core/rng';
import { selectQuestions } from '../../core/questionSelection';
import { getPlayerAvoidance, getPlayerPreferredThemes, getQuestionHistory, listCustomChallenges } from '../../db';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';
import { getQuizPool } from './pool';

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
  const [remaining, setRemaining] = useState<number | null>(null);

  const startedAtRef = useRef<number>(Date.now());
  const questionStartRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);
  // Question ids already auto-skipped for a broken image (avoid double-firing).
  const autoSkippedRef = useRef<Set<string>>(new Set());

  // In team mode the engine rotates over teams: a team behaves like a "player".
  const teamMode = cfg.teamMode && cfg.teams.length > 0;
  const roster: Player[] = useMemo(
    () =>
      teamMode ? cfg.teams.map((t) => ({ id: t.id, name: t.name, emoji: t.emoji, color: t.color })) : players,
    [teamMode, cfg.teams, players],
  );
  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of roster) m[p.id] = p;
    return m;
  }, [roster]);
  // Real players, kept to resolve team members when saving the result.
  const realById = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  // Attach each team's name and members to its result row, for the stats screen.
  const withTeamDetails = (result: SessionResult): SessionResult => ({
    ...result,
    players: result.players.map((pr) => {
      const team = cfg.teams.find((t) => t.id === pr.playerId);
      if (!team) return pr;
      const members = team.memberIds
        .map((id) => realById[id])
        .filter((p): p is Player => !!p)
        .map((p) => ({ name: p.name, emoji: p.emoji }));
      return {
        ...pr,
        details: { ...(pr.details ?? {}), team: true, name: team.name, emoji: team.emoji, color: team.color, members },
      };
    }),
  });

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
      const [history, pool, customChallenges, avoidance, preferences] = await Promise.all([
        getQuestionHistory(),
        getQuizPool(),
        listCustomChallenges(),
        getPlayerAvoidance(),
        getPlayerPreferredThemes(),
      ]);
      const seed = randomSeed();
      // Turn order, computed once and shared with the engine so that the
      // per-player weighting lines up with who actually gets each question.
      const order = shuffle(roster, mulberry32(seed)).map((p) => p.id);
      // Per-player universe avoidance and theme preferences are ignored in team mode.
      const avoidByPlayer: Record<string, string[]> = {};
      const preferByPlayer: Record<string, Theme[]> = {};
      if (!teamMode)
        for (const p of players) {
          avoidByPlayer[p.id] = avoidance[p.id] ?? [];
          preferByPlayer[p.id] = (preferences[p.id] ?? []) as Theme[];
        }
      // Pick a few extra questions as a reserve, used to swap in a replacement
      // whenever a question's image fails to load (so the round keeps its length
      // and the same player stays up).
      const RESERVE_COUNT = 8;
      const selectedAll = selectQuestions(
        pool,
        {
          themes: cfg.themes,
          difficulties: cfg.difficulties,
          count: cfg.questionCount + RESERVE_COUNT,
          excludedUniverses: cfg.excludedUniverses,
        },
        history,
        mulberry32(seed),
        { order, avoidByPlayer, turnMode: cfg.turnMode, preferByPlayer },
      );
      const selected = selectedAll.slice(0, cfg.questionCount);
      // Reserve first uses questions without a remote image, so a replacement is
      // guaranteed to render even offline.
      const reserve = selectedAll
        .slice(cfg.questionCount)
        .sort((a, b) => Number(a.media?.type === 'image') - Number(b.media?.type === 'image'));
      if (!alive) return;
      startedAtRef.current = Date.now();
      questionStartRef.current = Date.now();
      setGame(
        createQuizState({
          config: cfg,
          players: roster,
          questions: selected,
          seed,
          challenges: [...DRINK_CHALLENGES, ...customChallenges],
          order,
          reserve,
        }),
      );
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

  // Informative per-question countdown (no penalty; host decides).
  useEffect(() => {
    if (game?.phase !== 'question' || cfg.questionTimerSec <= 0) {
      setRemaining(null);
      return;
    }
    setRemaining(cfg.questionTimerSec);
    const iv = setInterval(() => {
      setRemaining((r) => (r != null && r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(iv);
  }, [game?.index, game?.phase, cfg.questionTimerSec]);

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
      const result = toSessionResult(game, startedAtRef.current, Date.now());
      onFinish(teamMode ? withTeamDetails(result) : result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {remaining != null && (
        <View style={{ alignItems: 'center', paddingTop: spacing(1) }}>
          <Txt weight="800" color={remaining === 0 ? colors.danger : colors.textDim}>
            ⏱ {remaining === 0 ? 'Temps écoulé !' : `${remaining} s`}
          </Txt>
        </View>
      )}

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
    const revealedHints = (q.hints ?? []).slice(0, game!.hintsRevealed);

    return (
      <View style={{ gap: spacing(2) }}>
        <View style={styles.metaRow}>
          <Txt weight="800" color={colors.accent}>
            {theme.emoji} {cfg.showUniverse && q.universe ? q.universe : theme.label}
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
            <Image
              source={{ uri: q.media.uri }}
              style={styles.media}
              resizeMode="contain"
              onError={() => {
                setImgError(true);
                // Image won't load → skip to a replacement, same player stays up.
                if (!autoSkippedRef.current.has(q.id)) {
                  autoSkippedRef.current.add(q.id);
                  dispatch({ type: 'IMAGE_FAILED' });
                }
              }}
            />
            {imgError && (
              <Txt faint size={fontSize.xs} center>
                (image indisponible — question suivante…)
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

        {renderHelpBar()}

        {cfg.turnMode === 'turn' ? renderTurn() : renderFastest()}
      </View>
    );
  }

  // Buttons to reveal help on demand; each reduces the points at stake.
  function renderHelpBar() {
    if (!q) return null;
    const hintsLeft = (q.hints?.length ?? 0) - game!.hintsRevealed;
    return (
      <View style={styles.helpBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt faint size={fontSize.xs} weight="800">
            BESOIN D'UN COUP DE POUCE ?
          </Txt>
          <Txt weight="800" color={colors.primary}>
            {potentialPoints(game!)} pts
          </Txt>
        </View>
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
        {hintsLeft > 0 && (
          <Button
            title={`💡 Indice ÷1,5${(q.hints?.length ?? 0) > 1 ? ` (${hintsLeft} restant${hintsLeft > 1 ? 's' : ''})` : ''}`}
            variant="ghost"
            size="sm"
            onPress={() => dispatch({ type: 'REVEAL_HINT' })}
          />
        )}
        <Txt faint size={fontSize.xs}>
          Réponse libre = points pleins · 4 props = ½ · 2 props = ¼ · indice = ÷1,5 (cumulables)
        </Txt>
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
          {renderOptions(null, null, false)}
          <View style={styles.playerGrid}>
            {roster.map((p) => (
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

  // The revealed propositions, tappable (interactive) or as a read-only preview.
  function renderOptions(playerId: string | null, timeMs: number | null, interactive: boolean) {
    const opts = visibleOptions(game!);
    if (opts.length === 0) return null;
    return (
      <View style={{ gap: spacing(1) }}>
        {opts.map((opt) => (
          <Pressable
            key={opt}
            style={[styles.option, !interactive && styles.optionPreview]}
            disabled={!interactive || !playerId}
            onPress={() => playerId && answer(playerId, opt === q!.answer, timeMs)}
          >
            <Txt weight="700">{opt}</Txt>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderAnswerControls(playerId: string | null, timeMs: number | null) {
    if (!q || !playerId) return null;

    // Propositions revealed → tap the right one.
    if (game!.propsShown > 0) {
      return renderOptions(playerId, timeMs, true);
    }

    // Free answer: reveal, then the host judges.
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
  optionPreview: { opacity: 0.85, borderStyle: 'dashed' },
  helpBox: {
    gap: spacing(1),
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: spacing(1.5),
  },
  helpRow: { flexDirection: 'row', gap: spacing(1) },
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
