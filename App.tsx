import { Tajawal_400Regular } from '@expo-google-fonts/tajawal/400Regular';
import { Tajawal_500Medium } from '@expo-google-fonts/tajawal/500Medium';
import { Tajawal_700Bold } from '@expo-google-fonts/tajawal/700Bold';
import { Tajawal_800ExtraBold } from '@expo-google-fonts/tajawal/800ExtraBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameSessionScreen } from './src/screens/GameSessionScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { DEFAULT_CATEGORY } from './src/data/categories';
import { colors } from './src/theme/theme';
import type { CategoryName, QuestionSource } from './src/types/question';

type Screen = 'intro' | 'welcome' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [category, setCategory] = useState<CategoryName>(DEFAULT_CATEGORY);
  const [source, setSource] = useState<QuestionSource>('local');
  // Fonts ship inside the app bundle; nothing is downloaded at runtime.
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* Each game mounts fresh (GameSessionScreen loads it), so Start always begins at zero. */}
      {screen === 'intro' ? <IntroScreen onDone={() => setScreen('welcome')} /> : null}
      {screen === 'welcome' ? (
        <WelcomeScreen
          source={source}
          onSourceChange={setSource}
          onStart={(chosen) => {
            setCategory(chosen);
            setScreen('game');
          }}
        />
      ) : null}
      {screen === 'game' ? (
        <GameSessionScreen
          key={`${category}|${source}`}
          category={category}
          source={source}
          onExit={() => setScreen('welcome')}
          onChangeCategory={setCategory}
        />
      ) : null}
    </SafeAreaProvider>
  );
}
