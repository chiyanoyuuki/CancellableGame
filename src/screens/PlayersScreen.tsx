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
  getPlayerUnwantedThemes,
  getQuestionHistoryByPlayer,
  listPlayers,
  restorePlayer,
  setPlayerUnwantedThemes,
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

  // Per-player unwanted THEMES (a question a ~1 % de chance d'en venir quand même).
  const [pool, setPool] = useState<Question[]>([]);
  const [historyByPlayer, setHistoryByPlayer] = useState<Record<string, QuestionHistory>>({});
  const [unwanted, setUnwanted] = useState<Record<string, Theme[]>>({});
  const [unwantedPlayer, setUnwantedPlayer] = useState<Player | null>(null);
  const [unwantedDraft, setUnwantedDraft] = useState<Set<Theme>>(new Set());

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [p, u, h] = await Promise.all([getQuizPool(), getPlayerUnwantedThemes(), getQuestionHistoryByPlayer()]);
      if (alive) {
        setPool(p);
        setUnwanted(u);
        setHistoryByPlayer(h);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Themes that actually have questions in the pool, in the canonical order.
  const availableThemes = useMemo(() => {
    const present = new Set<Theme>();
    for (const q of pool) present.add(q.theme);
    return THEMES.filter((t) => present.has(t));
  }, [pool]);

  // Questions inédites (jamais vues par ce joueur) qui restent tirables une fois
  // les thèmes non souhaités du brouillon écartés — recalculé en direct.
  const unseenRemaining = useMemo(() => {
    if (!unwantedPlayer) return 0;
    const seen = new Set(Object.keys(historyByPlayer[unwantedPlayer.id] ?? {}));
    let count = 0;
    for (const q of pool) {
      if (unwantedDraft.has(q.theme)) continue;
      if (seen.has(q.id)) continue;
      count++;
    }
    return count;
  }, [unwantedPlayer, historyByPlayer, pool, unwantedDraft]);

  const openUnwanted = (p: Player) => {
    setUnwantedPlayer(p);
    setUnwantedDraft(new Set(unwanted[p.id] ?? []));
  };
  const toggleUnwanted = (t: Theme) =>
    setUnwantedDraft((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  const saveUnwanted = async () => {
    if (!unwantedPlayer) return;
    const list = [...unwantedDraft];
    const next = { ...unwanted, [unwantedPlayer.id]: list };
    if (list.length === 0) delete next[unwantedPlayer.id];
    setUnwanted(next);
    setUnwantedPlayer(null);
    await setPlayerUnwantedThemes(next);
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
      { text: 'Thèmes non souhaités', onPress: () => openUnwanted(p) },
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
              {(unwanted[p.id]?.length ?? 0) > 0 && (
                <Txt faint size={fontSize.xs}>
                  🚫 évite {unwanted[p.id]!.length} thème{unwanted[p.id]!.length > 1 ? 's' : ''}
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
            Thèmes non souhaités
          </Txt>
          <Txt dim size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
            {unwantedPlayer?.name} ne tombera quasiment jamais sur ces thèmes : environ 1 % de chance par question,
            juste pour la surprise.
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
            <View style={styles.chipWrap}>
              {availableThemes.map((t) => (
                <Chip
                  key={t}
                  label={`${THEME_META[t].emoji} ${THEME_META[t].label}`}
                  selected={unwantedDraft.has(t)}
                  onPress={() => toggleUnwanted(t)}
                  color={colors.danger}
                />
              ))}
            </View>
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1) }}>
            <Button title="Annuler" variant="ghost" onPress={() => setUnwantedPlayer(null)} style={{ flex: 1 }} />
            <Button title="Enregistrer" onPress={saveUnwanted} style={{ flex: 1 }} />
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
