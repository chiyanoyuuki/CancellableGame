import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, Segmented, SectionHeader, Stepper, Txt } from '../../components/ui';
import {
  DEFAULT_QUIZ_CONFIG,
  type Difficulty,
  DIFFICULTY_LABELS,
  type DrinkIntensity,
  type Question,
  type QuizConfig,
  THEME_META,
  THEMES,
  type Theme,
  type TurnMode,
} from '../../core/models';
import type { QuestionHistory } from '../../core/questionSelection';
import { getQuestionHistory, kvGetJSON, kvSetJSON } from '../../db';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from './pool';

const LAST_CONFIG_KEY = 'quiz:lastConfig';

export function QuizConfigComponent({ onStart }: MiniGameConfigProps) {
  const [cfg, setCfg] = useState<QuizConfig>(DEFAULT_QUIZ_CONFIG);
  const [pool, setPool] = useState<Question[]>([]);
  const [history, setHistory] = useState<QuestionHistory>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    let alive = true;
    void kvGetJSON<Partial<QuizConfig>>(LAST_CONFIG_KEY, {}).then((saved) => {
      if (alive) setCfg((c) => ({ ...c, ...saved }));
    });
    void (async () => {
      const [p, h] = await Promise.all([getQuizPool(), getQuestionHistory()]);
      if (alive) {
        setPool(p);
        setHistory(h);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const eligible = useMemo(
    () =>
      pool.filter(
        (q) =>
          cfg.themes.includes(q.theme) &&
          cfg.difficulties.includes(q.difficulty) &&
          !(q.universe !== undefined && cfg.excludedUniverses.includes(q.universe)),
      ),
    [pool, cfg.themes, cfg.difficulties, cfg.excludedUniverses],
  );

  // Universes available per selected theme (for the advanced options).
  const universesByTheme = useMemo(() => {
    const map = new Map<Theme, string[]>();
    for (const q of pool) {
      if (!q.universe || !cfg.themes.includes(q.theme)) continue;
      const arr = map.get(q.theme) ?? [];
      if (!arr.includes(q.universe)) arr.push(q.universe);
      map.set(q.theme, arr);
    }
    const out: { theme: Theme; universes: string[] }[] = [];
    for (const t of THEMES) {
      const u = map.get(t);
      if (u && u.length > 0) out.push({ theme: t, universes: [...u].sort() });
    }
    return out;
  }, [pool, cfg.themes]);
  const available = eligible.length;
  const unseen = useMemo(
    () => eligible.filter((q) => !history[q.id]?.timesUsed).length,
    [eligible, history],
  );

  // Keep the requested count within what the current filters can provide.
  useEffect(() => {
    setCfg((c) => {
      const max = Math.max(1, available);
      return c.questionCount > max ? { ...c, questionCount: max } : c;
    });
  }, [available]);

  const toggleTheme = (t: Theme) =>
    setCfg((c) => {
      const has = c.themes.includes(t);
      return {
        ...c,
        themes: has ? c.themes.filter((x) => x !== t) : [...c.themes, t],
        // A theme can only stay "preferred" while it is still selected.
        preferredThemes: has ? c.preferredThemes.filter((x) => x !== t) : c.preferredThemes,
      };
    });

  const togglePreferred = (t: Theme) =>
    setCfg((c) => {
      if (c.preferredThemes.includes(t)) return { ...c, preferredThemes: c.preferredThemes.filter((x) => x !== t) };
      if (c.preferredThemes.length >= 3) return c; // au maximum 3 thèmes préférés
      return { ...c, preferredThemes: [...c.preferredThemes, t] };
    });

  const toggleDifficulty = (d: Difficulty) =>
    setCfg((c) => ({
      ...c,
      difficulties: c.difficulties.includes(d) ? c.difficulties.filter((x) => x !== d) : [...c.difficulties, d],
    }));

  const toggleUniverse = (u: string) =>
    setCfg((c) => ({
      ...c,
      excludedUniverses: c.excludedUniverses.includes(u)
        ? c.excludedUniverses.filter((x) => x !== u)
        : [...c.excludedUniverses, u],
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

      {cfg.themes.length > 1 && (
        <>
          <SectionHeader title="Thèmes préférés — +50 % (max 3)" />
          <View style={styles.wrap}>
            {cfg.themes.map((t) => (
              <Chip
                key={t}
                label={THEME_META[t].label}
                emoji={cfg.preferredThemes.includes(t) ? '⭐' : THEME_META[t].emoji}
                selected={cfg.preferredThemes.includes(t)}
                onPress={() => togglePreferred(t)}
                color={colors.warning}
              />
            ))}
          </View>
          <Txt faint size={fontSize.xs}>
            Les thèmes en ⭐ ont 50 % de chance en plus de tomber.
          </Txt>
        </>
      )}

      <SectionHeader title="Difficulté" />
      <View style={styles.wrap}>
        {([1, 2, 3, 4] as Difficulty[]).map((d) => (
          <Chip
            key={d}
            label={DIFFICULTY_LABELS[d]}
            selected={cfg.difficulties.includes(d)}
            onPress={() => toggleDifficulty(d)}
          />
        ))}
      </View>

      {universesByTheme.length > 0 && (
        <>
          <Pressable onPress={() => setShowAdvanced((v) => !v)}>
            <SectionHeader title={`Options avancées — univers ${showAdvanced ? '▾' : '▸'}`} />
          </Pressable>
          {showAdvanced &&
            universesByTheme.map(({ theme, universes }) => (
              <View key={theme} style={{ marginBottom: spacing(1.5) }}>
                <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.5) }}>
                  {THEME_META[theme].emoji} {THEME_META[theme].label.toUpperCase()}
                </Txt>
                <View style={styles.wrap}>
                  {universes.map((u) => (
                    <Chip key={u} label={u} selected={!cfg.excludedUniverses.includes(u)} onPress={() => toggleUniverse(u)} />
                  ))}
                </View>
              </View>
            ))}
        </>
      )}

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
          {available} dispo · {unseen} jamais vue{unseen > 1 ? 's' : ''} avec ces filtres
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

      <SectionHeader title="Réponses & aide" />
      <Card>
        <Txt weight="700">Réponse libre par défaut</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Chaque question démarre sans proposition (points pleins). Pendant la question, des
          boutons permettent de demander de l'aide — au prix de points :
        </Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          • 4 propositions → points ÷ 2{'\n'}• 2 propositions → points ÷ 4{'\n'}• un indice → points ÷ 1,5 (cumulable)
        </Txt>
      </Card>

      <SectionHeader title="Chrono par question" />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Chrono informatif ⏱</Txt>
            <Txt faint size={fontSize.xs}>Compte à rebours affiché, sans pénalité (0 = désactivé)</Txt>
          </View>
          <Stepper
            value={cfg.questionTimerSec}
            min={0}
            max={120}
            step={5}
            onChange={(v) => setCfg((c) => ({ ...c, questionTimerSec: v }))}
          />
        </View>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {cfg.questionTimerSec > 0 ? `${cfg.questionTimerSec} s par question` : 'Désactivé'}
        </Txt>
      </Card>

      <SectionHeader title="Options" />
      <Card>
        <View style={styles.row}>
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
        <View style={[styles.row, { marginTop: spacing(1.5) }]}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Afficher l'univers</Txt>
            <Txt faint size={fontSize.xs}>Montrer l'univers pendant la partie (ex. « Naruto »)</Txt>
          </View>
          <Switch
            value={cfg.showUniverse}
            onValueChange={(v) => setCfg((c) => ({ ...c, showUniverse: v }))}
            trackColor={{ true: colors.primary, false: colors.border }}
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
