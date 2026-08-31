import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, ProgressBar, Screen, SectionHeader, Txt } from '../components/ui';
import { contentStats } from '../core/contentStats';
import { calibrationIssues, successByDifficulty, successByTheme } from '../core/difficultyAudit';
import { DIFFICULTY_LABELS, THEME_META } from '../core/models';
import type { Theme } from '../core/models';
import type { Difficulty } from '../core/models';
import { funFacts, type StatAnswer, type StatResult, type StatSession } from '../core/stats';
import { listPlayers, loadStatAnswers, loadStatResults, loadStatSessions } from '../db';
import { QUESTIONS } from '../games/quiz/questions';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

interface Play {
  sessions: StatSession[];
  results: StatResult[];
  answers: StatAnswer[];
  playerCount: number;
}

const EMPTY: Play = { sessions: [], results: [], answers: [], playerCount: 0 };

export function AppStatsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AppStats'>) {
  const t = useT();
  const [play, setPlay] = useState<Play>(EMPTY);

  // La banque de questions est statique : on la crunch une seule fois.
  const content = useMemo(() => contentStats(QUESTIONS), []);
  const pct = Math.round(content.translatedRatio * 100);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const [sessions, results, answers, players] = await Promise.all([
          loadStatSessions(),
          loadStatResults(),
          loadStatAnswers(),
          listPlayers(true),
        ]);
        setPlay({ sessions, results, answers, playerCount: players.length });
      })();
    }, []),
  );

  const facts = useMemo(
    () => funFacts(play.sessions, play.results, play.answers),
    [play],
  );

  const byDiff = useMemo(() => successByDifficulty(play.answers), [play.answers]);
  const hardestThemes = useMemo(() => successByTheme(play.answers, 10).slice(0, 5), [play.answers]);
  const calibration = useMemo(() => calibrationIssues(play.answers), [play.answers]);
  const rateColor = (rate: number) => (rate >= 0.66 ? colors.success : rate >= 0.4 ? colors.warning : colors.danger);

  return (
    <Screen title={t("Statistiques de l'app")} subtitle={t('Contenu, traduction et totaux')} onBack={() => navigation.goBack()} scroll>
      {/* --- Contenu --------------------------------------------------------- */}
      <SectionHeader title={t('Contenu')} />
      <View style={styles.factsRow}>
        <FactCard emoji="❓" value={String(content.totalQuestions)} label={t('questions')} />
        <FactCard emoji="🌌" value={String(content.totalUniverses)} label={t('univers')} />
        <FactCard emoji="🗂️" value={String(content.themesPresent)} label={t('thèmes')} />
      </View>
      <Card style={{ marginTop: spacing(1) }}>
        <Txt weight="700" size={fontSize.sm} style={{ marginBottom: spacing(1) }}>
          {t('Répartition par difficulté')}
        </Txt>
        {([1, 2, 3, 4] as Difficulty[]).map((d) => (
          <BreakdownRow
            key={d}
            label={t(DIFFICULTY_LABELS[d])}
            value={content.byDifficulty[d]}
            total={content.totalQuestions}
            color={colors.primary}
          />
        ))}
      </Card>

      {/* --- Traduction anglaise -------------------------------------------- */}
      <SectionHeader title={t('Traduction anglaise')} />
      <Card>
        <View style={styles.transHead}>
          <Txt weight="800" size={fontSize.xl}>
            {pct}%
          </Txt>
          <Txt faint size={fontSize.sm} style={{ flex: 1, textAlign: 'right' }}>
            {t('{done} / {total} questions', {
              done: content.translatedQuestions,
              total: content.totalQuestions,
            })}
          </Txt>
        </View>
        <View style={{ marginTop: spacing(1) }}>
          <ProgressBar value={content.translatedQuestions} total={content.totalQuestions} color={colors.success} />
        </View>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(1) }}>
          {t("Les énoncés non traduits restent affichés en français : l'app est toujours jouable, la couverture se complète par lots.")}
        </Txt>
      </Card>

      <Card style={{ marginTop: spacing(1) }}>
        <Txt weight="700" size={fontSize.sm} style={{ marginBottom: spacing(1) }}>
          {t('Par thème')}
        </Txt>
        {content.byTheme.map((c) => {
          const done = c.translated >= c.total;
          return (
            <BreakdownRow
              key={c.theme}
              label={`${THEME_META[c.theme].emoji} ${t(THEME_META[c.theme].label)}`}
              value={c.translated}
              total={c.total}
              trailing={done ? '✅' : `${c.translated}/${c.total}`}
              color={done ? colors.success : colors.warning}
            />
          );
        })}
      </Card>

      {/* --- Vos parties ---------------------------------------------------- */}
      <SectionHeader title={t('Vos parties')} />
      <View style={styles.factsRow}>
        <FactCard emoji="🎮" value={String(facts.totalGames)} label={t('parties')} />
        <FactCard emoji="🧑‍🤝‍🧑" value={String(play.playerCount)} label={t('profils')} />
        <FactCard emoji="✍️" value={String(facts.totalQuestions)} label={t('réponses')} />
      </View>
      <View style={[styles.factsRow, { marginTop: spacing(1) }]}>
        <FactCard emoji="🍺" value={String(facts.totalSips)} label={t('gorgées')} />
        <FactCard emoji="🎯" value={String(facts.totalPoints)} label={t('points cumulés')} />
      </View>

      {/* --- Calibrage (taux de réussite réel) ------------------------------ */}
      {byDiff.length > 0 && (
        <>
          <SectionHeader title={t('Calibrage difficulté')} />
          <Card>
            <Txt weight="700" size={fontSize.sm} style={{ marginBottom: spacing(1) }}>
              {t('Taux de réussite par difficulté')}
            </Txt>
            {byDiff.map((s) => (
              <BreakdownRow
                key={s.key}
                label={t(DIFFICULTY_LABELS[Number(s.key) as Difficulty])}
                value={s.correct}
                total={s.total}
                trailing={`${Math.round(s.rate * 100)}% · ${s.total}`}
                color={rateColor(s.rate)}
              />
            ))}
            {calibration.length > 0 ? (
              calibration.map((c, i) => (
                <Txt key={i} size={fontSize.xs} color={colors.warning} style={{ marginTop: spacing(0.5) }}>
                  {t('⚠️ Calibrage à revoir : {issue}', { issue: c })}
                </Txt>
              ))
            ) : (
              <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
                {t('La réussite décroît bien avec la difficulté 👍')}
              </Txt>
            )}
          </Card>
          {hardestThemes.length > 0 && (
            <Card style={{ marginTop: spacing(1) }}>
              <Txt weight="700" size={fontSize.sm} style={{ marginBottom: spacing(1) }}>
                {t('Thèmes les plus durs')}
              </Txt>
              {hardestThemes.map((s) => (
                <BreakdownRow
                  key={s.key}
                  label={`${THEME_META[s.key as Theme]?.emoji ?? '❓'} ${t(THEME_META[s.key as Theme]?.label ?? s.key)}`}
                  value={s.correct}
                  total={s.total}
                  trailing={`${Math.round(s.rate * 100)}% · ${s.total}`}
                  color={rateColor(s.rate)}
                />
              ))}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

function FactCard(props: { emoji: string; value: string; label: string }) {
  return (
    <Card style={styles.factCard}>
      <Txt size={fontSize.xl}>{props.emoji}</Txt>
      <Txt size={fontSize.xl} weight="900">
        {props.value}
      </Txt>
      <Txt faint size={fontSize.xs} center>
        {props.label}
      </Txt>
    </Card>
  );
}

function BreakdownRow(props: { label: string; value: number; total: number; trailing?: string; color: string }) {
  const pct = props.total > 0 ? Math.round((props.value / props.total) * 100) : 0;
  return (
    <View style={{ marginBottom: spacing(1) }}>
      <View style={styles.rowLabel}>
        <Txt size={fontSize.sm} numberOfLines={1} style={{ flex: 1 }}>
          {props.label}
        </Txt>
        <Txt faint size={fontSize.xs}>
          {props.trailing ?? `${props.value} · ${pct}%`}
        </Txt>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: props.color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  factsRow: { flexDirection: 'row', gap: spacing(1), marginTop: spacing(1) },
  factCard: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing(1.5) },
  transHead: { flexDirection: 'row', alignItems: 'center', gap: spacing(1) },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing(1), marginBottom: spacing(0.5) },
  barTrack: { height: 10, backgroundColor: colors.card, borderRadius: radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill },
});
