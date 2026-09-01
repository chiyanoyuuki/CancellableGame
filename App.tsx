import { DarkTheme, DefaultTheme, type InitialState, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplash } from './src/components/AnimatedSplash';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initDatabase, kvGetJSON, mostRecentSavedGame } from './src/db';
import { AvatarFramesProvider } from './src/lib/avatarFrames';
import { setHapticsEnabled } from './src/lib/haptics';
import { setSpeechEnabled } from './src/lib/speech';
import { setSoundEnabled } from './src/lib/sounds';
import { setNoAlcohol } from './src/lib/drinkMode';
import { isReduceMotion, setReduceMotion } from './src/lib/motion';
import { scheduleDailyReminder } from './src/lib/notifications';
import { I18nProvider } from './src/lib/i18nProvider';
import { TextScaleProvider } from './src/lib/textScale';
import type { RootStackParamList } from './src/navigation';
import { GameConfigScreen } from './src/screens/GameConfigScreen';
import { GamePlayScreen } from './src/screens/GamePlayScreen';
import { GameSelectScreen } from './src/screens/GameSelectScreen';
import { CustomContentScreen } from './src/screens/CustomContentScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ImageCheckScreen } from './src/screens/ImageCheckScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PlayerProfileScreen } from './src/screens/PlayerProfileScreen';
import { AppStatsScreen } from './src/screens/AppStatsScreen';
import { PlayersScreen } from './src/screens/PlayersScreen';
import { RemoteProfileScreen } from './src/screens/RemoteProfileScreen';
import { ReportedQuestionsScreen } from './src/screens/ReportedQuestionsScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SoireeScreen } from './src/screens/SoireeScreen';
import { DailyChallengeScreen } from './src/screens/DailyChallengeScreen';
import { SoloQuizScreen } from './src/screens/SoloQuizScreen';
import { RoueScreen } from './src/screens/RoueScreen';
import { RevisionScreen } from './src/screens/RevisionScreen';
import { FaceAFaceScreen } from './src/screens/FaceAFaceScreen';
import { EntrainementScreen } from './src/screens/EntrainementScreen';
import { SeasonsScreen } from './src/screens/SeasonsScreen';
import { QotdScreen } from './src/screens/QotdScreen';
import { TournoiScreen } from './src/screens/TournoiScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { StoreScreen } from './src/screens/StoreScreen';
import { StoreProvider, useStore } from './src/store/StoreProvider';
import { colors, themeMode } from './src/theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...(themeMode === 'light' ? DefaultTheme : DarkTheme),
  colors: {
    ...(themeMode === 'light' ? DefaultTheme : DarkTheme).colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      <I18nProvider>
        <TextScaleProvider>
          <StoreProvider>
            <AppInner />
          </StoreProvider>
        </TextScaleProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

function AppInner() {
  const store = useStore();
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  // If a game was in progress, open straight into it (with Home underneath, so
  // « retour » revient à l'accueil) — la partie reprend automatiquement.
  const [initialNavState, setInitialNavState] = useState<InitialState | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      await initDatabase();
      // Préférence de vibrations (Réglages) appliquée au module haptique.
      try {
        setHapticsEnabled(await kvGetJSON<boolean>('ui:haptics', true));
      } catch {
        // best-effort
      }
      // Préférence de lecture vocale (Réglages).
      try {
        setSpeechEnabled(await kvGetJSON<boolean>('ui:speech', false));
      } catch {
        // best-effort
      }
      // Préférence d'effets sonores (Réglages).
      try {
        setSoundEnabled(await kvGetJSON<boolean>('ui:sound', false));
      } catch {
        // best-effort
      }
      // Préférence « Sans alcool » (Réglages).
      try {
        setNoAlcohol(await kvGetJSON<boolean>('ui:noAlcohol', false));
      } catch {
        // best-effort
      }
      // Préférence « Animations réduites » (Réglages).
      try {
        setReduceMotion(await kvGetJSON<boolean>('ui:reduceMotion', false));
      } catch {
        // best-effort
      }
      // Rappel quotidien : re-planifie si activé (au cas où l'OS l'aurait oublié).
      try {
        if (await kvGetJSON<boolean>('ui:dailyReminder', false)) {
          void scheduleDailyReminder(
            'Cancellable',
            'Ton défi du jour t’attend ! · Your daily challenge awaits! 🔥',
          );
        }
      } catch {
        // best-effort
      }
      try {
        const saved = await mostRecentSavedGame();
        if (saved) {
          setInitialNavState({
            index: 1,
            routes: [
              { name: 'Home' },
              {
                name: 'GamePlay',
                params: {
                  gameId: saved.gameId,
                  players: saved.players,
                  config: saved.config,
                  resume: true,
                  slotId: saved.slotId,
                },
              },
            ],
          });
        }
      } catch {
        // ignore a corrupt saved game — just start on Home
      }
      setReady(true);
    })();
  }, []);

  let content: ReactNode;
  if (!ready || store.loading) {
    content = <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  } else if (!store.onboarded) {
    // Premier lancement : choix des univers gratuits avant d'entrer dans l'app.
    content = <OnboardingScreen onDone={store.completeOnboarding} />;
  } else {
    content = (
      <NavigationContainer theme={navTheme} initialState={initialNavState}>
        <Stack.Navigator
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: isReduceMotion() ? 'none' : 'slide_from_right' }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Players" component={PlayersScreen} />
          <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} />
          <Stack.Screen name="RemoteProfile" component={RemoteProfileScreen} />
          <Stack.Screen name="GameSelect" component={GameSelectScreen} />
          <Stack.Screen name="Soiree" component={SoireeScreen} />
          <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
          <Stack.Screen name="SoloQuiz" component={SoloQuizScreen} />
          <Stack.Screen name="Roue" component={RoueScreen} />
          <Stack.Screen name="Revision" component={RevisionScreen} />
          <Stack.Screen name="FaceAFace" component={FaceAFaceScreen} />
          <Stack.Screen name="Entrainement" component={EntrainementScreen} />
          <Stack.Screen name="Seasons" component={SeasonsScreen} />
          <Stack.Screen name="Qotd" component={QotdScreen} />
          <Stack.Screen name="Tournoi" component={TournoiScreen} />
          <Stack.Screen name="Lobby" component={LobbyScreen} />
          <Stack.Screen name="GameConfig" component={GameConfigScreen} />
          <Stack.Screen name="GamePlay" component={GamePlayScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Results" component={ResultsScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Stats" component={StatsScreen} />
          <Stack.Screen name="AppStats" component={AppStatsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="CustomContent" component={CustomContentScreen} />
          <Stack.Screen name="ImageCheck" component={ImageCheckScreen} />
          <Stack.Screen name="ReportedQuestions" component={ReportedQuestionsScreen} />
          <Stack.Screen name="Store" component={StoreScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <ErrorBoundary>
      <AvatarFramesProvider allAchievements={store.ent.allAchievements}>
        {content}
        {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
      </AvatarFramesProvider>
    </ErrorBoundary>
  );
}
