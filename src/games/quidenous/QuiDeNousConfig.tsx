import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, HowToPlay, PlayerUnseenList, Segmented, SectionHeader, Stepper, Txt } from '../../components/ui';
import { CancelLevelSelector } from '../../components/CancelLevelSelector';
import type { DrinkIntensity } from '../../core/models';
import type { QuiDeNousConfig } from '../../core/quidenousEngine';
import { getActiveCancelLevels } from '../../lib/cancelLevel';
import { getPromptSeenByPlayer, type PromptSeenByPlayer } from '../../db';
import { isNoAlcohol } from '../../lib/drinkMode';
import { useT } from '../../lib/i18nProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { promptsForLevels } from './prompts';

export function QuiDeNousConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const t = useT();
  const [rounds, setRounds] = useState(8);
  const [drinksEnabled, setDrinksEnabled] = useState(!isNoAlcohol());
  const [drinkIntensity, setDrinkIntensity] = useState<DrinkIntensity>('normal');
  const [levels, setLevels] = useState(getActiveCancelLevels());
  const [seen, setSeen] = useState<PromptSeenByPlayer>({});

  useEffect(() => {
    void getPromptSeenByPlayer('quidenous').then(setSeen);
  }, []);

  // Affirmations jamais vues par chaque joueur, au niveau de cancellabilité choisi.
  const unseenByPlayer = useMemo(() => {
    const keys = promptsForLevels(levels);
    return players.map((p) => {
      const s = seen[p.id] ?? {};
      return { player: p, unseen: keys.filter((k) => (s[k] ?? 0) === 0).length };
    });
  }, [players, seen, levels]);

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

      <SectionHeader title={t('Niveau Cancellable')} />
      <CancelLevelSelector onChange={setLevels} />

      {players.length >= 3 && (
        <>
          <SectionHeader title={t('Inédits par joueur')} />
          <PlayerUnseenList rows={unseenByPlayer} />
          <Txt faint size={fontSize.xs}>
            {t('Affirmations jamais vues par chaque joueur au niveau choisi.')}
          </Txt>
        </>
      )}

      <SectionHeader title={t('Manches')} />
      <Stepper value={rounds} min={3} max={30} onChange={setRounds} />

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
