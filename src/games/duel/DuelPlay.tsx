import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, Txt } from '../../components/ui';
import { haptics } from '../../lib/haptics';
import { useT } from '../../lib/i18nProvider';
import { DIFFICULTY_LABELS, type Difficulty, type DuelConfig, type DuelJoker, type Player, THEME_META } from '../../core/models';
import { type DuelAction, type DuelState, createDuelState, duelReducer, duelToSessionResult } from '../../core/duelEngine';
import { type DrinkOutcome, rollAnswerDrink } from '../../core/drinks';
import { mulberry32, randomSeed, shuffle } from '../../core/rng';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import { useStore } from '../../store/StoreProvider';
import type { MiniGamePlayProps } from '../types';
import { getQuizPool } from '../quiz/pool';

function haptic(success: boolean) {
  if (success) haptics.correct();
  else haptics.fail();
}

export function DuelPlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const t = useT();
  const store = useStore();
  const cfg = config as DuelConfig;
  const [game, setGame] = useState<DuelState | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  // Écran de transition affiché quand la difficulté d'un joueur change.
  const [diffTransition, setDiffTransition] = useState<Difficulty | null>(null);
  // Pile d'états « avant réponse » pour corriger un mauvais clic (✅/❌).
  const [history, setHistory] = useState<DuelState[]>([]);

  const startedAtRef = useRef(Date.now());
  const finishedRef = useRef(false);
  // Dernière difficulté vue par chaque joueur, pour détecter les changements.
  const lastDiffRef = useRef<Record<string, number>>({});

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const fullPool = await getQuizPool();
        // Version gratuite : ne tire que dans les univers débloqués du joueur.
        const pool = store.ent.allThemes
          ? fullPool
          : fullPool.filter((q) => store.isUniverseUnlocked(q.universe ?? `#${q.theme}`));
        const seed = randomSeed();
        const order = shuffle(players, mulberry32(seed)).map((p) => p.id);
        if (!alive) return;
        startedAtRef.current = Date.now();
        setGame(createDuelState({ config: cfg, players, pool, seed, order }));
      } catch {
        if (alive) setLoadFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = (a: DuelAction) => setGame((s) => (s ? duelReducer(s, a) : s));

  // Correction d'un mauvais clic : on empile l'état AVANT chaque réponse.
  const snapshot = () => {
    if (game) setHistory((h) => [...h, game].slice(-50));
  };
  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setRevealedAnswer(false);
    setLastDrink(null);
    if (prev) setGame(prev);
  };
  const canUndo = history.length > 0;

  // Reset the free-answer reveal whenever a new question appears.
  useEffect(() => {
    if (game?.phase === 'question') setRevealedAnswer(false);
  }, [game?.activeId, game?.phase, game?.current?.id]);

  // Détecte le changement de difficulté du joueur actif et affiche une transition.
  useEffect(() => {
    if (game?.phase !== 'question' || !game.activeId || !game.current) return;
    const pid = game.activeId;
    const d = game.current.difficulty;
    const prev = lastDiffRef.current[pid];
    if (prev !== undefined && prev !== d) setDiffTransition(d);
    lastDiffRef.current[pid] = d;
  }, [game?.activeId, game?.current?.id, game?.phase]);

  useEffect(() => {
    if (game?.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(duelToSessionResult(game, startedAtRef.current, Date.now()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, onFinish]);

  const confirmQuit = () =>
    Alert.alert(t('Quitter le duel ?'), t('La partie en cours sera perdue.'), [
      { text: t('Continuer'), style: 'cancel' },
      { text: t('Quitter'), style: 'destructive', onPress: onQuit },
    ]);

  const [lastDrink, setLastDrink] = useState<DrinkOutcome | null>(null);

  const answer = (correct: boolean) => {
    haptic(correct);
    snapshot();
    if (cfg.drinksEnabled) {
      setLastDrink(
        rollAnswerDrink({
          correct,
          difficulty: game?.current?.difficulty ?? 2,
          turnMode: 'turn',
          hintsUsed: (game?.propsShown ?? 0) >= 2 ? 2 : 0,
          intensity: cfg.drinkIntensity,
          rng: Math.random,
        }),
      );
    }
    dispatch({ type: 'ANSWER', correct });
  };

  if (!game) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          {loadFailed ? (
            <>
              <Txt size={fontSize.huge}>😕</Txt>
              <Txt weight="800" center style={{ marginTop: spacing(1) }}>
                {t('Impossible de préparer la partie.')}
              </Txt>
              <Button title={t('Retour')} variant="secondary" style={{ marginTop: spacing(2) }} onPress={onQuit} />
            </>
          ) : (
            <>
              <ActivityIndicator color={colors.primary} size="large" />
              <Txt dim style={{ marginTop: spacing(2) }}>
                {t('Préparation du duel…')}
              </Txt>
            </>
          )}
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
            {t('✕ Quitter')}
          </Txt>
        </Pressable>
        <Txt faint size={fontSize.sm} weight="700">
          {t('⚔️ {n} en jeu', { n: game.alive.length })}
        </Txt>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {game.phase === 'reveal'
          ? renderReveal()
          : diffTransition !== null
            ? renderDiffTransition()
            : q
              ? renderQuestion()
              : null}
      </ScrollView>
    </SafeAreaView>
  );

  function renderDiffTransition() {
    if (diffTransition === null) return null;
    const diffEmoji: Record<Difficulty, string> = { 1: '🟢', 2: '🟡', 3: '🟠', 4: '🔴' };
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(6), alignItems: 'center' }}>
        <Txt style={{ fontSize: 72 }}>{diffEmoji[diffTransition]}</Txt>
        <Txt faint weight="800" size={fontSize.sm}>
          {t('CHANGEMENT DE DIFFICULTÉ')}
        </Txt>
        <Txt size={fontSize.xxl} weight="900" center color={colors.accent}>
          {t(DIFFICULTY_LABELS[diffTransition]).toUpperCase()}
        </Txt>
        {active && (
          <Txt dim center>
            {t('À toi, {name} !', { name: active.name })}
          </Txt>
        )}
        <View style={{ height: spacing(2) }} />
        <Button title={t('Continuer')} size="lg" variant="accent" onPress={() => setDiffTransition(null)} style={{ alignSelf: 'stretch' }} />
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
            {theme.emoji} {q.universe ?? t(theme.label)}
          </Txt>
          <Txt faint weight="700" size={fontSize.xs}>
            {t(DIFFICULTY_LABELS[q.difficulty]).toUpperCase()}
          </Txt>
        </View>

        {active && (
          <View style={styles.activeBanner}>
            <PlayerAvatar emoji={active.emoji} color={active.color} photoUri={active.photoUri} size={32} />
            <Txt weight="800">{t('À toi, {name} !', { name: active.name })}</Txt>
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

        {renderJokers()}
        {renderAnswerControls()}
      </View>
    );
  }

  function renderJokers() {
    const activeId = game!.activeId;
    if (!activeId) return null;
    const used = game!.jokersUsed[activeId] ?? [];
    const jk = cfg.jokers;
    const canOther = cfg.universes.length > 1;
    const buttons: { joker: DuelJoker; label: string; disabled: boolean }[] = [];
    if (jk.props4) buttons.push({ joker: 'props4', label: t('🔎 4 props'), disabled: used.includes('props4') || game!.propsShown !== 0 });
    if (jk.props2) buttons.push({ joker: 'props2', label: t('🔍 2 props'), disabled: used.includes('props2') || game!.propsShown === 2 });
    if (jk.playerHelp) buttons.push({ joker: 'playerHelp', label: t('🆘 Aide joueur'), disabled: used.includes('playerHelp') });
    if (jk.otherUniverse && canOther) buttons.push({ joker: 'otherUniverse', label: t('🔄 Autre univers'), disabled: used.includes('otherUniverse') });
    if (buttons.length === 0) return null;

    return (
      <View style={styles.jokerBox}>
        <Txt faint size={fontSize.xs} weight="800">
          {t('JOKERS DE {name}', { name: active?.name?.toUpperCase() ?? '' })}
        </Txt>
        <View style={styles.jokerRow}>
          {buttons.map((b) => (
            <Button
              key={b.joker}
              title={b.label}
              variant="secondary"
              size="sm"
              disabled={b.disabled}
              onPress={() => dispatch({ type: 'USE_JOKER', joker: b.joker })}
              style={{ flexGrow: 1 }}
            />
          ))}
        </View>
        {game!.helpUsed && (
          <Txt weight="700" size={fontSize.xs} color={colors.accent}>
            {t("🆘 {name} a demandé l'aide d'un autre joueur !", { name: active?.name ?? '' })}
          </Txt>
        )}
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
      return <Button title={t('Révéler la réponse')} onPress={() => setRevealedAnswer(true)} />;
    }
    return (
      <View style={{ gap: spacing(1) }}>
        <Card accent={colors.success}>
          <Txt faint size={fontSize.xs}>
            {t('RÉPONSE')}
          </Txt>
          <Txt size={fontSize.lg} weight="800">
            {q.answer}
          </Txt>
        </Card>
        <View style={{ flexDirection: 'row', gap: spacing(1) }}>
          <Button title={t('✅ Réussi')} variant="primary" style={{ flex: 1 }} onPress={() => answer(true)} />
          <Button title={t('❌ Raté')} variant="danger" style={{ flex: 1 }} onPress={() => answer(false)} />
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
            {survived
              ? t('{name} reste en jeu !', { name: active?.name ?? t('Le joueur') })
              : t('{name} est éliminé !', { name: elim?.name ?? t('Le joueur') })}
          </Txt>
        </View>

        {q && (
          <Card accent={colors.success}>
            <Txt faint size={fontSize.xs}>
              {t('RÉPONSE')}
            </Txt>
            <Txt size={fontSize.lg} weight="800">
              {q.answer}
            </Txt>
          </Card>
        )}

        <View>
          <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.5) }}>
            {t('ENCORE EN LICE ({n})', { n: stillIn.length })}
          </Txt>
          <View style={styles.aliveWrap}>
            {stillIn.map((id) => {
              const pl = byId[id];
              if (!pl) return null;
              return (
                <View key={id} style={styles.aliveChip}>
                  <PlayerAvatar emoji={pl.emoji} color={pl.color} photoUri={pl.photoUri} size={24} />
                  <Txt weight="700" size={fontSize.sm}>
                    {pl.name}
                  </Txt>
                </View>
              );
            })}
          </View>
        </View>

        {lastDrink && !!lastDrink.reason && (lastDrink.sipsDrunk > 0 || lastDrink.sipsGiven > 0) && (
          <Card accent={colors.warning}>
            <Txt weight="800" color={colors.warning}>🍺 {lastDrink.reason}</Txt>
            {lastDrink.sipsDrunk > 0 && (
              <Txt weight="700" style={{ marginTop: spacing(0.5) }}>
                {t(lastDrink.sipsDrunk > 1 ? '{name} boit {n} gorgées' : '{name} boit {n} gorgée', { name: (survived ? active?.name : elim?.name) ?? t('Le joueur'), n: lastDrink.sipsDrunk })}.
              </Txt>
            )}
            {lastDrink.sipsGiven > 0 && (
              <Txt weight="700" style={{ marginTop: spacing(0.5) }}>
                {t(lastDrink.sipsGiven > 1 ? '{name} distribue {n} gorgées' : '{name} distribue {n} gorgée', { name: active?.name ?? t('Le joueur'), n: lastDrink.sipsGiven })}.
              </Txt>
            )}
          </Card>
        )}

        <Button title={t('Continuer')} size="lg" onPress={() => { setLastDrink(null); dispatch({ type: 'CONTINUE' }); }} />
        {canUndo && <Button title={t('↩︎ Corriger')} variant="ghost" size="sm" onPress={undo} />}
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
  jokerBox: { gap: spacing(1), backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: spacing(1.5) },
  jokerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
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
