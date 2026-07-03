import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors } from '../theme/theme';

/**
 * Launch animation : des barreaux de prison tombent et se referment, puis le
 * titre « Cancellable » et le crédit « par Arma Cos » apparaissent, avant de
 * laisser place à l'application. Purement cosmétique ; appelle `onFinish`.
 */
const BAR_COUNT = 6;
const { height: SCREEN_H } = Dimensions.get('window');

export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const drops = useRef([...Array(BAR_COUNT)].map(() => new Animated.Value(0))).current;
  const titleOp = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  const credOp = useRef(new Animated.Value(0)).current;
  const dim = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bars = drops.map((d, i) =>
      Animated.spring(d, { toValue: 1, useNativeDriver: true, delay: i * 80, friction: 5.5, tension: 90 }),
    );
    // "clang" haptic when the bars slam shut
    const slam = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    }, BAR_COUNT * 80 + 260);

    Animated.parallel([
      Animated.stagger(0, bars),
      Animated.sequence([
        Animated.delay(720),
        Animated.parallel([
          Animated.timing(dim, { toValue: 1, duration: 420, useNativeDriver: true }),
          Animated.timing(titleOp, { toValue: 1, duration: 420, useNativeDriver: true }),
          Animated.timing(titleY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.timing(credOp, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.delay(780),
        Animated.timing(fade, { toValue: 0, duration: 460, useNativeDriver: true }),
      ]),
    ]).start(() => onFinish());

    return () => clearTimeout(slam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: fade }]} pointerEvents="none">
      <View style={styles.bars}>
        {drops.map((d, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                transform: [
                  { translateY: d.interpolate({ inputRange: [0, 1], outputRange: [-SCREEN_H, 0] }) },
                ],
              },
            ]}
          >
            <View style={styles.barHighlight} />
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, styles.dim, { opacity: dim }]} />

      <View style={styles.center} pointerEvents="none">
        <Animated.Text style={[styles.title, { opacity: titleOp, transform: [{ translateY: titleY }] }]}>
          CANCELLABLE
        </Animated.Text>
        <Animated.Text style={[styles.credit, { opacity: credOp }]}>par Arma Cos</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, zIndex: 100, alignItems: 'center', justifyContent: 'center' },
  bars: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    paddingHorizontal: 18,
  },
  bar: {
    width: 16,
    borderRadius: 999,
    backgroundColor: '#c9c2ef',
    marginVertical: -40,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 3, height: 0 },
    elevation: 6,
    overflow: 'hidden',
  },
  barHighlight: {
    position: 'absolute',
    left: 3,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dim: { backgroundColor: 'rgba(8,6,18,0.62)' },
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(124,92,255,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  credit: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 10,
  },
});
