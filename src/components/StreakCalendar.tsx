import { useMemo } from 'react';
import { View } from 'react-native';

import { Txt } from './ui';
import { recentDayKeys } from '../core/dailyChallenge';
import { useT } from '../lib/i18nProvider';
import { colors, fontSize, spacing } from '../theme/theme';

const DAYS = 35; // 5 semaines
const COLS = 7;

/** Petit calendrier « heatmap » des jours où le défi du jour a été complété. */
export function StreakCalendar({ dates }: { dates: readonly string[] }) {
  const t = useT();
  const done = useMemo(() => new Set(dates), [dates]);
  const keys = useMemo(() => recentDayKeys(DAYS), []);
  const rows = useMemo(() => {
    const out: string[][] = [];
    for (let i = 0; i < keys.length; i += COLS) out.push(keys.slice(i, i + COLS));
    return out;
  }, [keys]);
  const playedCount = keys.filter((k) => done.has(k)).length;

  return (
    <View>
      <View style={{ gap: spacing(0.5) }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: spacing(0.5) }}>
            {row.map((k) => (
              <View
                key={k}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 4,
                  backgroundColor: done.has(k) ? colors.success : colors.cardAlt,
                }}
              />
            ))}
            {/* Complète la dernière ligne pour garder l'alignement. */}
            {row.length < COLS &&
              Array.from({ length: COLS - row.length }).map((_, i) => <View key={`pad-${i}`} style={{ flex: 1 }} />)}
          </View>
        ))}
      </View>
      <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(1) }}>
        {t('{n} jours joués sur les 5 dernières semaines', { n: playedCount })}
      </Txt>
    </View>
  );
}
