import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, HowToPlay, Segmented, SectionHeader, Txt } from '../../components/ui';
import { ThemePicker } from '../../components/ThemePicker';
import type { CultureConfig } from '../../core/cultureEngine';
import type { DrinkIntensity } from '../../core/models';
import { isNoAlcohol } from '../../lib/drinkMode';
import { useT } from '../../lib/i18nProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';

const PER_PLAYER_OPTIONS = [2, 3, 4];

export function CultureConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const t = useT();
  const [questionsPerPlayer, setQuestionsPerPlayer] = useState(3);
  const [drinksEnabled, setDrinksEnabled] = useState(!isNoAlcohol());
  const [drinkIntensity, setDrinkIntensity] = useState<DrinkIntensity>('normal');
  const [themes, setThemes] = useState<string[]>([]);

  const valid = players.length >= 2;

  const launch = () =>
    onStart({
      questionsPerPlayer,
      drinksEnabled,
      drinkIntensity,
      dareCategory: 'soft',
      themes,
    } satisfies CultureConfig);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">{t('🎲 Culture ou gage')}</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t('Une question éclair à ton tour. Tu sais ? +1 point. Tu sèches ? Tu piges un gage.')}
        </Txt>
      </Card>

      <HowToPlay
        lines={[
          t('Le téléphone tourne : à ton tour, tu as une question à choix multiple.'),
          t('Bonne réponse : +1 point, tu passes tranquille.'),
          t('Mauvaise réponse : tu piges un gage à faire (et des gorgées si le mode alcool est activé).'),
          t('Chacun a le même nombre de questions ; le plus cultivé gagne 🧠.'),
        ]}
      />

      <SectionHeader title={t('Questions par joueur')} />
      <Segmented<string>
        value={String(questionsPerPlayer)}
        onChange={(v) => setQuestionsPerPlayer(Number(v))}
        options={PER_PLAYER_OPTIONS.map((n) => ({ label: `${n}`, value: String(n) }))}
      />

      <SectionHeader title={t('Thèmes des questions')} />
      <ThemePicker selected={themes} onChange={setThemes} />

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
      <Txt faint size={fontSize.xs}>
        {t('Le gage à faire est toujours « soft » (physique/fun) ; les gorgées s’ajoutent si le mode alcool est activé.')}
      </Txt>

      <View style={{ height: spacing(1) }} />
      <Button title={t('Lancer Culture ou gage')} emoji="🎲" size="lg" variant="accent" onPress={launch} disabled={!valid} />
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
