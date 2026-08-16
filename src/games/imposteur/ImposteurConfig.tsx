import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, HowToPlay, Segmented, SectionHeader, Txt } from '../../components/ui';
import { type DrinkIntensity, type Question, type Theme, THEME_META, THEMES } from '../../core/models';
import { type ImposteurConfig, isGoodImposteurWord } from '../../core/imposteurEngine';
import { useStore } from '../../store/StoreProvider';
import { colors, fontSize, spacing } from '../../theme/theme';
import type { MiniGameConfigProps } from '../types';
import { getQuizPool } from '../quiz/pool';

const ROUND_OPTIONS = [3, 5, 7];

export function ImposteurConfigComponent({ players, onStart }: MiniGameConfigProps) {
  const store = useStore();
  const [pool, setPool] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Set<Theme> | null>(null);
  const [rounds, setRounds] = useState(5);
  const [imposterCount, setImposterCount] = useState(1);
  const [discussionSec, setDiscussionSec] = useState(90);
  const [drinksEnabled, setDrinksEnabled] = useState(true);
  const [drinkIntensity, setDrinkIntensity] = useState<DrinkIntensity>('normal');

  useEffect(() => {
    let alive = true;
    void getQuizPool().then((p) => {
      if (alive) setPool(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Nombre de mots secrets jouables par thème (réponse concrète, univers débloqué).
  const wordCountByTheme = useMemo(() => {
    const m = new Map<Theme, number>();
    for (const q of pool) {
      if (q.theme === 'images' || !q.universe) continue;
      if (!isGoodImposteurWord(q.answer)) continue;
      if (!store.isUniverseUnlocked(q.universe)) continue;
      m.set(q.theme, (m.get(q.theme) ?? 0) + 1);
    }
    return m;
  }, [pool, store]);

  const availableThemes = useMemo(
    () => THEMES.filter((t) => (wordCountByTheme.get(t) ?? 0) > 0),
    [wordCountByTheme],
  );

  // Par défaut, tous les thèmes disponibles sont sélectionnés (une fois chargés).
  useEffect(() => {
    if (selected === null && availableThemes.length > 0) setSelected(new Set(availableThemes));
  }, [availableThemes, selected]);

  const chosen = selected ?? new Set<Theme>();
  const toggleTheme = (t: Theme) =>
    setSelected((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const wordCount = useMemo(
    () => [...chosen].reduce((s, t) => s + (wordCountByTheme.get(t) ?? 0), 0),
    [chosen, wordCountByTheme],
  );

  const canTwoImposters = players.length >= 5;
  const valid = players.length >= 3 && wordCount >= 1;

  const launch = () =>
    onStart({
      themes: [...chosen],
      rounds,
      imposterCount: canTwoImposters ? imposterCount : 1,
      discussionSec,
      drinksEnabled,
      drinkIntensity,
    } satisfies ImposteurConfig);

  return (
    <View style={{ gap: spacing(1) }}>
      <Card accent={colors.accent}>
        <Txt weight="800">🕵️ L'Imposteur</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Le jeu tire un mot secret d'un univers et le montre à tous… sauf à l'imposteur, qui ne voit que
          la catégorie. Chacun donne un indice, l'imposteur bluffe, puis on vote. Pas besoin de tout savoir :
          c'est du flair et du culot.
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

      <SectionHeader title="Univers des mots secrets" />
      <Txt faint size={fontSize.xs}>
        Les mots secrets sont tirés des thèmes cochés. {wordCount} mot{wordCount > 1 ? 's' : ''} disponible
        {wordCount > 1 ? 's' : ''}.
      </Txt>
      <View style={styles.wrap}>
        {availableThemes.map((t) => (
          <Chip
            key={t}
            label={THEME_META[t].label}
            emoji={THEME_META[t].emoji}
            selected={chosen.has(t)}
            onPress={() => toggleTheme(t)}
          />
        ))}
      </View>

      <View style={{ height: spacing(1) }} />
      <Button title="Lancer L'Imposteur" emoji="🕵️" size="lg" variant="accent" onPress={launch} disabled={!valid} />
      {!valid && (
        <Txt faint size={fontSize.xs} center>
          {players.length < 3 ? 'Il faut au moins 3 joueurs.' : 'Choisis au moins un thème avec des mots.'}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing(0.5) },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
});
