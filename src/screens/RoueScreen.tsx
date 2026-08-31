import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Segmented, Txt } from '../components/ui';
import { type DareCategory, daresFor, nextDare } from '../core/dares';
import { haptics } from '../lib/haptics';
import { isNoAlcohol } from '../lib/drinkMode';
import { sounds } from '../lib/sounds';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

/** Roue des gages : un outil autonome qui tire un défi au hasard (soft ou alcool). */
export function RoueScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Roue'>) {
  const t = useT();
  const [category, setCategory] = useState<DareCategory>(isNoAlcohol() ? 'soft' : 'alcool');
  const [dare, setDare] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dareRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Change de catégorie : on repart d'une roue vierge.
  const changeCategory = (c: DareCategory) => {
    if (spinning) return;
    setCategory(c);
    setDare(null);
    dareRef.current = null;
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const pool = daresFor(category);
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Défilement « machine à sous » : on affiche des gages de plus en plus lentement.
    let step = 0;
    const totalSteps = 16;
    const tick = () => {
      const d = nextDare(pool, dareRef.current, Math.random);
      dareRef.current = d;
      setDare(d);
      step += 1;
      if (step < totalSteps) {
        haptics.tick();
        sounds.tick();
        // délai croissant : 40ms → ~260ms
        const delay = 40 + Math.round((step / totalSteps) ** 2 * 260);
        timerRef.current = setTimeout(tick, delay);
      } else {
        setSpinning(false);
        haptics.win();
        sounds.reveal();
      }
    };
    tick();
  };

  const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '900deg'] });

  return (
    <Screen
      title={t('Roue des gages')}
      onBack={() => navigation.goBack()}
      scroll
      footer={
        <Button
          title={dare ? t('Tourner encore') : t('Tourner la roue')}
          emoji="🎡"
          size="lg"
          variant="accent"
          onPress={spin}
          disabled={spinning}
        />
      }
    >
      <Card>
        <Txt weight="800">{t('🎡 Roue des gages')}</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t('Un gage au hasard, quand vous voulez — pas besoin de lancer une partie.')}
        </Txt>
      </Card>

      <View style={{ marginTop: spacing(1.5) }}>
        <Segmented<DareCategory>
          value={category}
          onChange={changeCategory}
          options={[
            { label: t('Sans alcool'), value: 'soft' },
            { label: t('Alcool'), value: 'alcool' },
          ]}
        />
      </View>

      <View style={styles.stage}>
        <Animated.Text style={[styles.wheel, { transform: [{ rotate }] }]}>🎡</Animated.Text>
        <Card accent={dare && !spinning ? colors.accent : undefined} style={styles.dareCard}>
          <Txt center size={fontSize.lg} weight="800">
            {dare ?? t('Appuie sur « Tourner la roue » 👇')}
          </Txt>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', marginTop: spacing(3), gap: spacing(2) },
  wheel: { fontSize: 96 },
  dareCard: { alignSelf: 'stretch', minHeight: 120, justifyContent: 'center', borderRadius: radius.lg },
});
