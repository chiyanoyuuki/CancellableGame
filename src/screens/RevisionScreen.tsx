import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, ProgressBar, Screen, Txt } from '../components/ui';
import { buildDaily, type DailyQuestion } from '../core/dailyChallenge';
import { randomSeed } from '../core/rng';
import { clearMissedQuestion, getMissedQuestionIds } from '../db';
import { QUESTIONS } from '../games/quiz/questions';
import { haptics } from '../lib/haptics';
import { sounds } from '../lib/sounds';
import { speak, stopSpeaking } from '../lib/speech';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

/** Mode solo « Réviser mes erreurs » : rejoue les questions ratées en partie. */
export function RevisionScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Revision'>) {
  const t = useT();
  const [deck, setDeck] = useState<DailyQuestion[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [mastered, setMastered] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const startCountRef = useRef(0);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const ids = await getMissedQuestionIds();
      const idSet = new Set(ids);
      const pool = QUESTIONS.filter((q) => idSet.has(q.id));
      // buildDaily filtre les QCM propres sans média et mélange les options.
      const built = buildDaily(pool, randomSeed().toString(), pool.length);
      if (!alive) return;
      startCountRef.current = built.length;
      setDeck(built);
    })();
    return () => {
      alive = false;
      stopSpeaking();
    };
  }, []);

  const current = deck?.[idx];

  // Lecture vocale de l'énoncé (si activée).
  useEffect(() => {
    if (current) speak(current.question.text);
  }, [current?.question.id]);

  const choose = (opt: string) => {
    if (selected || !current) return;
    setSelected(opt);
    const correct = opt === current.question.answer;
    if (correct) {
      haptics.correct();
      sounds.correct();
      setMastered((m) => m + 1);
      void clearMissedQuestion(current.question.id);
    } else {
      haptics.wrong();
      sounds.wrong();
    }
    setReviewed((r) => r + 1);
  };

  const next = () => {
    setSelected(null);
    setIdx((i) => i + 1);
  };

  if (!deck) {
    return (
      <Screen title={t('Réviser mes erreurs')} onBack={() => navigation.goBack()}>
        <View style={{ alignItems: 'center', paddingTop: spacing(6) }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  if (deck.length === 0) {
    return (
      <Screen title={t('Réviser mes erreurs')} onBack={() => navigation.goBack()}>
        <EmptyState
          emoji="🎉"
          title={t('Aucune erreur à réviser')}
          subtitle={t('Joue au quiz : les questions que tu rates atterriront ici pour être révisées.')}
        />
      </Screen>
    );
  }

  // Fin de la session de révision.
  if (idx >= deck.length) {
    return (
      <Screen title={t('Révision terminée')} onBack={() => navigation.navigate('Home')}>
        <View style={{ alignItems: 'center', gap: spacing(1), paddingTop: spacing(4) }}>
          <Txt size={fontSize.huge}>🧠</Txt>
          <Txt size={fontSize.xl} weight="900" center>
            {t('{n} sur {total} maîtrisées', { n: mastered, total: startCountRef.current })}
          </Txt>
          <Txt dim center>
            {mastered === startCountRef.current
              ? t('Sans faute ! Ces questions ne reviendront plus. 👑')
              : t('Les questions encore ratées restent à réviser plus tard.')}
          </Txt>
        </View>
        <View style={{ height: spacing(3) }} />
        <Button title={t('Retour')} emoji="🏠" size="lg" onPress={() => navigation.navigate('Home')} />
      </Screen>
    );
  }

  const q = current!.question;
  return (
    <Screen title={t('Réviser mes erreurs')} onBack={() => navigation.goBack()}>
      <ProgressBar value={idx + 1} total={deck.length} />
      <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
        {t('{n}/{total} · {m} maîtrisées', { n: idx + 1, total: deck.length, m: mastered })}
      </Txt>

      <Card style={{ marginTop: spacing(1.5) }}>
        <Txt center size={fontSize.lg} weight="800">
          {q.text}
        </Txt>
      </Card>

      <View style={{ gap: spacing(1), marginTop: spacing(1.5) }}>
        {current!.options.map((opt) => {
          const isAnswer = opt === q.answer;
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
                {!!glyph && <Txt weight="900">{glyph}</Txt>}
              </View>
            </Pressable>
          );
        })}
      </View>

      {selected && (
        <View style={{ marginTop: spacing(2) }}>
          {!!q.explanation && (
            <Txt dim size={fontSize.sm} style={{ marginBottom: spacing(1.5) }}>
              {q.explanation}
            </Txt>
          )}
          <Button
            title={idx + 1 >= deck.length ? t('Voir le bilan') : t('Suivant')}
            emoji={idx + 1 >= deck.length ? '🏁' : '➡️'}
            size="lg"
            onPress={next}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: { borderRadius: radius.md, borderWidth: 2, padding: spacing(2) },
});
