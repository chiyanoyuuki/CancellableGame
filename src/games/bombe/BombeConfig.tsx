import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, Segmented, SectionHeader, Stepper, Txt } from '../../components/ui';
import {
  type BombeConfig,
  DEFAULT_BOMBE_CONFIG,
  type Difficulty,
  DIFFICULTY_LABELS,
  type DrinkIntensity,
  type Question,
  THEME_META,
  THEMES,
  type Theme,
} from '../../core/models';
import { kvGetJSON, kvSetJSON } from '../../db';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from '../quiz/pool';

const LAST_CONFIG_KEY = 'bombe:lastConfig';

export function BombeConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const [cfg, setCfg] = useState<BombeConfig>(DEFAULT_BOMBE_CONFIG);
  const [pool, setPool] = useState<Question[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    let alive = true;
    void kvGetJSON<Partial<BombeConfig>>(LAST_CONFIG_KEY, {}).then((saved) => {
      if (alive) setCfg((c) => ({ ...c, ...saved }));
    });
    void getQuizPool().then((p) => alive && setPool(p));
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
      ).length,
    [pool, cfg.themes, cfg.difficulties, cfg.excludedUniverses],
  );

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

  const set = <K extends keyof BombeConfig>(key: K, value: BombeConfig[K]) =>
    setCfg((c) => ({ ...c, [key]: value }));

  const valid = cfg.themes.length > 0 && cfg.difficulties.length > 0 && eligible > 0;

  const launch = () => {
    void kvSetJSON(LAST_CONFIG_KEY, cfg);
    onStart(cfg);
  };

  // Aperçu de la mèche moyenne pour le nombre de joueurs actuel.
  const avgFuse = Math.round(cfg.secondsPerPlayer * Math.max(1, players.length));

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">💣 La Bombe — élimination</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Un joueur au hasard commence. Réponds juste pour refiler la bombe au voisin de gauche. Erreur,
          propositions ou « passer » : la mèche raccourcit. Celui qui la tient quand elle explose est éliminé.
          Dernier survivant gagne !
        </Txt>
      </Card>

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
        {([1, 2, 3, 4] as Difficulty[]).map((d) => (
          <Chip key={d} label={DIFFICULTY_LABELS[d]} selected={cfg.difficulties.includes(d)} onPress={() => toggleDifficulty(d)} />
        ))}
      </View>
      <Txt faint size={fontSize.xs}>
        {eligible} question{eligible > 1 ? 's' : ''} disponible{eligible > 1 ? 's' : ''} avec ces filtres.
      </Txt>

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

      <SectionHeader title="La bombe" />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Secondes par joueur ⏱</Txt>
            <Txt faint size={fontSize.xs}>La mèche est tirée au hasard autour de cette valeur × le nombre de joueurs.</Txt>
          </View>
          <Stepper value={cfg.secondsPerPlayer} min={4} max={30} onChange={(v) => set('secondsPerPlayer', v)} />
        </View>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          ≈ {avgFuse} s de mèche à {players.length} joueur{players.length > 1 ? 's' : ''} au départ.
        </Txt>
      </Card>

      <SectionHeader title="Pénalités de temps" />
      <Card>
        <PenaltyRow label="Mauvaise réponse ❌" value={cfg.penaltyWrongSec} onChange={(v) => set('penaltyWrongSec', v)} />
        <PenaltyRow label="4 propositions 🔎" value={cfg.penaltyProps4Sec} onChange={(v) => set('penaltyProps4Sec', v)} />
        <PenaltyRow label="2 propositions 🔍" value={cfg.penaltyProps2Sec} onChange={(v) => set('penaltyProps2Sec', v)} />
        <PenaltyRow label="Passer la question ⏭️" value={cfg.penaltySkipSec} onChange={(v) => set('penaltySkipSec', v)} />
      </Card>

      <SectionHeader title="Gorgées" />
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Gorgées 🍻</Txt>
            <Txt faint size={fontSize.xs}>Chaque joueur éliminé boit une gorgée ou plus.</Txt>
          </View>
          <Switch
            value={cfg.drinksEnabled}
            onValueChange={(v) => set('drinksEnabled', v)}
            trackColor={{ true: colors.sip, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>
      {cfg.drinksEnabled && (
        <Segmented<DrinkIntensity>
          value={cfg.drinkIntensity}
          onChange={(v) => set('drinkIntensity', v)}
          options={[
            { label: 'Soft', value: 'soft' },
            { label: 'Normal', value: 'normal' },
            { label: 'Hardcore', value: 'hardcore' },
          ]}
        />
      )}

      <View style={{ height: spacing(1) }} />
      <Button title="Allumer la mèche" emoji="💣" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          Choisis au moins un thème et une difficulté avec des questions disponibles.
        </Txt>
      )}
    </View>
  );
}

function PenaltyRow(props: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={[styles.row, { marginBottom: spacing(1) }]}>
      <Txt weight="700" style={{ flex: 1 }}>
        {props.label}
      </Txt>
      <Stepper value={props.value} min={0} max={20} onChange={props.onChange} />
      <Txt faint size={fontSize.xs} style={{ width: 20, textAlign: 'right' }}>
        s
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) },
});
