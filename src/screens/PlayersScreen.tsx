import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Chip, PlayerAvatar, Screen, SectionHeader, Txt } from '../components/ui';
import type { Player } from '../core/models';
import {
  archivePlayer,
  createPlayer,
  deletePlayerForever,
  listPlayers,
  restorePlayer,
  updatePlayer,
} from '../db';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, PLAYER_COLORS, PLAYER_EMOJIS, radius, spacing } from '../theme/theme';

export function PlayersScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Players'>) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(PLAYER_EMOJIS[0] as string);
  const [color, setColor] = useState(PLAYER_COLORS[0] as string);
  const [editingId, setEditingId] = useState<string | null>(null);

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
            <Txt weight="700" style={{ flex: 1 }}>
              {p.name}
            </Txt>
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
});
