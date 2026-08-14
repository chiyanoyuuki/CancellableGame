import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, HowToPlay, PlayerAvatar, Segmented, SectionHeader, Stepper, Txt } from '../../components/ui';
import { type DrinkIntensity, type DuelUltimeConfig, type Question, type Theme, THEME_META, THEMES } from '../../core/models';
import { pickRandomUniverses } from '../../core/duelUltimeEngine';
import { countUnseen, type QuestionHistory } from '../../core/questionSelection';
import { getPlayerUnwantedUniverses, getQuestionHistoryByPlayer } from '../../db';
import { useStore } from '../../store/StoreProvider';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from '../quiz/pool';

// Thèmes au rendu spécial (image distante) : exclus du Duel Ultime.
const EXCLUDED_THEMES: Theme[] = ['images'];

const QUESTION_OPTIONS = [5, 10, 15];

export function DuelUltimeConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const store = useStore();
  const [pool, setPool] = useState<Question[]>([]);
  const [historyByPlayer, setHistoryByPlayer] = useState<Record<string, QuestionHistory>>({});
  const [unwantedMap, setUnwantedMap] = useState<Record<string, string[]>>({});
  const [randomCount, setRandomCount] = useState(3);
  const [n, setN] = useState(10);
  const [drinksEnabled, setDrinksEnabled] = useState(true);
  const [drinkIntensity, setDrinkIntensity] = useState<DrinkIntensity>('normal');
  const [timerSec, setTimerSec] = useState(0);
  const [universesByPlayer, setUniversesByPlayer] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState<string>(players[0]?.id ?? '');

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [p, hbp, un] = await Promise.all([
        getQuizPool(),
        getQuestionHistoryByPlayer(),
        getPlayerUnwantedUniverses(),
      ]);
      if (alive) {
        setPool(p);
        setHistoryByPlayer(hbp);
        setUnwantedMap(un);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Nombre de questions pro (difficulté 4) par univers présent dans le pool.
  const proCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of pool) {
      if (!q.universe || q.difficulty !== 4 || EXCLUDED_THEMES.includes(q.theme)) continue;
      m.set(q.universe, (m.get(q.universe) ?? 0) + 1);
    }
    return m;
  }, [pool]);

  // Pool des seules questions PRO jouables (le Duel Ultime ne pioche que dedans).
  const proPool = useMemo(
    () => pool.filter((q) => q.universe && q.difficulty === 4 && !EXCLUDED_THEMES.includes(q.theme)),
    [pool],
  );

  // Inédites PAR JOUEUR : questions pro jamais vues par le joueur dans SES univers
  // choisis (chaque joueur a sa propre sélection et son propre historique).
  const unseenById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of players) {
      const sel = new Set(universesByPlayer[p.id] ?? []);
      const mine = sel.size ? proPool.filter((q) => sel.has(q.universe as string)) : [];
      m[p.id] = countUnseen(mine, historyByPlayer[p.id] ?? {});
    }
    return m;
  }, [players, universesByPlayer, proPool, historyByPlayer]);

  // Univers jouables (au moins une question pro + débloqués), groupés par thème.
  // Multi-sélection : plusieurs petits univers se combinent pour atteindre N.
  const universesByTheme = useMemo(() => {
    const byTheme = new Map<Theme, Set<string>>();
    for (const q of pool) {
      if (!q.universe || EXCLUDED_THEMES.includes(q.theme)) continue;
      if ((proCount.get(q.universe) ?? 0) < 1) continue;
      let s = byTheme.get(q.theme);
      if (!s) {
        s = new Set<string>();
        byTheme.set(q.theme, s);
      }
      s.add(q.universe);
    }
    return THEMES.filter((t) => byTheme.has(t))
      .map((t) => ({
        theme: t,
        universes: [...byTheme.get(t)!]
          .filter((u) => store.isUniverseUnlocked(u))
          .sort((a, b) => a.localeCompare(b, 'fr')),
      }))
      .filter((g) => g.universes.length > 0);
  }, [pool, proCount, store]);

  // Ajoute/retire un univers pour le joueur en cours d'édition (multi-sélection).
  const toggle = (u: string) => {
    setUniversesByPlayer((prev) => {
      const cur = prev[editing] ?? [];
      const next = cur.includes(u) ? cur.filter((x) => x !== u) : [...cur, u];
      return { ...prev, [editing]: next };
    });
  };

  // Tous les univers jouables, à plat (déjà filtrés : questions pro + débloqués).
  const allPlayableUniverses = useMemo(() => universesByTheme.flatMap((g) => g.universes), [universesByTheme]);

  // Tire au sort, POUR CHAQUE joueur, `randomCount` univers parmi ceux qu'il
  // n'évite pas dans son profil. Écrase la sélection courante ; on peut ensuite
  // ajuster à la main. Repli : un profil qui a tout évité repart de tous les
  // univers jouables, pour ne jamais laisser un joueur sans univers.
  const assignRandom = () => {
    setUniversesByPlayer((prev) => {
      const next = { ...prev };
      for (const p of players) {
        next[p.id] = pickRandomUniverses(allPlayableUniverses, unwantedMap[p.id] ?? [], randomCount, Math.random);
      }
      return next;
    });
  };

  const valid = players.length >= 1 && players.every((p) => (universesByPlayer[p.id]?.length ?? 0) > 0);

  const launch = () =>
    onStart({ universesByPlayer, questionsPerPlayer: n, drinksEnabled, drinkIntensity, questionTimerSec: timerSec } satisfies DuelUltimeConfig);

  const editingName = players.find((p) => p.id === editing)?.name ?? '';
  const editingUniverses = universesByPlayer[editing] ?? [];
  const editingProTotal = editingUniverses.reduce((sum, u) => sum + (proCount.get(u) ?? 0), 0);
  const editingUnseen = unseenById[editing] ?? 0;

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">🥊 Duel Ultime</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Chaque joueur choisit un ou plusieurs univers et affronte {n} questions pro dessus,
          <Txt weight="800" size={fontSize.xs}> sans propositions</Txt> : on révèle la réponse, tu dis
          si tu l'avais. Priorité aux questions jamais vues. Le meilleur score gagne — jouable en solo.
        </Txt>
      </Card>

      <HowToPlay
        lines={[
          'Chaque joueur choisit un ou plusieurs univers et affronte N questions pro dessus.',
          'Aucune proposition : on révèle la réponse, tu dis honnêtement si tu l\'avais.',
          'Priorité aux questions jamais vues par le joueur.',
          'Le meilleur score l\'emporte — parfait aussi en solo pour se tester.',
        ]}
      />

      <SectionHeader title="Questions par joueur" />
      <Segmented<string>
        value={String(n)}
        onChange={(v) => setN(Number(v))}
        options={QUESTION_OPTIONS.map((q) => ({ label: `${q}`, value: String(q) }))}
      />

      <SectionHeader title="Mode alcool" />
      <View style={styles.rowBetween}>
        <Txt weight="700">🍺 Gorgées</Txt>
        <Switch value={drinksEnabled} onValueChange={setDrinksEnabled} />
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

      <SectionHeader title="Chrono par question" />
      <Segmented<string>
        value={String(timerSec)}
        onChange={(v) => setTimerSec(Number(v))}
        options={[
          { label: 'Aucun', value: '0' },
          { label: '15 s', value: '15' },
          { label: '30 s', value: '30' },
          { label: '45 s', value: '45' },
        ]}
      />

      <SectionHeader title="Univers au hasard" />
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: spacing(1) }}>
            <Txt weight="700">🎲 Univers par joueur</Txt>
            <Txt faint size={fontSize.xs}>
              Tire au sort ce nombre d'univers pour chaque joueur, parmi ceux qu'il n'évite pas dans son profil.
            </Txt>
          </View>
          <Stepper value={randomCount} min={1} max={10} onChange={setRandomCount} />
        </View>
        <Button
          title={`Tirer ${randomCount} univers pour chaque joueur`}
          emoji="🎲"
          variant="secondary"
          onPress={assignRandom}
          disabled={players.length === 0 || allPlayableUniverses.length === 0}
          style={{ marginTop: spacing(1.5) }}
        />
      </Card>

      <SectionHeader title="Univers de chaque joueur (un ou plusieurs)" />
      <View style={{ gap: spacing(1) }}>
        {players.map((p) => {
          const chosen = universesByPlayer[p.id] ?? [];
          const isEditing = p.id === editing;
          const unseen = unseenById[p.id] ?? 0;
          return (
            <Pressable
              key={p.id}
              onPress={() => setEditing(p.id)}
              style={[styles.playerRow, isEditing && styles.playerRowActive]}
            >
              <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={32} />
              <View style={{ flex: 1 }}>
                <Txt weight="800">{p.name}</Txt>
                <Txt faint size={fontSize.xs} numberOfLines={1}>
                  {chosen.length ? `🎯 ${chosen.join(', ')}` : 'Univers à choisir…'}
                </Txt>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                {chosen.length > 0 && (
                  <>
                    <Txt weight="800" color={unseen > 0 ? colors.success : colors.danger}>
                      {unseen}
                    </Txt>
                    <Txt faint size={fontSize.xs}>
                      inédite{unseen > 1 ? 's' : ''}
                    </Txt>
                  </>
                )}
                {isEditing && (
                  <Txt weight="800" size={fontSize.xs} color={colors.accent}>
                    EN COURS
                  </Txt>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(0.5) }}>
        {editingUniverses.length
          ? `${editingName} : ${editingUniverses.length} univers · ${editingProTotal} questions pro dispo · ${editingUnseen} inédite${editingUnseen > 1 ? 's' : ''}${editingProTotal < n ? ` (moins que ${n})` : ''}. Touche pour ajouter/retirer.`
          : `Choisis un ou plusieurs univers pour ${editingName}.`}
      </Txt>

      {universesByTheme.map(({ theme, universes }) => (
        <View key={theme} style={{ marginBottom: spacing(0.5) }}>
          <Txt weight="800" size={fontSize.xs} faint style={{ marginBottom: spacing(0.75) }}>
            {THEME_META[theme].emoji} {THEME_META[theme].label.toUpperCase()}
          </Txt>
          <View style={styles.wrap}>
            {universes.map((u) => (
              <Chip key={u} label={u} selected={editingUniverses.includes(u)} onPress={() => toggle(u)} />
            ))}
          </View>
        </View>
      ))}

      <View style={{ height: spacing(1) }} />
      <Button title="Lancer le Duel Ultime" emoji="🥊" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          Chaque joueur doit choisir au moins un univers.
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing(0.5) },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(1.5),
    borderWidth: 2,
    borderColor: colors.border,
  },
  playerRowActive: { borderColor: colors.accent, backgroundColor: colors.cardAlt },
});
