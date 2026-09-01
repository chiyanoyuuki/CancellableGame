import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, Txt } from '../../components/ui';
import { buildDaily } from '../../core/dailyChallenge';
import { type CultureConfig, type CultureState, type QCard, createCultureState, cultureRanking, cultureReducer, cultureToSessionResult, currentPlayerId } from '../../core/cultureEngine';
import { daresFor } from '../../core/dares';
import type { Player } from '../../core/models';
import { randomSeed } from '../../core/rng';
import { haptics } from '../../lib/haptics';
import { sounds } from '../../lib/sounds';
import { useT } from '../../lib/i18nProvider';
import { useStore } from '../../store/StoreProvider';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';
import { getQuizPool } from '../quiz/pool';

export function CulturePlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const t = useT();
  const cfg = config as CultureConfig;
  const store = useStore();
  const [game, setGame] = useState<CultureState | null>(null);
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
      const full = await getQuizPool();
      const themeSet = cfg.themes && cfg.themes.length > 0 ? new Set(cfg.themes) : null;
      const pool = full.filter(
        (q) =>
          (!themeSet || themeSet.has(q.theme)) &&
          (store.ent.allThemes || store.isUniverseUnlocked(q.universe ?? `#${q.theme}`)),
      );
      const need = players.length * Math.max(1, cfg.questionsPerPlayer);
      const daily = buildDaily(pool, randomSeed().toString(), Math.max(need + 4, need));
      const deck: QCard[] = daily.map((d) => ({
        id: d.question.id,
        text: d.question.text,
        options: d.options,
        answer: d.question.answer,
      }));
      if (!alive) return;
      startedAtRef.current = Date.now();
      setGame(
        createCultureState({ config: cfg, players, deck, dares: daresFor(cfg.dareCategory), seed: randomSeed() }),
      );
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = (a: Parameters<typeof cultureReducer>[1]) => setGame((s) => (s ? cultureReducer(s, a) : s));

  useEffect(() => {
    if (game?.phase === 'result') {
      if (game.lastOutcome?.correct) {
        haptics.correct();
        sounds.correct();
      } else {
        haptics.wrong();
        sounds.wrong();
      }
    }
  }, [game?.phase, game?.asked, game?.lastOutcome?.correct]);

  useEffect(() => {
    if (game?.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(cultureToSessionResult(game, startedAtRef.current, Date.now()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.phase, onFinish]);

  const confirmQuit = () =>
    Alert.alert(t('Quitter la partie ?'), t('La partie en cours sera perdue.'), [
      { text: t('Continuer'), style: 'cancel' },
      { text: t('Quitter'), style: 'destructive', onPress: onQuit },
    ]);

  if (!game) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Txt dim style={{ marginTop: spacing(2) }}>
            {t('Préparation de la partie…')}
          </Txt>
        </View>
      </SafeAreaView>
    );
  }

  const meId = currentPlayerId(game);
  const me = meId ? byId[meId] : undefined;

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
            {t('🎲 Question {n}/{total}', { n: Math.min(game.asked + 1, game.totalQuestions), total: game.totalQuestions })}
          </Txt>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {game.phase === 'question' ? renderQuestion() : game.phase === 'result' ? renderResult() : null}
      </ScrollView>
    </SafeAreaView>
  );

  function renderQuestion() {
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), justifyContent: 'center' }}>
          {me && <PlayerAvatar emoji={me.emoji} color={me.color} photoUri={me.photoUri} size={30} playerId={me.id} />}
          <Txt weight="800">{t("C'est à {name}", { name: me?.name ?? '?' })}</Txt>
        </View>
        <Card>
          <Txt center size={fontSize.lg} weight="800">
            {game!.card.text}
          </Txt>
        </Card>
        <View style={{ gap: spacing(1) }}>
          {game!.card.options.map((opt) => (
            <Pressable
              key={opt}
              style={styles.option}
              onPress={() => {
                haptics.select();
                dispatch({ type: 'ANSWER', choice: opt });
              }}
            >
              <Txt weight="700" size={fontSize.lg}>
                {opt}
              </Txt>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  function renderResult() {
    const o = game!.lastOutcome;
    if (!o) return null;
    const ranked = cultureRanking(game!);
    const last = game!.asked + 1 >= game!.totalQuestions;
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(1) }}>
        <View style={{ alignItems: 'center', gap: spacing(1) }}>
          <Txt size={fontSize.huge}>{o.correct ? '✅' : '🎲'}</Txt>
          <Txt size={fontSize.xl} weight="900" center>
            {o.correct ? t('Bonne réponse ! +1') : t('Raté… gage !')}
          </Txt>
        </View>

        {!o.correct && (
          <Card accent={colors.success}>
            <Txt faint size={fontSize.xs}>{t('La bonne réponse était')}</Txt>
            <Txt weight="800">{o.answer}</Txt>
          </Card>
        )}

        {!o.correct && !!o.dare && (
          <Card accent={colors.accent}>
            <Txt weight="800" color={colors.accent}>{t('🎭 Gage')}</Txt>
            <Txt style={{ marginTop: spacing(0.5) }}>{o.dare}</Txt>
          </Card>
        )}

        {o.sips > 0 && me && (
          <Card accent={colors.sip}>
            <Txt weight="800" color={colors.sip}>
              {t(o.sips > 1 ? '🍺 {name} : {n} gorgées' : '🍺 {name} : {n} gorgée', { name: me.name, n: o.sips })}
            </Txt>
          </Card>
        )}

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
                {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={26} playerId={p.id} />}
                <Txt weight="700" style={{ flex: 1 }} numberOfLines={1}>
                  {p?.name ?? id}
                </Txt>
                <Txt weight="900" color={colors.primary}>
                  {game!.scores[id] ?? 0}
                </Txt>
              </View>
            );
          })}
        </View>

        <Button
          title={last ? t('Voir les résultats') : t('Joueur suivant')}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
  },
  body: { padding: spacing(2), paddingBottom: spacing(4) },
  option: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing(2),
  },
  standRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), paddingVertical: spacing(0.5) },
});
