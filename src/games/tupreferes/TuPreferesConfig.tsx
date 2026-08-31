import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, HowToPlay, Segmented, SectionHeader, Txt } from '../../components/ui';
import type { DrinkIntensity } from '../../core/models';
import type { DrinkingSide, TuPreferesConfig } from '../../core/tupreferesEngine';
import { useT } from '../../lib/i18nProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';

const ROUND_OPTIONS = [5, 8, 12];

export function TuPreferesConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const t = useT();
  const [rounds, setRounds] = useState(8);
  const [drinkingSide, setDrinkingSide] = useState<DrinkingSide>('minority');
  const [drinksEnabled, setDrinksEnabled] = useState(true);
  const [drinkIntensity, setDrinkIntensity] = useState<DrinkIntensity>('normal');

  const valid = players.length >= 2;

  const launch = () =>
    onStart({ rounds, drinkingSide, drinksEnabled, drinkIntensity } satisfies TuPreferesConfig);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">{t('🤔 Tu préfères ?')}</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t('Un dilemme, deux options. Chacun vote en secret, on révèle le partage — et un camp trinque.')}
        </Txt>
      </Card>

      <HowToPlay
        lines={[
          t('On se passe le téléphone : chacun vote A ou B en secret, puis passe au suivant.'),
          t('Une fois tout le monde a voté, on révèle le partage des voix.'),
          t('Par défaut, la minorité (les originaux !) boit, et la majorité marque un point.'),
          t('Égalité parfaite ? Tout le monde trinque 🥂.'),
        ]}
      />

      <SectionHeader title={t('Manches')} />
      <Segmented<string>
        value={String(rounds)}
        onChange={(v) => setRounds(Number(v))}
        options={ROUND_OPTIONS.map((r) => ({ label: `${r}`, value: String(r) }))}
      />

      <SectionHeader title={t('Qui boit ?')} />
      <Segmented<DrinkingSide>
        value={drinkingSide}
        onChange={setDrinkingSide}
        options={[
          { label: t('La minorité'), value: 'minority' },
          { label: t('La majorité'), value: 'majority' },
        ]}
      />
      <Txt faint size={fontSize.xs}>
        {drinkingSide === 'minority'
          ? t('Le petit camp assume ses goûts… et boit 😏.')
          : t('Le grand camp boit : les moutons trinquent !')}
      </Txt>

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
      <Button title={t('Lancer Tu préfères')} emoji="🤔" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          {t('Il faut au moins 2 joueurs.')}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing(0.5) },
});
