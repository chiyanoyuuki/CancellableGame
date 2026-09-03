import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, ProgressBar, Txt } from '../components/ui';
import { QuestionHint } from '../components/QuestionHint';
import { buildDaily, type DailyQuestion } from '../core/dailyChallenge';
import { getQuizPool } from '../games/quiz/pool';
import { kvGetJSON, kvSetJSON } from '../db';
import { haptics } from '../lib/haptics';
import { speak, stopSpeaking } from '../lib/speech';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

/** Modes solo rapides, réutilisant le moteur QCM du défi du jour. */
export type SoloMode = 'survie' | 'chrono';

const DECK = 200; // profondeur du paquet mélangé
const CHRONO_SECONDS = 60;
const bestKey = (mode: SoloMode) => `solo:${mode}:best`;

type Phase = 'loading' | 'intro' | 'playing' | 'done';

export function SoloQuizScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'SoloQuiz'>) {
  const t = useT();
  const mode: SoloMode = route.params?.mode ?? 'survie';
  const isChrono = mode === 'chrono';

  const [phase, setPhase] = useState<Phase>('loading');
  const [deck, setDeck] = useState<DailyQuestion[]>([]);
  const [best, setBest] = useState(0);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(CHRONO_SECONDS);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        try {
          const [pool, b] = await Promise.all([getQuizPool(), kvGetJSON<number>(bestKey(mode), 0)]);
          if (!alive) return;
          setDeck(buildDaily(pool, `${mode}-${Date.now()}`, DECK));
          setBest(b);
        } catch {
          // Lecture impossible → on ne reste pas coincé sur « Chargement… ».
          if (!alive) return;
          setDeck([]);
        } finally {
          if (alive) setPhase((p) => (p === 'playing' || p === 'done' ? p : 'intro'));
        }
      })();
      return () => {
        alive = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]),
  );

  const current = deck[idx];

  useEffect(() => {
    if (phase === 'playing' && current) speak(current.question.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current?.question.id]);
  useEffect(() => stopSpeaking, []);

  // Compte à rebours du mode contre-la-montre.
  useEffect(() => {
    if (phase !== 'playing' || !isChrono) return;
    if (remaining <= 0) {
      void finish(score);
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isChrono, remaining]);

  const start = () => {
    setIdx(0);
    setScore(0);
    setSelected(null);
    setRemaining(CHRONO_SECONDS);
    setPhase('playing');
  };

  const finish = async (finalScore: number) => {
    stopSpeaking();
    if (finalScore > best) {
      setBest(finalScore);
      await kvSetJSON(bestKey(mode), finalScore);
      haptics.win();
    }
    setPhase('done');
  };

  const advance = (nextScore: number) => {
    setScore(nextScore);
    if (idx + 1 >= deck.length) {
      void finish(nextScore);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  };

  const choose = (opt: string) => {
    if (selected || !current) return;
    setSelected(opt);
    const ok = opt === current.question.answer;
    if (ok) haptics.correct();
    else haptics.wrong();

    if (isChrono) {
      // Enchaîne vite : bon = +1, mauvais = 0, on passe à la suite après un flash.
      setTimeout(() => advance(ok ? score + 1 : score), 450);
    } else if (!ok) {
      // Survie : première erreur = fin.
      setTimeout(() => void finish(score), 700);
    } else {
      setTimeout(() => advance(score + 1), 450);
    }
  };

  const title = isChrono ? t('Contre-la-montre') : t('Survie');

  if (phase === 'loading') {
    return (
      <Screen title={title} onBack={() => navigation.goBack()}>
        <Txt dim center style={{ marginTop: spacing(4) }}>
          {t('Chargement…')}
        </Txt>
      </Screen>
    );
  }

  if (phase === 'intro') {
    return (
      <Screen title={title} onBack={() => navigation.goBack()} scroll>
        <View style={{ alignItems: 'center', marginVertical: spacing(2), gap: spacing(0.5) }}>
          <Txt size={fontSize.huge}>{isChrono ? '⏱️' : '💀'}</Txt>
          <Txt faint>{t('Meilleur score : {n}', { n: best })}</Txt>
        </View>
        <Card>
          <Txt dim size={fontSize.sm}>
            {isChrono
              ? t('Réponds à un maximum de questions en {s} secondes.', { s: CHRONO_SECONDS })
              : t('Enchaîne les bonnes réponses. La première erreur arrête tout !')}
          </Txt>
        </Card>
        <Button
          title={t('Commencer')}
          emoji={isChrono ? '⏱️' : '💀'}
          size="lg"
          style={{ marginTop: spacing(2) }}
          onPress={start}
          disabled={deck.length === 0}
        />
        {deck.length === 0 && (
          <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(1) }}>
            {t('Aucune question disponible.')}
          </Txt>
        )}
      </Screen>
    );
  }

  if (phase === 'playing' && current) {
    const answer = current.question.answer;
    return (
      <Screen title={title} onBack={() => navigation.goBack()} scroll>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing(0.5) }}>
          <Txt faint size={fontSize.xs} weight="800">
            {isChrono ? t('⏱️ {s}s', { s: remaining }) : t('💀 Survie')}
          </Txt>
          <Txt faint size={fontSize.xs} weight="800">
            {t('Score : {n}', { n: score })}
          </Txt>
        </View>
        {isChrono && <ProgressBar value={remaining} total={CHRONO_SECONDS} color={remaining <= 10 ? colors.danger : colors.primary} />}

        <Card style={{ marginTop: spacing(1) }}>
          <QuestionHint theme={current.question.theme} universe={current.question.universe} />
          <Txt weight="800" size={fontSize.lg}>
            {current.question.text}
          </Txt>
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
      </Screen>
    );
  }

  // done
  const isRecord = score >= best && score > 0;
  return (
    <Screen title={title} onBack={() => navigation.goBack()} scroll>
      <View style={{ alignItems: 'center', marginVertical: spacing(3), gap: spacing(0.5) }}>
        <Txt size={fontSize.huge}>{isRecord ? '🏆' : isChrono ? '⏱️' : '💀'}</Txt>
        <Txt size={fontSize.xxl} weight="900">
          {t('Score : {n}', { n: score })}
        </Txt>
        <Txt faint>{isRecord ? t('Nouveau record ! 🎉') : t('Meilleur score : {n}', { n: best })}</Txt>
      </View>
      <View style={{ gap: spacing(1) }}>
        <Button title={t('Rejouer')} emoji="🔁" onPress={start} />
        <Button title={t('Retour')} emoji="🏠" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(1.75),
  },
});
