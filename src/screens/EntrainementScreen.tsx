import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Chip, ProgressBar, Screen, SectionHeader, Txt } from '../components/ui';
import { buildDaily, type DailyQuestion } from '../core/dailyChallenge';
import { type Question, type Theme, THEME_META, THEMES } from '../core/models';
import { randomSeed } from '../core/rng';
import { getQuizPool } from '../games/quiz/pool';
import { haptics } from '../lib/haptics';
import { sounds } from '../lib/sounds';
import { speak, stopSpeaking } from '../lib/speech';
import { useT } from '../lib/i18nProvider';
import { useStore } from '../store/StoreProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

const SESSION = 20; // questions par session d'entraînement

/** Entraînement solo décontracté : choisis un thème et enchaîne les questions. */
export function EntrainementScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Entrainement'>) {
  const t = useT();
  const store = useStore();
  const [pool, setPool] = useState<Question[] | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [deck, setDeck] = useState<DailyQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const full = await getQuizPool();
      const usable = store.ent.allThemes
        ? full
        : full.filter((q) => store.isUniverseUnlocked(q.universe ?? `#${q.theme}`));
      if (alive) setPool(usable);
    })();
    return () => {
      alive = false;
      stopSpeaking();
    };
  }, [store]);

  // Thèmes disponibles + nombre de questions QCM jouables (sans média).
  const counts = useMemo(() => {
    const m = new Map<Theme, number>();
    for (const q of pool ?? []) {
      if (q.media || q.distractors.length !== 3) continue;
      m.set(q.theme, (m.get(q.theme) ?? 0) + 1);
    }
    return m;
  }, [pool]);

  const startTheme = (th: Theme) => {
    const themed = (pool ?? []).filter((q) => q.theme === th);
    const built = buildDaily(themed, randomSeed().toString(), SESSION);
    setTheme(th);
    setDeck(built);
    setIdx(0);
    setSelected(null);
    setCorrect(0);
  };

  const current = deck[idx];
  useEffect(() => {
    if (current) speak(current.question.text);
  }, [current?.question.id]);

  const choose = (opt: string) => {
    if (selected || !current) return;
    setSelected(opt);
    if (opt === current.question.answer) {
      haptics.correct();
      sounds.correct();
      setCorrect((c) => c + 1);
    } else {
      haptics.wrong();
      sounds.wrong();
    }
  };

  const next = () => {
    setSelected(null);
    setIdx((i) => i + 1);
  };

  const backToThemes = () => {
    setTheme(null);
    setDeck([]);
    stopSpeaking();
  };

  if (!pool) {
    return (
      <Screen title={t('Entraînement')} onBack={() => navigation.goBack()}>
        <View style={{ alignItems: 'center', paddingTop: spacing(6) }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  // Choix du thème.
  if (!theme) {
    const available = THEMES.filter((th) => (counts.get(th) ?? 0) > 0);
    return (
      <Screen title={t('Entraînement par thème')} subtitle={t('Choisis un thème et enchaîne, sans pression')} onBack={() => navigation.goBack()} scroll>
        <SectionHeader title={t('Thèmes')} />
        <View style={styles.chips}>
          {available.map((th) => (
            <Chip
              key={th}
              label={`${THEME_META[th].emoji} ${t(THEME_META[th].label)} · ${counts.get(th) ?? 0}`}
              onPress={() => startTheme(th)}
            />
          ))}
        </View>
        {available.length === 0 && (
          <Txt dim center style={{ marginTop: spacing(3) }}>
            {t('Aucun thème jouable pour le moment.')}
          </Txt>
        )}
      </Screen>
    );
  }

  // Fin de session.
  if (idx >= deck.length) {
    return (
      <Screen title={t('Entraînement')} onBack={backToThemes}>
        <View style={{ alignItems: 'center', gap: spacing(1), paddingTop: spacing(4) }}>
          <Txt size={fontSize.huge}>🎓</Txt>
          <Txt size={fontSize.xl} weight="900" center>
            {t('{n}/{total} bonnes réponses', { n: correct, total: deck.length })}
          </Txt>
          <Txt dim center>{THEME_META[theme].emoji} {t(THEME_META[theme].label)}</Txt>
        </View>
        <View style={{ height: spacing(3) }} />
        <Button title={t('Encore ce thème')} emoji="🔁" size="lg" onPress={() => startTheme(theme)} />
        <View style={{ height: spacing(1) }} />
        <Button title={t('Changer de thème')} emoji="🎯" variant="secondary" onPress={backToThemes} />
      </Screen>
    );
  }

  const q = current!.question;
  return (
    <Screen title={`${THEME_META[theme].emoji} ${t(THEME_META[theme].label)}`} onBack={backToThemes}>
      <ProgressBar value={idx + 1} total={deck.length} />
      <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
        {t('{n}/{total} · {m} bonnes', { n: idx + 1, total: deck.length, m: correct })}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  option: { borderRadius: radius.md, borderWidth: 2, padding: spacing(2) },
});
