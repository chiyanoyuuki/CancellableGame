import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, PlayerAvatar, Screen, SectionHeader, Txt } from '../components/ui';
import { QuestionHint } from '../components/QuestionHint';
import { buildDaily, dateKey, type DailyQuestion } from '../core/dailyChallenge';
import type { Player } from '../core/models';
import { allAnsweredToday, hasAnswered, qotdBoard, type QotdRecord, recordQotd } from '../core/qotd';
import { kvGetJSON, kvSetJSON, listPlayers } from '../db';
import { getQuizPool } from '../games/quiz/pool';
import { haptics } from '../lib/haptics';
import { sounds } from '../lib/sounds';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

const KV_KEY = 'qotd:answers';

/** Question du jour : une seule question, chacun répond, révélation collective. */
export function QotdScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Qotd'>) {
  const t = useT();
  const today = dateKey();
  const [players, setPlayers] = useState<Player[]>([]);
  const [data, setData] = useState<QotdRecord | null>(null);
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [answering, setAnswering] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [pl, stored, pool] = await Promise.all([
          listPlayers(true),
          kvGetJSON<QotdRecord>(KV_KEY, {}),
          getQuizPool(),
        ]);
        if (!alive) return;
        setPlayers(pl);
        setData(stored);
        setQuestion(buildDaily(pool, `qotd-${today}`, 1)[0] ?? null);
      } catch {
        // Lecture impossible → on n'affiche pas un spinner figé.
        if (!alive) return;
        setData({});
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [today]);

  const playerIds = useMemo(() => players.map((p) => p.id), [players]);
  const board = useMemo(() => (data ? qotdBoard(data, playerIds, today) : []), [data, playerIds, today]);
  const allDone = data ? allAnsweredToday(data, playerIds, today) : false;
  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  const submit = async (opt: string) => {
    if (!answering || !question || !data) return;
    setSelected(opt);
    const correct = opt === question.question.answer;
    if (correct) {
      haptics.correct();
      sounds.correct();
    } else {
      haptics.wrong();
      sounds.wrong();
    }
    const next = recordQotd(data, today, answering, correct);
    setData(next);
    await kvSetJSON(KV_KEY, next);
    // Retour au tableau après un court instant (pas de révélation ici).
    setTimeout(() => {
      setAnswering(null);
      setSelected(null);
    }, 500);
  };

  // Tant que le chargement n'est pas terminé → spinner (jamais figé : `loaded`
  // passe à true même en cas d'erreur de lecture).
  if (!loaded) {
    return (
      <Screen title={t('Question du jour')} onBack={() => navigation.goBack()}>
        <View style={{ alignItems: 'center', paddingTop: spacing(6) }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }
  if (players.length === 0) {
    return (
      <Screen title={t('Question du jour')} onBack={() => navigation.goBack()}>
        <EmptyState emoji="👥" title={t('Aucun joueur')} subtitle={t('Ajoute des joueurs pour répondre à la question du jour.')} />
      </Screen>
    );
  }
  if (!data || !question) {
    return (
      <Screen title={t('Question du jour')} onBack={() => navigation.goBack()}>
        <EmptyState emoji="🤷" title={t('Aucune question disponible')} subtitle={t('Reviens un peu plus tard pour la question du jour.')} />
      </Screen>
    );
  }

  const q = question.question;

  // Écran de réponse d'un joueur.
  if (answering) {
    const p = byId[answering];
    return (
      <Screen title={t('Question du jour')} onBack={() => setAnswering(null)}>
        <View style={{ alignItems: 'center', gap: spacing(1), marginBottom: spacing(1) }}>
          {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={48} playerId={p.id} />}
          <Txt weight="800">{t('{name} répond', { name: p?.name ?? '?' })}</Txt>
        </View>
        <Card>
          <QuestionHint theme={q.theme} universe={q.universe} center />
          <Txt center size={fontSize.lg} weight="800">{q.text}</Txt>
        </Card>
        <View style={{ gap: spacing(1), marginTop: spacing(1.5) }}>
          {question.options.map((opt) => (
            <Pressable
              key={opt}
              disabled={!!selected}
              onPress={() => void submit(opt)}
              style={[styles.option, selected === opt && { borderColor: colors.primary }]}
            >
              <Txt weight="700" size={fontSize.lg}>{opt}</Txt>
            </Pressable>
          ))}
        </View>
        <Txt faint center size={fontSize.xs} style={{ marginTop: spacing(2) }}>
          {t('Réponds sans montrer aux autres — les résultats se révèlent quand tout le monde a joué.')}
        </Txt>
      </Screen>
    );
  }

  return (
    <Screen title={t('Question du jour')} subtitle={t('Une question, une fois par jour')} onBack={() => navigation.goBack()} scroll>
      <Card accent={colors.accent}>
        <QuestionHint theme={q.theme} universe={q.universe} center />
        <Txt center size={fontSize.lg} weight="800">{q.text}</Txt>
        {allDone && (
          <View style={{ marginTop: spacing(1.5), alignItems: 'center' }}>
            <Txt faint size={fontSize.xs}>{t('LA RÉPONSE')}</Txt>
            <Txt weight="900" size={fontSize.xl} color={colors.success}>{q.answer}</Txt>
            {!!q.explanation && (
              <Txt dim size={fontSize.sm} center style={{ marginTop: spacing(0.5) }}>{q.explanation}</Txt>
            )}
          </View>
        )}
      </Card>

      <SectionHeader title={allDone ? t('Résultats du jour') : t('À vous de jouer')} />
      {board.map((row, i) => {
        const p = byId[row.playerId];
        const played = hasAnswered(data, today, row.playerId);
        return (
          <Card
            key={row.playerId}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginBottom: spacing(0.75) }}
            onPress={!played ? () => setAnswering(row.playerId) : undefined}
          >
            <Txt weight="800" style={{ width: 22 }}>{i + 1}</Txt>
            {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={34} playerId={p.id} />}
            <View style={{ flex: 1 }}>
              <Txt weight="800" numberOfLines={1}>{p?.name ?? row.playerId}</Txt>
              <Txt faint size={fontSize.xs}>{t('{n} bonnes réponses au total', { n: row.totalCorrect })}</Txt>
            </View>
            {/* Aujourd'hui : neutre tant que tout le monde n'a pas joué. */}
            {allDone ? (
              <Txt weight="900" size={fontSize.lg} color={row.correctToday ? colors.success : colors.danger}>
                {row.correctToday ? '✓' : '✗'}
              </Txt>
            ) : played ? (
              <Txt weight="800" color={colors.textFaint}>{t('a joué')}</Txt>
            ) : (
              <Txt weight="800" color={colors.primary}>{t('à toi ›')}</Txt>
            )}
          </Card>
        );
      })}

      {allDone && (
        <Txt dim center style={{ marginTop: spacing(2) }}>
          {t('Tout le monde a joué ! Reviens demain pour une nouvelle question. 🌅')}
        </Txt>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, padding: spacing(2) },
});
