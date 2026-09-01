import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Button, Card, Screen, SectionHeader, Segmented, Txt } from '../components/ui';
import { type BackupData, exportAll, getReportedCount, importAll, kvGetJSON, kvSetJSON, resetDb } from '../db';
import { useAvatarFrames } from '../lib/avatarFrames';
import { areHapticsEnabled, setHapticsEnabled } from '../lib/haptics';
import { isSpeechEnabled, setSpeechEnabled } from '../lib/speech';
import { isSoundEnabled, setSoundEnabled } from '../lib/sounds';
import { isNoAlcohol, setNoAlcohol } from '../lib/drinkMode';
import { isReduceMotion, setReduceMotion } from '../lib/motion';
import { ALL_FLAGS, type FeatureFlag, FLAG_KV, getFlag, setFlag } from '../lib/featureFlags';
import { cancelDailyReminder, scheduleDailyReminder } from '../lib/notifications';
import { currentThemeMode, setAppTheme } from '../lib/appTheme';
import type { ThemeMode } from '../theme/theme';
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

const THEMES = [
  { label: 'Sombre', value: 'dark' as const },
  { label: 'Clair', value: 'light' as const },
];

// Ligne d'interrupteur : « first » sans marge haute (1re d'une carte), sinon espacée.
const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1), marginTop: spacing(2) },
  first: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) },
});
const settingRow = rowStyles.row;
const settingRowFirst = rowStyles.first;

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

  const [sound, setSound] = useState(isSoundEnabled());
  const toggleSound = (on: boolean) => {
    setSound(on);
    setSoundEnabled(on);
    void kvSetJSON('ui:sound', on);
  };

  const [noAlcohol, setNoAlcoholState] = useState(isNoAlcohol());
  const toggleNoAlcohol = (on: boolean) => {
    setNoAlcoholState(on);
    setNoAlcohol(on);
    void kvSetJSON('ui:noAlcohol', on);
  };

  const [reduceMotion, setReduceMotionState] = useState(isReduceMotion());
  const toggleReduceMotion = (on: boolean) => {
    setReduceMotionState(on);
    setReduceMotion(on);
    void kvSetJSON('ui:reduceMotion', on);
  };

  const [feat, setFeat] = useState<Record<FeatureFlag, boolean>>(() => {
    const o = {} as Record<FeatureFlag, boolean>;
    for (const f of ALL_FLAGS) o[f] = getFlag(f);
    return o;
  });
  const toggleFeat = (f: FeatureFlag, on: boolean) => {
    setFeat((p) => ({ ...p, [f]: on }));
    setFlag(f, on);
    void kvSetJSON(FLAG_KV[f], on);
  };
  const FEATURE_LABELS: Record<FeatureFlag, { title: string; desc: string }> = {
    teamGen: { title: t("Générateur d'équipes 🧩"), desc: t("Raccourci sur l'accueil pour répartir les joueurs en équipes.") },
    streakCalendar: { title: t('Calendrier de série 📆'), desc: t("Historique visuel de tes défis du jour.") },
    weeklyRecap: { title: t('Récap de la semaine 📈'), desc: t('Carte de la semaine à partager, dans les Stats.') },
    jokers: { title: t('Jokers dans le quiz 🃏'), desc: t('50/50 et geler le chrono, en nombre limité par partie.') },
    tiebreak: { title: t('Manche de départage 🥊'), desc: t("Question surprise en cas d'égalité (Soirée & Tournoi).") },
  };

  const [theme, setTheme] = useState<ThemeMode>(currentThemeMode());
  const changeTheme = async (mode: ThemeMode) => {
    if (mode === theme) return; // déjà sélectionné
    setTheme(mode);
    const reloaded = await setAppTheme(mode);
    // En build de prod, pas de rechargement auto : on prévient l'utilisateur.
    if (!reloaded) {
      Alert.alert(t('Thème enregistré'), t("Redémarre l'application pour appliquer le nouveau thème."));
    }
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

      <SectionHeader title={t('Thème')} />
      <Card>
        <Txt weight="700">{t("Thème de l'application")}</Txt>
        <View style={{ marginTop: spacing(1) }}>
          <Segmented<ThemeMode>
            value={theme}
            onChange={(v) => void changeTheme(v)}
            options={THEMES.map((o) => ({ label: t(o.label), value: o.value }))}
          />
        </View>
        <Txt faint size={fontSize.xs} style={{ marginTop: spacing(1) }}>
          {t('Le thème sombre est idéal en soirée. Le changement redémarre l’application.')}
        </Txt>
      </Card>

      <SectionHeader title={t('Affichage')} />
      <Card>
        <Txt weight="700">{t('Taille du texte')}</Txt>
        <View style={{ marginTop: spacing(1) }}>
          <Segmented<string> value={scaleValue} onChange={(v) => setScale(Number(v))} options={textSizeOptions} />
        </View>
        <Txt style={{ marginTop: spacing(1.5) }}>{t('Aperçu : tout le monde voit bien la question ? 👀')}</Txt>
        <View style={settingRow}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Animations réduites 🍃')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Coupe le splash, les transitions et la roue (confort et perf).')}</Txt>
          </View>
          <Switch value={reduceMotion} onValueChange={toggleReduceMotion} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} />
        </View>
        <View style={settingRow}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Cadre de palier sur les avatars 🖼️')}</Txt>
            <Txt faint size={fontSize.xs}>
              {t("Un anneau coloré autour de l'avatar selon le palier général du profil (nécessite le pack Hauts faits).")}
            </Txt>
          </View>
          <Switch value={frames.enabled} onValueChange={frames.setEnabled} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} />
        </View>
      </Card>

      <SectionHeader title={t('Son & vibrations')} />
      <Card>
        <View style={settingRowFirst}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Vibrations 📳')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Retours haptiques (bonnes/mauvaises réponses, victoire…)')}</Txt>
          </View>
          <Switch value={haptics} onValueChange={toggleHaptics} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} />
        </View>
        <View style={settingRow}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Lecture vocale 🔊')}</Txt>
            <Txt faint size={fontSize.xs}>{t("Lire l'énoncé des questions à voix haute (utile en soirée).")}</Txt>
          </View>
          <Switch value={speech} onValueChange={toggleSpeech} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} />
        </View>
        <View style={settingRow}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Effets sonores 🎶')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Petits sons de jeu (bonne/mauvaise réponse, compte à rebours, victoire).')}</Txt>
          </View>
          <Switch value={sound} onValueChange={toggleSound} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} />
        </View>
      </Card>

      <SectionHeader title={t('Notifications')} />
      <Card>
        <View style={settingRowFirst}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Rappel quotidien 🔔')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Une notification à 19h pour ne pas perdre ta série.')}</Txt>
          </View>
          <Switch value={reminder} onValueChange={(on) => void toggleReminder(on)} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} />
        </View>
      </Card>

      <SectionHeader title={t('Soirée')} />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1) }}>
          <View style={{ flex: 1 }}>
            <Txt weight="700">{t('Sans alcool 🚫🍺')}</Txt>
            <Txt faint size={fontSize.xs}>{t('Les nouveaux modes démarrent sans gorgées et la Roue s’ouvre sur les gages soft.')}</Txt>
          </View>
          <Switch
            value={noAlcohol}
            onValueChange={toggleNoAlcohol}
            trackColor={{ true: colors.success, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      <SectionHeader title={t('Fonctionnalités')} />
      <Card>
        <Txt dim size={fontSize.sm} style={{ marginBottom: spacing(1) }}>
          {t('Active ou masque les extras. Tout est activé par défaut.')}
        </Txt>
        {ALL_FLAGS.map((f, i) => (
          <View
            key={f}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(1), marginTop: i === 0 ? 0 : spacing(2) }}
          >
            <View style={{ flex: 1 }}>
              <Txt weight="700">{FEATURE_LABELS[f].title}</Txt>
              <Txt faint size={fontSize.xs}>{FEATURE_LABELS[f].desc}</Txt>
            </View>
            <Switch
              value={feat[f]}
              onValueChange={(on) => toggleFeat(f, on)}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        ))}
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
