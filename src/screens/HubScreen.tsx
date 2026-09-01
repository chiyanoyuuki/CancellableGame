import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Button, Screen } from '../components/ui';
import { getMissedCount } from '../db';
import { getFlag } from '../lib/featureFlags';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { spacing } from '../theme/theme';

type HubKind = 'solo' | 'party' | 'manage';

const TITLES: Record<HubKind, string> = {
  solo: 'Jouer en solo',
  party: 'Soirée & outils',
  manage: 'Stats & profils',
};

const SUBTITLES: Record<HubKind, string> = {
  solo: "S'entraîner et se défier seul",
  party: 'Fils rouges et outils de soirée',
  manage: 'Gérer joueurs, stats et contenu',
};

interface HubItem {
  label: string;
  emoji: string;
  onPress: () => void;
}

/** Sous-menu générique : regroupe des destinations par thème pour désengorger l'accueil. */
export function HubScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Hub'>) {
  const t = useT();
  const hub = route.params.hub;
  const [missed, setMissed] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (hub === 'solo') void getMissedCount().then(setMissed);
    }, [hub]),
  );

  const items: HubItem[] = [];
  if (hub === 'solo') {
    items.push(
      { label: t('Entraînement par thème'), emoji: '🎯', onPress: () => navigation.navigate('Entrainement') },
      { label: t('Survie'), emoji: '💀', onPress: () => navigation.navigate('SoloQuiz', { mode: 'survie' }) },
      { label: t('Contre-la-montre'), emoji: '⏱️', onPress: () => navigation.navigate('SoloQuiz', { mode: 'chrono' }) },
      {
        label: missed > 0 ? t('Réviser mes erreurs ({n})', { n: missed }) : t('Réviser mes erreurs'),
        emoji: '🧠',
        onPress: () => navigation.navigate('Revision'),
      },
    );
  } else if (hub === 'party') {
    items.push(
      { label: t('Mode Soirée'), emoji: '🎉', onPress: () => navigation.navigate('Soiree') },
      { label: t('Tournoi'), emoji: '🏆', onPress: () => navigation.navigate('Tournoi') },
      { label: t('Question du jour'), emoji: '🗓️', onPress: () => navigation.navigate('Qotd') },
      { label: t('Roue des gages'), emoji: '🎡', onPress: () => navigation.navigate('Roue') },
    );
    if (getFlag('teamGen')) {
      items.push({ label: t("Générateur d'équipes"), emoji: '🧩', onPress: () => navigation.navigate('TeamGenerator') });
    }
  } else {
    items.push(
      { label: t('Joueurs'), emoji: '👥', onPress: () => navigation.navigate('Players') },
      { label: t('Statistiques'), emoji: '📊', onPress: () => navigation.navigate('Stats') },
      { label: t('Mon contenu'), emoji: '✏️', onPress: () => navigation.navigate('CustomContent') },
      { label: t('Boutique'), emoji: '🛍️', onPress: () => navigation.navigate('Store') },
    );
  }

  return (
    <Screen title={t(TITLES[hub])} subtitle={t(SUBTITLES[hub])} onBack={() => navigation.goBack()} scroll>
      <View style={{ gap: spacing(1) }}>
        {items.map((it) => (
          <Button key={it.label} title={it.label} emoji={it.emoji} variant="secondary" size="lg" onPress={it.onPress} />
        ))}
      </View>
    </Screen>
  );
}
