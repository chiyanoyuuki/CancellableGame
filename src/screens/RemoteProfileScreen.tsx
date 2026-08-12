import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
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

// Le lien du QR de l'hôte embarque le « roster » (profils déjà connus) dans son
// ancre `#r=`, pour que chaque invité puisse retrouver son profil et voir ses
// univers déjà exclus pré-cochés. Les univers sont encodés par leur INDICE dans
// le catalogue (compact) ; `v` = taille du catalogue, garde-fou anti-décalage.
const ROSTER_MAX_LEN = 1400;

type RosterUrl = { url: string; included: number; total: number };

// Base de l'URL, avec le cache-buster `?v=` (voir REMOTE_FORM_VERSION). L'ancre
// `#r=` est ajoutée ensuite ; elle n'affecte pas le cache, d'où le `?v=`.
function formBase(): string {
  const sep = REMOTE_PROFILE_URL.includes('?') ? '&' : '?';
  return `${REMOTE_PROFILE_URL}${sep}v=${REMOTE_FORM_VERSION}`;
}

function buildRosterUrl(active: Player[], unwantedByPlayer: Record<string, string[]>): RosterUrl {
  const catalogue = getUniverseCatalogue();
  const indexOf = new Map(catalogue.map((u, i) => [u, i] as const));
  const people = active.map((p) => ({
    n: p.name,
    e: p.emoji,
    c: p.color,
    u: (unwantedByPlayer[p.id] ?? [])
      .map((u) => indexOf.get(u))
      .filter((i): i is number => i !== undefined),
  }));
  const encode = (arr: typeof people) =>
    encodeURIComponent(JSON.stringify({ v: catalogue.length, p: arr }));
  const withHash = (arr: typeof people) => `${formBase()}#r=${encode(arr)}`;
  const base = { total: people.length };

  // Le QR doit rester scannable d'écran à écran : on borne la charge utile, mais
  // on n'abandonne JAMAIS tout le roster. 1) tout (avec univers) ; 2) sinon sans
  // les univers (on garde nom + avatar pour la sélection) ; 3) sinon on tronque
  // la liste (cas rare : profils illimités et beaucoup de joueurs).
  if (people.length === 0) return { url: withHash(people), included: 0, ...base };
  if (encode(people).length <= ROSTER_MAX_LEN) {
    return { url: withHash(people), included: people.length, ...base };
  }
  const light = people.map((p) => ({ ...p, u: [] as number[] }));
  if (encode(light).length <= ROSTER_MAX_LEN) {
    return { url: withHash(light), included: light.length, ...base };
  }
  const kept: typeof light = [];
  for (const p of light) {
    if (encode([...kept, p]).length > ROSTER_MAX_LEN) break;
    kept.push(p);
  }
  return { url: withHash(kept), included: kept.length, ...base };
}

export function RemoteProfileScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'RemoteProfile'>) {
  const store = useStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [imported, setImported] = useState<Imported[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  // Verrou anti-rebond : la caméra émet plusieurs fois le même QR par seconde.
  const busyRef = useRef(false);

  // Lien encodé dans le QR de l'hôte : inclut le roster des joueurs actuels
  // (dans l'ancre `#r=`) pour que chaque invité retrouve son profil. Rafraîchi
  // à chaque affichage de l'écran et après chaque import.
  const [qrValue, setQrValue] = useState(REMOTE_PROFILE_URL);
  const [rosterInfo, setRosterInfo] = useState<{ included: number; total: number }>({ included: 0, total: 0 });

  const refreshRoster = useCallback(async () => {
    const [active, map] = await Promise.all([listPlayers(false), getPlayerUnwantedUniverses()]);
    const res = buildRosterUrl(active, map);
    setQrValue(res.url);
    setRosterInfo({ included: res.included, total: res.total });
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshRoster();
    }, [refreshRoster]),
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

  const recordImported = (p: { name: string; emoji: string; color: string }, unwanted: number, updated: boolean) => {
    setImported((prev) => [{ name: p.name, emoji: p.emoji, color: p.color, unwanted, updated }, ...prev]);
    setFeedback({ ok: true, text: updated ? `${p.name} mis à jour !` : `${p.name} ajouté !` });
    // Le nouveau/màj joueur doit apparaître dans le roster du QR de l'hôte.
    void refreshRoster();
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
    await updatePlayer({ id: existing.id, name: profile.name, emoji, color });
    const map = await getPlayerUnwantedUniverses();
    if (profile.unwanted.length > 0) map[existing.id] = profile.unwanted;
    else delete map[existing.id];
    await setPlayerUnwantedUniverses(map);
    recordImported({ name: profile.name, emoji, color }, profile.unwanted.length, true);
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
              <QRCode value={qrValue} size={240} ecl="L" />
            </View>
            <Txt
              center
              size={fontSize.xs}
              weight="800"
              color={rosterInfo.total > 0 ? colors.success : colors.textFaint}
              style={{ marginTop: spacing(1) }}
            >
              {rosterInfo.total === 0
                ? 'Aucun profil enregistré à pré-remplir pour l’instant.'
                : rosterInfo.included >= rosterInfo.total
                  ? `✓ ${rosterInfo.included} profil${rosterInfo.included > 1 ? 's' : ''} inclus dans ce QR`
                  : `✓ ${rosterInfo.included}/${rosterInfo.total} profils inclus (QR limité pour rester lisible)`}
            </Txt>
            <Txt faint size={fontSize.xs} center style={{ marginTop: spacing(0.5) }}>
              1. Les invités scannent ce QR pour ouvrir le formulaire (et retrouver leur profil).
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
                  {(p.unwanted > 0 ? `${p.unwanted} univers exclus` : 'Tous les univers gardés') +
                    (p.updated ? ' · mis à jour' : '')}
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
