import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Button, Card, Screen, SectionHeader, Segmented, Txt } from '../components/ui';
import { type BackupData, exportAll, getReportedCount, importAll, kvSetJSON, resetDb } from '../db';
import { useAvatarFrames } from '../lib/avatarFrames';
import { areHapticsEnabled, setHapticsEnabled } from '../lib/haptics';
import { useTextScale } from '../lib/textScale';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, spacing } from '../theme/theme';

const TEXT_SIZES = [
  { label: 'Petit', value: '0.85' },
  { label: 'Normal', value: '1' },
  { label: 'Grand', value: '1.15' },
  { label: 'Très grand', value: '1.3' },
];

export function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Settings'>) {
  const [busy, setBusy] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const { scale, setScale } = useTextScale();
  const [haptics, setHaptics] = useState(areHapticsEnabled());
  const frames = useAvatarFrames();

  const toggleHaptics = (on: boolean) => {
    setHaptics(on);
    setHapticsEnabled(on);
    void kvSetJSON('ui:haptics', on);
  };

  // Le sélecteur de taille compare des chaînes ; on prend la valeur exacte la plus proche.
  const scaleValue = TEXT_SIZES.reduce(
    (best, o) => (Math.abs(Number(o.value) - scale) < Math.abs(Number(best) - scale) ? o.value : best),
    '1',
  );

  useFocusEffect(
    useCallback(() => {
      void getReportedCount().then(setReportCount);
    }, []),
  );

  const exportData = async () => {
    try {
      setBusy(true);
      const data = await exportAll();
      const json = JSON.stringify(data, null, 2);
      const uri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}soiree-backup-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(uri, json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Sauvegarde Cancellable' });
      } else {
        Alert.alert('Sauvegarde créée', uri);
      }
    } catch (e) {
      Alert.alert('Erreur', String(e));
    } finally {
      setBusy(false);
    }
  };

  const importData = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.[0]) return;
      const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
      const data = JSON.parse(text) as BackupData;
      Alert.alert('Importer la sauvegarde ?', 'Toutes les données actuelles seront remplacées.', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Importer',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await importAll(data);
              Alert.alert('Import terminé', 'Vos données ont été restaurées.');
            } catch (e) {
              Alert.alert('Erreur', String(e));
            } finally {
              setBusy(false);
            }
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Erreur', String(e));
    }
  };

  const reset = () =>
    Alert.alert('Tout effacer ?', 'Joueurs, parties et statistiques seront définitivement supprimés.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Tout effacer',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await resetDb();
            Alert.alert('Données effacées');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  return (
    <Screen title="Réglages" onBack={() => navigation.goBack()} scroll>
      <SectionHeader title="Accessibilité & confort" />
      <Card>
        <Txt weight="700">Taille du texte</Txt>
        <View style={{ marginTop: spacing(1) }}>
          <Segmented<string> value={scaleValue} onChange={(v) => setScale(Number(v))} options={TEXT_SIZES} />
        </View>
        <Txt style={{ marginTop: spacing(1.5) }}>Aperçu : tout le monde voit bien la question ? 👀</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1), marginTop: spacing(2) }}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Vibrations 📳</Txt>
            <Txt faint size={fontSize.xs}>Retours haptiques (bonnes/mauvaises réponses, victoire…)</Txt>
          </View>
          <Switch
            value={haptics}
            onValueChange={toggleHaptics}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1), marginTop: spacing(2) }}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">Cadre de palier sur les avatars 🖼️</Txt>
            <Txt faint size={fontSize.xs}>Un anneau coloré autour de l'avatar selon le palier général du profil (nécessite le pack Hauts faits).</Txt>
          </View>
          <Switch
            value={frames.enabled}
            onValueChange={frames.setEnabled}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      <SectionHeader title="Sauvegarde" />
      <Card>
        <Txt dim size={fontSize.sm} style={{ marginBottom: spacing(1.5) }}>
          Vos stats sont conservées localement et survivent aux mises à jour de l'APK. Exportez une sauvegarde
          pour changer de téléphone ou vous prémunir d'une désinstallation.
        </Txt>
        <View style={{ gap: spacing(1) }}>
          <Button title="Exporter une sauvegarde" emoji="📤" onPress={exportData} loading={busy} />
          <Button title="Importer une sauvegarde" emoji="📥" variant="secondary" onPress={importData} disabled={busy} />
        </View>
      </Card>

      <SectionHeader title="Contenu" />
      <Card>
        <Txt dim size={fontSize.sm} style={{ marginBottom: spacing(1.5) }}>
          Le thème « Image mystère » charge de vraies photos depuis internet. Vérifiez d'un coup d'œil
          lesquelles ne s'affichent pas pour pouvoir les signaler.
        </Txt>
        <Button
          title="Vérifier les images"
          emoji="📸"
          variant="secondary"
          onPress={() => navigation.navigate('ImageCheck')}
        />
        <View style={{ height: spacing(1) }} />
        <Button
          title={reportCount > 0 ? `Questions signalées (${reportCount})` : 'Questions signalées'}
          emoji="⚠️"
          variant="secondary"
          onPress={() => navigation.navigate('ReportedQuestions')}
        />
      </Card>

      <SectionHeader title="Zone de danger" />
      <Card>
        <Button title="Tout effacer" variant="danger" onPress={reset} disabled={busy} />
      </Card>

      <SectionHeader title="À propos" />
      <Card>
        <Txt weight="800">Cancellable 🔒</Txt>
        <Txt faint size={fontSize.xs}>par Arma Cos</Txt>
        <Txt dim size={fontSize.sm}>
          Le jeu de vos soirées entre amis. D'autres mini-jeux arrivent — toutes les stats resteront connectées.
        </Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(1) }}>
          Astuce : ne désinstallez pas l'app et ne changez pas son identifiant pour conserver l'historique.
        </Txt>
      </Card>
    </Screen>
  );
}
