import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Chip, Screen, SectionHeader, Segmented, Txt } from '../components/ui';
import type { DrinkChallenge } from '../core/drinks';
import { type Difficulty, DIFFICULTY_LABELS, THEME_META, THEMES, type Theme } from '../core/models';
import {
  addCustomChallenge,
  addCustomQuestion,
  type CustomQuestion,
  deleteCustomChallenge,
  deleteCustomQuestion,
  listCustomChallenges,
  listCustomQuestions,
} from '../db';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

const DIFFS: { label: string; value: string }[] = [
  { label: 'Facile', value: '1' },
  { label: 'Moyen', value: '2' },
  { label: 'Difficile', value: '3' },
  { label: 'Pro', value: '4' },
];

export function CustomContentScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'CustomContent'>) {
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [challenges, setChallenges] = useState<DrinkChallenge[]>([]);

  // Question form
  const [theme, setTheme] = useState<Theme>('manga');
  const [universe, setUniverse] = useState('');
  const [difficulty, setDifficulty] = useState('2');
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  const [d3, setD3] = useState('');
  const [hint, setHint] = useState('');

  const [challengeText, setChallengeText] = useState('');

  const refresh = useCallback(async () => {
    const [q, c] = await Promise.all([listCustomQuestions(), listCustomChallenges()]);
    setQuestions(q);
    setChallenges(c);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const resetQuestionForm = () => {
    setUniverse('');
    setText('');
    setAnswer('');
    setD1('');
    setD2('');
    setD3('');
    setHint('');
  };

  const saveQuestion = async () => {
    if (!text.trim() || !answer.trim()) return;
    await addCustomQuestion({
      theme,
      universe: universe.trim() || undefined,
      difficulty: Number(difficulty) as Difficulty,
      text: text.trim(),
      answer: answer.trim(),
      distractors: [d1, d2, d3].map((d) => d.trim()).filter((d) => d.length > 0),
      hints: hint.trim() ? [hint.trim()] : undefined,
    });
    resetQuestionForm();
    await refresh();
  };

  const removeQuestion = (q: CustomQuestion) =>
    Alert.alert('Supprimer cette question ?', q.text, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteCustomQuestion(q.id);
          await refresh();
        },
      },
    ]);

  const saveChallenge = async () => {
    if (!challengeText.trim()) return;
    await addCustomChallenge(challengeText.trim());
    setChallengeText('');
    await refresh();
  };

  const removeChallenge = (c: DrinkChallenge) =>
    Alert.alert('Supprimer ce défi ?', c.text, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteCustomChallenge(c.id);
          await refresh();
        },
      },
    ]);

  return (
    <Screen title="Mon contenu" subtitle="Ajoute tes propres questions et défis" onBack={() => navigation.goBack()} scroll>
      <SectionHeader title="Nouvelle question" />
      <Card>
        <Txt faint size={fontSize.xs} weight="800">
          THÈME
        </Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing(0.75) }}>
          <View style={{ flexDirection: 'row', gap: spacing(1) }}>
            {THEMES.map((t) => (
              <Chip key={t} label={THEME_META[t].label} emoji={THEME_META[t].emoji} selected={theme === t} onPress={() => setTheme(t)} />
            ))}
          </View>
        </ScrollView>

        <TextInput
          value={universe}
          onChangeText={setUniverse}
          placeholder="Univers (optionnel, ex. Naruto)"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={40}
        />

        <View style={{ marginTop: spacing(1) }}>
          <Segmented value={difficulty} onChange={setDifficulty} options={DIFFS} />
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Question"
          placeholderTextColor={colors.textFaint}
          style={[styles.input, styles.multiline, { marginTop: spacing(1) }]}
          multiline
        />
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          placeholder="Bonne réponse"
          placeholderTextColor={colors.textFaint}
          style={[styles.input, { marginTop: spacing(1) }]}
        />
        <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(1.5) }}>
          MAUVAISES RÉPONSES (pour le QCM)
        </Txt>
        <TextInput value={d1} onChangeText={setD1} placeholder="Proposition 1" placeholderTextColor={colors.textFaint} style={[styles.input, { marginTop: spacing(0.75) }]} />
        <TextInput value={d2} onChangeText={setD2} placeholder="Proposition 2" placeholderTextColor={colors.textFaint} style={[styles.input, { marginTop: spacing(0.75) }]} />
        <TextInput value={d3} onChangeText={setD3} placeholder="Proposition 3" placeholderTextColor={colors.textFaint} style={[styles.input, { marginTop: spacing(0.75) }]} />
        <TextInput value={hint} onChangeText={setHint} placeholder="Indice (optionnel)" placeholderTextColor={colors.textFaint} style={[styles.input, { marginTop: spacing(1) }]} />

        <Button title="Ajouter la question" emoji="➕" style={{ marginTop: spacing(1.5) }} onPress={saveQuestion} disabled={!text.trim() || !answer.trim()} />
      </Card>

      <SectionHeader title={`Mes questions (${questions.length})`} />
      {questions.length === 0 ? (
        <Txt dim center style={{ paddingVertical: spacing(2) }}>
          Aucune question perso pour l'instant.
        </Txt>
      ) : (
        questions.map((q) => (
          <Card key={q.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Txt faint size={fontSize.xs}>
                {THEME_META[q.theme]?.emoji ?? '•'} {q.universe ?? THEME_META[q.theme]?.label} · {DIFFICULTY_LABELS[q.difficulty]}
              </Txt>
              <Txt weight="700" numberOfLines={2}>
                {q.text}
              </Txt>
              <Txt dim size={fontSize.xs}>
                → {q.answer}
              </Txt>
            </View>
            <Button title="🗑" size="sm" variant="ghost" onPress={() => removeQuestion(q)} />
          </Card>
        ))
      )}

      <SectionHeader title="Nouveau défi 🍻" />
      <Card>
        <TextInput
          value={challengeText}
          onChangeText={setChallengeText}
          placeholder="Ex. : Tout le monde boit de la main gauche jusqu'au prochain défi."
          placeholderTextColor={colors.textFaint}
          style={[styles.input, styles.multiline]}
          multiline
        />
        <Button title="Ajouter le défi" emoji="➕" style={{ marginTop: spacing(1.5) }} onPress={saveChallenge} disabled={!challengeText.trim()} />
      </Card>

      <SectionHeader title={`Mes défis (${challenges.length})`} />
      {challenges.length === 0 ? (
        <Txt dim center style={{ paddingVertical: spacing(2) }}>
          Aucun défi perso pour l'instant.
        </Txt>
      ) : (
        challenges.map((c) => (
          <Card key={c.id} style={styles.itemRow}>
            <Txt weight="600" style={{ flex: 1 }}>
              {c.text}
            </Txt>
            <Button title="🗑" size="sm" variant="ghost" onPress={() => removeChallenge(c)} />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1.25),
    fontSize: fontSize.md,
  },
  multiline: { minHeight: 64, textAlignVertical: 'top' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginBottom: spacing(1) },
});
