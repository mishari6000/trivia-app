import { Tajawal_400Regular } from '@expo-google-fonts/tajawal/400Regular';
import { Tajawal_500Medium } from '@expo-google-fonts/tajawal/500Medium';
import { Tajawal_700Bold } from '@expo-google-fonts/tajawal/700Bold';
import { Tajawal_800ExtraBold } from '@expo-google-fonts/tajawal/800ExtraBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DEFAULT_CATEGORY } from './src/data/categories';
import { newGame } from './src/game/pickSession';
import { GameScreen } from './src/screens/GameScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { LevelScreen } from './src/screens/LevelScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { colors } from './src/theme/theme';
import type { CategoryName, Difficulty, PlayableQuestion } from './src/types/question';

type Screen = 'intro' | 'welcome' | 'level' | 'game';
type Game = { id: number; difficulty: Difficulty; questions: PlayableQuestion[] };

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [category, setCategory] = useState<CategoryName>(DEFAULT_CATEGORY);
  const [game, setGame] = useState<Game | null>(null);
  // Fonts ship inside the app bundle; nothing is downloaded at runtime.
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
  });

  // Each game gets fresh questions and a new id, so GameScreen mounts fresh and starts at zero.
  const startGame = (difficulty: Difficulty) => {
    setGame((prev) => ({ id: (prev?.id ?? 0) + 1, difficulty, questions: newGame(category, difficulty) }));
    setScreen('game');
  };

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {screen === 'intro' ? <IntroScreen onDone={() => setScreen('welcome')} /> : null}
      {screen === 'welcome' ? (
        <WelcomeScreen
          onStart={(chosen) => {
            setCategory(chosen);
            setScreen('level');
          }}
        />
      ) : null}
      {screen === 'level' ? (
        <LevelScreen category={category} onPick={startGame} onBack={() => setScreen('welcome')} />
      ) : null}
      {screen === 'game' && game ? (
        <GameScreen
          key={game.id}
          category={category}
          difficulty={game.difficulty}
          questions={game.questions}
          onPlayAgain={() => startGame(game.difficulty)}
          onChangeCategory={() => setScreen('welcome')}
        />
      ) : null}
    </SafeAreaProvider>
  );
}
