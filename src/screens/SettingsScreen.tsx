import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Button, Card, Screen, SectionHeader, Segmented, Txt } from '../components/ui';
import { type BackupData, exportAll, getReportedCount, importAll, kvGetJSON, kvSetJSON, resetDb } from '../db';
import { useAvatarFrames } from '../lib/avatarFrames';
import { areHapticsEnabled, setHapticsEnabled } from '../lib/haptics';
import { isSpeechEnabled, setSpeechEnabled } from '../lib/speech';
import { cancelDailyReminder, scheduleDailyReminder } from '../lib/notifications';
import { useI18n, useT } from '../lib/i18nProvider';
import { useTextScale } from '../lib/textScale';
import type { RootStackParamList } from '../navigation';
import { colors, fontSize, spacing } from '../theme/theme';

const TEXT_SIZES = [
  { label: 'Petit', value: '0.85' },
  { label: 'Normal', value: '1' },
  { label: 'Grand', value: '1.15' },
  { label: 'Très grand', value: '1.3' },
];

const LANGUAGES = [
  { label: 'Français', value: 'fr' as const },
  { label: 'English', value: 'en' as const },
];

export function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Settings'>) {
  const t = useT();
  const { lang, setLang } = useI18n();
  const [busy, setBusy] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const { scale, setScale } = useTextScale();
  const [haptics, setHaptics] = useState(areHapticsEnabled());
  const frames = useAvatarFrames();
  const textSizeOptions = TEXT_SIZES.map((o) => ({ label: t(o.label), value: o.value }));

  const toggleHaptics = (on: boolean) => {
    setHaptics(on);
    setHapticsEnabled(on);
    void kvSetJSON('ui:haptics', on);
  };

  const [speech, setSpeech] = useState(isSpeechEnabled());
  const toggleSpeech = (on: boolean) => {
    setSpeech(on);
    setSpeechEnabled(on);
    void kvSetJSON('ui:speech', on);
  };

  const [reminder, setReminder] = useState(false);
  useEffect(() => {
    void kvGetJSON<boolean>('ui:dailyReminder', false).then(setReminder);
  }, []);
  const toggleReminder = async (on: boolean) => {
    if (on) {
      const ok = await scheduleDailyReminder(
        t('Défi du jour Cancellable'),
        t('Ton défi du jour t’attend — garde ta série ! 🔥'),
      );
      if (!ok) {
        Alert.alert(t('Notifications refusées'), t('Autorise les notifications pour recevoir le rappel.'));
        return; // on laisse l'interrupteur sur off
      }
      setReminder(true);
      void kvSetJSON('ui:dailyReminder', true);
    } else {
      await cancelDailyReminder();
      setReminder(false);
      void kvSetJSON('ui:dailyReminder', false);
    }
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
        await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: t('Sauvegarde Cancellable') });
      } else {
        Alert.alert(t('Sauvegarde créée'), uri);
      }
    } catch (e) {
      Alert.alert(t('Erreur'), String(e));
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
      Alert.alert(t('Importer la sauvegarde ?'), t('Toutes les données actuelles seront remplacées.'), [
        { text: t('Annuler'), style: 'cancel' },
        {
          text: t('Importer'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await importAll(data);
              Alert.alert(t('Import terminé'), t('Vos données ont été restaurées.'));
            } catch (e) {
              Alert.alert(t('Erreur'), String(e));
            } finally {
              setBusy(false);
            }
          },
        },
      ]);
    } catch (e) {
      Alert.alert(t('Erreur'), String(e));
    }
  };

  const reset = () =>
    Alert.alert(t('Tout effacer ?'), t('Joueurs, parties et statistiques seront définitivement supprimés.'), [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Tout effacer'),
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await resetDb();
            Alert.alert(t('Données effacées'));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  return (
    <Screen title={t('Réglages')} onBack={() => navigation.goBack()} scroll>
      <SectionHeader title={t('Langue')} />
      <Card>
        <Txt weight="700">{t("Langue de l'application")}</Txt>
        <View style={{ marginTop: spacing(1) }}>
          <Segmented value={lang} onChange={setLang} options={LANGUAGES} />
        </View>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(1) }}>
          {t('Les questions du quiz restent en français.')}
        </Txt>
      </Card>

      <SectionHeader title={t('Accessibilité & confort')} />
      <Card>
        <Txt weight="700">{t('Taille du texte')}</Txt>
        <View style={{ marginTop: spacing(1) }}>
          <Segmented<string> value={scaleValue} onChange={(v) => setScale(Number(v))} options={textSizeOptions} />
        </View>
        <Txt style={{ marginTop: spacing(1.5) }}>{t('Aperçu : tout le monde voit bien la question ? 👀')}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1), marginTop: spacing(2) }}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Vibrations 📳')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Retours haptiques (bonnes/mauvaises réponses, victoire…)')}</Txt>
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
            <Txt weight="700">{t('Lecture vocale 🔊')}</Txt>
            <Txt faint size={fontSize.xs}>{t("Lire l'énoncé des questions à voix haute (utile en soirée).")}</Txt>
          </View>
          <Switch
            value={speech}
            onValueChange={toggleSpeech}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1), marginTop: spacing(2) }}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Rappel quotidien 🔔')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Une notification à 19h pour ne pas perdre ta série.')}</Txt>
          </View>
          <Switch
            value={reminder}
            onValueChange={(on) => void toggleReminder(on)}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1), marginTop: spacing(2) }}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Cadre de palier sur les avatars 🖼️')}</Txt>
            <Txt faint size={fontSize.xs}>
              {t("Un anneau coloré autour de l'avatar selon le palier général du profil (nécessite le pack Hauts faits).")}
            </Txt>
          </View>
          <Switch
            value={frames.enabled}
            onValueChange={frames.setEnabled}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      <SectionHeader title={t('Sauvegarde')} />
      <Card>
        <Txt dim size={fontSize.sm} style={{ marginBottom: spacing(1.5) }}>
          {t(
            "Vos stats sont conservées localement et survivent aux mises à jour de l'APK. Exportez une sauvegarde pour changer de téléphone ou vous prémunir d'une désinstallation.",
          )}
        </Txt>
        <View style={{ gap: spacing(1) }}>
          <Button title={t('Exporter une sauvegarde')} emoji="📤" onPress={exportData} loading={busy} />
          <Button title={t('Importer une sauvegarde')} emoji="📥" variant="secondary" onPress={importData} disabled={busy} />
        </View>
      </Card>

      <SectionHeader title={t('Contenu')} />
      <Card>
        <Txt dim size={fontSize.sm} style={{ marginBottom: spacing(1.5) }}>
          {t(
            "Le thème « Image mystère » charge de vraies photos depuis internet. Vérifiez d'un coup d'œil lesquelles ne s'affichent pas pour pouvoir les signaler.",
          )}
        </Txt>
        <Button
          title={t('Vérifier les images')}
          emoji="📸"
          variant="secondary"
          onPress={() => navigation.navigate('ImageCheck')}
        />
        <View style={{ height: spacing(1) }} />
        <Button
          title={reportCount > 0 ? t('Questions signalées ({n})', { n: reportCount }) : t('Questions signalées')}
          emoji="⚠️"
          variant="secondary"
          onPress={() => navigation.navigate('ReportedQuestions')}
        />
      </Card>

      <SectionHeader title={t("Statistiques de l'app")} />
      <Card>
        <Txt dim size={fontSize.sm} style={{ marginBottom: spacing(1.5) }}>
          {t("L'état de la banque de questions (nombre, univers, difficultés), l'avancée de la traduction anglaise et vos totaux de parties.")}
        </Txt>
        <Button
          title={t("Voir les statistiques de l'app")}
          emoji="📊"
          variant="secondary"
          onPress={() => navigation.navigate('AppStats')}
        />
      </Card>

      <SectionHeader title={t('Zone de danger')} />
      <Card>
        <Button title={t('Tout effacer')} variant="danger" onPress={reset} disabled={busy} />
      </Card>

      <SectionHeader title={t('À propos')} />
      <Card>
        <Txt weight="800">Cancellable 🔒</Txt>
        <Txt faint size={fontSize.xs}>{t('par Arma Cos')}</Txt>
        <Txt dim size={fontSize.sm}>
          {t("Le jeu de vos soirées entre amis. D'autres mini-jeux arrivent — toutes les stats resteront connectées.")}
        </Txt>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(1) }}>
          {t("Astuce : ne désinstallez pas l'app et ne changez pas son identifiant pour conserver l'historique.")}
        </Txt>
      </Card>
    </Screen>
  );
}
