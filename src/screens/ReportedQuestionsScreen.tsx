import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button, Card, EmptyState, Screen, Txt } from '../components/ui';
import {
  clearReportedQuestions,
  deleteReportedQuestion,
  listReportedQuestions,
  type ReportedQuestion,
} from '../db';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, spacing } from '../theme/theme';

const REASON_LABEL: Record<string, string> = {
  reponse: 'Réponse fausse',
  faute: 'Faute / orthographe',
  ambigu: 'Ambiguë ou obsolète',
};

export function ReportedQuestionsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ReportedQuestions'>) {
  const t = useT();
  const [items, setItems] = useState<ReportedQuestion[]>([]);

  const refresh = useCallback(() => {
    void listReportedQuestions().then(setItems);
  }, []);
  useFocusEffect(useCallback(() => refresh(), [refresh]));

  const remove = async (id: number) => {
    await deleteReportedQuestion(id);
    refresh();
  };

  const clearAll = () =>
    Alert.alert(t('Tout effacer ?'), t('Supprimer tous les signalements ?'), [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Effacer'),
        style: 'destructive',
        onPress: async () => {
          await clearReportedQuestions();
          refresh();
        },
      },
    ]);

  return (
    <Screen
      title={t('Questions signalées')}
      subtitle={t('À relire et corriger dans la banque')}
      onBack={() => navigation.goBack()}
      scroll
      footer={items.length > 0 ? <Button title={t('Tout effacer')} variant="danger" onPress={clearAll} /> : undefined}
    >
      {items.length === 0 ? (
        <EmptyState emoji="✅" title={t('Aucun signalement')} subtitle={t('Les questions signalées en jeu apparaîtront ici.')} />
      ) : (
        items.map((r) => (
          <Card key={r.id} style={{ marginBottom: spacing(1) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing(1) }}>
              <Txt faint size={fontSize.xs} weight="800">
                {r.universe ?? r.questionId} · {t(REASON_LABEL[r.reason ?? ''] ?? 'Autre')}
              </Txt>
              <Pressable onPress={() => void remove(r.id)} hitSlop={8}>
                <Txt size={fontSize.xs} weight="700" color={colors.danger}>
                  {t('Supprimer')}
                </Txt>
              </Pressable>
            </View>
            <Txt weight="700" style={{ marginTop: spacing(0.5) }}>
              {r.questionText}
            </Txt>
            <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.25) }}>
              {t('Réponse : {answer}', { answer: r.answer })}
            </Txt>
          </Card>
        ))
      )}
    </Screen>
  );
}
