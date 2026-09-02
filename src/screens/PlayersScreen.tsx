import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { Button, Card, Chip, PlayerAvatar, Screen, SectionHeader, Txt } from '../components/ui';
import { THEME_META, THEMES } from '../core/models';
import type { Player, Question, Theme } from '../core/models';
import { keepsEnoughUniverses, keptUniverses, MIN_KEPT_UNIVERSES } from '../core/profilePrefs';
import type { QuestionHistory } from '../core/questionSelection';
import { lastPlayedByPlayer, type StatAnswer, type StatResult, titlesByPlayer } from '../core/stats';
import { haptics } from '../lib/haptics';
import { useT } from '../lib/i18nProvider';
import { relativeDay } from '../lib/relativeTime';
import { exportProfile, importProfile } from '../lib/profileTransfer';
import {
  archivePlayer,
  createPlayer,
  deletePlayerForever,
  getPlayerUnwantedUniverses,
  getQuestionHistoryByPlayer,
  listArchivedPlayers,
  listPlayers,
  loadStatAnswers,
  loadStatResults,
  restorePlayer,
  setPlayerUnwantedUniverses,
  updatePlayer,
} from '../db';
import { getQuizPool } from '../games/quiz/pool';
import { UNIVERSE_ADD_ORDER } from '../games/quiz/questions';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { canAddProfile, FREE_PROFILE_LIMIT } from '../store/products';
import { colors, fontSize, PLAYER_COLORS, PLAYER_EMOJIS, radius, spacing } from '../theme/theme';

// Rang d'ancienneté d'un univers : plus l'indice est grand, plus il est récent.
const ADD_RANK = new Map(UNIVERSE_ADD_ORDER.map((key, i) => [key, i] as const));
// Au-delà de ce nombre d'exclusions, on trie par date d'ajout plutôt que par thème.
const UNWANTED_DATE_SORT_THRESHOLD = 20;

export function PlayersScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Players'>) {
  const t = useT();
  const store = useStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(PLAYER_EMOJIS[0] as string);
  const [color, setColor] = useState(PLAYER_COLORS[0] as string);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  // Choisit une vraie photo depuis la galerie et la copie dans le dossier de
  // l'app (pour qu'elle survive au redémarrage). En cas d'échec, on garde l'URI.
  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('Accès refusé'), t("Autorise l'accès aux photos dans les réglages pour choisir un avatar."));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    const src = res.canceled ? null : res.assets[0]?.uri;
    if (!src) return;
    try {
      const dir = `${FileSystem.documentDirectory}avatars`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => undefined);
      const dest = `${dir}/${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: src, to: dest });
      setPhotoUri(dest);
    } catch {
      setPhotoUri(src);
    }
  };

  // Per-player unwanted UNIVERSES (a question a ~2 % de chance d'en venir quand même).
  const [pool, setPool] = useState<Question[]>([]);
  const [historyByPlayer, setHistoryByPlayer] = useState<Record<string, QuestionHistory>>({});
  const [unwanted, setUnwanted] = useState<Record<string, string[]>>({});
  const [unwantedPlayer, setUnwantedPlayer] = useState<Player | null>(null);
  const [unwantedDraft, setUnwantedDraft] = useState<Set<string>>(new Set());
  // Menu d'actions d'un joueur (Modal : Android n'affiche que 3 boutons d'Alert).
  const [menuPlayer, setMenuPlayer] = useState<Player | null>(null);
  // Stats (tous modes / total) pour afficher le titre détenu sous chaque pseudo.
  const [statResults, setStatResults] = useState<StatResult[]>([]);
  const [statAnswers, setStatAnswers] = useState<StatAnswer[]>([]);

  // Le pool de questions ne change pas en cours de session : chargé une fois.
  // (Joueurs, univers évités et historique sont rechargés à chaque focus.)
  useEffect(() => {
    let alive = true;
    void (async () => {
      const p = await getQuizPool();
      if (alive) setPool(p);
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

  // Mêmes catégories qu'au-dessus, mais à plat et triées par date d'ajout (les
  // plus récentes d'abord) ; les univers non listés sont traités comme anciens.
  const categoriesByAge = useMemo(
    () =>
      categoriesByTheme
        .flatMap(({ theme, items }) => items.map((it) => ({ ...it, theme })))
        .sort((a, b) => (ADD_RANK.get(b.key) ?? -1) - (ADD_RANK.get(a.key) ?? -1)),
    [categoriesByTheme],
  );

  // Nombre total d'univers du catalogue (les thèmes « #… » sans univers ne comptent pas).
  const totalUniverses = useMemo(
    () => categoriesByTheme.reduce((n, g) => n + g.items.filter((it) => !it.key.startsWith('#')).length, 0),
    [categoriesByTheme],
  );

  // Sous le seuil d'exclusions, on garde le tri par thème ; au-delà, on bascule
  // sur le tri par date d'ajout pour repérer vite les derniers univers ajoutés.
  const sortUnwantedByDate =
    !!unwantedPlayer && (unwanted[unwantedPlayer.id]?.length ?? 0) >= UNWANTED_DATE_SORT_THRESHOLD;

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
    // Garde-fou : on garde toujours au moins MIN_KEPT_UNIVERSES univers non exclus.
    if (!keepsEnoughUniverses(totalUniverses, list)) return;
    const next = { ...unwanted, [unwantedPlayer.id]: list };
    if (list.length === 0) delete next[unwantedPlayer.id];
    setUnwanted(next);
    setUnwantedPlayer(null);
    await setPlayerUnwantedUniverses(next);
  };

  // Rechargé à CHAQUE focus (retour depuis « Profil à distance » après un scan
  // QR, etc.) : joueurs + univers évités + historique, pour que l'écran reflète
  // tout de suite les imports, sans avoir à quitter et revenir.
  const refresh = useCallback(async () => {
    // Le roster est la donnée CRITIQUE : on le charge À PART et on l'affiche
    // toujours, même si une donnée annexe (stats, historique, univers évités)
    // échoue ou traîne. Sinon une seule requête annexe en échec vide toute la
    // liste des profils — alors que les joueurs existent bel et bien (et
    // restent visibles dans les modes de jeu, qui ne lisent que le roster).
    try {
      const pl = await (showArchived ? listArchivedPlayers() : listPlayers(false));
      setPlayers(pl);
    } catch {
      // lecture du roster impossible : on garde la liste déjà affichée
    }
    try {
      const [u, h, sr, sa] = await Promise.all([
        getPlayerUnwantedUniverses(),
        getQuestionHistoryByPlayer(),
        loadStatResults(),
        loadStatAnswers(),
      ]);
      setUnwanted(u);
      setHistoryByPlayer(h);
      setStatResults(sr);
      setStatAnswers(sa);
    } catch {
      // stats / historique indisponibles : le roster reste affiché sans ces infos
    }
  }, [showArchived]);

  // Titre le plus prestigieux détenu par chaque joueur, sur tous les modes et
  // depuis toujours (affiché en tout petit sous le pseudo, hors partie).
  const titlesByP = useMemo(
    () => titlesByPlayer(players, statResults, statAnswers, { period: 'all' }),
    [players, statResults, statAnswers],
  );

  // Dernière partie jouée par joueur (tous modes confondus), pour l'afficher
  // sous le pseudo dans le roster.
  const lastPlayed = useMemo(() => lastPlayedByPlayer(statResults), [statResults]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setPhotoUri(undefined);
    setEmoji(PLAYER_EMOJIS[Math.floor(Math.random() * PLAYER_EMOJIS.length)] as string);
    setColor(PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)] as string);
  };

  const showProfileLimit = () =>
    Alert.alert(
      t('Limite de profils atteinte'),
      t('La version gratuite est limitée à {n} profils. Débloque les profils illimités dans la Boutique.', {
        n: FREE_PROFILE_LIMIT,
      }),
      [
        { text: t('Plus tard'), style: 'cancel' },
        { text: t('Boutique'), onPress: () => navigation.navigate('Store') },
      ],
    );

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editingId) {
      await updatePlayer({ id: editingId, name: trimmed, emoji, color, photoUri });
    } else {
      const active = await listPlayers(false);
      if (!canAddProfile(active.length, store.ent)) {
        showProfileLimit();
        return;
      }
      await createPlayer({ name: trimmed, emoji, color, photoUri });
    }
    resetForm();
    await refresh();
  };

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setName(p.name);
    setEmoji(p.emoji);
    setColor(p.color);
    setPhotoUri(p.photoUri);
  };

  // Duplique un profil : même avatar et mêmes univers évités, nom suffixé « copie ».
  const duplicatePlayer = async (p: Player) => {
    const active = await listPlayers(false);
    if (!canAddProfile(active.length, store.ent)) {
      showProfileLimit();
      return;
    }
    const copy = await createPlayer({ name: t('{name} copie', { name: p.name }), emoji: p.emoji, color: p.color });
    const src = unwanted[p.id] ?? [];
    if (src.length > 0) {
      const next = { ...unwanted, [copy.id]: [...src] };
      setUnwanted(next);
      await setPlayerUnwantedUniverses(next);
    }
    await refresh();
  };

  // Ouvre le menu d'actions (rendu via un Modal, cf. plus bas).
  const manage = (p: Player) => setMenuPlayer(p);

  const confirmDelete = (p: Player) =>
    Alert.alert(t('Supprimer définitivement ?'), t('Les statistiques de {name} seront effacées.', { name: p.name }), [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Supprimer'),
        style: 'destructive',
        onPress: async () => {
          await deletePlayerForever(p.id);
          await refresh();
        },
      },
    ]);

  const archiveToggle = async (p: Player) => {
    if (showArchived) await restorePlayer(p.id);
    else await archivePlayer(p.id);
    haptics.select();
    await refresh();
  };

  const doExportProfile = async (p: Player) => {
    try {
      await exportProfile(p.id);
    } catch (e) {
      Alert.alert(t('Erreur'), String(e));
    }
  };

  const doImportProfile = async () => {
    if (!canAddProfile(players.length, store.ent)) {
      Alert.alert(
        t('Limite atteinte'),
        t('Version gratuite limitée à {n} profils. Débloque les profils illimités dans la Boutique.', {
          n: FREE_PROFILE_LIMIT,
        }),
        [
          { text: t('Plus tard'), style: 'cancel' },
          { text: t('Boutique'), onPress: () => navigation.navigate('Store') },
        ],
      );
      return;
    }
    try {
      const imported = await importProfile();
      if (imported) {
        haptics.select();
        await refresh();
        Alert.alert(
          t('Profil importé'),
          t('{name} a été ajouté, avec ses univers évités et ses questions déjà vues.', { name: imported.name }),
        );
      }
    } catch (e) {
      Alert.alert(t('Erreur'), String(e));
    }
  };

  // Puce d'une catégorie dans le sélecteur d'univers évités. Les univers non
  // débloqués (version gratuite) sont grisés et renvoient vers la Boutique.
  const catChip = (it: { key: string; label: string; theme?: Theme }) => {
    const emoji = it.theme ? THEME_META[it.theme].emoji : undefined;
    // Un univers garde son nom (contenu) ; un thème « #… » est traduit.
    const label = it.key.startsWith('#') ? t(it.label) : it.label;
    if (!store.isUniverseUnlocked(it.key)) {
      return (
        <View key={it.key} style={{ opacity: 0.45 }}>
          <Chip label={`🔒 ${label}`} emoji={emoji} selected={false} onPress={() => navigation.navigate('Store')} />
        </View>
      );
    }
    return (
      <Chip
        key={it.key}
        label={label}
        emoji={emoji}
        selected={!unwantedDraft.has(it.key)}
        onPress={() => toggleUnwanted(it.key)}
      />
    );
  };

  return (
    <>
    <Screen title={t('Joueurs')} onBack={() => navigation.goBack()} scroll>
      <Card>
        <Txt weight="800" size={fontSize.md} style={{ marginBottom: spacing(1) }}>
          {editingId ? t('Modifier le joueur') : t('Nouveau joueur')}
        </Txt>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('Prénom / pseudo')}
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
          <Button
            title={photoUri ? t('Changer la photo') : t('Photo de profil')}
            emoji="📷"
            variant="secondary"
            onPress={() => void pickPhoto()}
            style={{ flex: 1 }}
          />
          {photoUri && <Button title={t('Retirer')} variant="ghost" onPress={() => setPhotoUri(undefined)} />}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1.5), alignItems: 'center' }}>
          <PlayerAvatar emoji={emoji} color={color} photoUri={photoUri} />
          <Button title={editingId ? t('Enregistrer') : t('Ajouter')} onPress={submit} disabled={!name.trim()} style={{ flex: 1 }} />
          {editingId && <Button title={t('Annuler')} variant="ghost" onPress={resetForm} />}
        </View>
      </Card>

      <Button
        title={t('Profil à distance (QR)')}
        emoji="📲"
        variant="secondary"
        onPress={() => navigation.navigate('RemoteProfile')}
        style={{ marginTop: spacing(1) }}
      />
      <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(0.5) }}>
        {t('Chaque invité remplit son profil sur son téléphone, tu scannes son QR.')}
      </Txt>

      {!showArchived && (
        <Button
          title={t('Importer un profil (fichier)')}
          emoji="📥"
          variant="secondary"
          onPress={() => void doImportProfile()}
          style={{ marginTop: spacing(1) }}
        />
      )}

      <SectionHeader
        title={showArchived ? t('Archivés') : 'Roster'}
        right={
          <Chip
            label={showArchived ? t('Voir actifs') : t('Voir archivés')}
            selected={showArchived}
            onPress={() => setShowArchived((v) => !v)}
          />
        }
      />

      {players.length === 0 ? (
        <Txt dim center style={{ paddingVertical: spacing(3) }}>
          {showArchived ? t('Aucun joueur archivé.') : t('Ajoute des joueurs pour commencer 👆')}
        </Txt>
      ) : (
        players.map((p) => (
          <Card key={p.id} style={styles.playerRow} accent={p.color}>
            <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} playerId={p.id} />
            <View style={{ flex: 1 }}>
              <Txt weight="700">{p.name}</Txt>
              {titlesByP[p.id]?.[0] && (
                <Txt size={fontSize.xs} weight="800" color={colors.accent} numberOfLines={1}>
                  {titlesByP[p.id]![0]!.emoji} {titlesByP[p.id]![0]!.title}
                </Txt>
              )}
              {totalUniverses > 0 && (
                <Txt faint size={fontSize.xs}>
                  {t('📚 {kept}/{total} univers', {
                    kept: keptUniverses(totalUniverses, unwanted[p.id] ?? []),
                    total: totalUniverses,
                  })}
                </Txt>
              )}
              <Txt faint size={fontSize.xs}>
                {lastPlayed[p.id] !== undefined
                  ? t('🕹️ Dernière partie : {when}', { when: relativeDay(lastPlayed[p.id]!) })
                  : t('🕹️ Jamais joué')}
              </Txt>
            </View>
            {showArchived ? (
              <Button
                title={t('Restaurer')}
                size="sm"
                variant="secondary"
                onPress={async () => {
                  await restorePlayer(p.id);
                  haptics.select();
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
            {t('Univers et thèmes')}
          </Txt>
          <Txt dim size={fontSize.sm} style={{ marginTop: spacing(0.5) }}>
            {t(
              "Tout est activé par défaut. Touche une catégorie pour la désactiver : {name} n'aura alors qu'environ 2 % de chance de tomber dessus, juste pour la surprise.",
              { name: unwantedPlayer?.name ?? '' },
            )}
          </Txt>
          <View style={styles.counter}>
            <Txt weight="800" size={fontSize.lg} color={unseenRemaining > 0 ? colors.success : colors.danger}>
              {unseenRemaining}
            </Txt>
            <Txt dim size={fontSize.sm} style={{ flex: 1 }}>
              {t(
                unseenRemaining > 1
                  ? 'questions inédites restantes pour {name} avec ce choix'
                  : 'question inédite restante pour {name} avec ce choix',
                { name: unwantedPlayer?.name ?? '' },
              )}
            </Txt>
          </View>
          {(() => {
            const kept = keptUniverses(totalUniverses, [...unwantedDraft]);
            const ok = kept >= MIN_KEPT_UNIVERSES;
            return (
              <Txt size={fontSize.sm} weight="700" color={ok ? colors.text : colors.danger} style={{ marginTop: spacing(0.5) }}>
                {t('📚 {kept}/{total} univers gardés', { kept, total: totalUniverses })}
                {!ok ? ` — minimum ${MIN_KEPT_UNIVERSES}` : ''}
              </Txt>
            );
          })()}
          {sortUnwantedByDate && (
            <Txt faint size={fontSize.xs} style={{ marginTop: spacing(1) }}>
              {t('🆕 Triés par ajout : les univers les plus récents en premier.')}
            </Txt>
          )}
          <ScrollView style={{ marginTop: spacing(1.5) }} contentContainerStyle={{ paddingBottom: spacing(1) }}>
            {sortUnwantedByDate ? (
              <View style={styles.chipWrap}>{categoriesByAge.map((it) => catChip(it))}</View>
            ) : (
              categoriesByTheme.map(({ theme, items }) => (
                <View key={theme} style={{ marginBottom: spacing(1.5) }}>
                  <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(0.75) }}>
                    {THEME_META[theme].emoji} {t(THEME_META[theme].label).toUpperCase()}
                  </Txt>
                  <View style={styles.chipWrap}>{items.map((it) => catChip({ ...it }))}</View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: spacing(1), marginTop: spacing(1) }}>
            <Button title={t('Annuler')} variant="ghost" onPress={() => setUnwantedPlayer(null)} style={{ flex: 1 }} />
            <Button
              title={t('Enregistrer')}
              onPress={saveUnwanted}
              disabled={!keepsEnoughUniverses(totalUniverses, [...unwantedDraft])}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>

    <Modal visible={!!menuPlayer} transparent animationType="fade" onRequestClose={() => setMenuPlayer(null)}>
      <Pressable style={styles.modalBackdrop} onPress={() => setMenuPlayer(null)}>
        <Pressable style={styles.menuSheet} onPress={() => {}}>
          {menuPlayer && (
            <>
              <View style={styles.menuHeader}>
                <PlayerAvatar emoji={menuPlayer.emoji} color={menuPlayer.color} photoUri={menuPlayer.photoUri} size={32} />
                <Txt weight="800" size={fontSize.lg}>
                  {menuPlayer.name}
                </Txt>
              </View>
              <Button title={t('🏅 Profil et hauts faits')} onPress={() => { const p = menuPlayer; setMenuPlayer(null); navigation.navigate('PlayerProfile', { playerId: p.id }); }} />
              <Button title={t('Modifier')} variant="secondary" onPress={() => { const p = menuPlayer; setMenuPlayer(null); startEdit(p); }} />
              <Button title={t('Dupliquer')} variant="secondary" onPress={() => { const p = menuPlayer; setMenuPlayer(null); void duplicatePlayer(p); }} />
              <Button title={t('📤 Exporter ce profil (complet)')} variant="secondary" onPress={() => { const p = menuPlayer; setMenuPlayer(null); void doExportProfile(p); }} />
              <Button title={t('Univers et thèmes évités')} variant="secondary" onPress={() => { const p = menuPlayer; setMenuPlayer(null); openUnwanted(p); }} />
              <Button title={showArchived ? t('Restaurer') : t('Archiver')} variant="secondary" onPress={() => { const p = menuPlayer; setMenuPlayer(null); void archiveToggle(p); }} />
              <Button title={t('Supprimer (efface les stats)')} variant="danger" onPress={() => { const p = menuPlayer; setMenuPlayer(null); confirmDelete(p); }} />
              <Button title={t('Annuler')} variant="ghost" onPress={() => setMenuPlayer(null)} />
            </>
          )}
        </Pressable>
      </Pressable>
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
  menuSheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing(2.5),
    gap: spacing(1),
  },
  menuHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), marginBottom: spacing(0.5) },
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
