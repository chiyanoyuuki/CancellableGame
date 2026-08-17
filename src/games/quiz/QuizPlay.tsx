import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, ProgressBar, Txt } from '../../components/ui';
import { haptics } from '../../lib/haptics';
import { DRINK_CHALLENGES, resolveChallenge } from '../../core/drinks';
import { accuracyRatio, adaptiveDifficulties } from '../../core/adaptiveDifficulty';
import { DIFFICULTY_LABELS, type Difficulty, type Player, type QuizConfig, type SessionResult, THEME_META } from '../../core/models';
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
import {
  deleteSavedGame,
  getPlayerUnwantedUniverses,
  getQuestionHistory,
  getQuestionHistoryByPlayer,
  getAccuracyByPlayer,
  getSavedGame,
  listCustomChallenges,
  newSlotId,
  reportQuestion,
  saveGame,
} from '../../db';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import { useStore } from '../../store/StoreProvider';
import type { MiniGamePlayProps } from '../types';
import { getQuizPool } from './pool';

function haptic(success: boolean) {
  if (success) haptics.correct();
  else haptics.wrong();
}

export function QuizPlayComponent({ players, config, onFinish, onQuit, resume, slotId: resumeSlotId }: MiniGamePlayProps) {
  const store = useStore();
  const cfg = config as QuizConfig;
  // Slot de sauvegarde de CETTE partie : repris s'il est fourni, sinon nouveau.
  const [gameSlotId] = useState(() => resumeSlotId ?? newSlotId());
  const [game, setGame] = useState<QuizState | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const [buzzed, setBuzzed] = useState<{ playerId: string; timeMs: number } | null>(null);
  const [imgError, setImgError] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  // Défi en cours : graine du tirage au sort des joueurs (le bouton « retirer au
  // sort » l'incrémente) et compte à rebours du minuteur (réinitialisable).
  const [challengeSeed, setChallengeSeed] = useState(1);
  const [challengeTimer, setChallengeTimer] = useState<number | null>(null);
  const [challengeTimerKey, setChallengeTimerKey] = useState(0);
  // Rotation des joueurs tirés au sort pour les défis : on retient les derniers
  // choisis afin de ne pas retomber toujours sur les mêmes.
  const recentPicksRef = useRef<string[]>([]);
  // Questions signalées cette partie (pour éviter le double-signalement et changer le libellé).
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  // Univers non souhaités par joueur — sert à signaler, sous l'univers, quand
  // une question sort d'un univers que le joueur actif avait écarté.
  const [unwantedByPlayer, setUnwantedByPlayer] = useState<Record<string, string[]>>({});
  // Univers non souhaités bruts par joueur (profil réel) — en mode équipe, sert
  // à afficher sous chaque question quels membres de l'équipe active n'ont PAS
  // exclu cet univers de leur profil.
  const [unwantedRawByPlayer, setUnwantedRawByPlayer] = useState<Record<string, string[]>>({});
  // Pile d'états « avant réponse » pour revenir à la question précédente.
  const [history, setHistory] = useState<QuizState[]>([]);
  // Panneau de gestion des joueurs (mise en pause / retour).
  const [showPlayers, setShowPlayers] = useState(false);
  // Petite étape marquante affichée avant une question (« à la moitié », etc.).
  const [milestone, setMilestone] = useState<{ emoji: string; title: string; subtitle: string } | null>(null);

  const startedAtRef = useRef<number>(Date.now());
  const questionStartRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);
  // Étapes déjà affichées (pour ne pas les remontrer, ex. après un retour arrière).
  const shownMilestonesRef = useRef<Set<string>>(new Set());
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
  // In « resume » mode, restore the saved in-progress game instead.
  useEffect(() => {
    let alive = true;
    void (async () => {
      if (resume && resumeSlotId) {
        const saved = await getSavedGame(resumeSlotId);
        const st = saved?.state as QuizState | undefined;
        if (st && Array.isArray(st.questions) && typeof st.index === 'number') {
          const unwantedUniverses = await getPlayerUnwantedUniverses();
          const unwantedUniversesByPlayer: Record<string, string[]> = {};
          if (!teamMode) for (const p of players) unwantedUniversesByPlayer[p.id] = unwantedUniverses[p.id] ?? [];
          if (!alive) return;
          setUnwantedByPlayer(unwantedUniversesByPlayer);
          setUnwantedRawByPlayer(unwantedUniverses);
          startedAtRef.current = saved?.startedAt ?? Date.now();
          questionStartRef.current = Date.now();
          // Défauts pour les parties sauvegardées avant l'ajout de la pause.
          setGame({
            ...st,
            voids: st.voids ?? 0,
            turnPos: st.turnPos ?? 0,
            standby: st.standby ?? [],
            owed: st.owed ?? {},
            activeCatchUp: st.activeCatchUp ?? false,
          });
          return;
        }
        // Nothing valid to resume → fall through and start a fresh game.
      }

      const [history, historyByPlayer, fullPool, customChallenges, unwantedUniverses, accuracy] = await Promise.all([
        getQuestionHistory(),
        getQuestionHistoryByPlayer(),
        getQuizPool(),
        listCustomChallenges(),
        getPlayerUnwantedUniverses(),
        cfg.adaptiveDifficulty && !teamMode && cfg.turnMode === 'turn'
          ? getAccuracyByPlayer()
          : Promise.resolve({} as Record<string, { correct: number; total: number }>),
      ]);
      // Version gratuite : ne tire que dans les univers débloqués du joueur.
      const pool = store.ent.allThemes
        ? fullPool
        : fullPool.filter((q) => store.isUniverseUnlocked(q.universe ?? `#${q.theme}`));
      const seed = randomSeed();
      // Turn order, computed once and shared with the engine so that the
      // per-player weighting lines up with who actually gets each question.
      const order = shuffle(roster, mulberry32(seed)).map((p) => p.id);
      // Per-player unwanted universes are ignored in team mode.
      const unwantedUniversesByPlayer: Record<string, string[]> = {};
      if (!teamMode) for (const p of players) unwantedUniversesByPlayer[p.id] = unwantedUniverses[p.id] ?? [];
      // Mode équipe : les questions d'une équipe viennent des univers voulus par
      // au moins un de ses membres (un univers n'est écarté que si TOUS l'ont
      // exclu). On FAVORISE en plus les univers voulus par plusieurs membres :
      // chaque membre supplémentaire qui le veut multiplie sa probabilité, si bien
      // qu'un univers « à deux » sort le plus souvent, tandis que les univers d'un
      // seul membre, à poids égal, alternent naturellement entre les joueurs.
      const allowedUniversesByPlayer: Record<string, string[]> = {};
      const universeWeightByPlayer: Record<string, Record<string, number>> = {};
      if (teamMode) {
        const TEAM_SHARED_BOOST = 4;
        const allUniverses = new Set<string>();
        for (const q of pool) if (q.universe) allUniverses.add(q.universe);
        for (const t of cfg.teams) {
          const allowed: string[] = [];
          const weights: Record<string, number> = {};
          for (const u of allUniverses) {
            const wantCount = t.memberIds.reduce(
              (n, mid) => n + (!(unwantedUniverses[mid] ?? []).includes(u) ? 1 : 0),
              0,
            );
            if (wantCount > 0) {
              allowed.push(u);
              weights[u] = Math.pow(TEAM_SHARED_BOOST, wantCount - 1);
            }
          }
          allowedUniversesByPlayer[t.id] = allowed;
          universeWeightByPlayer[t.id] = weights;
        }
      }
      // Difficulté adaptative (mode « tour » solo) : chaque joueur ne reçoit que
      // les paliers calibrés sur son taux de réussite, en restant dans les
      // difficultés choisies pour la partie. Un tableau vide = aucune contrainte.
      let difficultiesByPlayer: Record<string, Difficulty[]> | undefined;
      if (cfg.adaptiveDifficulty && !teamMode && cfg.turnMode === 'turn') {
        difficultiesByPlayer = {};
        for (const p of players) {
          const adaptive = adaptiveDifficulties(accuracyRatio(accuracy[p.id]));
          difficultiesByPlayer[p.id] = adaptive.filter((d) => cfg.difficulties.includes(d));
        }
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
        {
          order,
          turnMode: cfg.turnMode,
          unwantedUniversesByPlayer,
          allowedUniversesByPlayer,
          universeWeightByPlayer,
          difficultiesByPlayer,
          // Per-player fresh questions only make sense outside team mode.
          historyByPlayer: teamMode ? undefined : historyByPlayer,
        },
      );
      const selected = selectedAll.slice(0, cfg.questionCount);
      // Reserve first uses questions without a remote image, so a replacement is
      // guaranteed to render even offline.
      const reserve = selectedAll
        .slice(cfg.questionCount)
        .sort((a, b) => Number(a.media?.type === 'image') - Number(b.media?.type === 'image'));
      if (!alive) return;
      setUnwantedByPlayer(unwantedUniversesByPlayer);
      setUnwantedRawByPlayer(unwantedUniverses);
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

  // Persist the in-progress game on every change so it can be resumed after
  // quitting the app or pressing « retour ». Starting a new game overwrites it;
  // finishing all the questions clears it (stats are saved elsewhere).
  useEffect(() => {
    if (!game) return;
    if (game.phase === 'finished') {
      void deleteSavedGame(gameSlotId);
      return;
    }
    void saveGame({ slotId: gameSlotId, gameId: 'quiz', players, config: cfg, state: game, startedAt: startedAtRef.current });
  }, [game, players, cfg, gameSlotId]);

  const dispatch = useCallback((a: QuizAction) => setGame((s) => (s ? quizReducer(s, a) : s)), []);

  // « Revenir en arrière » : on empile l'état AVANT chaque réponse, et on le
  // restaure tel quel (score, réponses, question) si l'on s'est trompé.
  const snapshot = () => {
    if (game) setHistory((h) => [...h, game].slice(-100));
  };
  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setBuzzed(null);
    setRevealedAnswer(false);
    setImgError(false);
    if (prev) setGame(prev);
  };
  const canGoBack = history.length > 0;

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

  // Étapes marquantes affichées avant une question : à la moitié, puis au
  // dernier tour (quand il reste une question par personne). Une seule fois.
  useEffect(() => {
    if (game?.phase !== 'question') return;
    const total = game.questions.length;
    const idx = game.index;
    const n = Math.max(1, roster.length);
    let m: { key: string; emoji: string; title: string; subtitle: string } | null = null;
    if (total > n && idx === total - n) {
      m = { key: 'lastlap', emoji: '🏁', title: 'Dernier tour !', subtitle: n > 1 ? 'Il reste une question par personne.' : 'Dernière question !' };
    } else if (total >= 4 && idx === Math.floor(total / 2)) {
      m = { key: 'half', emoji: '⏳', title: 'On est à la moitié !', subtitle: `${idx} question${idx > 1 ? 's' : ''} déjà passée${idx > 1 ? 's' : ''}.` };
    }
    if (m && !shownMilestonesRef.current.has(m.key)) {
      shownMilestonesRef.current.add(m.key);
      setMilestone({ emoji: m.emoji, title: m.title, subtitle: m.subtitle });
    }
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

  // Chaque nouveau défi retire au sort les joueurs concernés (graine fraîche).
  useEffect(() => {
    if (game?.phase === 'challenge' && game.pendingChallenge?.picks) {
      setChallengeSeed(randomSeed());
    }
  }, [game?.phase, game?.pendingChallenge?.id]);

  // Minuteur du défi (compte à rebours), réinitialisable via challengeTimerKey.
  useEffect(() => {
    const c = game?.phase === 'challenge' ? game.pendingChallenge : null;
    if (!c?.timerSec) {
      setChallengeTimer(null);
      return;
    }
    setChallengeTimer(c.timerSec);
    const iv = setInterval(() => {
      setChallengeTimer((t) => (t != null && t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(iv);
  }, [game?.phase, game?.pendingChallenge?.id, challengeTimerKey]);

  // Défi prêt à afficher : noms tirés au sort insérés dans le texte.
  const resolvedChallenge = useMemo(() => {
    const c = game?.phase === 'challenge' ? game.pendingChallenge : null;
    if (!c) return null;
    return resolveChallenge(c, players, mulberry32(challengeSeed), recentPicksRef.current);
  }, [game?.phase, game?.pendingChallenge, players, challengeSeed]);

  // Mémorise les joueurs tout juste tirés au sort, pour que le prochain tirage
  // (ou le « retirer au sort ») évite de retomber sur eux tant que possible.
  useEffect(() => {
    const ids = resolvedChallenge?.pickedIds;
    if (!ids || ids.length === 0) return;
    const cap = Math.max(1, players.length - 1);
    recentPicksRef.current = [...ids, ...recentPicksRef.current.filter((x) => !ids.includes(x))].slice(0, cap);
  }, [resolvedChallenge, players.length]);

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

  // Quitter = mettre en pause : la partie est gardée et reprendra plus tard.
  const confirmQuit = () =>
    Alert.alert('Quitter la partie ?', 'La partie est gardée : tu pourras la reprendre plus tard.', [
      { text: 'Continuer à jouer', style: 'cancel' },
      { text: 'Quitter', onPress: onQuit },
    ]);

  // Terminer = abandonner : on efface la partie, sans enregistrer les stats.
  const confirmTerminate = () =>
    Alert.alert('Terminer la partie ?', 'La partie en cours sera perdue et les statistiques ne seront pas enregistrées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Terminer',
        style: 'destructive',
        onPress: async () => {
          await deleteSavedGame(gameSlotId).catch(() => undefined);
          onQuit();
        },
      },
    ]);

  const answer = (playerId: string, correct: boolean, timeMs: number | null) => {
    haptic(correct);
    snapshot();
    dispatch({ type: 'SUBMIT', playerId, correct, timeMs });
  };

  // Réponse fausse automatique quand le chrono atteint 0 (option activée).
  // En « chacun son tour » : le joueur actif rate ; en « au plus rapide » :
  // personne n'a trouvé — sauf si quelqu'un a déjà buzzé (l'hôte juge alors).
  const autoTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (!cfg.autoWrongOnTimeout || cfg.questionTimerSec <= 0) return;
    if (!game || game.phase !== 'question' || milestone || remaining !== 0) return;
    if (autoTimeoutRef.current === game.index) return;
    if (cfg.turnMode === 'fastest' && buzzed) return; // laisse l'hôte juger le buzz
    autoTimeoutRef.current = game.index;
    if (cfg.turnMode === 'turn' && game.activePlayerId) {
      answer(game.activePlayerId, false, null);
    } else {
      snapshot();
      dispatch({ type: 'SKIP' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, game?.phase, game?.index, game?.activePlayerId, milestone, buzzed, cfg.autoWrongOnTimeout, cfg.questionTimerSec, cfg.turnMode]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2) }}>
          <Pressable onPress={() => setShowPlayers(true)} hitSlop={12}>
            <Txt weight="700">👥{game.standby.length > 0 ? ` ${game.standby.length}⏸` : ''}</Txt>
          </Pressable>
          <Pressable onPress={confirmTerminate} hitSlop={12}>
            <Txt color={colors.danger} weight="700">
              🏁 Terminer
            </Txt>
          </Pressable>
        </View>
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
            : milestone
              ? renderMilestone()
              : q
                ? renderQuestion()
                : null}
      </ScrollView>

      <Modal visible={showPlayers} animationType="slide" transparent onRequestClose={() => setShowPlayers(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Txt weight="800" size={fontSize.lg}>
              Joueurs
            </Txt>
            <Txt dim size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
              Mets un joueur en pause s'il s'absente : la partie continue sans lui. À son retour, il rattrape
              d'un coup toutes les questions manquées.
            </Txt>
            <ScrollView style={{ marginTop: spacing(1.5) }} contentContainerStyle={{ paddingBottom: spacing(1) }}>
              {roster.map((p) => {
                const paused = game.standby.includes(p.id);
                const owedN = game.owed[p.id] ?? 0;
                return (
                  <View key={p.id} style={styles.manageRow}>
                    <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={32} />
                    <View style={{ flex: 1 }}>
                      <Txt weight="700">{p.name}</Txt>
                      {paused ? (
                        <Txt size={fontSize.xs} weight="700" color={colors.sip}>
                          ⏸ en pause{owedN > 0 ? ` · ${owedN} à rattraper` : ''}
                        </Txt>
                      ) : owedN > 0 ? (
                        <Txt size={fontSize.xs} weight="700" color={colors.accent}>
                          🔥 rattrape {owedN} question{owedN > 1 ? 's' : ''}
                        </Txt>
                      ) : (
                        <Txt faint size={fontSize.xs}>en jeu</Txt>
                      )}
                    </View>
                    <Button
                      title={paused ? '▶️ Revenir' : '⏸ Pause'}
                      size="sm"
                      variant={paused ? 'primary' : 'secondary'}
                      onPress={() => dispatch({ type: 'TOGGLE_STANDBY', playerId: p.id })}
                    />
                  </View>
                );
              })}
            </ScrollView>
            <Button title="Fermer" onPress={() => setShowPlayers(false)} style={{ marginTop: spacing(1) }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  // -------------------------------------------------------------------------
  // Phase renderers (closures: `game` and `q` are in scope and non-null here)
  // -------------------------------------------------------------------------

  function renderQuestion() {
    if (!q) return null;
    const theme = THEME_META[q.theme];
    const revealedHints = (q.hints ?? []).slice(0, game!.hintsRevealed);

    // Sous l'univers, en mode « tour » seulement (un seul « joueur » à la question) :
    //  - en solo : indique au joueur actif s'il avait désactivé cette catégorie ;
    //  - en équipe : liste les membres de l'équipe active qui ont cet univers en favori.
    const activeId = cfg.turnMode === 'turn' ? game!.activePlayerId : null;
    const activeTeam = teamMode && activeId ? cfg.teams.find((t) => t.id === activeId) : undefined;
    const activeName = activeId ? byId[activeId]?.name : undefined;
    const categoryWord = q.universe ? 'Univers' : 'Thème';
    const categoryKey = q.universe ?? `#${q.theme}`;
    const categoryExcluded = !teamMode && !!activeId && (unwantedByPlayer[activeId] ?? []).includes(categoryKey);
    // Pour une question à univers, on ne montre la ligne que si l'univers est
    // affiché ; pour un thème sans univers, on la montre toujours.
    const showSoloLine = !teamMode && !!activeId && (q.universe ? cfg.showUniverse : true);
    // Membres de l'équipe active qui n'ont PAS exclu cet univers de leur profil
    // (donc ceux pour qui c'est un univers voulu).
    const teamMembersWithUniverse =
      activeTeam && q.universe
        ? activeTeam.memberIds
            .map((id) => realById[id])
            .filter((p): p is Player => !!p && !(unwantedRawByPlayer[p.id] ?? []).includes(q.universe!))
        : [];

    return (
      <View style={{ gap: spacing(2) }}>
        <View style={{ gap: spacing(0.5) }}>
          <View style={styles.metaRow}>
            <Txt weight="800" color={colors.accent}>
              {theme.emoji} {cfg.showUniverse && q.universe ? q.universe : theme.label}
            </Txt>
            <Txt faint weight="700" size={fontSize.xs}>
              {DIFFICULTY_LABELS[q.difficulty].toUpperCase()}
            </Txt>
          </View>
          {showSoloLine && (
            <Txt weight="700" size={fontSize.xs} color={categoryExcluded ? colors.danger : colors.textFaint}>
              {categoryExcluded
                ? `🚫 ${categoryWord} non souhaité${activeName ? ` par ${activeName}` : ''}`
                : `✓ ${categoryWord} activé`}
            </Txt>
          )}
          {activeTeam && q.universe && (
            <Txt
              weight="700"
              size={fontSize.xs}
              color={teamMembersWithUniverse.length > 0 ? colors.accent : colors.textFaint}
            >
              {teamMembersWithUniverse.length > 0
                ? `⭐ Univers voulu par ${teamMembersWithUniverse.map((m) => m.name).join(', ')}`
                : "Univers exclu par toute l'équipe"}
            </Txt>
          )}
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

        {canGoBack && (
          <Button title="↩︎ Question précédente" variant="ghost" size="sm" onPress={goBack} />
        )}
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
            <PlayerAvatar emoji={active.emoji} color={active.color} photoUri={active.photoUri} size={32} />
            <Txt weight="800" style={{ flex: 1 }}>À toi, {active.name} !</Txt>
            {game!.activeCatchUp && (
              <Txt weight="800" size={fontSize.xs} color={colors.accent}>
                🔥 RATTRAPAGE
              </Txt>
            )}
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
            {roster.filter((p) => !game!.standby.includes(p.id)).map((p) => (
              <Pressable
                key={p.id}
                style={styles.buzzBtn}
                onPress={() => setBuzzed({ playerId: p.id, timeMs: Date.now() - questionStartRef.current })}
              >
                <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={36} />
                <Txt weight="700" numberOfLines={1}>
                  {p.name}
                </Txt>
              </Pressable>
            ))}
          </View>
          <Button
            title="Personne n'a trouvé"
            variant="ghost"
            size="sm"
            onPress={() => {
              snapshot();
              dispatch({ type: 'SKIP' });
            }}
          />
        </View>
      );
    }
    const p = byId[buzzed.playerId];
    return (
      <View style={{ gap: spacing(1.5) }}>
        <View style={styles.activeBanner}>
          {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={32} />}
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

  // Signaler la question en cours (réponse fausse, faute…) pour relecture ultérieure.
  const reportCurrent = () => {
    const q = currentQuestion(game!);
    if (!q || reportedIds.has(q.id)) return;
    const send = (reason: string) => {
      void reportQuestion({ id: q.id, text: q.text, answer: q.answer, universe: q.universe }, reason);
      setReportedIds((prev) => new Set(prev).add(q.id));
    };
    Alert.alert('Signaler cette question', 'Qu’est-ce qui ne va pas ?', [
      { text: 'Réponse fausse', onPress: () => send('reponse') },
      { text: 'Faute / orthographe', onPress: () => send('faute') },
      { text: 'Ambiguë ou obsolète', onPress: () => send('ambigu') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  function renderReveal() {
    const o = game!.lastOutcome;
    if (!o) return null;
    const who = game!.activePlayerId ? byId[game!.activePlayerId] : undefined;
    const ranking = getRanking(game!);
    const curId = currentQuestion(game!)?.id;
    const alreadyReported = !!curId && reportedIds.has(curId);
    const rq = currentQuestion(game!);

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

        {rq?.explanation ? (
          <Card accent={colors.accent}>
            <Txt weight="800" size={fontSize.sm}>
              💡 Le sais-tu ?
            </Txt>
            <Txt style={{ marginTop: spacing(0.5) }}>{rq.explanation}</Txt>
          </Card>
        ) : rq?.universe ? (
          <Txt faint size={fontSize.xs} center>
            💡 {rq.answer} — univers « {rq.universe} »
          </Txt>
        ) : null}

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
        {canGoBack && (
          <Button title="↩︎ Corriger" variant="ghost" onPress={goBack} />
        )}
        {curId && (
          <Button
            title={alreadyReported ? '✓ Question signalée' : '⚠️ Signaler cette question'}
            variant="ghost"
            size="sm"
            disabled={alreadyReported}
            onPress={reportCurrent}
          />
        )}
      </View>
    );
  }

  function renderMilestone() {
    if (!milestone) return null;
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(6), alignItems: 'center' }}>
        <Txt style={{ fontSize: 72 }}>{milestone.emoji}</Txt>
        <Txt size={fontSize.xxl} weight="900" center>
          {milestone.title}
        </Txt>
        <Txt dim center>
          {milestone.subtitle}
        </Txt>
        <View style={{ height: spacing(2) }} />
        <Button title="Continuer" size="lg" onPress={() => setMilestone(null)} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  function renderChallenge() {
    const c = game!.pendingChallenge;
    if (!c) return null;
    const resolved = resolvedChallenge ?? { text: c.text, pickedIds: [], timerSec: c.timerSec };
    const picked = resolved.pickedIds.map((id) => realById[id]).filter((p): p is Player => !!p);
    const timerDone = challengeTimer === 0;
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
            {resolved.text}
          </Txt>
        </Card>

        {/* Joueurs tirés au sort automatiquement : avatars + noms. */}
        {picked.length > 0 && (
          <View style={{ gap: spacing(1) }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing(2) }}>
              {picked.map((p) => (
                <View key={p.id} style={{ alignItems: 'center', gap: spacing(0.5) }}>
                  <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={52} />
                  <Txt weight="800">{p.name}</Txt>
                </View>
              ))}
            </View>
            <Button
              title="🎲 Retirer au sort"
              variant="secondary"
              size="sm"
              onPress={() => setChallengeSeed(randomSeed())}
              style={{ alignSelf: 'center' }}
            />
          </View>
        )}

        {/* Minuteur du défi : compte à rebours réinitialisable. */}
        {resolved.timerSec != null && (
          <Card accent={timerDone ? colors.danger : colors.primary}>
            <Txt center size={fontSize.xxl} weight="800" color={timerDone ? colors.danger : colors.text}>
              ⏱ {timerDone ? 'Temps écoulé !' : `${challengeTimer ?? resolved.timerSec} s`}
            </Txt>
            <Button
              title="↻ Réinitialiser le minuteur"
              variant="ghost"
              size="sm"
              onPress={() => setChallengeTimerKey((k) => k + 1)}
              style={{ marginTop: spacing(1) }}
            />
          </Card>
        )}

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
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing(2.5),
    maxHeight: '82%',
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    paddingVertical: spacing(1),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
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
