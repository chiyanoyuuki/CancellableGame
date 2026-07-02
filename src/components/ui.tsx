import { type ReactNode, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, radius, spacing } from '../theme/theme';

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

export function Txt(props: {
  children: ReactNode;
  size?: number;
  color?: string;
  weight?: TextStyle['fontWeight'];
  center?: boolean;
  dim?: boolean;
  faint?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}) {
  const color = props.color ?? (props.faint ? colors.textFaint : props.dim ? colors.textDim : colors.text);
  return (
    <Text
      numberOfLines={props.numberOfLines}
      style={[
        { color, fontSize: props.size ?? fontSize.md, fontWeight: props.weight ?? '500' },
        props.center && { textAlign: 'center' },
        props.style,
      ]}
    >
      {props.children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Screen scaffold
// ---------------------------------------------------------------------------

export function Screen(props: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  scroll?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  headerRight?: ReactNode;
}) {
  const body = props.scroll ? (
    <ScrollView
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}
      showsVerticalScrollIndicator={false}
    >
      {props.children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: spacing(2) }}>{props.children}</View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {(props.title || props.onBack) && (
        <View style={styles.header}>
          {props.onBack ? (
            <Pressable onPress={props.onBack} hitSlop={12} style={styles.backBtn}>
              <Text style={styles.backChevron}>‹</Text>
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={{ flex: 1 }}>
            {!!props.title && (
              <Txt size={fontSize.lg} weight="800" numberOfLines={1}>
                {props.title}
              </Txt>
            )}
            {!!props.subtitle && (
              <Txt size={fontSize.xs} dim>
                {props.subtitle}
              </Txt>
            )}
          </View>
          {props.headerRight}
        </View>
      )}
      {body}
      {!!props.footer && <View style={styles.footer}>{props.footer}</View>}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export function Button(props: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  emoji?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const variant = props.variant ?? 'primary';
  const size = props.size ?? 'md';
  const disabled = props.disabled || props.loading;

  const bg: Record<ButtonVariant, string> = {
    primary: colors.primary,
    accent: colors.accent,
    secondary: colors.card,
    ghost: 'transparent',
    danger: colors.danger,
  };
  const pad = size === 'lg' ? spacing(2.25) : size === 'sm' ? spacing(1) : spacing(1.75);
  const txtSize = size === 'lg' ? fontSize.lg : size === 'sm' ? fontSize.sm : fontSize.md;

  return (
    <Pressable
      onPress={props.onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg[variant],
          paddingVertical: pad,
          borderWidth: variant === 'secondary' || variant === 'ghost' ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        props.style,
      ]}
    >
      {props.loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.btnTxt, { fontSize: txtSize, color: variant === 'ghost' ? colors.text : colors.white }]}>
          {props.emoji ? `${props.emoji}  ` : ''}
          {props.title}
        </Text>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export function Card(props: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; accent?: string }) {
  const content = (
    <View
      style={[
        styles.card,
        props.accent ? { borderLeftWidth: 4, borderLeftColor: props.accent } : null,
        props.style,
      ]}
    >
      {props.children}
    </View>
  );
  if (props.onPress) {
    return (
      <Pressable onPress={props.onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        {content}
      </Pressable>
    );
  }
  return content;
}

// ---------------------------------------------------------------------------
// Chip (toggle pill)
// ---------------------------------------------------------------------------

export function Chip(props: { label: string; selected?: boolean; onPress?: () => void; emoji?: string; color?: string }) {
  const selColor = props.color ?? colors.primary;
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.chip,
        {
          backgroundColor: props.selected ? selColor : colors.card,
          borderColor: props.selected ? selColor : colors.border,
        },
      ]}
    >
      <Text style={{ color: props.selected ? colors.white : colors.textDim, fontWeight: '700', fontSize: fontSize.sm }}>
        {props.emoji ? `${props.emoji} ` : ''}
        {props.label}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Segmented control
// ---------------------------------------------------------------------------

export function Segmented<T extends string>(props: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {props.options.map((o) => {
        const active = o.value === props.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => props.onChange(o.value)}
            style={[styles.segment, active && { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: active ? colors.white : colors.textDim, fontWeight: '700', fontSize: fontSize.sm }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

export function Stepper(props: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const step = props.step ?? 1;
  const min = props.min ?? 0;
  const max = props.max ?? 999;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  // Keep the latest value in a ref so the hold-repeat timer isn't stale.
  const valueRef = useRef(props.value);
  valueRef.current = props.value;
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const bump = (dir: number) => props.onChange(clamp(valueRef.current + dir * step));
  const stop = () => {
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdTimeout.current = null;
    holdInterval.current = null;
  };
  const start = (dir: number) => {
    bump(dir); // immediate step on tap
    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => bump(dir), 70); // then auto-repeat while held
    }, 350);
  };

  // Clean up any running timer if the component unmounts mid-hold.
  useEffect(() => stop, []);

  return (
    <View style={styles.stepper}>
      <Pressable onPressIn={() => start(-1)} onPressOut={stop} style={styles.stepBtn}>
        <Text style={styles.stepSign}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{props.value}</Text>
      <Pressable onPressIn={() => start(1)} onPressOut={stop} style={styles.stepBtn}>
        <Text style={styles.stepSign}>+</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

export function SectionHeader(props: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Txt size={fontSize.sm} weight="800" color={colors.textFaint}>
        {props.title.toUpperCase()}
      </Txt>
      {props.right}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

export function ProgressBar(props: { value: number; total: number; color?: string }) {
  const pct = props.total > 0 ? Math.max(0, Math.min(1, props.value / props.total)) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: props.color ?? colors.primary }]} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Player avatar
// ---------------------------------------------------------------------------

export function PlayerAvatar(props: { emoji: string; color: string; size?: number; selected?: boolean }) {
  const size = props.size ?? 44;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: props.color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: props.selected ? 3 : 0,
        borderColor: colors.white,
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>{props.emoji}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

export function EmptyState(props: { emoji: string; title: string; subtitle?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing(5), gap: spacing(1) }}>
      <Text style={{ fontSize: 52 }}>{props.emoji}</Text>
      <Txt size={fontSize.lg} weight="800" center>
        {props.title}
      </Txt>
      {!!props.subtitle && (
        <Txt dim center>
          {props.subtitle}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(1.25),
    gap: spacing(1),
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backChevron: { color: colors.text, fontSize: 34, lineHeight: 36, marginTop: -4 },
  footer: { padding: spacing(2), borderTopWidth: 1, borderTopColor: colors.border, gap: spacing(1) },
  btn: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(2) },
  btnTxt: { fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing(2) },
  chip: { paddingHorizontal: spacing(1.75), paddingVertical: spacing(1), borderRadius: radius.pill, borderWidth: 1 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, paddingVertical: spacing(1.25), borderRadius: radius.sm, alignItems: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSign: { color: colors.white, fontSize: 26, fontWeight: '800' },
  stepValue: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', minWidth: 48, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1),
    marginTop: spacing(1),
  },
  progressTrack: { height: 10, borderRadius: radius.pill, backgroundColor: colors.card, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill },
});
