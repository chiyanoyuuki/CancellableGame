import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Chip, PlayerAvatar, Screen, SectionHeader, Txt } from '../components/ui';
import { THEME_META, THEMES } from '../core/models';
import type { Player, Question, Theme } from '../core/models';
import {
  archivePlayer,
  createPlayer,
  deletePlayerForever,
  getPlayerAvoidance,
  listPlayers,
  restorePlayer,
  setPlayerAvoidance,
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

  // Per-player universe avoidance (soft: 50% less likely).
  const [pool, setPool] = useState<Question[]>([]);
  const [avoidance, setAvoidance] = useState<Record<string, string[]>>({});
  const [avoidPlayer, setAvoidPlayer] = useState<Player | null>(null);
  const [avoidDraft, setAvoidDraft] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [p, a] = await Promise.all([getQuizPool(), getPlayerAvoidance()]);
      if (alive) {
        setPool(p);
        setAvoidance(a);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const universesByTheme = useMemo(() => {
    const map = new Map<Theme, Set<string>>();
    for (const q of pool) {
      if (!q.universe) continue;
      const s = map.get(q.theme) ?? new Set<string>();
      s.add(q.universe);
      map.set(q.theme, s);
    }
    const out: { theme: Theme; universes: string[] }[] = [];
    for (const t of THEMES) {
      const s = map.get(t);
      if (s && s.size > 0) out.push({ theme: t, universes: [...s].sort() });
    }
    return out;
  }, [pool]);

  const openAvoid = (p: Player) => {
    setAvoidPlayer(p);
    setAvoidDraft(new Set(avoidance[p.id] ?? []));
  };
  const toggleAvoid = (u: string) =>
    setAvoidDraft((prev) => {
      const next = new Set(prev);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      return next;
    });
  const saveAvoid = async () => {
    if (!avoidPlayer) return;
    const list = [...avoidDraft];
    const next = { ...avoidance, [avoidPlayer.id]: list };
    if (list.length === 0) delete next[avoidPlayer.id];
    setAvoidance(next);
    setAvoidPlayer(null);
    await setPlayerAvoidance(next);
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
      { text: 'Univers à éviter', onPress: () => openAvoid(p) },
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
              {(avoidance[p.id]?.length ?? 0) > 0 && (
                <Txt faint size={fontSize.xs}>🚫 évite {avoidance[p.id]!.length} univers</Txt>
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

    <Modal visible={avoidPlayer !== null} animationType="slide" transparent onRequestClose={() => setAvoidPlayer(null)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Txt weight="800" size={fontSize.lg}>
            Univers à éviter
          </Txt>
          <Txt dim size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
            {avoidPlayer?.name} aura 2× moins de chances de tomber sur ces univers (ils ne sont pas exclus).
          </Txt>
          <ScrollView style={{ marginTop: spacing(1.5) }} contentContainerStyle={{ paddingBottom: spacing(1) }}>
            {universesByTheme.map(({ theme, universes }) => (
              <View key={theme} style={{ marginBottom: spacing(1.5) }}>
                <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.5) }}>
                  {THEME_META[theme].emoji} {THEME_META[theme].label.toUpperCase()}
                </Txt>
                <View style={styles.chipWrap}>
                  {universes.map((u) => (
                    <Chip key={u} label={u} selected={avoidDraft.has(u)} onPress={() => toggleAvoid(u)} />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1) }}>
            <Button title="Annuler" variant="ghost" onPress={() => setAvoidPlayer(null)} style={{ flex: 1 }} />
            <Button title="Enregistrer" onPress={saveAvoid} style={{ flex: 1 }} />
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
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
});
