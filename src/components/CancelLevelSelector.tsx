import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { Chip, Txt } from './ui';
import { CANCEL_LEVELS, CANCEL_META, type CancelLevel } from '../core/models';
import { kvSetJSON } from '../db';
import { CANCEL_KV, getChosenCancelLevels, setActiveCancelLevels } from '../lib/cancelLevel';
import { useT } from '../lib/i18nProvider';
import { useStore } from '../store/StoreProvider';
import { isCancelLevelUnlocked, PRODUCTS } from '../store/products';
import { fontSize, spacing } from '../theme/theme';

const CANCEL_PRICE = PRODUCTS.find((p) => p.id === 'cancellable')?.price ?? '1,99 €';

/**
 * Sélecteur des niveaux de « cancellabilité ». Réglage GLOBAL persisté, partagé
 * par tous les modes, mais réglé dans la config de chaque partie. Chaque niveau
 * s'active/se désactive INDÉPENDAMMENT (ex. ne garder que Chill + Cancellable).
 * Le niveau 1 est gratuit ; les niveaux osés (2/3/4) exigent le pack — verrouillés
 * 🔒 et proposant l'achat au tap. Au moins un niveau reste toujours actif.
 */
export function CancelLevelSelector({ onChange }: { onChange?: (levels: CancelLevel[]) => void }) {
  const t = useT();
  const { ent, purchase } = useStore();
  const [levels, setLevels] = useState<CancelLevel[]>(() =>
    getChosenCancelLevels().filter((l) => isCancelLevelUnlocked(l, ent)),
  );

  const apply = (next: readonly CancelLevel[]) => {
    const clean = next.length > 0 ? [...new Set(next)].sort((a, b) => a - b) : [1 as CancelLevel];
    setLevels(clean);
    setActiveCancelLevels(clean);
    void kvSetJSON(CANCEL_KV, clean);
    onChange?.(clean);
  };

  // Retire les niveaux verrouillés si le pack n'est pas (ou plus) possédé.
  useEffect(() => {
    const allowed = levels.filter((l) => isCancelLevelUnlocked(l, ent));
    if (allowed.length !== levels.length) apply(allowed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ent.cancellable]);

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
              if (ok) apply([...levels, target]);
            })();
          },
        },
      ],
    );
  };

  const toggle = (l: CancelLevel) => {
    if (!isCancelLevelUnlocked(l, ent)) {
      askUnlock(l);
      return;
    }
    if (levels.includes(l)) {
      if (levels.length <= 1) return; // toujours au moins un niveau actif
      apply(levels.filter((x) => x !== l));
    } else {
      apply([...levels, l]);
    }
  };

  return (
    <View style={{ gap: spacing(1) }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) }}>
        {CANCEL_LEVELS.map((l) => {
          const unlocked = isCancelLevelUnlocked(l, ent);
          return (
            <Chip
              key={l}
              label={`${CANCEL_META[l].emoji} ${t(CANCEL_META[l].label)}${unlocked ? '' : ' 🔒'}`}
              selected={levels.includes(l)}
              onPress={() => toggle(l)}
            />
          );
        })}
      </View>
      <Txt faint size={fontSize.xs}>
        {ent.cancellable
          ? t('Active ou désactive chaque niveau indépendamment (au moins un actif).')
          : t('🔒 Niveaux osés réservés au Pack Cancellable ({price}).', { price: CANCEL_PRICE })}
      </Txt>
    </View>
  );
}
