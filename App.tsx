import { DarkTheme, type InitialState, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplash } from './src/components/AnimatedSplash';
import { initDatabase, kvGetJSON, mostRecentSavedGame } from './src/db';
import { AvatarFramesProvider } from './src/lib/avatarFrames';
import { setHapticsEnabled } from './src/lib/haptics';
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
import { PlayersScreen } from './src/screens/PlayersScreen';
import { RemoteProfileScreen } from './src/screens/RemoteProfileScreen';
import { ReportedQuestionsScreen } from './src/screens/ReportedQuestionsScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SoireeScreen } from './src/screens/SoireeScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { StoreScreen } from './src/screens/StoreScreen';
import { StoreProvider, useStore } from './src/store/StoreProvider';
import { colors } from './src/theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
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
      <StatusBar style="light" />
      <TextScaleProvider>
        <StoreProvider>
          <AppInner />
        </StoreProvider>
      </TextScaleProvider>
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
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Players" component={PlayersScreen} />
          <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} />
          <Stack.Screen name="RemoteProfile" component={RemoteProfileScreen} />
          <Stack.Screen name="GameSelect" component={GameSelectScreen} />
          <Stack.Screen name="Soiree" component={SoireeScreen} />
          <Stack.Screen name="Lobby" component={LobbyScreen} />
          <Stack.Screen name="GameConfig" component={GameConfigScreen} />
          <Stack.Screen name="GamePlay" component={GamePlayScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Results" component={ResultsScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Stats" component={StatsScreen} />
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
    <AvatarFramesProvider allAchievements={store.ent.allAchievements}>
      {content}
      {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
    </AvatarFramesProvider>
  );
}
