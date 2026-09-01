import { View } from 'react-native';

import { Button, Chip, Txt } from './ui';
import { type Theme, THEME_META, THEMES } from '../core/models';
import { useT } from '../lib/i18nProvider';
import { fontSize, spacing } from '../theme/theme';

/**
 * Sélecteur de thèmes réutilisable : chips multi-sélection + boutons « Tout /
 * Aucun » pour la sélection en masse. Une liste vide = tous les thèmes (aucune
 * restriction), ce que l'appelant interprète comme « pas de filtre ».
 */
export function ThemePicker(props: { selected: string[]; onChange: (themes: string[]) => void }) {
  const t = useT();
  const set = new Set(props.selected);
  const toggle = (th: Theme) => {
    const next = new Set(set);
    if (next.has(th)) next.delete(th);
    else next.add(th);
    props.onChange([...next]);
  };
  return (
    <View style={{ gap: spacing(1) }}>
      <View style={{ flexDirection: 'row', gap: spacing(1) }}>
        <Button size="sm" variant="ghost" title={t('Tout')} onPress={() => props.onChange([...THEMES])} />
        <Button size="sm" variant="ghost" title={t('Aucun')} onPress={() => props.onChange([])} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) }}>
        {THEMES.map((th) => (
          <Chip
            key={th}
            label={`${THEME_META[th].emoji} ${t(THEME_META[th].label)}`}
            selected={set.has(th)}
            onPress={() => toggle(th)}
          />
        ))}
      </View>
      {props.selected.length === 0 && (
        <Txt faint size={fontSize.xs}>{t('Aucun thème choisi → tous les thèmes seront utilisés.')}</Txt>
      )}
    </View>
  );
}
