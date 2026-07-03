import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Image, Share, StyleSheet, View } from 'react-native';

import { Button, Card, Chip, Screen, SectionHeader, Txt } from '../components/ui';
import type { Question } from '../core/models';
import { QUESTIONS } from '../games/quiz/questions';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

type Status = 'loading' | 'ok' | 'error';

/**
 * Écran de diagnostic : charge toutes les questions à image et signale d'un
 * coup d'œil celles dont l'image ne se charge pas (URL cassée, hors-ligne…).
 *
 * Astuce : une image peut se charger tout en montrant la mauvaise personne —
 * les vignettes permettent aussi de vérifier le contenu, pas seulement le
 * succès du chargement.
 */
export function ImageCheckScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ImageCheck'>) {
  const imageQuestions = useMemo(
    () => QUESTIONS.filter((q): q is Question & { media: { type: 'image'; uri: string } } =>
      q.media?.type === 'image' && typeof q.media.uri === 'string',
    ),
    [],
  );

  const [status, setStatus] = useState<Record<string, Status>>({});
  const [onlyBroken, setOnlyBroken] = useState(false);

  const set = (id: string, s: Status) => setStatus((prev) => (prev[id] === s ? prev : { ...prev, [id]: s }));

  const okCount = Object.values(status).filter((s) => s === 'ok').length;
  const errCount = Object.values(status).filter((s) => s === 'error').length;
  const loadingCount = imageQuestions.length - okCount - errCount;

  const broken = imageQuestions.filter((q) => status[q.id] === 'error');

  const shareBroken = () => {
    if (broken.length === 0) return;
    const body = broken.map((q) => `${q.id} — ${q.answer}\n${q.media.uri}`).join('\n\n');
    Share.share({ message: `Images cassées (${broken.length}) :\n\n${body}` });
  };

  const shown = onlyBroken ? broken : imageQuestions;

  return (
    <Screen
      title="Vérifier les images"
      subtitle={`${imageQuestions.length} questions à image`}
      onBack={() => navigation.goBack()}
      scroll
    >
      <Card>
        <View style={styles.countsRow}>
          <Count emoji="✅" label="Chargées" value={okCount} color={colors.success} />
          <Count emoji="❌" label="Cassées" value={errCount} color={colors.danger} />
          <Count emoji="⏳" label="En cours" value={loadingCount} color={colors.textDim} />
        </View>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(1) }}>
          Laisse l'écran ouvert quelques secondes le temps que tout se charge. Une connexion est requise.
        </Txt>
        <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1.5), flexWrap: 'wrap' }}>
          <Chip label="Tout" selected={!onlyBroken} onPress={() => setOnlyBroken(false)} />
          <Chip label={`Cassées (${errCount})`} selected={onlyBroken} onPress={() => setOnlyBroken(true)} color={colors.danger} />
        </View>
        {errCount > 0 && (
          <Button
            title="Partager la liste des cassées"
            emoji="📤"
            variant="secondary"
            size="sm"
            style={{ marginTop: spacing(1.5) }}
            onPress={shareBroken}
          />
        )}
      </Card>

      <SectionHeader title={onlyBroken ? 'Images cassées' : 'Toutes les images'} />
      {shown.length === 0 ? (
        <Card>
          <Txt dim center>
            {onlyBroken ? 'Aucune image cassée détectée 🎉' : 'Aucune question à image.'}
          </Txt>
        </Card>
      ) : (
        <View style={{ gap: spacing(1) }}>
          {shown.map((q) => {
            const s = status[q.id] ?? 'loading';
            return (
              <View key={q.id} style={styles.row}>
                <View style={styles.thumbWrap}>
                  <Image
                    source={{ uri: q.media.uri }}
                    style={styles.thumb}
                    resizeMode="cover"
                    onLoad={() => set(q.id, 'ok')}
                    onError={() => set(q.id, 'error')}
                  />
                  <View style={[styles.dot, { backgroundColor: s === 'ok' ? colors.success : s === 'error' ? colors.danger : colors.textFaint }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt weight="700" numberOfLines={1}>
                    {q.answer}
                  </Txt>
                  <Txt faint size={fontSize.xs} numberOfLines={1}>
                    {q.id} · {s === 'ok' ? 'OK' : s === 'error' ? 'ne charge pas' : 'chargement…'}
                  </Txt>
                  <Txt faint size={fontSize.xs} numberOfLines={1}>
                    {q.media.uri.replace('https://', '')}
                  </Txt>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function Count(props: { emoji: string; label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Txt size={fontSize.xl} weight="800" color={props.color}>
        {props.value}
      </Txt>
      <Txt faint size={fontSize.xs}>
        {props.emoji} {props.label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  countsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(1),
  },
  thumbWrap: { width: 56, height: 56 },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.cardAlt },
  dot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.bg,
  },
});
