import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Button, Card, Chip, PlayerAvatar, Segmented, SectionHeader, Stepper, Txt } from '../../components/ui';
import {
  DEFAULT_QUIZ_CONFIG,
  type Difficulty,
  DIFFICULTY_LABELS,
  type DrinkIntensity,
  type Question,
  type QuizConfig,
  type Team,
  THEME_META,
  THEMES,
  type Theme,
  type TurnMode,
} from '../../core/models';
import type { QuestionHistory } from '../../core/questionSelection';
import { getQuestionHistory, kvGetJSON, kvSetJSON } from '../../db';
import { colors, fontSize, PLAYER_COLORS, radius, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from './pool';

const TEAM_EMOJIS = ['🦁', '🐺', '🦅', '🐉', '🦈', '🐻', '🦊', '🐧', '🦖', '🐙'];
const teamKey = (name: string, i: number) => `team:${(name.trim() || `equipe-${i + 1}`).toLowerCase().replace(/\s+/g, '-')}`;

const LAST_CONFIG_KEY = 'quiz:lastConfig';

export function QuizConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const [cfg, setCfg] = useState<QuizConfig>(DEFAULT_QUIZ_CONFIG);
  const [pool, setPool] = useState<Question[]>([]);
  const [history, setHistory] = useState<QuestionHistory>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- Team mode local state (turned into cfg.teams only at launch) ----------
  const [teamCount, setTeamCount] = useState(() => Math.min(2, Math.max(1, players.length)));
  const [teamNames, setTeamNames] = useState<string[]>(() =>
    Array.from({ length: Math.max(1, players.length) }, (_, i) => `Équipe ${i + 1}`),
  );
  const [assign, setAssign] = useState<Record<string, number>>(() => {
    const n = Math.min(2, Math.max(1, players.length));
    const a: Record<string, number> = {};
    players.forEach((p, i) => (a[p.id] = i % n));
    return a;
  });

  const buildTeams = (): Team[] => {
    const teams: Team[] = [];
    for (let i = 0; i < teamCount; i++) {
      const memberIds = players.filter((p) => (assign[p.id] ?? 0) === i).map((p) => p.id);
      if (memberIds.length === 0) continue;
      const name = teamNames[i]?.trim() || `Équipe ${i + 1}`;
      teams.push({
        id: teamKey(name, i),
        name,
        emoji: TEAM_EMOJIS[i % TEAM_EMOJIS.length] as string,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length] as string,
        memberIds,
      });
    }
    return teams;
  };

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
    setCfg((c) => ({
      ...c,
      themes: c.themes.includes(t) ? c.themes.filter((x) => x !== t) : [...c.themes, t],
    }));

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

  const changeTeamCount = (n: number) => {
    setTeamCount(n);
    setAssign((a) => {
      const next = { ...a };
      for (const p of players) if ((next[p.id] ?? 0) >= n) next[p.id] = (next[p.id] ?? 0) % n;
      return next;
    });
  };

  const launch = () => {
    const teams = cfg.teamMode ? buildTeams() : [];
    const finalCfg: QuizConfig = {
      ...cfg,
      questionCount: Math.min(cfg.questionCount, Math.max(1, available)),
      teams,
      teamMode: cfg.teamMode && teams.length >= 1,
    };
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

      <Txt faint size={fontSize.xs}>
        Astuce : chaque joueur peut choisir jusqu'à 3 thèmes préférés dans l'écran Joueurs
        (50 % de chance en plus), comme les univers à éviter.
      </Txt>

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

      <SectionHeader title="Équipes" />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Mode équipe 👥</Txt>
            <Txt faint size={fontSize.xs}>Le tour passe à une équipe, pas à un joueur. Les univers évités par les joueurs sont ignorés.</Txt>
          </View>
          <Switch
            value={cfg.teamMode}
            onValueChange={(v) => setCfg((c) => ({ ...c, teamMode: v }))}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      {cfg.teamMode && (
        <>
          <Card>
            <View style={styles.row}>
              <Txt weight="700">Nombre d'équipes</Txt>
              <Stepper value={teamCount} min={1} max={Math.max(1, players.length)} onChange={changeTeamCount} />
            </View>
          </Card>

          {Array.from({ length: teamCount }).map((_, ti) => {
            const members = players.filter((p) => (assign[p.id] ?? 0) === ti);
            return (
              <Card key={ti} accent={PLAYER_COLORS[ti % PLAYER_COLORS.length]}>
                <View style={[styles.row, { gap: spacing(1) }]}>
                  <Txt size={fontSize.lg}>{TEAM_EMOJIS[ti % TEAM_EMOJIS.length]}</Txt>
                  <TextInput
                    value={teamNames[ti] ?? ''}
                    onChangeText={(t) => setTeamNames((ns) => { const c = [...ns]; c[ti] = t; return c; })}
                    placeholder={`Équipe ${ti + 1}`}
                    placeholderTextColor={colors.textFaint}
                    style={styles.teamInput}
                  />
                </View>
                <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
                  {members.length > 0 ? members.map((m) => `${m.emoji} ${m.name}`).join('  ·  ') : 'Aucun joueur'}
                </Txt>
              </Card>
            );
          })}

          <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(0.5) }}>
            RÉPARTITION DES JOUEURS
          </Txt>
          {players.map((p) => (
            <Card key={p.id} style={[styles.row, { gap: spacing(1) }]}>
              <PlayerAvatar emoji={p.emoji} color={p.color} size={32} />
              <Txt weight="700" style={{ flex: 1 }} numberOfLines={1}>
                {p.name}
              </Txt>
              <View style={{ flexDirection: 'row', gap: spacing(0.5), flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {Array.from({ length: teamCount }).map((_, ti) => {
                  const on = (assign[p.id] ?? 0) === ti;
                  return (
                    <Pressable
                      key={ti}
                      onPress={() => setAssign((a) => ({ ...a, [p.id]: ti }))}
                      style={[styles.teamPick, on && { backgroundColor: PLAYER_COLORS[ti % PLAYER_COLORS.length], borderColor: PLAYER_COLORS[ti % PLAYER_COLORS.length] }]}
                    >
                      <Txt size={fontSize.sm}>{TEAM_EMOJIS[ti % TEAM_EMOJIS.length]}</Txt>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          ))}
        </>
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
  teamInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    paddingVertical: spacing(0.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamPick: {
    minWidth: 34,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(0.5),
  },
});
