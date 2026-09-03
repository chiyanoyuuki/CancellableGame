import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, Txt } from '../components/ui';
import { buildDaily, type DailyQuestion } from '../core/dailyChallenge';
import type { Player } from '../core/models';
import { randomSeed } from '../core/rng';
import { awardTieBreak } from '../core/soiree';
import { getActiveSoiree, listPlayers, saveActiveSoiree } from '../db';
import { getQuizPool } from '../games/quiz/pool';
import { haptics } from '../lib/haptics';
import { sounds } from '../lib/sounds';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

/** Manche de départage : question(s) surprise pour trancher une égalité en tête. */
export function TieBreakScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'TieBreak'>) {
  const t = useT();
  const { playerIds, returnTo } = route.params;
  const [players, setPlayers] = useState<Player[]>([]);
  const [deck, setDeck] = useState<DailyQuestion[] | null>(null);
  const [failed, setFailed] = useState(false);

  const [contenders, setContenders] = useState<string[]>(playerIds);
  const [qIndex, setQIndex] = useState(0);
  const [turn, setTurn] = useState(0); // index dans contenders du joueur qui répond
  const [reveal, setReveal] = useState(false); // écran de réponse ouvert ?
  const [correctThisRound, setCorrectThisRound] = useState<string[]>([]);
  const [roundOver, setRoundOver] = useState(false);
  const settledRef = useRef(false);

  useEffect(() => {
    void (async () => {
      try {
        const [pl, pool] = await Promise.all([listPlayers(true), getQuizPool()]);
        const d = buildDaily(pool, `tiebreak-${randomSeed()}`, 24);
        setPlayers(pl);
        setDeck(d);
        // Sans joueurs ni questions, le départage ne peut pas se dérouler : on
        // bascule sur un écran d'erreur au lieu d'un spinner (ou d'un crash sur
        // un deck vide).
        if (d.length === 0 || pl.length === 0) setFailed(true);
      } catch {
        setFailed(true);
      }
    })();
  }, []);

  const byId = useMemo(() => {
    const m: Record<string, Player> = {};
    for (const p of players) m[p.id] = p;
    return m;
  }, [players]);

  const question = deck?.[qIndex % (deck.length || 1)];

  const finish = async (winnerId: string) => {
    if (settledRef.current) return;
    settledRef.current = true;
    try {
      const active = await getActiveSoiree();
      if (active) await saveActiveSoiree(awardTieBreak(active, winnerId));
    } catch {
      // best-effort
    }
    navigation.navigate(returnTo);
  };

  const answer = (opt: string) => {
    if (!question) return;
    const player = contenders[turn];
    if (!player) return;
    const correct = opt === question.question.answer;
    if (correct) {
      haptics.correct();
      sounds.correct();
    } else {
      haptics.wrong();
      sounds.wrong();
    }
    const nextCorrect = correct ? [...correctThisRound, player] : correctThisRound;
    setCorrectThisRound(nextCorrect);
    setReveal(false);
    const nextTurn = turn + 1;
    if (nextTurn < contenders.length) {
      setTurn(nextTurn);
      return;
    }
    // Tous les prétendants ont répondu → on évalue la manche.
    if (nextCorrect.length === 1) {
      void finish(nextCorrect[0]!);
      return;
    }
    setRoundOver(true);
  };

  const nextRound = () => {
    // Si plusieurs ont réussi, ils continuent entre eux ; sinon tout le monde rejoue.
    const stillIn = correctThisRound.length > 1 ? correctThisRound : contenders;
    setContenders(stillIn);
    setQIndex((i) => i + 1);
    setTurn(0);
    setCorrectThisRound([]);
    setRoundOver(false);
  };

  if (failed) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Txt size={fontSize.huge}>😕</Txt>
          <Txt weight="800" center style={{ marginTop: spacing(1) }}>{t('Départage impossible pour le moment.')}</Txt>
          <Button title={t('Retour')} variant="secondary" style={{ marginTop: spacing(2) }} onPress={() => navigation.navigate(returnTo)} />
        </View>
      </SafeAreaView>
    );
  }

  if (!deck || players.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Txt dim style={{ marginTop: spacing(2) }}>{t('Préparation du départage…')}</Txt>
        </View>
      </SafeAreaView>
    );
  }

  const q = question!.question;
  const player = byId[contenders[turn] ?? ''];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Txt weight="900" size={fontSize.lg}>{t('🥊 Départage')}</Txt>
        <Txt faint size={fontSize.sm} weight="700">{t('{n} en lice', { n: contenders.length })}</Txt>
      </View>

      <View style={styles.body}>
        {roundOver ? (
          <View style={{ gap: spacing(2), alignItems: 'center', paddingTop: spacing(3) }}>
            <Txt size={fontSize.huge}>😮</Txt>
            <Txt size={fontSize.xl} weight="900" center>
              {correctThisRound.length === 0 ? t('Personne n\'a trouvé !') : t('Toujours à égalité !')}
            </Txt>
            <Txt dim center>
              {t('La bonne réponse était « {answer} ». On remet ça.', { answer: q.answer })}
            </Txt>
            <Button title={t('Question suivante')} emoji="➡️" size="lg" variant="accent" onPress={nextRound} style={{ alignSelf: 'stretch' }} />
          </View>
        ) : !reveal ? (
          <View style={{ gap: spacing(2), alignItems: 'center', paddingTop: spacing(4) }}>
            {player && <PlayerAvatar emoji={player.emoji} color={player.color} photoUri={player.photoUri} size={72} playerId={player.id} />}
            <Txt faint weight="800" size={fontSize.sm}>{t('PASSE LE TÉLÉPHONE')}</Txt>
            <Txt size={fontSize.xxl} weight="900" center>{t('{name}, à toi', { name: player?.name ?? '?' })}</Txt>
            <Txt dim center>{t('Réponds vite et bien : une seule bonne réponse te sacre champion.')}</Txt>
            <Button title={t('Voir la question')} emoji="🎯" size="lg" variant="accent" onPress={() => setReveal(true)} style={{ alignSelf: 'stretch' }} />
          </View>
        ) : (
          <View style={{ gap: spacing(1.5), paddingTop: spacing(1) }}>
            <Card><Txt center size={fontSize.lg} weight="800">{q.text}</Txt></Card>
            {question!.options.map((opt) => (
              <Pressable key={opt} style={styles.option} onPress={() => answer(opt)}>
                <Txt weight="700" size={fontSize.lg}>{opt}</Txt>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing(2), paddingVertical: spacing(1.5) },
  body: { flex: 1, padding: spacing(2) },
  option: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, padding: spacing(2) },
});
