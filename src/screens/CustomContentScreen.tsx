import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Button, Card, Chip, Screen, SectionHeader, Segmented, Txt } from '../components/ui';
import type { DrinkChallenge } from '../core/drinks';
import { type Difficulty, DIFFICULTY_LABELS, THEME_META, THEMES, type Theme } from '../core/models';
import { type CustomPack, decodePack, encodePack } from '../core/packCodec';
import {
  addCustomChallenge,
  addCustomQuestion,
  type CustomQuestion,
  deleteCustomChallenge,
  deleteCustomQuestion,
  listCustomChallenges,
  listCustomQuestions,
} from '../db';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme/theme';

const DIFFS: { label: string; value: string }[] = [
  { label: 'Facile', value: '1' },
  { label: 'Moyen', value: '2' },
  { label: 'Difficile', value: '3' },
  { label: 'Pro', value: '4' },
];

export function CustomContentScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'CustomContent'>) {
  const tr = useT();
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
  const [busy, setBusy] = useState(false);

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
    Alert.alert(tr('Supprimer cette question ?'), q.text, [
      { text: tr('Annuler'), style: 'cancel' },
      {
        text: tr('Supprimer'),
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
    Alert.alert(tr('Supprimer ce défi ?'), c.text, [
      { text: tr('Annuler'), style: 'cancel' },
      {
        text: tr('Supprimer'),
        style: 'destructive',
        onPress: async () => {
          await deleteCustomChallenge(c.id);
          await refresh();
        },
      },
    ]);

  // Exporte questions + défis perso dans un fichier .json partageable.
  const exportPack = async () => {
    if (questions.length === 0 && challenges.length === 0) {
      Alert.alert(tr('Rien à partager'), tr('Crée au moins une question ou un défi.'));
      return;
    }
    try {
      setBusy(true);
      const pack: CustomPack = {
        questions: questions.map((q) => ({
          theme: q.theme,
          universe: q.universe,
          difficulty: q.difficulty,
          text: q.text,
          answer: q.answer,
          acceptable: q.acceptable,
          distractors: q.distractors,
          hints: q.hints,
        })),
        challenges: challenges.map((c) => c.text),
      };
      const raw = encodePack(pack);
      const uri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}cancellable-pack-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(uri, raw);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: tr('Partager mon pack') });
      } else {
        Alert.alert(tr('Pack créé'), uri);
      }
    } catch (e) {
      Alert.alert(tr('Erreur'), String(e));
    } finally {
      setBusy(false);
    }
  };

  // Importe un pack .json (contenu NON fiable : decodePack valide et borne tout).
  const importPack = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.[0]) return;
      const raw = await FileSystem.readAsStringAsync(res.assets[0].uri);
      const pack = decodePack(raw);
      if (!pack) {
        Alert.alert(tr('Pack invalide'), tr("Ce fichier n'est pas un pack Cancellable valide."));
        return;
      }
      Alert.alert(
        tr('Importer ce pack ?'),
        tr('{q} questions et {c} défis seront ajoutés à ton contenu.', { q: pack.questions.length, c: pack.challenges.length }),
        [
          { text: tr('Annuler'), style: 'cancel' },
          {
            text: tr('Importer'),
            onPress: async () => {
              setBusy(true);
              try {
                for (const q of pack.questions) await addCustomQuestion(q);
                for (const c of pack.challenges) await addCustomChallenge(c);
                await refresh();
                Alert.alert(
                  tr('Import terminé'),
                  tr('{q} questions et {c} défis ajoutés.', { q: pack.questions.length, c: pack.challenges.length }),
                );
              } catch (e) {
                Alert.alert(tr('Erreur'), String(e));
              } finally {
                setBusy(false);
              }
            },
          },
        ],
      );
    } catch (e) {
      Alert.alert(tr('Erreur'), String(e));
    }
  };

  return (
    <Screen title={tr('Mon contenu')} subtitle={tr('Ajoute tes propres questions et défis')} onBack={() => navigation.goBack()} scroll>
      <SectionHeader title={tr('Partage de packs')} />
      <Card>
        <Txt dim size={fontSize.sm} style={{ marginBottom: spacing(1.5) }}>
          {tr('Exporte tes questions et défis dans un fichier à envoyer à tes amis — ou importe le leur.')}
        </Txt>
        <View style={{ gap: spacing(1) }}>
          <Button title={tr('Partager mon pack')} emoji="📤" variant="secondary" onPress={() => void exportPack()} loading={busy} />
          <Button title={tr('Importer un pack')} emoji="📥" variant="secondary" onPress={() => void importPack()} disabled={busy} />
        </View>
      </Card>

      <SectionHeader title={tr('Nouvelle question')} />
      <Card>
        <Txt faint size={fontSize.xs} weight="800">
          {tr('THÈME')}
        </Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing(0.75) }}>
          <View style={{ flexDirection: 'row', gap: spacing(1) }}>
            {THEMES.map((th) => (
              <Chip key={th} label={tr(THEME_META[th].label)} emoji={THEME_META[th].emoji} selected={theme === th} onPress={() => setTheme(th)} />
            ))}
          </View>
        </ScrollView>

        <TextInput
          value={universe}
          onChangeText={setUniverse}
          placeholder={tr('Univers (optionnel, ex. Naruto)')}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={40}
        />

        <View style={{ marginTop: spacing(1) }}>
          <Segmented value={difficulty} onChange={setDifficulty} options={DIFFS.map((o) => ({ label: tr(o.label), value: o.value }))} />
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={tr('Question')}
          placeholderTextColor={colors.textFaint}
          style={[styles.input, styles.multiline, { marginTop: spacing(1) }]}
          multiline
        />
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          placeholder={tr('Bonne réponse')}
          placeholderTextColor={colors.textFaint}
          style={[styles.input, { marginTop: spacing(1) }]}
        />
        <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(1.5) }}>
          {tr('MAUVAISES RÉPONSES (pour le QCM)')}
        </Txt>
        <TextInput value={d1} onChangeText={setD1} placeholder={tr('Proposition 1')} placeholderTextColor={colors.textFaint} style={[styles.input, { marginTop: spacing(0.75) }]} />
        <TextInput value={d2} onChangeText={setD2} placeholder={tr('Proposition 2')} placeholderTextColor={colors.textFaint} style={[styles.input, { marginTop: spacing(0.75) }]} />
        <TextInput value={d3} onChangeText={setD3} placeholder={tr('Proposition 3')} placeholderTextColor={colors.textFaint} style={[styles.input, { marginTop: spacing(0.75) }]} />
        <TextInput value={hint} onChangeText={setHint} placeholder={tr('Indice (optionnel)')} placeholderTextColor={colors.textFaint} style={[styles.input, { marginTop: spacing(1) }]} />

        <Button title={tr('Ajouter la question')} emoji="➕" style={{ marginTop: spacing(1.5) }} onPress={saveQuestion} disabled={!text.trim() || !answer.trim()} />
      </Card>

      <SectionHeader title={tr('Mes questions ({n})', { n: questions.length })} />
      {questions.length === 0 ? (
        <Txt dim center style={{ paddingVertical: spacing(2) }}>
          {tr("Aucune question perso pour l'instant.")}
        </Txt>
      ) : (
        questions.map((q) => (
          <Card key={q.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Txt faint size={fontSize.xs}>
                {THEME_META[q.theme]?.emoji ?? '•'} {q.universe ?? (THEME_META[q.theme] ? tr(THEME_META[q.theme].label) : '')} · {tr(DIFFICULTY_LABELS[q.difficulty])}
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

      <SectionHeader title={tr('Nouveau défi 🍻')} />
      <Card>
        <TextInput
          value={challengeText}
          onChangeText={setChallengeText}
          placeholder={tr("Ex. : Tout le monde boit de la main gauche jusqu'au prochain défi.")}
          placeholderTextColor={colors.textFaint}
          style={[styles.input, styles.multiline]}
          multiline
        />
        <Button title={tr('Ajouter le défi')} emoji="➕" style={{ marginTop: spacing(1.5) }} onPress={saveChallenge} disabled={!challengeText.trim()} />
      </Card>

      <SectionHeader title={tr('Mes défis ({n})', { n: challenges.length })} />
      {challenges.length === 0 ? (
        <Txt dim center style={{ paddingVertical: spacing(2) }}>
          {tr("Aucun défi perso pour l'instant.")}
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
