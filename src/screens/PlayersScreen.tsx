import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Chip, PlayerAvatar, Screen, SectionHeader, Txt } from '../components/ui';
import { THEME_META, THEMES } from '../core/models';
import type { Player, Question, Theme } from '../core/models';
import type { QuestionHistory } from '../core/questionSelection';
import {
  archivePlayer,
  createPlayer,
  deletePlayerForever,
  getPlayerChosenUniverses,
  getPlayerUnwantedUniverses,
  getQuestionHistoryByPlayer,
  listPlayers,
  restorePlayer,
  setPlayerChosenUniverses,
  setPlayerUnwantedUniverses,
  updatePlayer,
} from '../db';
import { getQuizPool } from '../games/quiz/pool';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, PLAYER_COLORS, PLAYER_EMOJIS, radius, spacing } from '../theme/theme';

export function PlayersScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Players'>) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(PLAYER_EMOJIS[0] as string);
  const [color, setColor] = useState(PLAYER_COLORS[0] as string);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Per-player unwanted UNIVERSES (a question a ~2 % de chance d'en venir quand même).
  const [pool, setPool] = useState<Question[]>([]);
  const [historyByPlayer, setHistoryByPlayer] = useState<Record<string, QuestionHistory>>({});
  const [unwanted, setUnwanted] = useState<Record<string, string[]>>({});
  const [unwantedPlayer, setUnwantedPlayer] = useState<Player | null>(null);
  const [unwantedDraft, setUnwantedDraft] = useState<Set<string>>(new Set());

  // Per-player CHOSEN (favourite) universes — pour le Duel aléatoire et les équipes.
  const [chosen, setChosen] = useState<Record<string, string[]>>({});
  const [chosenPlayer, setChosenPlayer] = useState<Player | null>(null);
  const [chosenDraft, setChosenDraft] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [p, u, h, c] = await Promise.all([
        getQuizPool(),
        getPlayerUnwantedUniverses(),
        getQuestionHistoryByPlayer(),
        getPlayerChosenUniverses(),
      ]);
      if (alive) {
        setPool(p);
        setUnwanted(u);
        setHistoryByPlayer(h);
        setChosen(c);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Catégories désactivables, groupées par thème (ordre canonique). Un thème
  // à univers propose une case par univers ; un thème sans univers (rébus,
  // énigmes, blind test…) propose une seule case pour tout le thème, avec la
  // clé « #thème ».
  const categoriesByTheme = useMemo(() => {
    const univ = new Map<Theme, Set<string>>();
    const bare = new Set<Theme>();
    const present = new Set<Theme>();
    for (const q of pool) {
      present.add(q.theme);
      if (q.universe) {
        let s = univ.get(q.theme);
        if (!s) {
          s = new Set<string>();
          univ.set(q.theme, s);
        }
        s.add(q.universe);
      } else {
        bare.add(q.theme);
      }
    }
    return THEMES.filter((t) => present.has(t))
      .map((t) => {
        const us = univ.get(t);
        const items = us
          ? [...us].sort((a, b) => a.localeCompare(b, 'fr')).map((u) => ({ key: u, label: u }))
          : [];
        if (items.length === 0 && bare.has(t)) items.push({ key: `#${t}`, label: THEME_META[t].label });
        return { theme: t, items };
      })
      .filter((g) => g.items.length > 0);
  }, [pool]);

  /** Clé d'évitement d'une question : son univers, ou « #thème » à défaut. */
  const avoidKey = (q: Question) => q.universe ?? `#${q.theme}`;

  // Questions inédites (jamais vues par ce joueur) qui restent tirables une fois
  // les catégories désactivées du brouillon écartées — recalculé en direct.
  const unseenRemaining = useMemo(() => {
    if (!unwantedPlayer) return 0;
    const seen = new Set(Object.keys(historyByPlayer[unwantedPlayer.id] ?? {}));
    let count = 0;
    for (const q of pool) {
      if (unwantedDraft.has(avoidKey(q))) continue;
      if (seen.has(q.id)) continue;
      count++;
    }
    return count;
  }, [unwantedPlayer, historyByPlayer, pool, unwantedDraft]);

  const openUnwanted = (p: Player) => {
    setUnwantedPlayer(p);
    setUnwantedDraft(new Set(unwanted[p.id] ?? []));
  };
  const toggleUnwanted = (u: string) =>
    setUnwantedDraft((prev) => {
      const next = new Set(prev);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      return next;
    });
  const saveUnwanted = async () => {
    if (!unwantedPlayer) return;
    const list = [...unwantedDraft];
    const next = { ...unwanted, [unwantedPlayer.id]: list };
    if (list.length === 0) delete next[unwantedPlayer.id];
    setUnwanted(next);
    setUnwantedPlayer(null);
    await setPlayerUnwantedUniverses(next);
  };

  // Vrais univers seulement (pas les thèmes sans univers), pour les favoris.
  const universesByTheme = useMemo(
    () =>
      categoriesByTheme
        .map(({ theme, items }) => ({ theme, items: items.filter((it) => !it.key.startsWith('#')) }))
        .filter((g) => g.items.length > 0),
    [categoriesByTheme],
  );

  const openChosen = (p: Player) => {
    setChosenPlayer(p);
    setChosenDraft(new Set(chosen[p.id] ?? []));
  };
  const toggleChosen = (u: string) =>
    setChosenDraft((prev) => {
      const next = new Set(prev);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      return next;
    });
  const saveChosen = async () => {
    if (!chosenPlayer) return;
    const list = [...chosenDraft];
    const next = { ...chosen, [chosenPlayer.id]: list };
    if (list.length === 0) delete next[chosenPlayer.id];
    setChosen(next);
    setChosenPlayer(null);
    await setPlayerChosenUniverses(next);
  };

  const refresh = useCallback(async () => {
    setPlayers(await listPlayers(showArchived));
  }, [showArchived]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setEmoji(PLAYER_EMOJIS[Math.floor(Math.random() * PLAYER_EMOJIS.length)] as string);
    setColor(PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)] as string);
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editingId) {
      await updatePlayer({ id: editingId, name: trimmed, emoji, color });
    } else {
      await createPlayer({ name: trimmed, emoji, color });
    }
    resetForm();
    await refresh();
  };

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setName(p.name);
    setEmoji(p.emoji);
    setColor(p.color);
  };

  const manage = (p: Player) => {
    Alert.alert(p.name, undefined, [
      { text: 'Modifier', onPress: () => startEdit(p) },
      { text: 'Univers favoris (Duel / Équipe)', onPress: () => openChosen(p) },
      { text: 'Univers et thèmes évités', onPress: () => openUnwanted(p) },
      {
        text: 'Archiver',
        onPress: async () => {
          await archivePlayer(p.id);
          await refresh();
        },
      },
      {
        text: 'Supprimer (efface les stats)',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Supprimer définitivement ?', `Les statistiques de ${p.name} seront effacées.`, [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Supprimer',
              style: 'destructive',
              onPress: async () => {
                await deletePlayerForever(p.id);
                await refresh();
              },
            },
          ]),
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  return (
    <>
    <Screen title="Joueurs" onBack={() => navigation.goBack()} scroll>
      <Card>
        <Txt weight="800" size={fontSize.md} style={{ marginBottom: spacing(1) }}>
          {editingId ? 'Modifier le joueur' : 'Nouveau joueur'}
        </Txt>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Prénom / pseudo"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(1.5) }}>
          AVATAR
        </Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing(0.5) }}>
          <View style={{ flexDirection: 'row', gap: spacing(1) }}>
            {PLAYER_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiBtn, emoji === e && { borderColor: colors.primary, backgroundColor: colors.cardAlt }]}
              >
                <Txt size={fontSize.lg}>{e}</Txt>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(1.5) }}>
          COULEUR
        </Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1), marginTop: spacing(0.5) }}>
          {PLAYER_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
            />
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(2), alignItems: 'center' }}>
          <PlayerAvatar emoji={emoji} color={color} />
          <Button title={editingId ? 'Enregistrer' : 'Ajouter'} onPress={submit} disabled={!name.trim()} style={{ flex: 1 }} />
          {editingId && <Button title="Annuler" variant="ghost" onPress={resetForm} />}
        </View>
      </Card>

      <SectionHeader
        title={showArchived ? 'Archivés' : 'Roster'}
        right={
          <Chip
            label={showArchived ? 'Voir actifs' : 'Voir archivés'}
            selected={showArchived}
            onPress={() => setShowArchived((v) => !v)}
          />
        }
      />

      {players.length === 0 ? (
        <Txt dim center style={{ paddingVertical: spacing(3) }}>
          {showArchived ? 'Aucun joueur archivé.' : 'Ajoute des joueurs pour commencer 👆'}
        </Txt>
      ) : (
        players.map((p) => (
          <Card key={p.id} style={styles.playerRow} accent={p.color}>
            <PlayerAvatar emoji={p.emoji} color={p.color} />
            <View style={{ flex: 1 }}>
              <Txt weight="700">{p.name}</Txt>
              {(chosen[p.id]?.length ?? 0) > 0 && (
                <Txt faint size={fontSize.xs}>
                  ⭐ {chosen[p.id]!.length} univers favori{chosen[p.id]!.length > 1 ? 's' : ''}
                </Txt>
              )}
              {(unwanted[p.id]?.length ?? 0) > 0 && (
                <Txt faint size={fontSize.xs}>
                  🚫 évite {unwanted[p.id]!.length} catégorie{unwanted[p.id]!.length > 1 ? 's' : ''}
                </Txt>
              )}
            </View>
            {showArchived ? (
              <Button
                title="Restaurer"
                size="sm"
                variant="secondary"
                onPress={async () => {
                  await restorePlayer(p.id);
                  await refresh();
                }}
              />
            ) : (
              <Button title="⋯" size="sm" variant="ghost" onPress={() => manage(p)} />
            )}
          </Card>
        ))
      )}
    </Screen>

    <Modal visible={unwantedPlayer !== null} animationType="slide" transparent onRequestClose={() => setUnwantedPlayer(null)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Txt weight="800" size={fontSize.lg}>
            Univers et thèmes
          </Txt>
          <Txt dim size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
            Tout est activé par défaut. Touche une catégorie pour la désactiver : {unwantedPlayer?.name} n'aura
            alors qu'environ 2 % de chance de tomber dessus, juste pour la surprise.
          </Txt>
          <View style={styles.counter}>
            <Txt weight="800" size={fontSize.lg} color={unseenRemaining > 0 ? colors.success : colors.danger}>
              {unseenRemaining}
            </Txt>
            <Txt dim size={fontSize.sm} style={{ flex: 1 }}>
              question{unseenRemaining > 1 ? 's' : ''} inédite{unseenRemaining > 1 ? 's' : ''} restante{unseenRemaining > 1 ? 's' : ''} pour {unwantedPlayer?.name} avec ce choix
            </Txt>
          </View>
          <ScrollView style={{ marginTop: spacing(1.5) }} contentContainerStyle={{ paddingBottom: spacing(1) }}>
            {categoriesByTheme.map(({ theme, items }) => (
              <View key={theme} style={{ marginBottom: spacing(1.5) }}>
                <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.75) }}>
                  {THEME_META[theme].emoji} {THEME_META[theme].label.toUpperCase()}
                </Txt>
                <View style={styles.chipWrap}>
                  {items.map((it) => (
                    <Chip
                      key={it.key}
                      label={it.label}
                      selected={!unwantedDraft.has(it.key)}
                      onPress={() => toggleUnwanted(it.key)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1) }}>
            <Button title="Annuler" variant="ghost" onPress={() => setUnwantedPlayer(null)} style={{ flex: 1 }} />
            <Button title="Enregistrer" onPress={saveUnwanted} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>

    <Modal visible={chosenPlayer !== null} animationType="slide" transparent onRequestClose={() => setChosenPlayer(null)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Txt weight="800" size={fontSize.lg}>
            Univers favoris de {chosenPlayer?.name}
          </Txt>
          <Txt dim size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
            Les univers que {chosenPlayer?.name} connaît le mieux. Ils servent au Duel « univers aléatoires »
            et au mode équipe, où chaque équipe joue sur les univers favoris de ses membres.
          </Txt>
          <View style={styles.counter}>
            <Txt weight="800" size={fontSize.lg} color={chosenDraft.size > 0 ? colors.success : colors.textFaint}>
              {chosenDraft.size}
            </Txt>
            <Txt dim size={fontSize.sm} style={{ flex: 1 }}>
              univers favori{chosenDraft.size > 1 ? 's' : ''} sélectionné{chosenDraft.size > 1 ? 's' : ''}
            </Txt>
          </View>
          <ScrollView style={{ marginTop: spacing(1.5) }} contentContainerStyle={{ paddingBottom: spacing(1) }}>
            {universesByTheme.map(({ theme, items }) => (
              <View key={theme} style={{ marginBottom: spacing(1.5) }}>
                <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.75) }}>
                  {THEME_META[theme].emoji} {THEME_META[theme].label.toUpperCase()}
                </Txt>
                <View style={styles.chipWrap}>
                  {items.map((it) => (
                    <Chip
                      key={it.key}
                      label={it.label}
                      selected={chosenDraft.has(it.key)}
                      onPress={() => toggleChosen(it.key)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1) }}>
            <Button title="Annuler" variant="ghost" onPress={() => setChosenPlayer(null)} style={{ flex: 1 }} />
            <Button title="Enregistrer" onPress={saveChosen} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
    </>
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
    paddingVertical: spacing(1.5),
    fontSize: fontSize.md,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: 'transparent' },
  colorDotActive: { borderColor: colors.white },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), marginBottom: spacing(1) },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing(2.5),
    maxHeight: '82%',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    marginTop: spacing(1.5),
    padding: spacing(1.5),
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
});
