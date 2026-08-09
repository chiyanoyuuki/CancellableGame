import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Button, Card, PlayerAvatar, Screen, Txt } from '../components/ui';
import { REMOTE_PROFILE_CONFIGURED, REMOTE_PROFILE_URL } from '../config';
import { decodeProfile } from '../core/profileCodec';
import {
  createPlayer,
  getPlayerUnwantedUniverses,
  listPlayers,
  setPlayerUnwantedUniverses,
} from '../db';
import type { RootStackParamList } from '../navigation';
import { useStore } from '../store/StoreProvider';
import { canAddProfile } from '../store/products';
import { colors, fontSize, radius, spacing } from '../theme/theme';

type Imported = { name: string; emoji: string; color: string; unwanted: number };

export function RemoteProfileScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'RemoteProfile'>) {
  const store = useStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [imported, setImported] = useState<Imported[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  // Verrou anti-rebond : la caméra émet plusieurs fois le même QR par seconde.
  const busyRef = useRef(false);

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

  const onScanned = async (raw: string) => {
    if (busyRef.current) return;
    busyRef.current = true;

    const profile = decodeProfile(raw);
    if (!profile) {
      setFeedback({ ok: false, text: 'QR non reconnu. Assure-toi que c’est bien un profil Cancellable.' });
      setScanning(false);
      return;
    }

    // Respecte la limite de profils de la version gratuite.
    const active = await listPlayers(false);
    if (!canAddProfile(active.length, store.ent)) {
      setScanning(false);
      setFeedback({ ok: false, text: `Limite de ${active.length} profils atteinte. Débloque les profils illimités dans la Boutique.` });
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

    setImported((prev) => [
      { name: player.name, emoji: player.emoji, color: player.color, unwanted: profile.unwanted.length },
      ...prev,
    ]);
    setFeedback({ ok: true, text: `${player.name} ajouté !` });
    setScanning(false);
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

  return (
    <Screen title="Profil à distance" onBack={() => navigation.goBack()} scroll>
      <Card accent={colors.accent}>
        <Txt weight="800">📲 Chacun son profil, en même temps</Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
          Les invités scannent le QR ci-dessous, remplissent leur profil dans leur navigateur
          (sans installer l'appli), puis te montrent leur propre QR. Tu le scannes ici pour l'ajouter.
          Rien ne passe par Internet : le profil est transporté par le QR.
        </Txt>
      </Card>

      <View style={styles.qrWrap}>
        {REMOTE_PROFILE_CONFIGURED ? (
          <>
            <View style={styles.qrBox}>
              <QRCode value={REMOTE_PROFILE_URL} size={200} />
            </View>
            <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(1) }}>
              1. Les invités scannent ce QR pour ouvrir le formulaire.
            </Txt>
          </>
        ) : (
          <Card>
            <Txt weight="700" color={colors.warning}>URL du formulaire non configurée</Txt>
            <Txt faint size={fontSize.xs} style={{ marginTop: spacing(0.5) }}>
              Hébergez `webform/profil.html` puis renseignez son adresse dans `REMOTE_PROFILE_URL`
              (src/config.ts) pour afficher le QR d'accès.
            </Txt>
          </Card>
        )}
      </View>

      <View style={{ height: spacing(1) }} />
      <Button title="Scanner un profil" emoji="📷" size="lg" variant="accent" onPress={() => void openScanner()} />
      <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(1) }}>
        2. Quand un invité a fini, scanne le QR qu'il affiche.
      </Txt>

      {feedback && (
        <Card accent={feedback.ok ? colors.success : colors.danger} style={{ marginTop: spacing(2) }}>
          <Txt weight="700" color={feedback.ok ? colors.success : colors.danger}>
            {feedback.ok ? '✅ ' : '⚠️ '}
            {feedback.text}
          </Txt>
        </Card>
      )}

      {imported.length > 0 && (
        <View style={{ marginTop: spacing(2) }}>
          <Txt faint size={fontSize.xs} weight="800" style={{ marginBottom: spacing(1) }}>
            AJOUTÉS CETTE SESSION ({imported.length})
          </Txt>
          {imported.map((p, i) => (
            <View key={`${p.name}-${i}`} style={styles.row}>
              <PlayerAvatar emoji={p.emoji} color={p.color} size={32} />
              <View style={{ flex: 1 }}>
                <Txt weight="700">{p.name}</Txt>
                <Txt faint size={fontSize.xs}>
                  {p.unwanted > 0 ? `${p.unwanted} univers exclus` : 'Tous les univers gardés'}
                </Txt>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  qrWrap: { alignItems: 'center', marginTop: spacing(2) },
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
});
