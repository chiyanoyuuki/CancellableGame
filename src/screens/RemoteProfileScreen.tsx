import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Button, Card, PlayerAvatar, Screen, Txt } from '../components/ui';
import { REMOTE_FORM_VERSION, REMOTE_PROFILE_CONFIGURED, REMOTE_PROFILE_URL } from '../config';
import type { Player } from '../core/models';
import { decodeProfile, type RemoteProfile } from '../core/profileCodec';
import {
  createPlayer,
  getPlayerUnwantedUniverses,
  listPlayers,
  setPlayerUnwantedUniverses,
  updatePlayer,
} from '../db';
import { getUniverseCatalogue } from '../games/quiz/questions/catalogue';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { canAddProfile } from '../store/products';
import { colors, fontSize, radius, spacing } from '../theme/theme';

type Imported = { name: string; emoji: string; color: string; unwanted: number; updated: boolean };

// Catalogue figé au chargement : sert à encoder les univers évités par leur
// INDICE (compact) dans les liens de mise à jour.
const CATALOGUE = getUniverseCatalogue();
const CAT_INDEX = new Map(CATALOGUE.map((u, i) => [u, i] as const));

// Base de l'URL du formulaire, avec le cache-buster `?v=` (voir
// REMOTE_FORM_VERSION) : une ancre `#r=` seule ne casse pas le cache du
// navigateur de l'invité, d'où ce paramètre qui force la page à jour.
function formBase(): string {
  const sep = REMOTE_PROFILE_URL.includes('?') ? '&' : '?';
  return `${REMOTE_PROFILE_URL}${sep}v=${REMOTE_FORM_VERSION}`;
}

// QR « créer un profil » : formulaire vierge (aucune ancre).
function createUrl(): string {
  return formBase();
}

// QR « mettre à jour » propre à UN joueur : le formulaire s'ouvre déjà rempli
// (avatar, couleur, univers évités pré-cochés). Un seul profil par QR → petit
// et toujours scannable. Le formulaire web auto-remplit quand `#r=` ne contient
// qu'un profil.
function updateUrl(p: Player, unwantedNames: string[]): string {
  const u = unwantedNames
    .map((n) => CAT_INDEX.get(n))
    .filter((i): i is number => i !== undefined);
  const payload = encodeURIComponent(
    JSON.stringify({ v: CATALOGUE.length, p: [{ n: p.name, e: p.emoji, c: p.color, u }] }),
  );
  return `${formBase()}#r=${payload}`;
}

export function RemoteProfileScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'RemoteProfile'>) {
  const store = useStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [imported, setImported] = useState<Imported[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  // Verrou anti-rebond : la caméra émet plusieurs fois le même QR par seconde.
  const busyRef = useRef(false);

  // Joueurs existants + leurs univers évités (pour les QR de mise à jour).
  const [players, setPlayers] = useState<Player[]>([]);
  const [unwanted, setUnwanted] = useState<Record<string, string[]>>({});
  // Joueur dont on affiche le QR de mise à jour en grand (modale).
  const [qrPlayer, setQrPlayer] = useState<Player | null>(null);

  const refresh = useCallback(async () => {
    const [active, map] = await Promise.all([listPlayers(false), getPlayerUnwantedUniverses()]);
    setPlayers(active);
    setUnwanted(map);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const openScanner = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setFeedback({ ok: false, text: "Accès à l'appareil photo refusé. Autorise-le dans les réglages." });
        return;
      }
    }
    setFeedback(null);
    busyRef.current = false;
    setScanning(true);
  };

  const recordImported = (p: { name: string; emoji: string; color: string }, count: number, updated: boolean) => {
    setImported((prev) => [{ name: p.name, emoji: p.emoji, color: p.color, unwanted: count, updated }, ...prev]);
    setFeedback({ ok: true, text: updated ? `${p.name} mis à jour !` : `${p.name} ajouté !` });
    // La liste des joueurs (et donc les QR de mise à jour) doit refléter l'import.
    void refresh();
  };

  // Crée un nouveau joueur (en respectant la limite de la version gratuite).
  const applyCreate = async (profile: RemoteProfile, activeCount: number) => {
    if (!canAddProfile(activeCount, store.ent)) {
      setFeedback({ ok: false, text: `Limite de ${activeCount} profils atteinte. Débloque les profils illimités dans la Boutique.` });
      return;
    }
    const player = await createPlayer({
      name: profile.name,
      emoji: profile.emoji || '🙂',
      color: profile.color || colors.primary,
    });
    if (profile.unwanted.length > 0) {
      const map = await getPlayerUnwantedUniverses();
      map[player.id] = profile.unwanted;
      await setPlayerUnwantedUniverses(map);
    }
    recordImported(player, profile.unwanted.length, false);
  };

  // Met à jour un joueur existant (avatar, couleur, univers non souhaités).
  const applyUpdate = async (existing: Player, profile: RemoteProfile) => {
    const emoji = profile.emoji || existing.emoji;
    const color = profile.color || existing.color;
    // Si le joueur a déjà une VRAIE photo, on ne la remplace jamais par un emoji :
    // un QR ne transporte pas de photo, on conserve donc l'existante.
    await updatePlayer({ id: existing.id, name: profile.name, emoji, color, photoUri: existing.photoUri });
    const map = await getPlayerUnwantedUniverses();
    if (profile.unwanted.length > 0) map[existing.id] = profile.unwanted;
    else delete map[existing.id];
    await setPlayerUnwantedUniverses(map);
    recordImported({ name: profile.name, emoji, color }, profile.unwanted.length, true);
  };

  const onScanned = async (raw: string) => {
    if (busyRef.current) return;
    busyRef.current = true;

    const profile = decodeProfile(raw, CATALOGUE);
    if (!profile) {
      setFeedback({ ok: false, text: 'QR non reconnu. Assure-toi que c’est bien un profil Cancellable.' });
      setScanning(false);
      return;
    }
    setScanning(false);

    // Pop-up de validation : on montre le nom et le nombre d'univers évités.
    const count = profile.unwanted.length;
    const summary = `${profile.emoji || '🙂'}  ${profile.name}\n${count > 0 ? `${count} univers évité${count > 1 ? 's' : ''}` : 'Aucun univers évité'}`;

    const active = await listPlayers(false);
    const existing = active.find(
      (p) => p.name.trim().toLowerCase() === profile.name.trim().toLowerCase(),
    );
    if (existing) {
      Alert.alert('Profil existant', `${summary}\n\nUn profil du même nom existe déjà.`, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Créer un nouveau', onPress: () => void applyCreate(profile, active.length) },
        { text: 'Mettre à jour', onPress: () => void applyUpdate(existing, profile) },
      ]);
      return;
    }
    Alert.alert('Ajouter ce joueur ?', summary, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Ajouter', onPress: () => void applyCreate(profile, active.length) },
    ]);
  };

  // --- Vue caméra plein écran pendant le scan ---
  if (scanning) {
    return (
      <View style={styles.scanRoot}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            void onScanned(data);
          }}
        />
        <View style={styles.scanOverlay} pointerEvents="box-none">
          <View style={styles.reticle} />
          <Txt center weight="800" color={colors.white} style={styles.scanHint}>
            Vise le QR code du profil de l'invité
          </Txt>
          <Button title="Annuler" variant="secondary" onPress={() => setScanning(false)} style={{ alignSelf: 'stretch' }} />
        </View>
      </View>
    );
  }

  if (!REMOTE_PROFILE_CONFIGURED) {
    return (
      <Screen title="Profil à distance" onBack={() => navigation.goBack()} scroll>
        <Card>
          <Txt weight="700" color={colors.warning}>URL du formulaire non configurée</Txt>
          <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
            Hébergez le dossier `webform/` puis renseignez son adresse dans `REMOTE_PROFILE_URL`
            (src/config.ts) pour afficher les QR d'accès.
          </Txt>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Profil à distance" onBack={() => navigation.goBack()} scroll>
      <Card accent={colors.accent}>
        <Txt weight="800">📲 Chacun édite son profil, sans se passer le tel</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Deux sortes de QR : un pour <Txt weight="800" size={fontSize.xs}>créer</Txt> un nouveau profil,
          et un <Txt weight="800" size={fontSize.xs}>par joueur</Txt> pour mettre à jour le sien
          (avatar et univers évités déjà pré-cochés). L'invité scanne, ajuste dans son navigateur,
          puis te montre son QR retour que tu scannes ici. Rien ne passe par Internet.
        </Txt>
      </Card>

      {/* --- Créer un profil --- */}
      <Txt weight="800" size={fontSize.xs} faint style={styles.section}>
        ➕ CRÉER UN NOUVEAU PROFIL
      </Txt>
      <View style={styles.qrWrap}>
        <View style={styles.qrBox}>
          <QRCode value={createUrl()} size={180} ecl="L" />
        </View>
        <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(1) }}>
          Un invité scanne ce QR pour créer son profil de zéro.
        </Txt>
      </View>

      {/* --- Scanner le QR retour d'un invité (à portée de main, sous le QR) --- */}
      <View style={{ height: spacing(1.5) }} />
      <Button title="Scanner un profil" emoji="📷" size="lg" variant="accent" onPress={() => void openScanner()} />
      <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(1) }}>
        Quand un invité a fini, scanne le QR qu'il affiche (création ou mise à jour).
      </Txt>
      {feedback && (
        <Card accent={feedback.ok ? colors.success : colors.danger} style={{ marginTop: spacing(1.5) }}>
          <Txt weight="700" color={feedback.ok ? colors.success : colors.danger}>
            {feedback.ok ? '✅ ' : '⚠️ '}
            {feedback.text}
          </Txt>
        </Card>
      )}

      {/* --- Mettre à jour un profil existant --- */}
      <Txt weight="800" size={fontSize.xs} faint style={styles.section}>
        ✏️ METTRE À JOUR UN JOUEUR
      </Txt>
      {players.length === 0 ? (
        <Card>
          <Txt faint size={fontSize.xs}>
            Aucun joueur pour l'instant. Crée-en d'abord (QR ci-dessus, ou écran Joueurs).
          </Txt>
        </Card>
      ) : (
        <>
          <Txt faint size={fontSize.xs} style={{ marginBottom: spacing(1) }}>
            Touche un joueur pour afficher SON QR : son profil s'ouvrira déjà rempli.
          </Txt>
          {players.map((p) => {
            const n = unwanted[p.id]?.length ?? 0;
            return (
              <Pressable
                key={p.id}
                onPress={() => setQrPlayer(p)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
              >
                <PlayerAvatar emoji={p.emoji} color={p.color} photoUri={p.photoUri} size={36} />
                <View style={{ flex: 1 }}>
                  <Txt weight="700">{p.name}</Txt>
                  <Txt faint size={fontSize.xs}>
                    {n > 0 ? `${n} univers évité${n > 1 ? 's' : ''}` : 'Aucun univers évité'}
                  </Txt>
                </View>
                <Txt weight="800" color={colors.accent}>QR ▸</Txt>
              </Pressable>
            );
          })}
        </>
      )}

      {imported.length > 0 && (
        <View style={{ marginTop: spacing(2) }}>
          <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(1) }}>
            REÇUS CETTE SESSION ({imported.length})
          </Txt>
          {imported.map((p, i) => (
            <View key={`${p.name}-${i}`} style={styles.row}>
              <PlayerAvatar emoji={p.emoji} color={p.color} size={32} />
              <View style={{ flex: 1 }}>
                <Txt weight="700">{p.name}</Txt>
                <Txt faint size={fontSize.xs}>
                  {(p.unwanted > 0 ? `${p.unwanted} univers exclus` : 'Tous les univers gardés') +
                    (p.updated ? ' · mis à jour' : ' · nouveau')}
                </Txt>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* --- Modale : QR de mise à jour d'un joueur --- */}
      <Modal
        visible={qrPlayer !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setQrPlayer(null)}
      >
        <Pressable style={styles.modalRoot} onPress={() => setQrPlayer(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {qrPlayer && (
              <>
                <View style={styles.modalHead}>
                  <PlayerAvatar emoji={qrPlayer.emoji} color={qrPlayer.color} photoUri={qrPlayer.photoUri} size={40} />
                  <Txt weight="800" size={fontSize.lg}>{qrPlayer.name}</Txt>
                </View>
                <View style={styles.qrBoxLg}>
                  <QRCode value={updateUrl(qrPlayer, unwanted[qrPlayer.id] ?? [])} size={240} ecl="L" />
                </View>
                <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(1.5) }}>
                  {qrPlayer.name} scanne ce QR : son profil s'ouvre déjà rempli. Il ajuste puis te
                  montre son QR retour, que tu scannes ici. (Tu peux aussi lui envoyer une capture.)
                </Txt>
                <Button
                  title="Fermer"
                  variant="secondary"
                  onPress={() => setQrPlayer(null)}
                  style={{ alignSelf: 'stretch', marginTop: spacing(2) }}
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing(3), marginBottom: spacing(1), letterSpacing: 1 },
  qrWrap: { alignItems: 'center' },
  qrBox: { backgroundColor: colors.white, padding: spacing(2), borderRadius: radius.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(1.5),
    marginBottom: spacing(1),
  },
  scanRoot: { flex: 1, backgroundColor: '#000' },
  scanOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: spacing(3),
    gap: spacing(2),
  },
  reticle: {
    position: 'absolute',
    top: '28%',
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: radius.lg,
  },
  scanHint: { marginBottom: spacing(1) },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(3),
  },
  modalCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing(3),
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  modalHead: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), marginBottom: spacing(2) },
  qrBoxLg: { backgroundColor: colors.white, padding: spacing(2), borderRadius: radius.md },
});
