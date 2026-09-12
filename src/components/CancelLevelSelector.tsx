import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { Segmented, Txt } from './ui';
import { CANCEL_LEVELS, CANCEL_META, type CancelLevel } from '../core/models';
import { kvSetJSON } from '../db';
import { CANCEL_KV, getChosenCancelLevel, setCancelLevel } from '../lib/cancelLevel';
import { useT } from '../lib/i18nProvider';
import { useStore } from '../store/StoreProvider';
import { FREE_CANCEL_LEVEL, isCancelLevelUnlocked, PRODUCTS } from '../store/products';
import { colors, fontSize, spacing } from '../theme/theme';

/** Couleur d'accent par niveau (du plus soft au plus trash). */
const LEVEL_COLOR: Record<CancelLevel, string> = {
  1: colors.success,
  2: colors.sip,
  3: colors.accent,
  4: colors.danger,
};

const MAX_LEVEL = CANCEL_LEVELS[CANCEL_LEVELS.length - 1] as CancelLevel;
const CANCEL_PRICE = PRODUCTS.find((p) => p.id === 'cancellable')?.price ?? '1,99 €';

/**
 * Sélecteur du niveau de « cancellabilité ». Réglage GLOBAL persisté (kv),
 * partagé par tous les modes. Le niveau 1 est gratuit ; les niveaux osés (2/3/4)
 * exigent le pack « Cancellable » : ils s'affichent verrouillés 🔒 et proposent
 * l'achat au tap. Le module `cancelLevel` borne de toute façon le contenu tant
 * que le pack n'est pas possédé.
 */
export function CancelLevelSelector({ onChange }: { onChange?: (l: CancelLevel) => void }) {
  const t = useT();
  const { ent, purchase } = useStore();
  const maxAllowed: CancelLevel = ent.cancellable ? MAX_LEVEL : (FREE_CANCEL_LEVEL as CancelLevel);
  const [level, setLevel] = useState<CancelLevel>(() =>
    Math.min(getChosenCancelLevel(), maxAllowed) as CancelLevel,
  );

  const apply = (l: CancelLevel) => {
    setLevel(l);
    setCancelLevel(l);
    void kvSetJSON(CANCEL_KV, l);
    onChange?.(l);
  };

  // Si un niveau osé était mémorisé mais que le pack n'est pas (ou plus) possédé,
  // on borne au gratuit.
  useEffect(() => {
    if (getChosenCancelLevel() > maxAllowed) apply(maxAllowed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxAllowed]);

  const askUnlock = (target: CancelLevel) => {
    Alert.alert(
      t('Pack Cancellable 🌶️'),
      t('Débloque les niveaux osés (Épicé, +18 et Cancellable) dans tous les modes pour {price}.', { price: CANCEL_PRICE }),
      [
        { text: t('Plus tard'), style: 'cancel' },
        {
          text: t('Débloquer'),
          onPress: () => {
            void (async () => {
              const ok = await purchase('cancellable');
              if (ok) apply(target);
            })();
          },
        },
      ],
    );
  };

  const change = (v: string) => {
    const l = Number(v) as CancelLevel;
    if (isCancelLevelUnlocked(l, ent)) apply(l);
    else askUnlock(l);
  };

  const meta = CANCEL_META[level];
  return (
    <View style={{ gap: spacing(1) }}>
      <Segmented<string>
        value={String(level)}
        onChange={change}
        options={CANCEL_LEVELS.map((l) => ({
          label: `${CANCEL_META[l].emoji} ${t(CANCEL_META[l].label)}${isCancelLevelUnlocked(l, ent) ? '' : ' 🔒'}`,
          value: String(l),
        }))}
      />
      <Txt faint size={fontSize.xs} color={LEVEL_COLOR[level]} weight="700">
        {meta.emoji} {t(meta.desc)}
      </Txt>
      {!ent.cancellable && (
        <Txt faint size={fontSize.xs}>
          {t('🔒 Niveaux osés réservés au Pack Cancellable ({price}).', { price: CANCEL_PRICE })}
        </Txt>
      )}
    </View>
  );
}
