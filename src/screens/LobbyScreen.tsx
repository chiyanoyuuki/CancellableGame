import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, EmptyState, PlayerAvatar, Screen, Txt } from '../components/ui';
import type { Player } from '../core/models';
import { getGame } from '../games/registry';
import { createPlayer, listPlayers } from '../db';
import { useT } from '../lib/i18nProvider';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { canAddProfile, FREE_PROFILE_LIMIT } from '../store/products';
import { colors, fontSize, PLAYER_COLORS, PLAYER_EMOJIS, radius, spacing } from '../theme/theme';

export function LobbyScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Lobby'>) {
  const t = useT();
  const store = useStore();
  const { gameId } = route.params;
  const game = getGame(gameId);
  const [roster, setRoster] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Création express d'un joueur sans quitter l'écran de sélection.
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(PLAYER_EMOJIS[0] as string);
  const [color, setColor] = useState(PLAYER_COLORS[0] as string);

  const refresh = useCallback(async () => {
    let list: Player[];
    try {
      list = await listPlayers(false);
    } catch {
      // lecture impossible : on garde le roster précédent
      return;
    }
    setRoster(list);
    // Aucun joueur coché par défaut : chaque nouvelle partie démarre sans
    // sélection. On garde seulement les sélections déjà faites et encore valides.
    setSelected((prev) => new Set([...prev].filter((id) => list.some((p) => p.id === id))));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openCreate = () => {
    setName('');
    setEmoji(PLAYER_EMOJIS[Math.floor(Math.random() * PLAYER_EMOJIS.length)] as string);
    setColor(PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)] as string);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Même garde que l'écran Joueurs : la version gratuite est plafonnée.
    if (!canAddProfile(roster.length, store.ent)) {
      Alert.alert(
        t('Limite de profils atteinte'),
        t('La version gratuite est limitée à {n} profils. Débloque les profils illimités dans la Boutique.', {
          n: FREE_PROFILE_LIMIT,
        }),
        [
          { text: t('Plus tard'), style: 'cancel' },
          { text: t('Boutique'), onPress: () => { setCreateOpen(false); navigation.navigate('Store'); } },
        ],
      );
      return;
    }
    try {
      const created = await createPlayer({ name: trimmed, emoji, color });
      await refresh();
      // Le nouveau joueur est coché d'office : il participe à la partie qu'on lance.
      setSelected((prev) => new Set(prev).add(created.id));
      setCreateOpen(false);
    } catch {
      Alert.alert(t('Erreur'), t('Impossible de créer le joueur.'));
    }
  };

  const activePlayers = useMemo(() => roster.filter((p) => selected.has(p.id)), [roster, selected]);
  const minPlayers = game?.minPlayers ?? 1;
  const enough = activePlayers.length >= minPlayers;

  return (
    <Screen
      title={t('Qui joue ?')}
      subtitle={game ? t(game.title) : undefined}
      onBack={() => navigation.goBack()}
      scroll
      headerRight={
        <Button title={t('Joueur')} emoji="➕" variant="secondary" size="sm" onPress={openCreate} />
      }
      footer={
        <Button
          title={t(
            activePlayers.length > 1 ? 'Configurer ({n} joueurs)' : 'Configurer ({n} joueur)',
            { n: activePlayers.length },
          )}
          size="lg"
          disabled={!enough}
          onPress={() => navigation.navigate('GameConfig', { gameId, players: activePlayers })}
        />
      }
    >
      {roster.length === 0 ? (
        <View>
          <EmptyState emoji="👥" title={t('Aucun joueur')} subtitle={t('Ajoute des joueurs avant de lancer une partie.')} />
          <Button title={t('Ajouter un joueur')} emoji="➕" onPress={openCreate} />
        </View>
      ) : (
        <View style={{ gap: spacing(1) }}>
          {!enough && (
            <Txt faint size={fontSize.xs} center>
              {t(
                minPlayers > 1 ? 'Sélectionne au moins {n} joueurs.' : 'Sélectionne au moins {n} joueur.',
                { n: minPlayers },
              )}
            </Txt>
          )}
          {roster.map((p) => {
            const on = selected.has(p.id);
            return (
              <Pressable key={p.id} onPress={() => toggle(p.id)}>
                <Card
                  accent={on ? p.color : colors.border}
                  style={[styles.row, { opacity: on ? 1 : 0.5 }]}
                >
                  <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} selected={on} playerId={p.id} />
                  <Txt weight="700" style={{ flex: 1 }}>
                    {p.name}
                  </Txt>
                  <View style={[styles.check, on && { backgroundColor: colors.success, borderColor: colors.success }]}>
                    {on && <Txt weight="900" color={colors.white}>✓</Txt>}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}

      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCreateOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Txt size={fontSize.lg} weight="800" style={{ marginBottom: spacing(1.5) }}>
                {t('Nouveau joueur')}
              </Txt>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('Prénom / pseudo')}
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                maxLength={20}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => void submitCreate()}
              />

              <Txt faint size={fontSize.xs} weight="800" style={{ marginTop: spacing(1.5) }}>
                {t('AVATAR')}
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
                {t('COULEUR')}
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
                <Button title={t('Créer')} onPress={() => void submitCreate()} disabled={!name.trim()} style={{ flex: 1 }} />
                <Button title={t('Annuler')} variant="ghost" onPress={() => setCreateOpen(false)} />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing(2.5),
    maxHeight: '82%',
  },
});
