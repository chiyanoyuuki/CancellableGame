import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Txt } from '../../components/ui';
import {
  type AliasAction,
  type AliasConfig,
  type AliasState,
  aliasRanking,
  aliasReducer,
  aliasToSessionResult,
  createAliasState,
  currentRoundForTeam,
  currentTeam,
} from '../../core/aliasEngine';
import { isGoodImposteurWord } from '../../core/imposteurEngine';
import { randomSeed } from '../../core/rng';
import { haptics } from '../../lib/haptics';
import { sounds } from '../../lib/sounds';
import { useT } from '../../lib/i18nProvider';
import { useStore } from '../../store/StoreProvider';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';
import { getQuizPool } from '../quiz/pool';

export function AliasPlayComponent({ config, onFinish, onQuit }: MiniGamePlayProps) {
  const t = useT();
  const cfg = config as AliasConfig;
  const store = useStore();
  const [game, setGame] = useState<AliasState | null>(null);
  const [left, setLeft] = useState(cfg.roundSeconds);
  const startedAtRef = useRef(Date.now());
  const finishedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const full = await getQuizPool();
      const themeSet = cfg.themes && cfg.themes.length > 0 ? new Set(cfg.themes) : null;
      const seen = new Set<string>();
      const words: string[] = [];
      for (const q of full) {
        if (themeSet && !themeSet.has(q.theme)) continue;
        if (!isGoodImposteurWord(q.answer)) continue;
        if (!store.ent.allThemes && !store.isUniverseUnlocked(q.universe ?? `#${q.theme}`)) continue;
        if (seen.has(q.answer)) continue;
        seen.add(q.answer);
        words.push(q.answer);
      }
      if (!alive) return;
      startedAtRef.current = Date.now();
      setGame(createAliasState({ config: cfg, pool: words, seed: randomSeed() }));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = (a: AliasAction) => setGame((s) => (s ? aliasReducer(s, a) : s));

  // Chrono du tour : démarre à chaque passage en « playing », s'arrête à 0.
  useEffect(() => {
    if (game?.phase !== 'playing') return;
    setLeft(cfg.roundSeconds);
    const iv = setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          clearInterval(iv);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [game?.phase, game?.roundsDone, cfg.roundSeconds]);

  // Fin du temps → recap.
  useEffect(() => {
    if (game?.phase === 'playing' && left === 0) {
      haptics.fail();
      sounds.wrong();
      dispatch({ type: 'END_TURN' });
    } else if (game?.phase === 'playing' && left <= 5 && left > 0) {
      haptics.tick();
      sounds.tick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, game?.phase]);

  useEffect(() => {
    if (game?.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(aliasToSessionResult(game, startedAtRef.current, Date.now()));
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

  const team = currentTeam(game);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={confirmQuit} hitSlop={12}>
          <Txt color={colors.textDim} weight="700">
            {t('✕ Quitter')}
          </Txt>
        </Pressable>
        {game.phase !== 'finished' && team && (
          <Txt faint size={fontSize.sm} weight="700">
            {team.emoji} {t(team.name)} · {t('tour {n}/{total}', { n: currentRoundForTeam(game), total: cfg.roundsPerTeam })}
          </Txt>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {game.phase === 'ready'
          ? renderReady()
          : game.phase === 'playing'
            ? renderPlaying()
            : game.phase === 'turnEnd'
              ? renderTurnEnd()
              : null}
      </ScrollView>
    </SafeAreaView>
  );

  function renderReady() {
    if (!team) return null;
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(5), alignItems: 'center' }}>
        <Txt size={fontSize.huge}>{team.emoji}</Txt>
        <Txt size={fontSize.xxl} weight="900" center color={team.color}>
          {t('{name}, à vous !', { name: t(team.name) })}
        </Txt>
        <Txt dim center>
          {t('Le décriveur prend le téléphone. Prêt ? Le chrono démarre au « Go ».')}
        </Txt>
        <View style={{ height: spacing(1) }} />
        <Button title={t('Go ! 🚀')} size="lg" variant="accent" onPress={() => dispatch({ type: 'START_TURN' })} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  function renderPlaying() {
    const danger = left <= 5;
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(1) }}>
        <Txt weight="900" size={fontSize.huge} center color={danger ? colors.danger : colors.text}>
          {left}s
        </Txt>
        <Card style={{ minHeight: 140, justifyContent: 'center' }}>
          <Txt center size={fontSize.xxl} weight="900">
            {game!.word}
          </Txt>
        </Card>
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.action, { backgroundColor: colors.card }]}
            onPress={() => {
              haptics.select();
              dispatch({ type: 'SKIP' });
            }}
          >
            <Txt weight="800" size={fontSize.lg}>{t('⤳ Passer')}</Txt>
          </Pressable>
          <Pressable
            style={[styles.action, { backgroundColor: colors.success }]}
            onPress={() => {
              haptics.correct();
              sounds.correct();
              dispatch({ type: 'FOUND' });
            }}
          >
            <Txt weight="900" size={fontSize.lg} color={colors.white}>{t('✓ Trouvé')}</Txt>
          </Pressable>
        </View>
        <Button title={t('Terminer le tour')} variant="ghost" size="sm" onPress={() => dispatch({ type: 'END_TURN' })} />
      </View>
    );
  }

  function renderTurnEnd() {
    const found = game!.turnResults.filter((r) => r.found).length;
    const last = game!.roundsDone + 1 >= game!.totalTurns;
    const ranked = aliasRanking(game!);
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(2) }}>
        <View style={{ alignItems: 'center', gap: spacing(0.5) }}>
          <Txt size={fontSize.huge}>⏱️</Txt>
          <Txt size={fontSize.xl} weight="900" center>
            {t('{n} mots trouvés !', { n: found })}
          </Txt>
        </View>

        {game!.turnResults.length > 0 && (
          <Card>
            {game!.turnResults.map((r, i) => (
              <View key={`${r.word}-${i}`} style={styles.wordRow}>
                <Txt weight="700" style={{ flex: 1 }} numberOfLines={1}>
                  {r.word}
                </Txt>
                <Txt weight="900" color={r.found ? colors.success : colors.textFaint}>
                  {r.found ? '✓' : '⤳'}
                </Txt>
              </View>
            ))}
          </Card>
        )}

        <View>
          <Txt faint weight="800" size={fontSize.xs} style={{ marginBottom: spacing(0.5) }}>
            {t('SCORES')}
          </Txt>
          {ranked.map((tm, i) => (
            <View key={tm.id} style={styles.scoreRow}>
              <Txt weight="800" style={{ width: 22 }}>{i + 1}</Txt>
              <Txt style={{ flex: 1 }} weight="700" numberOfLines={1}>
                {tm.emoji} {t(tm.name)}
              </Txt>
              <Txt weight="900" color={colors.primary}>{game!.scores[tm.id] ?? 0}</Txt>
            </View>
          ))}
        </View>

        <Button
          title={last ? t('Voir les résultats') : t('Équipe suivante')}
          emoji={last ? '🏁' : '➡️'}
          size="lg"
          onPress={() => dispatch({ type: 'NEXT_TURN' })}
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
  actionRow: { flexDirection: 'row', gap: spacing(1.5) },
  action: { flex: 1, borderRadius: radius.md, padding: spacing(2.5), alignItems: 'center', justifyContent: 'center' },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), paddingVertical: spacing(0.5) },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), paddingVertical: spacing(0.5) },
});
