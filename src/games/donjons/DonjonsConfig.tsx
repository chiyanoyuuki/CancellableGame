import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { CancelLevelSelector } from '../../components/CancelLevelSelector';
import { ContentPicker, type ContentSelection } from '../../components/ContentPicker';
import { Button, Card, HowToPlay, Segmented, SectionHeader, Txt } from '../../components/ui';
import type { CancelLevel } from '../../core/models';
import type { DonjonsConfig, GameDuration } from '../../core/donjonsEngine';
import { getActiveCancelLevels } from '../../lib/cancelLevel';
import { isNoAlcohol } from '../../lib/drinkMode';
import { useT } from '../../lib/i18nProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';

/** Config complète du mode : moteur + sélection de contenu (univers). */
export interface DonjonsPlayConfig extends DonjonsConfig {
  content: ContentSelection;
}

export function DonjonsConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const t = useT();
  const [levels, setLevels] = useState<CancelLevel[]>(getActiveCancelLevels());
  const [duration, setDuration] = useState<GameDuration>('normal');
  const [drinksEnabled, setDrinksEnabled] = useState(!isNoAlcohol());
  const [content, setContent] = useState<ContentSelection>({ themes: [], excludedUniverses: [] });

  const valid = players.length >= 3;

  const launch = () =>
    onStart({ duration, drinksEnabled, cancelLevels: levels, content } satisfies DonjonsPlayConfig);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">{t('🎲 Donjons & Gorgées')}</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t('Un quiz-RPG de soirée : choisis une race et une classe, cible tes amis, et que le d20 décide !')}
        </Txt>
      </Card>

      <HowToPlay
        lines={[
          t('Chaque joueur incarne une Race + une Classe (bonus/malus + une capacité).'),
          t('À ton tour, cible un joueur et impose-lui un défi : question, action ou vérité, j’ai jamais, ou duel.'),
          t('La cible résout au d20 + sa stat : le 1 est une catastrophe, le 20 un sauvetage.'),
          t('Réussir rapporte de l’XP (montée de niveau) ; échouer fait boire ou déclenche un gage.'),
          t('Plus on boit, plus l’ivresse déforme les stats. Le plus haut niveau en fin de partie gagne.'),
        ]}
      />

      <SectionHeader title={t('Niveau Cancellable')} />
      <CancelLevelSelector onChange={setLevels} />

      <SectionHeader title={t('Durée de la partie')} />
      <Segmented<GameDuration>
        value={duration}
        onChange={setDuration}
        options={[
          { label: t('Court'), value: 'court' },
          { label: t('Normal'), value: 'normal' },
          { label: t('Long'), value: 'long' },
        ]}
      />

      <SectionHeader title={t('Contenu du quiz')} />
      <ContentPicker value={content} onChange={setContent} levels={levels} />

      <SectionHeader title={t('Mode alcool')} />
      <View style={styles.rowBetween}>
        <Txt weight="700">{t('🍺 Gorgées')}</Txt>
        <Switch
          value={drinksEnabled}
          onValueChange={setDrinksEnabled}
          trackColor={{ true: colors.sip, false: colors.border }}
          thumbColor={colors.white}
        />
      </View>
      {!drinksEnabled && (
        <Txt faint size={fontSize.xs}>
          {t('Sans alcool : les gorgées deviennent des gages soft.')}
        </Txt>
      )}

      <View style={{ height: spacing(1) }} />
      <Button
        title={t('Créer les personnages')}
        emoji="🎲"
        size="lg"
        variant="accent"
        onPress={launch}
        disabled={!valid}
      />
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
