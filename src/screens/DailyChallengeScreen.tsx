import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, Share, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, ProgressBar, Screen, SectionHeader, Txt } from '../components/ui';
import {
  buildDaily,
  completeDay,
  DAILY_COUNT,
  dateKey,
  type DailyQuestion,
  EMPTY_STREAK,
  isDoneToday,
  liveStreak,
  normalizeCode,
  previousDateKey,
  randomChallengeCode,
  type StreakState,
} from '../core/dailyChallenge';
import { getQuizPool } from '../games/quiz/pool';
import { kvGetJSON, kvSetJSON } from '../db';
import { haptics } from '../lib/haptics';
import { speak, stopSpeaking } from '../lib/speech';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

const STREAK_KEY = 'daily:streak';
const lastResultKey = (date: string) => `daily:result:${date}`;

type Phase = 'loading' | 'intro' | 'playing' | 'done';
interface DayResult {
  score: number;
  total: number;
}

export function DailyChallengeScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'DailyChallenge'>) {
  const t = useT();
  const [phase, setPhase] = useState<Phase>('loading');
  const [daily, setDaily] = useState<DailyQuestion[]>([]);
  const [streak, setStreak] = useState<StreakState>(EMPTY_STREAK);
  const [todayResult, setTodayResult] = useState<DayResult | null>(null);
  const [codeInput, setCodeInput] = useState('');

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const countedRef = useRef(true); // cette partie compte-t-elle pour la série ?

  const today = dateKey();
  const yesterday = previousDateKey();
  // Défi partagé : le code reçu EST la graine ; ne compte jamais pour la série.
  const challengeCode = route.params?.seed ? normalizeCode(route.params.seed) : null;
  const isChallenge = !!challengeCode;
  const seedKey = challengeCode ?? today;

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const [pool, s, res] = await Promise.all([
          getQuizPool(),
          kvGetJSON<StreakState>(STREAK_KEY, EMPTY_STREAK),
          kvGetJSON<DayResult | null>(lastResultKey(today), null),
        ]);
        if (!alive) return;
        setDaily(buildDaily(pool, seedKey));
        setStreak(s);
        setTodayResult(res);
        // Ne pas écraser une partie en cours si l'écran reprend le focus.
        setPhase((p) => (p === 'playing' || p === 'done' ? p : 'intro'));
      })();
      return () => {
        alive = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seedKey]),
  );

  const start = () => {
    // Un défi partagé ou déjà fait aujourd'hui ne compte pas pour la série.
    countedRef.current = !isChallenge && !isDoneToday(streak, today);
    setIdx(0);
    setScore(0);
    setSelected(null);
    setPhase('playing');
  };

  const shareChallenge = (code: string, myScore?: number) => {
    const line =
      myScore !== undefined
        ? t('Je fais {score}/{total} sur ce défi Cancellable ! Bats-moi avec le code {code} 🎯', {
            score: myScore,
            total: daily.length,
            code,
          })
        : t('Défi Cancellable ! Rejoue exactement mes questions avec le code {code} 🎯', { code });
    void Share.share({ message: line });
  };

  const openCode = (code: string) => {
    const c = normalizeCode(code);
    if (c.length >= 3) navigation.push('DailyChallenge', { seed: c });
  };

  const current = daily[idx];

  // Lecture vocale de l'énoncé à chaque nouvelle question (si activée).
  useEffect(() => {
    if (phase === 'playing' && current) speak(current.question.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current?.question.id]);
  // Couper la voix en quittant l'écran.
  useEffect(() => stopSpeaking, []);

  const choose = (opt: string) => {
    if (selected || !current) return;
    setSelected(opt);
    const ok = opt === current.question.answer;
    if (ok) {
      setScore((s) => s + 1);
      haptics.correct();
    } else {
      haptics.wrong();
    }
  };

  const next = async () => {
    if (idx + 1 < daily.length) {
      setIdx((i) => i + 1);
      setSelected(null);
      return;
    }
    // Fin du défi.
    const finalScore = score; // score déjà à jour (setScore synchrone au tap précédent)
    const result: DayResult = { score: finalScore, total: daily.length };
    if (countedRef.current) {
      const nextStreak = completeDay(streak, today, yesterday);
      setStreak(nextStreak);
      setTodayResult(result);
      countedRef.current = false;
      await kvSetJSON(STREAK_KEY, nextStreak);
      await kvSetJSON(lastResultKey(today), result);
      haptics.win();
    } else if (!isChallenge) {
      setTodayResult((r) => r ?? result);
    } else {
      haptics.win();
    }
    setPhase('done');
  };

  const shown = liveStreak(streak, today, yesterday);
  const done = isDoneToday(streak, today);

  // --- Rendu ----------------------------------------------------------------
  if (phase === 'loading') {
    return (
      <Screen title={t('Défi du jour')} onBack={() => navigation.goBack()}>
        <Txt dim center style={{ marginTop: spacing(4) }}>
          {t('Chargement…')}
        </Txt>
      </Screen>
    );
  }

  if (phase === 'intro' && isChallenge) {
    return (
      <Screen title={t('Défi partagé')} onBack={() => navigation.goBack()} scroll>
        <View style={{ alignItems: 'center', marginVertical: spacing(2), gap: spacing(0.5) }}>
          <Txt size={fontSize.huge}>🔗</Txt>
          <Txt faint size={fontSize.xs} weight="800">{t('CODE DU DÉFI')}</Txt>
          <Txt size={fontSize.xxl} weight="900" style={{ letterSpacing: 3 }}>
            {challengeCode}
          </Txt>
        </View>
        <Card>
          <Txt weight="800" size={fontSize.lg}>{t('{n} questions, exactement les mêmes pour ton ami', { n: daily.length })}</Txt>
          <Txt dim size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
            {t('Comparez vos scores ! (ce défi ne compte pas pour ta série)')}
          </Txt>
        </Card>
        <View style={{ marginTop: spacing(2), gap: spacing(1) }}>
          <Button title={t('Commencer le défi')} emoji="🎯" size="lg" onPress={start} disabled={daily.length === 0} />
          <Button title={t('Partager ce défi')} emoji="🔗" variant="secondary" onPress={() => shareChallenge(challengeCode!)} />
        </View>
      </Screen>
    );
  }

  if (phase === 'intro') {
    return (
      <Screen title={t('Défi du jour')} onBack={() => navigation.goBack()} scroll>
        <View style={{ alignItems: 'center', marginVertical: spacing(2), gap: spacing(0.5) }}>
          <Txt size={fontSize.huge}>🔥</Txt>
          <Txt size={fontSize.xxl} weight="900">
            {t('Série : {n}', { n: shown })}
          </Txt>
          <Txt faint>{t('Meilleure série : {n}', { n: streak.best })}</Txt>
        </View>

        <Card>
          <Txt weight="800" size={fontSize.lg}>
            {t('{n} questions, un défi par jour', { n: DAILY_COUNT })}
          </Txt>
          <Txt dim size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
            {t('Le même défi pour tout le monde aujourd’hui. Reviens chaque jour pour allonger ta série.')}
          </Txt>
          {done && todayResult && (
            <Txt weight="800" color={colors.primary} style={{ marginTop: spacing(1) }}>
              {t('✅ Terminé aujourd’hui — {score}/{total}', { score: todayResult.score, total: todayResult.total })}
            </Txt>
          )}
        </Card>

        <View style={{ marginTop: spacing(2), gap: spacing(1) }}>
          <Button
            title={done ? t('Rejouer (hors série)') : t('Commencer le défi')}
            emoji="🎯"
            size="lg"
            onPress={start}
            disabled={daily.length === 0}
          />
          {daily.length === 0 && <Txt faint center size={fontSize.xs}>{t('Aucune question disponible.')}</Txt>}
        </View>

        {/* --- Défi entre amis --------------------------------------------- */}
        <SectionHeader title={t('Défi entre amis')} />
        <Card>
          <Txt dim size={fontSize.sm}>{t('Crée un code et partage-le : ton ami jouera exactement les mêmes questions.')}</Txt>
          <Button
            title={t('Créer un défi à partager')}
            emoji="🔗"
            variant="secondary"
            style={{ marginTop: spacing(1) }}
            onPress={() => openCode(randomChallengeCode())}
          />
          <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1.5) }}>
            <TextInput
              style={styles.codeInput}
              value={codeInput}
              onChangeText={(v) => setCodeInput(normalizeCode(v))}
              placeholder={t('Entrer un code reçu')}
              placeholderTextColor={colors.textFaint}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
            />
            <Button title={t('Jouer')} onPress={() => openCode(codeInput)} disabled={normalizeCode(codeInput).length < 3} />
          </View>
        </Card>

        {/* --- Autres modes solo ------------------------------------------- */}
        <SectionHeader title={t('Autres modes solo')} />
        <View style={{ gap: spacing(1) }}>
          <Button title={t('Survie')} emoji="💀" variant="secondary" onPress={() => navigation.navigate('SoloQuiz', { mode: 'survie' })} />
          <Button title={t('Contre-la-montre')} emoji="⏱️" variant="secondary" onPress={() => navigation.navigate('SoloQuiz', { mode: 'chrono' })} />
        </View>
      </Screen>
    );
  }

  if (phase === 'playing' && current) {
    const answer = current.question.answer;
    return (
      <Screen title={t('Défi du jour')} onBack={() => navigation.goBack()} scroll>
        <View style={{ gap: spacing(0.5), marginBottom: spacing(1) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt faint size={fontSize.xs} weight="800">
              {t('Question {i}/{n}', { i: idx + 1, n: daily.length })}
            </Txt>
            <Txt faint size={fontSize.xs} weight="800">
              {t('Score : {n}', { n: score })}
            </Txt>
          </View>
          <ProgressBar value={idx + (selected ? 1 : 0)} total={daily.length} />
        </View>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing(1) }}>
            <Txt weight="800" size={fontSize.lg} style={{ flex: 1 }}>
              {current.question.text}
            </Txt>
            <Pressable onPress={() => speak(current.question.text)} hitSlop={8}>
              <Txt size={fontSize.lg}>🔊</Txt>
            </Pressable>
          </View>
        </Card>

        <View style={{ marginTop: spacing(1.5), gap: spacing(1) }}>
          {current.options.map((opt) => {
            const isAnswer = opt === answer;
            const isPicked = opt === selected;
            let bg = colors.card;
            let border = colors.border;
            if (selected) {
              if (isAnswer) {
                bg = colors.successBg;
                border = colors.success;
              } else if (isPicked) {
                bg = colors.dangerBg;
                border = colors.danger;
              }
            }
            // Repère non coloré (accessibilité daltonisme) : ✓ bonne, ✗ mauvaise choisie.
            const glyph = selected ? (isAnswer ? '✓' : isPicked ? '✗' : '') : '';
            return (
              <Pressable
                key={opt}
                onPress={() => choose(opt)}
                disabled={!!selected}
                style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) }}>
                  <Txt weight="700" style={{ flex: 1 }}>
                    {opt}
                  </Txt>
                  {!!glyph && (
                    <Txt weight="900" size={fontSize.lg} color={isAnswer ? colors.success : colors.danger}>
                      {glyph}
                    </Txt>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {selected && (
          <Button
            title={idx + 1 < daily.length ? t('Suivant') : t('Voir le score')}
            emoji="➡️"
            size="lg"
            style={{ marginTop: spacing(2) }}
            onPress={() => void next()}
          />
        )}
      </Screen>
    );
  }

  // done
  const pct = daily.length > 0 ? Math.round((score / daily.length) * 100) : 0;
  return (
    <Screen title={t('Défi du jour')} onBack={() => navigation.goBack()} scroll>
      <View style={{ alignItems: 'center', marginVertical: spacing(3), gap: spacing(0.5) }}>
        <Txt size={fontSize.huge}>{pct >= 80 ? '🏆' : pct >= 50 ? '🎉' : '💪'}</Txt>
        <Txt size={fontSize.xxl} weight="900">
          {score}/{daily.length}
        </Txt>
        <Txt dim>{t('{pct}% de bonnes réponses', { pct })}</Txt>
        <Txt size={fontSize.xl} weight="900" style={{ marginTop: spacing(1) }}>
          {t('🔥 Série : {n}', { n: liveStreak(streak, today, yesterday) })}
        </Txt>
        {streak.best > 0 && <Txt faint>{t('Meilleure série : {n}', { n: streak.best })}</Txt>}
      </View>
      <View style={{ gap: spacing(1) }}>
        {isChallenge ? (
          <Button title={t('Partager ce défi')} emoji="🔗" onPress={() => shareChallenge(challengeCode!, score)} />
        ) : (
          <Button
            title={t('Défier un ami')}
            emoji="🔗"
            variant="secondary"
            onPress={() => {
              const code = randomChallengeCode();
              shareChallenge(code, score);
              openCode(code);
            }}
          />
        )}
        <Button title={t('Rejouer (hors série)')} emoji="🔁" variant="secondary" onPress={start} />
        <Button title={t('Retour')} emoji="🏠" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(1),
  },
  option: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(1.75),
  },
});
