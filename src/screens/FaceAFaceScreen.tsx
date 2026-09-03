import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, EmptyState, PlayerAvatar, Screen, SectionHeader, Txt } from '../components/ui';
import { ThemeRadar, type RadarAxis } from '../components/ThemeRadar';
import { type Player, type Theme, THEME_META } from '../core/models';
import { answerSpeed, headToHead, type StatAnswer, type StatResult, themeAccuracy } from '../core/stats';
import { listPlayers, loadStatAnswers, loadStatResults } from '../db';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, spacing } from '../theme/theme';

export function FaceAFaceScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'FaceAFace'>) {
  const t = useT();
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<StatResult[]>([]);
  const [answers, setAnswers] = useState<StatAnswer[]>([]);
  const [aId, setAId] = useState<string | null>(null);
  const [bId, setBId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      // Joueurs d'abord (donnée critique de l'écran), stats ensuite : un échec de
      // lecture des stats ne doit pas cacher les joueurs.
      try {
        const pl = await listPlayers(true);
        setPlayers(pl);
        if (pl[0]) setAId(pl[0].id);
        if (pl[1]) setBId(pl[1].id);
      } catch {
        // roster indisponible : on garde l'état précédent
      }
      try {
        const [r, a] = await Promise.all([loadStatResults(), loadStatAnswers()]);
        setResults(r);
        setAnswers(a);
      } catch {
        // stats indisponibles : les comparaisons resteront vides
      }
    })();
  }, []);

  const a = players.find((p) => p.id === aId) ?? null;
  const b = players.find((p) => p.id === bId) ?? null;

  const h2h = useMemo(
    () => (a && b && a.id !== b.id ? headToHead(results, a.id, b.id) : null),
    [results, a, b],
  );
  const speedA = useMemo(() => (a ? answerSpeed(answers, a.id) : null), [answers, a]);
  const speedB = useMemo(() => (b ? answerSpeed(answers, b.id) : null), [answers, b]);

  const axes = useMemo<RadarAxis[]>(() => {
    if (!a || !b) return [];
    const mapA = new Map(themeAccuracy(answers, a.id).map((x) => [x.theme, x] as const));
    const mapB = new Map(themeAccuracy(answers, b.id).map((x) => [x.theme, x] as const));
    const themes = [...new Set([...mapA.keys(), ...mapB.keys()])];
    themes.sort(
      (t1, t2) =>
        (mapA.get(t2)?.total ?? 0) + (mapB.get(t2)?.total ?? 0) - ((mapA.get(t1)?.total ?? 0) + (mapB.get(t1)?.total ?? 0)),
    );
    return themes.slice(0, 7).map((th) => ({
      label: THEME_META[th as Theme]?.emoji ?? th.slice(0, 3),
      a: mapA.get(th)?.accuracy ?? 0,
      b: mapB.get(th)?.accuracy ?? 0,
    }));
  }, [answers, a, b]);

  if (players.length < 2) {
    return (
      <Screen title={t('Face-à-face')} onBack={() => navigation.goBack()}>
        <EmptyState
          emoji="🤝"
          title={t('Pas assez de joueurs')}
          subtitle={t('Ajoute au moins deux joueurs et jouez quelques parties pour comparer vos bilans.')}
        />
      </Screen>
    );
  }

  const picker = (selectedId: string | null, onPick: (id: string) => void, otherId: string | null) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing(1), paddingVertical: spacing(0.5) }}>
      {players.map((p) => {
        const selected = p.id === selectedId;
        const dim = p.id === otherId;
        return (
          <Pressable
            key={p.id}
            onPress={() => onPick(p.id)}
            style={[styles.pick, selected && { borderColor: colors.primary, backgroundColor: colors.card }, dim && { opacity: 0.35 }]}
          >
            <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={40} playerId={p.id} />
            <Txt size={fontSize.xs} weight="700" numberOfLines={1} style={{ maxWidth: 64 }}>
              {p.name}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <Screen title={t('Face-à-face')} onBack={() => navigation.goBack()} scroll>
      <SectionHeader title={t('Joueur A')} />
      {picker(aId, setAId, bId)}
      <SectionHeader title={t('Joueur B')} />
      {picker(bId, setBId, aId)}

      {a && b && a.id !== b.id ? (
        <>
          {/* Bilan des victoires */}
          <View style={{ marginTop: spacing(2) }}>
            <Card>
              <View style={styles.h2hRow}>
                <View style={styles.h2hSide}>
                  <PlayerAvatar emoji={a.emoji} color={a.color} photoUri={a.photoUri} size={44} playerId={a.id} />
                  <Txt weight="800" numberOfLines={1}>{a.name}</Txt>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Txt weight="900" size={fontSize.xxl}>
                    {h2h ? `${h2h.aWins} – ${h2h.bWins}` : '0 – 0'}
                  </Txt>
                  <Txt faint size={fontSize.xs}>
                    {h2h && h2h.meetings > 0
                      ? t('{n} duels · {t} nuls', { n: h2h.meetings, t: h2h.ties })
                      : t('Jamais affrontés')}
                  </Txt>
                </View>
                <View style={styles.h2hSide}>
                  <PlayerAvatar emoji={b.emoji} color={b.color} photoUri={b.photoUri} size={44} playerId={b.id} />
                  <Txt weight="800" numberOfLines={1}>{b.name}</Txt>
                </View>
              </View>
              {h2h && h2h.meetings > 0 && (
                <Txt center dim size={fontSize.sm} style={{ marginTop: spacing(1) }}>
                  {h2h.aWins > h2h.bWins
                    ? t('{name} mène 🔥', { name: a.name })
                    : h2h.bWins > h2h.aWins
                      ? t('{name} mène 🔥', { name: b.name })
                      : t('Tout est serré !')}
                </Txt>
              )}
            </Card>
          </View>

          {/* Vitesse de réponse */}
          <SectionHeader title={t('Vitesse ⚡')} />
          <Card>
            <View style={styles.speedRow}>
              <SpeedCell name={a.name} speed={speedA} t={t} />
              <SpeedCell name={b.name} speed={speedB} t={t} />
            </View>
          </Card>

          {/* Radar par thème */}
          <SectionHeader title={t('Forces par thème')} />
          <Card>
            {axes.length >= 3 ? (
              <>
                <ThemeRadar axes={axes} colorA={a.color} colorB={b.color} />
                <View style={styles.legend}>
                  <Legend color={a.color} name={a.name} />
                  <Legend color={b.color} name={b.name} />
                </View>
              </>
            ) : (
              <Txt dim center size={fontSize.sm}>
                {t('Jouez au quiz dans plus de thèmes pour comparer vos forces.')}
              </Txt>
            )}
          </Card>
        </>
      ) : (
        <Txt dim center style={{ marginTop: spacing(3) }}>
          {t('Choisis deux joueurs différents.')}
        </Txt>
      )}
    </Screen>
  );
}

function SpeedCell({ name, speed, t }: { name: string; speed: { avgMs: number; bestMs: number; count: number } | null; t: (s: string, p?: Record<string, string | number>) => string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Txt weight="800" numberOfLines={1}>{name}</Txt>
      {speed && speed.count > 0 ? (
        <>
          <Txt weight="900" size={fontSize.xl} color={colors.primary}>
            {(speed.avgMs / 1000).toFixed(1)}s
          </Txt>
          <Txt faint size={fontSize.xs}>{t('moy · record {n}s', { n: (speed.bestMs / 1000).toFixed(1) })}</Txt>
        </>
      ) : (
        <Txt faint size={fontSize.sm} style={{ marginTop: spacing(1) }}>{t('—')}</Txt>
      )}
    </View>
  );
}

function Legend({ color, name }: { color: string; name: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(0.5) }}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color }} />
      <Txt size={fontSize.xs} weight="700" numberOfLines={1}>{name}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  pick: { alignItems: 'center', gap: spacing(0.5), padding: spacing(1), borderRadius: 14, borderWidth: 2, borderColor: colors.border },
  h2hRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h2hSide: { alignItems: 'center', gap: spacing(0.5), width: 90 },
  speedRow: { flexDirection: 'row', gap: spacing(1) },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing(2), marginTop: spacing(1) },
});
