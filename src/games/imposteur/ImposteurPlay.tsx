import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, PlayerAvatar, Txt } from '../../components/ui';
import type { Player } from '../../core/models';
import {
  type ImposteurAction,
  type ImposteurConfig,
  type ImposteurState,
  type WordCard,
  createImposteurState,
  imposteurRanking,
  imposteurReducer,
  imposteurToSessionResult,
  isGoodImposteurWord,
} from '../../core/imposteurEngine';
import { randomSeed } from '../../core/rng';
import { haptics } from '../../lib/haptics';
import { useT } from '../../lib/i18nProvider';
import { getQuizPool } from '../quiz/pool';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGamePlayProps } from '../types';

export function ImposteurPlayComponent({ players, config, onFinish, onQuit }: MiniGamePlayProps) {
  const t = useT();
  const cfg = config as ImposteurConfig;
  const [game, setGame] = useState<ImposteurState | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [discussLeft, setDiscussLeft] = useState<number | null>(null);
  // Pile d'états « avant décision » pour corriger un mauvais clic (vote/devinette).
  const [history, setHistory] = useState<ImposteurState[]>([]);

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
      try {
        const full = await getQuizPool();
        const universes = new Set(cfg.universes);
        const seen = new Map<string, WordCard>();
        for (const q of full) {
          if (!q.universe || !universes.has(q.universe)) continue;
          if (!isGoodImposteurWord(q.answer)) continue;
          if (!seen.has(q.answer)) seen.set(q.answer, { word: q.answer, universe: q.universe, theme: q.theme });
        }
        if (!alive) return;
        startedAtRef.current = Date.now();
        setGame(createImposteurState({ config: cfg, players, pool: [...seen.values()], seed: randomSeed() }));
      } catch {
        if (alive) setLoadFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = (a: ImposteurAction) => setGame((s) => (s ? imposteurReducer(s, a) : s));

  // Correction d'un mauvais clic : on empile l'état AVANT chaque décision
  // irréversible (vote, devinette) et on le restaure tel quel si besoin.
  const snapshot = () => {
    if (game) setHistory((h) => [...h, game].slice(-50));
  };
  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setShowRole(false);
    if (prev) setGame(prev);
  };
  const canUndo = history.length > 0;

  // Minuteur de discussion (informatif) : redémarre à chaque manche.
  useEffect(() => {
    if (game?.phase !== 'discuss' || cfg.discussionSec <= 0) {
      setDiscussLeft(null);
      return;
    }
    setDiscussLeft(cfg.discussionSec);
    const iv = setInterval(() => setDiscussLeft((n) => (n !== null && n > 0 ? n - 1 : n)), 1000);
    return () => clearInterval(iv);
  }, [game?.phase, game?.round, cfg.discussionSec]);

  useEffect(() => {
    if (game?.phase === 'result') {
      if (game.lastOutcome?.crewWon) haptics.win();
      else haptics.warn();
    }
  }, [game?.phase, game?.round, game?.lastOutcome?.crewWon]);

  useEffect(() => {
    if (game?.phase === 'finished' && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(imposteurToSessionResult(game, startedAtRef.current, Date.now()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, onFinish]);

  const confirmQuit = () =>
    Alert.alert(t('Quitter la partie ?'), t('La partie en cours sera perdue.'), [
      { text: t('Continuer'), style: 'cancel' },
      { text: t('Quitter'), style: 'destructive', onPress: onQuit },
    ]);

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
                {t('Préparation de la partie…')}
              </Txt>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

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
            {t('🕵️ Manche {n}/{total}', { n: game.round, total: game.totalRounds })}
          </Txt>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {game.phase === 'reveal'
          ? renderReveal()
          : game.phase === 'discuss'
            ? renderDiscuss()
            : game.phase === 'vote'
              ? renderVote()
              : game.phase === 'guess'
                ? renderGuess()
                : game.phase === 'result'
                  ? renderResult()
                  : null}
      </ScrollView>
    </SafeAreaView>
  );

  function renderReveal() {
    const id = game!.revealOrder[game!.revealIdx];
    const p = id ? byId[id] : undefined;
    if (!p) return null;
    const isImposter = !!id && game!.imposterIds.includes(id);
    // Mode « mot proche » : l'imposteur ne sait PAS qu'il l'est. On lui montre un
    // mot (proche mais différent) présenté comme le vrai mot ; le décalage
    // n'apparaîtra qu'à la discussion. En mode « sans mot », il sait qu'il est
    // l'imposteur et ne voit aucun mot.
    const closeMode = isImposter && !!game!.imposterWord;
    if (!showRole) {
      return (
        <View style={{ gap: spacing(2), paddingTop: spacing(5), alignItems: 'center' }}>
          <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={72} playerId={p.id} />
          <Txt faint weight="800" size={fontSize.sm}>
            {t('PASSE LE TÉLÉPHONE')}
          </Txt>
          <Txt size={fontSize.xxl} weight="900" center>
            {t('{name}, à toi', { name: p.name })}
          </Txt>
          <Txt dim center>
            {t("Toi seul(e) regardes l'écran, puis tu passes au suivant.")}
          </Txt>
          <View style={{ height: spacing(1) }} />
          <Button title={t('Voir mon rôle')} emoji="🎭" size="lg" variant="accent" onPress={() => setShowRole(true)} style={{ alignSelf: 'stretch' }} />
        </View>
      );
    }
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(3) }}>
        <Txt faint weight="800" size={fontSize.sm} center>
          {t('UNIVERS')}
        </Txt>
        <Txt size={fontSize.xl} weight="900" center color={colors.accent}>
          {game!.universe}
        </Txt>
        {isImposter && !closeMode ? (
          <Card accent={colors.danger}>
            <Txt size={fontSize.xxl} weight="900" center>
              {t("🤫 Tu es l'imposteur")}
            </Txt>
            <Txt dim center style={{ marginTop: spacing(1) }}>
              {t("Tu ne connais pas le mot. Écoute, adapte-toi et donne un indice crédible pour ne pas te faire griller !")}
            </Txt>
          </Card>
        ) : (
          // Équipage — et imposteur en mode « mot proche » : même carte, pour
          // qu'il ne sache pas qu'il est l'imposteur (son mot diffère juste un peu).
          <Card accent={colors.success}>
            <Txt faint size={fontSize.xs} center>
              {t('MOT SECRET')}
            </Txt>
            <Txt size={fontSize.xxl} weight="900" center>
              {closeMode ? game!.imposterWord : game!.word}
            </Txt>
            <Txt dim center style={{ marginTop: spacing(1) }}>
              {t("Donne un indice à voix haute : assez précis pour prouver que tu sais, assez vague pour ne pas aider l'imposteur.")}
            </Txt>
          </Card>
        )}
        <View style={{ height: spacing(1) }} />
        <Button
          title={t("J'ai vu 👍")}
          size="lg"
          onPress={() => {
            haptics.select();
            setShowRole(false);
            dispatch({ type: 'SEEN' });
          }}
        />
      </View>
    );
  }

  function renderDiscuss() {
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(4), alignItems: 'center' }}>
        <Txt size={fontSize.huge}>💬</Txt>
        <Txt faint weight="800" size={fontSize.sm}>
          {t('UNIVERS')}
        </Txt>
        <Txt size={fontSize.xl} weight="900" center color={colors.accent}>
          {game!.universe}
        </Txt>
        <Txt dim center>
          {t('Chacun son tour, donnez un indice sur le mot. Repérez celui qui bluffe…')}
        </Txt>
        {discussLeft !== null && (
          <Txt weight="900" size={fontSize.huge} color={discussLeft <= 10 ? colors.danger : colors.text}>
            {discussLeft === 0 ? t('Temps écoulé !') : `${discussLeft}s`}
          </Txt>
        )}
        <View style={{ height: spacing(1) }} />
        <Button title={t('Passer au vote')} emoji="🗳️" size="lg" variant="accent" onPress={() => dispatch({ type: 'START_VOTE' })} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  function renderVote() {
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(2) }}>
        <Txt size={fontSize.xl} weight="900" center>
          {t("Qui est l'imposteur ?")}
        </Txt>
        <Txt dim center>
          {t('Débattez, puis touchez le joueur désigné par le groupe.')}
        </Txt>
        <View style={styles.voteGrid}>
          {game!.order.map((id) => {
            const p = byId[id];
            if (!p) return null;
            return (
              <Pressable
                key={id}
                style={styles.voteCell}
                onPress={() => {
                  haptics.select();
                  snapshot();
                  dispatch({ type: 'ACCUSE', playerId: id });
                }}
              >
                <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={54} playerId={p.id} />
                <Txt weight="800" numberOfLines={1}>
                  {p.name}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderGuess() {
    const accused = game!.accusedId ? byId[game!.accusedId] : undefined;
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(3), alignItems: 'center' }}>
        <Txt size={fontSize.huge}>🎯</Txt>
        <Txt size={fontSize.xl} weight="900" center>
          {t("{name} était bien l'imposteur !", { name: accused?.name ?? t('Le suspect') })}
        </Txt>
        <Txt dim center>
          {t("Dernière chance : l'imposteur annonce le mot à voix haute. A-t-il trouvé ?")}
        </Txt>
        <Card accent={colors.success} style={{ alignSelf: 'stretch' }}>
          <Txt faint size={fontSize.xs} center>
            {t('LE MOT ÉTAIT')}
          </Txt>
          <Txt size={fontSize.xxl} weight="900" center>
            {game!.word}
          </Txt>
        </Card>
        <View style={styles.judgeRow}>
          <Pressable
            style={[styles.judge, { backgroundColor: colors.success }]}
            onPress={() => {
              snapshot();
              dispatch({ type: 'GUESS', correct: false });
            }}
          >
            <Txt weight="800" size={fontSize.lg} color={colors.white}>
              {t('❌ Non — équipage gagne')}
            </Txt>
          </Pressable>
          <Pressable
            style={[styles.judge, { backgroundColor: colors.danger }]}
            onPress={() => {
              snapshot();
              dispatch({ type: 'GUESS', correct: true });
            }}
          >
            <Txt weight="800" size={fontSize.lg} color={colors.white}>
              {t('✅ Oui — il vole tout')}
            </Txt>
          </Pressable>
        </View>
        {canUndo && <Button title={t('↩︎ Corriger')} variant="ghost" size="sm" onPress={undo} />}
      </View>
    );
  }

  function renderResult() {
    const o = game!.lastOutcome;
    if (!o) return null;
    const imposterNames = o.imposterIds.map((id) => byId[id]?.name ?? '?').join(', ');
    const drinkerNames = o.drinkers.map((id) => byId[id]?.name ?? '?').join(', ');
    const ranked = imposteurRanking(game!);
    const last = game!.round >= game!.totalRounds;
    return (
      <View style={{ gap: spacing(2), paddingTop: spacing(2) }}>
        <View style={{ alignItems: 'center', gap: spacing(1) }}>
          <Txt size={fontSize.huge}>{o.crewWon ? '🎉' : '🕵️'}</Txt>
          <Txt size={fontSize.xl} weight="900" center>
            {o.crewWon ? t("L'équipage gagne !") : t("L'imposteur s'en sort !")}
          </Txt>
        </View>

        <Card accent={o.crewWon ? colors.success : colors.danger}>
          <Txt weight="800">
            {t(o.imposterIds.length > 1 ? 'Imposteurs' : 'Imposteur')} : {imposterNames}
          </Txt>
          <Txt faint size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
            {t('Le mot était « {word} » · {universe}', { word: o.word, universe: o.universe })}
          </Txt>
          {!o.crewWon && o.accusedWasImposter && o.imposterGuessed && (
            <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
              {t('Démasqué mais il a deviné le mot : il rafle la mise.')}
            </Txt>
          )}
        </Card>

        {o.sips > 0 && o.drinkers.length > 0 && (
          <Card accent={colors.sip}>
            <Txt weight="800" color={colors.sip}>
              {t(o.sips > 1 ? '🍺 {names} : {n} gorgées' : '🍺 {names} : {n} gorgée', { names: drinkerNames, n: o.sips })}
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
                {p && <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={28} playerId={p.id} />}
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
          title={last ? t('Voir les résultats') : t('Manche suivante')}
          emoji={last ? '🏁' : '➡️'}
          size="lg"
          onPress={() => dispatch({ type: 'NEXT' })}
        />
        {canUndo && <Button title={t('↩︎ Corriger le vote')} variant="ghost" size="sm" onPress={undo} />}
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
  voteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5), justifyContent: 'center' },
  voteCell: {
    width: 96,
    alignItems: 'center',
    gap: spacing(0.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(0.5),
  },
  judgeRow: { flexDirection: 'row', gap: spacing(1.5), alignSelf: 'stretch' },
  judge: { flex: 1, borderRadius: radius.md, padding: spacing(2), alignItems: 'center', justifyContent: 'center' },
  standRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), paddingVertical: spacing(0.5) },
});
