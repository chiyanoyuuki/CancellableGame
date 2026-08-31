import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Button, Card, Chip, HowToPlay, PlayerAvatar, PlayerUnseenList, Segmented, SectionHeader, Stepper, Txt } from '../../components/ui';
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
import { countUnseenGroups, identityGroups, type QuestionHistory } from '../../core/questionSelection';
import {
  matchesQuery,
  presentPinned,
  pushRecent,
  toggleFavorite as toggleFav,
} from '../../core/universePrefs';
import { getQuestionHistory, getQuestionHistoryByPlayer, kvGetJSON, kvSetJSON } from '../../db';
import { useT } from '../../lib/i18nProvider';
import { useStore } from '../../store/StoreProvider';
import { colors, fontSize, PLAYER_COLORS, radius, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from './pool';

const TEAM_EMOJIS = ['🦁', '🐺', '🦅', '🐉', '🦈', '🐻', '🦊', '🐧', '🦖', '🐙'];
const teamKey = (name: string, i: number) => `team:${(name.trim() || `equipe-${i + 1}`).toLowerCase().replace(/\s+/g, '-')}`;

const LAST_CONFIG_KEY = 'quiz:lastConfig';
const FAVORITE_UNIVERSES_KEY = 'quiz:favoriteUniverses';
const RECENT_UNIVERSES_KEY = 'quiz:recentUniverses';

export function QuizConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const t = useT();
  const store = useStore();
  const [cfg, setCfg] = useState<QuizConfig>(DEFAULT_QUIZ_CONFIG);
  const [pool, setPool] = useState<Question[]>([]);
  const [history, setHistory] = useState<QuestionHistory>({});
  const [historyByPlayer, setHistoryByPlayer] = useState<Record<string, QuestionHistory>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [universeSearch, setUniverseSearch] = useState('');

  // --- Team mode local state (turned into cfg.teams only at launch) ----------
  const [teamCount, setTeamCount] = useState(() => Math.min(2, Math.max(1, players.length)));
  // Nom d'équipe : par défaut la concaténation des 3 premières lettres du pseudo
  // de chaque membre ; on ne mémorise que les noms saisis à la main (par index).
  const [manualNames, setManualNames] = useState<Record<number, string>>({});
  const [assign, setAssign] = useState<Record<string, number>>(() => {
    const n = Math.min(2, Math.max(1, players.length));
    const a: Record<string, number> = {};
    players.forEach((p, i) => (a[p.id] = i % n));
    return a;
  });

  // Concaténation des 3 premières lettres du pseudo de chaque membre de l'équipe.
  const autoTeamName = (i: number): string => {
    const members = players.filter((p) => (assign[p.id] ?? 0) === i);
    if (members.length === 0) return t('Équipe {n}', { n: i + 1 });
    return members.map((m) => m.name.trim().slice(0, 3)).join('');
  };

  const buildTeams = (): Team[] => {
    const teams: Team[] = [];
    for (let i = 0; i < teamCount; i++) {
      const memberIds = players.filter((p) => (assign[p.id] ?? 0) === i).map((p) => p.id);
      if (memberIds.length === 0) continue;
      const name = manualNames[i]?.trim() || autoTeamName(i);
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
    void kvGetJSON<string[]>(FAVORITE_UNIVERSES_KEY, []).then((f) => alive && setFavorites(f));
    void kvGetJSON<string[]>(RECENT_UNIVERSES_KEY, []).then((r) => alive && setRecent(r));
    void (async () => {
      const [p, h, hbp] = await Promise.all([
        getQuizPool(),
        getQuestionHistory(),
        getQuestionHistoryByPlayer(),
      ]);
      if (alive) {
        setPool(p);
        setHistory(h);
        setHistoryByPlayer(hbp);
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
          !(q.universe !== undefined && cfg.excludedUniverses.includes(q.universe)) &&
          // Version gratuite : ne compter que les univers débloqués.
          store.isUniverseUnlocked(q.universe ?? `#${q.theme}`),
      ),
    [pool, cfg.themes, cfg.difficulties, cfg.excludedUniverses, store],
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

  // --- Découvrabilité des univers : recherche + favoris + récemment joués -----
  const availableUniverses = useMemo(() => {
    const s = new Set<string>();
    for (const g of universesByTheme) for (const u of g.universes) s.add(u);
    return s;
  }, [universesByTheme]);
  const favoritePresent = useMemo(
    () => presentPinned(favorites, availableUniverses).filter((u) => matchesQuery(u, universeSearch)),
    [favorites, availableUniverses, universeSearch],
  );
  const recentPresent = useMemo(
    () =>
      presentPinned(recent, availableUniverses).filter(
        (u) => !favorites.includes(u) && matchesQuery(u, universeSearch),
      ),
    [recent, availableUniverses, universeSearch, favorites],
  );
  const filteredByTheme = useMemo(
    () =>
      universesByTheme
        .map((g) => ({ theme: g.theme, universes: g.universes.filter((u) => matchesQuery(u, universeSearch)) }))
        .filter((g) => g.universes.length > 0),
    [universesByTheme, universeSearch],
  );
  const visibleUniverses = useMemo(() => {
    const s = new Set<string>();
    for (const u of favoritePresent) s.add(u);
    for (const u of recentPresent) s.add(u);
    for (const g of filteredByTheme) for (const u of g.universes) s.add(u);
    return [...s];
  }, [favoritePresent, recentPresent, filteredByTheme]);
  const bulkSetVisible = (exclude: boolean) =>
    setCfg((c) => {
      const set = new Set(c.excludedUniverses);
      for (const u of visibleUniverses) {
        if (exclude) set.add(u);
        else set.delete(u);
      }
      return { ...c, excludedUniverses: [...set] };
    });

  const available = eligible.length;
  const unseen = useMemo(
    () => eligible.filter((q) => !history[q.id]?.timesUsed).length,
    [eligible, history],
  );

  // Inédites PAR JOUEUR : combien de questions chaque joueur n'a pas encore vues
  // avec la sélection courante (thèmes + difficultés + univers). Les groupes
  // d'identité sont pré-calculés une fois, puis comptés pour l'historique de
  // chaque joueur — pas cher même sur un gros pool.
  const unseenGroups = useMemo(() => identityGroups(eligible), [eligible]);
  const unseenByPlayer = useMemo(
    () => players.map((p) => ({ player: p, unseen: countUnseenGroups(unseenGroups, historyByPlayer[p.id] ?? {}) })),
    [players, unseenGroups, historyByPlayer],
  );

  // « Questions par joueur » × nombre de joueurs = total de la manche, plafonné
  // à ce que les filtres actuels peuvent fournir.
  const nPlayers = Math.max(1, players.length);
  const maxPerPlayer = Math.max(1, Math.floor(available / nPlayers));
  const totalQuestions = Math.min(cfg.questionsPerPlayer * nPlayers, Math.max(1, available));

  // Garde le « par joueur » dans ce que les filtres permettent.
  useEffect(() => {
    setCfg((c) => (c.questionsPerPlayer > maxPerPlayer ? { ...c, questionsPerPlayer: maxPerPlayer } : c));
  }, [maxPerPlayer]);

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

  const renderUniverseChip = (u: string) =>
    store.isUniverseUnlocked(u) ? (
      <Chip
        key={u}
        label={favorites.includes(u) ? `★ ${u}` : u}
        selected={!cfg.excludedUniverses.includes(u)}
        onPress={() => toggleUniverse(u)}
        onLongPress={() => toggleFavoriteUniverse(u)}
      />
    ) : (
      <View key={u} style={{ opacity: 0.45 }}>
        <Chip label={`🔒 ${u}`} selected={false} />
      </View>
    );

  const valid = cfg.themes.length > 0 && cfg.difficulties.length > 0 && available > 0;

  const changeTeamCount = (n: number) => {
    setTeamCount(n);
    setAssign((a) => {
      const next = { ...a };
      for (const p of players) if ((next[p.id] ?? 0) >= n) next[p.id] = (next[p.id] ?? 0) % n;
      return next;
    });
  };

  const toggleFavoriteUniverse = (u: string) => {
    setFavorites((f) => {
      const next = toggleFav(f, u);
      void kvSetJSON(FAVORITE_UNIVERSES_KEY, next);
      return next;
    });
  };

  const launch = () => {
    const teams = cfg.teamMode ? buildTeams() : [];
    const finalCfg: QuizConfig = {
      ...cfg,
      questionCount: totalQuestions,
      teams,
      teamMode: cfg.teamMode && teams.length >= 1,
    };
    void kvSetJSON(LAST_CONFIG_KEY, finalCfg);
    // Mémorise les univers réellement jouables de cette partie (raccourci
    // « récemment joués »). Ignoré si la sélection est large (voir pushRecent).
    const played = [...new Set(eligible.map((q) => q.universe).filter((u): u is string => !!u))];
    const nextRecent = pushRecent(recent, played);
    setRecent(nextRecent);
    void kvSetJSON(RECENT_UNIVERSES_KEY, nextRecent);
    onStart(finalCfg);
  };

  return (
    <View style={{ gap: spacing(1) }}>
      <HowToPlay
        lines={[
          t('Chaque joueur répond à sa propre question, à tour de rôle — ou tout le monde court sur la même en « au plus rapide ».'),
          t('Sans proposition = points pleins. Demander des propositions ou un indice coûte des points.'),
          t("Les questions déjà vues par un joueur ne reviennent qu'en dernier recours."),
          t('Active les gorgées et les défis pour pimenter la soirée ; règle un chrono si besoin.'),
        ]}
      />
      <SectionHeader title={t('Thèmes')} />
      <View style={styles.wrap}>
        {THEMES.map((th) => (
          <Chip
            key={th}
            label={t(THEME_META[th].label)}
            emoji={THEME_META[th].emoji}
            selected={cfg.themes.includes(th)}
            onPress={() => toggleTheme(th)}
          />
        ))}
      </View>

      <Txt faint size={fontSize.xs}>
        {t(
          "Astuce : chaque partie pioche des questions inédites et un maximum d'univers différents. Chaque joueur peut désactiver des univers ou des thèmes entiers dans l'écran Joueurs : il n'a alors qu'environ 2 % de chance par question d'en croiser un.",
        )}
      </Txt>

      <SectionHeader title={t('Difficulté')} />
      <View style={styles.wrap}>
        {([1, 2, 3, 4] as Difficulty[]).map((d) => (
          <Chip
            key={d}
            label={t(DIFFICULTY_LABELS[d])}
            selected={cfg.difficulties.includes(d)}
            onPress={() => toggleDifficulty(d)}
          />
        ))}
      </View>
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Difficulté adaptative 🎯')}</Txt>
            <Txt faint size={fontSize.xs}>
              {t('Chacun reçoit, à son tour, des questions à sa mesure selon ses réussites passées (mode « Chacun son tour »).')}
            </Txt>
          </View>
          <Switch
            value={cfg.adaptiveDifficulty ?? false}
            onValueChange={(v) => setCfg((c) => ({ ...c, adaptiveDifficulty: v }))}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      {universesByTheme.length > 0 && (
        <>
          <Pressable onPress={() => setShowAdvanced((v) => !v)}>
            <SectionHeader title={`${t('Options avancées — univers')} ${showAdvanced ? '▾' : '▸'}`} />
          </Pressable>
          {showAdvanced && (
            <>
              <TextInput
                style={styles.searchInput}
                value={universeSearch}
                onChangeText={setUniverseSearch}
                placeholder={t('Rechercher un univers…')}
                placeholderTextColor={colors.textFaint}
                autoCorrect={false}
              />
              <View style={[styles.wrap, { marginTop: spacing(1), marginBottom: spacing(0.5) }]}>
                <Button size="sm" variant="ghost" title={t('Tout activer')} onPress={() => bulkSetVisible(false)} />
                <Button size="sm" variant="ghost" title={t('Tout désactiver')} onPress={() => bulkSetVisible(true)} />
              </View>
              <Txt faint size={fontSize.xs} style={{ marginBottom: spacing(1) }}>
                {t('Appui long sur un univers pour le mettre en favori ★.')}
              </Txt>
              {favoritePresent.length > 0 && (
                <View style={{ marginBottom: spacing(1.5) }}>
                  <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.5) }}>
                    ★ {t('FAVORIS')}
                  </Txt>
                  <View style={styles.wrap}>{favoritePresent.map(renderUniverseChip)}</View>
                </View>
              )}
              {recentPresent.length > 0 && (
                <View style={{ marginBottom: spacing(1.5) }}>
                  <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.5) }}>
                    🕹️ {t('RÉCEMMENT JOUÉS')}
                  </Txt>
                  <View style={styles.wrap}>{recentPresent.map(renderUniverseChip)}</View>
                </View>
              )}
              {filteredByTheme.map(({ theme, universes }) => (
                <View key={theme} style={{ marginBottom: spacing(1.5) }}>
                  <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.5) }}>
                    {THEME_META[theme].emoji} {t(THEME_META[theme].label).toUpperCase()}
                  </Txt>
                  <View style={styles.wrap}>{universes.map(renderUniverseChip)}</View>
                </View>
              ))}
              {visibleUniverses.length === 0 && (
                <Txt faint size={fontSize.xs}>{t('Aucun univers ne correspond à la recherche.')}</Txt>
              )}
            </>
          )}
        </>
      )}

      <SectionHeader title={t('Questions par joueur')} />
      <Card>
        <View style={styles.row}>
          <Txt weight="700">{t('Par joueur')}</Txt>
          <Stepper
            value={cfg.questionsPerPlayer}
            min={1}
            max={maxPerPlayer}
            onChange={(v) => setCfg((c) => ({ ...c, questionsPerPlayer: v }))}
          />
        </View>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {cfg.questionsPerPlayer} × {t(nPlayers > 1 ? '{n} joueurs' : '{n} joueur', { n: nPlayers })} ={' '}
          {t(totalQuestions > 1 ? '{n} questions' : '{n} question', { n: totalQuestions })} ·{' '}
          {t('{n} dispo', { n: available })} · {t(unseen > 1 ? '{n} jamais vues' : '{n} jamais vue', { n: unseen })}
        </Txt>
      </Card>

      {players.length > 0 && (
        <>
          <SectionHeader title={t('Inédites par joueur')} />
          <PlayerUnseenList rows={unseenByPlayer} />
          <Txt faint size={fontSize.xs}>
            {t('Questions jamais vues par chaque joueur avec les thèmes, difficultés et univers choisis.')}
          </Txt>
        </>
      )}

      <SectionHeader title={t('Mode de jeu')} />
      <Segmented<TurnMode>
        value={cfg.turnMode}
        onChange={(v) => setCfg((c) => ({ ...c, turnMode: v }))}
        options={[
          { label: t('Chacun son tour'), value: 'turn' },
          { label: t('Au plus rapide'), value: 'fastest' },
        ]}
      />
      <Txt faint size={fontSize.xs}>
        {cfg.turnMode === 'turn'
          ? t('Chaque joueur répond à sa propre question, à tour de rôle.')
          : t('Tout le monde court sur la même question : le plus rapide marque (avec bonus de vitesse).')}
      </Txt>

      {cfg.turnMode === 'fastest' && (
        <Card>
          <View style={styles.row}>
            <Txt weight="700">{t('Temps par question')}</Txt>
            <Stepper
              value={Math.round(cfg.fastestTimeLimitMs / 1000)}
              min={5}
              max={60}
              step={5}
              onChange={(v) => setCfg((c) => ({ ...c, fastestTimeLimitMs: v * 1000 }))}
            />
          </View>
          <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
            {t("secondes — plus c'est rapide, plus le bonus est gros")}
          </Txt>
        </Card>
      )}

      <SectionHeader title={t('Équipes')} />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Mode équipe 👥')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Le tour passe à une équipe, pas à un joueur. Les univers évités par les joueurs sont ignorés.')}</Txt>
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
              <Txt weight="700">{t("Nombre d'équipes")}</Txt>
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
                    value={manualNames[ti] ?? autoTeamName(ti)}
                    onChangeText={(t) => setManualNames((m) => ({ ...m, [ti]: t }))}
                    placeholder={autoTeamName(ti)}
                    placeholderTextColor={colors.textFaint}
                    style={styles.teamInput}
                  />
                </View>
                <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
                  {members.length > 0 ? members.map((m) => `${m.emoji} ${m.name}`).join('  ·  ') : t('Aucun joueur')}
                </Txt>
              </Card>
            );
          })}

          <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(0.5) }}>
            {t('RÉPARTITION DES JOUEURS')}
          </Txt>
          {players.map((p) => (
            <Card key={p.id} style={[styles.row, { gap: spacing(1) }]}>
              <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={32} />
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

      <SectionHeader title={t('Réponses & aide')} />
      <Card>
        <Txt weight="700">{t('Réponse libre par défaut')}</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t(
            "Chaque question démarre sans proposition (points pleins). Pendant la question, des boutons permettent de demander de l'aide — au prix de points :",
          )}
        </Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          {t('• 4 propositions → points ÷ 2\n• 2 propositions → points ÷ 4\n• un indice → points ÷ 1,5 (cumulable)')}
        </Txt>
      </Card>

      <SectionHeader title={t('Chrono par question')} />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Chrono informatif ⏱')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Compte à rebours affiché, sans pénalité (0 = désactivé)')}</Txt>
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
          {cfg.questionTimerSec > 0 ? t('{n} s par question', { n: cfg.questionTimerSec }) : t('Désactivé')}
        </Txt>
      </Card>

      {cfg.questionTimerSec > 0 && (
        <Card>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Txt weight="700">{t('Réponse fausse au temps écoulé ❌')}</Txt>
              <Txt faint size={fontSize.xs}>
                {t(
                  "À la fin du chrono, une réponse fausse est enregistrée automatiquement (le joueur du tour ; « personne n'a trouvé » en mode au plus rapide).",
                )}
              </Txt>
            </View>
            <Switch
              value={cfg.autoWrongOnTimeout ?? false}
              onValueChange={(v) => setCfg((c) => ({ ...c, autoWrongOnTimeout: v }))}
              trackColor={{ true: colors.danger, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        </Card>
      )}

      <SectionHeader title={t('Options')} />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Gorgées 🍻')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Gorgées à boire / distribuer selon les réponses')}</Txt>
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
            <Txt weight="700">{t('Défis 🎲')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Cartes « Défi ! » proposées entre les questions')}</Txt>
          </View>
          <Switch
            value={cfg.challengesEnabled ?? true}
            onValueChange={(v) => setCfg((c) => ({ ...c, challengesEnabled: v }))}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
        <View style={[styles.row, { marginTop: spacing(1.5) }]}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t("Afficher l'univers")}</Txt>
            <Txt faint size={fontSize.xs}>{t("Montrer l'univers pendant la partie (ex. « Naruto »)")}</Txt>
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
      <Button title={t('Lancer la partie')} emoji="🚀" size="lg" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          {t('Choisis au moins un thème et une difficulté.')}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  searchInput: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(1),
  },
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
