import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, HowToPlay, Segmented, SectionHeader, Txt } from '../../components/ui';
import type { DrinkIntensity } from '../../core/models';
import type { QuiDeNousConfig } from '../../core/quidenousEngine';
import { isNoAlcohol } from '../../lib/drinkMode';
import { useT } from '../../lib/i18nProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';

const ROUND_OPTIONS = [5, 8, 12];

export function QuiDeNousConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const t = useT();
  const [rounds, setRounds] = useState(8);
  const [drinksEnabled, setDrinksEnabled] = useState(!isNoAlcohol());
  const [drinkIntensity, setDrinkIntensity] = useState<DrinkIntensity>('normal');

  const valid = players.length >= 3;

  const launch = () => onStart({ rounds, drinksEnabled, drinkIntensity } satisfies QuiDeNousConfig);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">{t('🙋 Qui est le plus susceptible… ?')}</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t('Une affirmation, tout le monde désigne un joueur en secret. Le plus pointé du doigt trinque.')}
        </Txt>
      </Card>

      <HowToPlay
        lines={[
          t('On se passe le téléphone : chacun désigne en secret le joueur qui colle le mieux, puis passe au suivant.'),
          t('Une fois tout le monde a voté, on révèle le décompte des doigts pointés.'),
          t('Le plus désigné boit autant de gorgées que de votes reçus — et devient la vedette de la manche.'),
          t('Classement final : la plus grosse vedette de la soirée 🌟.'),
        ]}
      />

      <SectionHeader title={t('Manches')} />
      <Segmented<string>
        value={String(rounds)}
        onChange={(v) => setRounds(Number(v))}
        options={ROUND_OPTIONS.map((r) => ({ label: `${r}`, value: String(r) }))}
      />

      <SectionHeader title={t('Mode alcool')} />
      <View style={styles.rowBetween}>
        <Txt weight="700">{t('🍺 Gorgées')}</Txt>
        <Switch value={drinksEnabled} onValueChange={setDrinksEnabled} trackColor={{ true: colors.sip, false: colors.border }} thumbColor={colors.white} />
      </View>
      {drinksEnabled && (
        <Segmented<DrinkIntensity>
          value={drinkIntensity}
          onChange={setDrinkIntensity}
          options={[
            { label: 'Soft', value: 'soft' },
            { label: 'Normal', value: 'normal' },
            { label: 'Hardcore', value: 'hardcore' },
          ]}
        />
      )}

      <View style={{ height: spacing(1) }} />
      <Button title={t('Lancer Qui est le plus susceptible')} emoji="🙋" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          {t('Il faut au moins 3 joueurs.')}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing(0.5) },
});
