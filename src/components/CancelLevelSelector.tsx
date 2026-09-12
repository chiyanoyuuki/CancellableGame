import { useState } from 'react';
import { View } from 'react-native';

import { Segmented, Txt } from './ui';
import { CANCEL_LEVELS, CANCEL_META, type CancelLevel } from '../core/models';
import { kvSetJSON } from '../db';
import { CANCEL_KV, getCancelLevel, setCancelLevel } from '../lib/cancelLevel';
import { useT } from '../lib/i18nProvider';
import { colors, fontSize, spacing } from '../theme/theme';

/** Couleur d'accent par niveau (du plus soft au plus trash). */
const LEVEL_COLOR: Record<CancelLevel, string> = {
  1: colors.success,
  2: colors.sip,
  3: colors.accent,
  4: colors.danger,
};

/**
 * Sélecteur du niveau de « cancellabilité ». Réglage GLOBAL : le choix est
 * persisté (kv) et appliqué immédiatement au module `cancelLevel`, donc partagé
 * par tous les modes. On peut le montrer dans les Réglages comme dans la config
 * d'un mode — c'est le même réglage partout.
 */
export function CancelLevelSelector({ onChange }: { onChange?: (l: CancelLevel) => void }) {
  const t = useT();
  const [level, setLevel] = useState<CancelLevel>(getCancelLevel());
  const change = (v: string) => {
    const l = Number(v) as CancelLevel;
    setLevel(l);
    setCancelLevel(l);
    void kvSetJSON(CANCEL_KV, l);
    onChange?.(l);
  };
  const meta = CANCEL_META[level];
  return (
    <View style={{ gap: spacing(1) }}>
      <Segmented<string>
        value={String(level)}
        onChange={change}
        options={CANCEL_LEVELS.map((l) => ({ label: `${CANCEL_META[l].emoji} ${t(CANCEL_META[l].label)}`, value: String(l) }))}
      />
      <Txt faint size={fontSize.xs} color={LEVEL_COLOR[level]} weight="700">
        {meta.emoji} {t(meta.desc)}
      </Txt>
    </View>
  );
}
