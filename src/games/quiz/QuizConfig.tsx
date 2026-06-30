import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, Segmented, SectionHeader, Stepper, Txt } from '../../components/ui';
import {
  type AnswerFormat,
  DEFAULT_QUIZ_CONFIG,
  type Difficulty,
  DIFFICULTY_LABELS,
  type DrinkIntensity,
  type QuizConfig,
  THEME_META,
  THEMES,
  type Theme,
  type TurnMode,
} from '../../core/models';
import { kvGetJSON, kvSetJSON } from '../../db';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { QUESTIONS } from './questions';

const LAST_CONFIG_KEY = 'quiz:lastConfig';

export function QuizConfigComponent({ onStart }: MiniGameConfigProps) {
  const [cfg, setCfg] = useState<QuizConfig>(DEFAULT_QUIZ_CONFIG);

  useEffect(() => {
    let alive = true;
    void kvGetJSON<Partial<QuizConfig>>(LAST_CONFIG_KEY, {}).then((saved) => {
      if (alive) setCfg((c) => ({ ...c, ...saved }));
    });
    return () => {
      alive = false;
    };
  }, []);

  const available = useMemo(
    () =>
      QUESTIONS.filter((q) => cfg.themes.includes(q.theme) && cfg.difficulties.includes(q.difficulty)).length,
    [cfg.themes, cfg.difficulties],
  );

  // Keep the requested count within what the current filters can provide.
  useEffect(() => {
    setCfg((c) => {
      const max = Math.max(1, available);
      return c.questionCount > max ? { ...c, questionCount: max } : c;
    });
  }, [available]);

  const toggleTheme = (t: Theme) =>
    setCfg((c) => ({
      ...c,
      themes: c.themes.includes(t) ? c.themes.filter((x) => x !== t) : [...c.themes, t],
    }));

  const toggleDifficulty = (d: Difficulty) =>
    setCfg((c) => ({
      ...c,
      difficulties: c.difficulties.includes(d) ? c.difficulties.filter((x) => x !== d) : [...c.difficulties, d],
    }));

  const valid = cfg.themes.length > 0 && cfg.difficulties.length > 0 && available > 0;

  const launch = () => {
    const finalCfg: QuizConfig = { ...cfg, questionCount: Math.min(cfg.questionCount, Math.max(1, available)) };
    void kvSetJSON(LAST_CONFIG_KEY, finalCfg);
    onStart(finalCfg);
  };

  return (
    <View style={{ gap: spacing(1) }}>
      <SectionHeader title="Thèmes" />
      <View style={styles.wrap}>
        {THEMES.map((t) => (
          <Chip
            key={t}
            label={THEME_META[t].label}
            emoji={THEME_META[t].emoji}
            selected={cfg.themes.includes(t)}
            onPress={() => toggleTheme(t)}
          />
        ))}
      </View>

      <SectionHeader title="Difficulté" />
      <View style={styles.wrap}>
        {([1, 2, 3] as Difficulty[]).map((d) => (
          <Chip
            key={d}
            label={DIFFICULTY_LABELS[d]}
            selected={cfg.difficulties.includes(d)}
            onPress={() => toggleDifficulty(d)}
          />
        ))}
      </View>

      <SectionHeader title="Nombre de questions" />
      <Card>
        <View style={styles.row}>
          <Txt weight="700">Questions</Txt>
          <Stepper
            value={cfg.questionCount}
            min={1}
            max={Math.max(1, available)}
            onChange={(v) => setCfg((c) => ({ ...c, questionCount: v }))}
          />
        </View>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {available} question{available > 1 ? 's' : ''} disponible{available > 1 ? 's' : ''} avec ces filtres
        </Txt>
      </Card>

      <SectionHeader title="Mode de jeu" />
      <Segmented<TurnMode>
        value={cfg.turnMode}
        onChange={(v) => setCfg((c) => ({ ...c, turnMode: v }))}
        options={[
          { label: 'Chacun son tour', value: 'turn' },
          { label: 'Au plus rapide', value: 'fastest' },
        ]}
      />
      <Txt faint size={fontSize.xs}>
        {cfg.turnMode === 'turn'
          ? 'Chaque joueur répond à sa propre question, à tour de rôle.'
          : 'Tout le monde court sur la même question : le plus rapide marque (avec bonus de vitesse).'}
      </Txt>

      {cfg.turnMode === 'fastest' && (
        <Card>
          <View style={styles.row}>
            <Txt weight="700">Temps par question</Txt>
            <Stepper
              value={Math.round(cfg.fastestTimeLimitMs / 1000)}
              min={5}
              max={60}
              step={5}
              onChange={(v) => setCfg((c) => ({ ...c, fastestTimeLimitMs: v * 1000 }))}
            />
          </View>
          <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
            secondes — plus c'est rapide, plus le bonus est gros
          </Txt>
        </Card>
      )}

      <SectionHeader title="Réponses" />
      <Segmented<AnswerFormat>
        value={cfg.answerFormat}
        onChange={(v) => setCfg((c) => ({ ...c, answerFormat: v }))}
        options={[
          { label: 'Avec propositions', value: 'choices' },
          { label: 'Réponse libre', value: 'open' },
        ]}
      />
      <Txt faint size={fontSize.xs}>
        {cfg.answerFormat === 'choices'
          ? 'QCM : 4 propositions, on tape la bonne.'
          : 'Réponse libre : on dit la réponse à voix haute, l\'animateur valide. Ça vaut plus de points !'}
      </Txt>

      <SectionHeader title="Options" />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Indices</Txt>
            <Txt faint size={fontSize.xs}>Autoriser les indices (réduisent les points)</Txt>
          </View>
          <Switch
            value={cfg.hintsEnabled}
            onValueChange={(v) => setCfg((c) => ({ ...c, hintsEnabled: v }))}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
        <View style={[styles.row, { marginTop: spacing(1.5) }]}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Gorgées 🍻</Txt>
            <Txt faint size={fontSize.xs}>Défis et gorgées à boire / distribuer</Txt>
          </View>
          <Switch
            value={cfg.drinksEnabled}
            onValueChange={(v) => setCfg((c) => ({ ...c, drinksEnabled: v }))}
            trackColor={{ true: colors.sip, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      {cfg.drinksEnabled && (
        <Segmented<DrinkIntensity>
          value={cfg.drinkIntensity}
          onChange={(v) => setCfg((c) => ({ ...c, drinkIntensity: v }))}
          options={[
            { label: 'Soft', value: 'soft' },
            { label: 'Normal', value: 'normal' },
            { label: 'Hardcore', value: 'hardcore' },
          ]}
        />
      )}

      <View style={{ height: spacing(1) }} />
      <Button title="Lancer la partie" emoji="🚀" size="lg" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          Choisis au moins un thème et une difficulté.
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) },
});
