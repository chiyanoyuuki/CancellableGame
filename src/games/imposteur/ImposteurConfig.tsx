import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, HowToPlay, Segmented, SectionHeader, Txt } from '../../components/ui';
import { type DrinkIntensity, type Question, type Theme, THEME_META, THEMES } from '../../core/models';
import { type ImposteurConfig, isGoodImposteurWord } from '../../core/imposteurEngine';
import { getPlayerUnwantedUniverses } from '../../db';
import { useStore } from '../../store/StoreProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from '../quiz/pool';

const ROUND_OPTIONS = [3, 5, 7];

export function ImposteurConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const store = useStore();
  const [pool, setPool] = useState<Question[]>([]);
  const [unwantedMap, setUnwantedMap] = useState<Record<string, string[]>>({});
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualSel, setManualSel] = useState<Set<string> | null>(null);
  const [rounds, setRounds] = useState(5);
  const [imposterCount, setImposterCount] = useState(1);
  const [discussionSec, setDiscussionSec] = useState(90);
  const [drinksEnabled, setDrinksEnabled] = useState(true);
  const [drinkIntensity, setDrinkIntensity] = useState<DrinkIntensity>('normal');

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [p, un] = await Promise.all([getQuizPool(), getPlayerUnwantedUniverses()]);
      if (alive) {
        setPool(p);
        setUnwantedMap(un);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Univers jouables : au moins un mot secret concret + débloqués. On retient
  // aussi leur thème (pour l'exclusion « #thème ») et leur nombre de mots.
  const playable = useMemo(() => {
    const words = new Map<string, number>();
    const theme = new Map<string, Theme>();
    for (const q of pool) {
      if (q.theme === 'images' || !q.universe) continue;
      if (!isGoodImposteurWord(q.answer)) continue;
      if (!store.isUniverseUnlocked(q.universe)) continue;
      words.set(q.universe, (words.get(q.universe) ?? 0) + 1);
      theme.set(q.universe, q.theme);
    }
    return { words, theme, list: [...words.keys()] };
  }, [pool, store]);

  // Univers gardés par TOUS les profils sélectionnés : aucun joueur ne l'a écarté
  // (ni l'univers, ni son thème entier « #thème ») dans son profil.
  const keptByAll = useMemo(() => {
    const sets = players.map((p) => new Set(unwantedMap[p.id] ?? []));
    return playable.list.filter((u) => {
      const t = playable.theme.get(u);
      return sets.every((un) => !un.has(u) && !(t && un.has(`#${t}`)));
    });
  }, [players, unwantedMap, playable]);

  // Pré-remplit la sélection manuelle avec les univers gardés par tous.
  useEffect(() => {
    if (manualSel === null && playable.list.length > 0) setManualSel(new Set(keptByAll));
  }, [keptByAll, playable.list.length, manualSel]);

  const manual = manualSel ?? new Set<string>();
  const toggleUniverse = (u: string) =>
    setManualSel((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      return next;
    });

  const resolved = mode === 'auto' ? keptByAll : playable.list.filter((u) => manual.has(u));
  const wordCount = resolved.reduce((s, u) => s + (playable.words.get(u) ?? 0), 0);
  const canTwoImposters = players.length >= 5;
  const valid = players.length >= 3 && resolved.length >= 1;

  const launch = () =>
    onStart({
      universes: resolved,
      rounds,
      imposterCount: canTwoImposters ? imposterCount : 1,
      discussionSec,
      drinksEnabled,
      drinkIntensity,
    } satisfies ImposteurConfig);

  // Univers jouables groupés par thème, pour la sélection manuelle.
  const byTheme = useMemo(() => {
    const m = new Map<Theme, string[]>();
    for (const u of playable.list) {
      const t = playable.theme.get(u);
      if (!t) continue;
      const arr = m.get(t) ?? [];
      arr.push(u);
      m.set(t, arr);
    }
    return THEMES.filter((t) => m.has(t)).map((t) => ({
      theme: t,
      universes: (m.get(t) as string[]).sort((a, b) => a.localeCompare(b, 'fr')),
    }));
  }, [playable]);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">🕵️ L'Imposteur</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Un mot secret est tiré d'un univers et montré à tous… sauf à l'imposteur, qui ne voit que la
          catégorie. Chacun donne un indice, l'imposteur bluffe, puis on vote.
        </Txt>
      </Card>

      <HowToPlay
        lines={[
          'On se passe le téléphone : chacun découvre le mot secret — sauf l\'imposteur.',
          'À tour de rôle, chacun dit UN indice sur le mot, ni trop clair ni trop vague.',
          'L\'imposteur ne connaît que l\'univers : il doit bluffer un indice crédible.',
          'On vote pour le suspect. Démasqué, l\'imposteur peut voler la manche en devinant le mot.',
          'Équipage gagnant : l\'imposteur boit. Imposteur gagnant : tout le monde boit.',
        ]}
      />

      <SectionHeader title="Univers des mots secrets" />
      <Segmented<'auto' | 'manual'>
        value={mode}
        onChange={setMode}
        options={[
          { label: 'Gardés par tous', value: 'auto' },
          { label: 'Je choisis', value: 'manual' },
        ]}
      />
      {mode === 'auto' ? (
        <Txt faint size={fontSize.xs}>
          Seuls les univers qu'AUCUN joueur n'a écartés dans son profil peuvent tomber.
          {' '}
          {keptByAll.length} univers · {wordCount} mot{wordCount > 1 ? 's' : ''}.
          {keptByAll.length === 0 ? ' Personne n\'a d\'univers commun : passe en « Je choisis ».' : ''}
        </Txt>
      ) : (
        <>
          <Txt faint size={fontSize.xs}>
            Touche les univers qui pourront tomber. {resolved.length} sélectionné{resolved.length > 1 ? 's' : ''} ·
            {' '}
            {wordCount} mot{wordCount > 1 ? 's' : ''}.
          </Txt>
          {byTheme.map(({ theme, universes }) => (
            <View key={theme} style={{ marginBottom: spacing(0.5) }}>
              <Txt weight="800" size={fontSize.xs} faint style={{ marginBottom: spacing(0.75) }}>
                {THEME_META[theme].emoji} {THEME_META[theme].label.toUpperCase()}
              </Txt>
              <View style={styles.wrap}>
                {universes.map((u) => (
                  <Chip key={u} label={u} selected={manual.has(u)} onPress={() => toggleUniverse(u)} />
                ))}
              </View>
            </View>
          ))}
        </>
      )}

      <SectionHeader title="Manches" />
      <Segmented<string>
        value={String(rounds)}
        onChange={(v) => setRounds(Number(v))}
        options={ROUND_OPTIONS.map((r) => ({ label: `${r}`, value: String(r) }))}
      />

      {canTwoImposters && (
        <>
          <SectionHeader title="Imposteurs par manche" />
          <Segmented<string>
            value={String(imposterCount)}
            onChange={(v) => setImposterCount(Number(v))}
            options={[
              { label: '1 imposteur', value: '1' },
              { label: '2 imposteurs', value: '2' },
            ]}
          />
        </>
      )}

      <SectionHeader title="Minuteur de discussion" />
      <Segmented<string>
        value={String(discussionSec)}
        onChange={(v) => setDiscussionSec(Number(v))}
        options={[
          { label: 'Aucun', value: '0' },
          { label: '60 s', value: '60' },
          { label: '90 s', value: '90' },
          { label: '2 min', value: '120' },
        ]}
      />

      <SectionHeader title="Mode alcool" />
      <View style={styles.rowBetween}>
        <Txt weight="700">🍺 Gorgées</Txt>
        <Switch value={drinksEnabled} onValueChange={setDrinksEnabled} trackColor={{ true: colors.sip, false: colors.border }} thumbColor={colors.white} />
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

      <View style={{ height: spacing(1) }} />
      <Button title="Lancer L'Imposteur" emoji="🕵️" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          {players.length < 3 ? 'Il faut au moins 3 joueurs.' : 'Aucun univers disponible avec ce choix.'}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing(0.5) },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
});
