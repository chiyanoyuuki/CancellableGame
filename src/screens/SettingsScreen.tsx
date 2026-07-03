import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Button, Card, Screen, SectionHeader, Txt } from '../components/ui';
import { type BackupData, exportAll, importAll, resetDb } from '../db';
import type { RootStackParamList } from '../navigation';
import { fontSize, spacing } from '../theme/theme';

export function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Settings'>) {
  const [busy, setBusy] = useState(false);

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
