import { Tajawal_400Regular } from '@expo-google-fonts/tajawal/400Regular';
import { Tajawal_500Medium } from '@expo-google-fonts/tajawal/500Medium';
import { Tajawal_700Bold } from '@expo-google-fonts/tajawal/700Bold';
import { Tajawal_800ExtraBold } from '@expo-google-fonts/tajawal/800ExtraBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { boardReducer, createBoard, type BoardAction, type BoardState, type Tile } from './src/game/board';
import { pickQuestion } from './src/game/pickSession';
import { BoardScreen } from './src/screens/BoardScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { DEFAULT_TEAM_NAMES, SetupScreen } from './src/screens/SetupScreen';
import { TileQuestionScreen } from './src/screens/TileQuestionScreen';
import { colors } from './src/theme/theme';
import type { CategoryName, PlayableQuestion } from './src/types/question';

type Screen = 'intro' | 'setup' | 'board' | 'question';
/** The tile being played, with its question (kept in an array so the engine stays stable). */
type Active = { tile: Tile; questions: PlayableQuestion[] };

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [picked, setPicked] = useState<CategoryName[]>([]);
  const [teamNames, setTeamNames] = useState<[string, string]>(DEFAULT_TEAM_NAMES);
  const [board, setBoard] = useState<BoardState | null>(null);
  const [active, setActive] = useState<Active | null>(null);
  // Fonts ship inside the app bundle; nothing is downloaded at runtime.
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
  });

  const update = (action: BoardAction) => setBoard((b) => (b ? boardReducer(b, action) : b));
  const newBoard = (categories: CategoryName[], names: [string, string]) => {
    setBoard(createBoard(categories, names));
    setScreen('board');
  };
  const pickTile = (tile: Tile) => {
    const question = pickQuestion(tile.category, tile.difficulty);
    if (!question) return;
    setActive({ tile, questions: [question] });
    setScreen('question');
  };

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {screen === 'intro' ? <IntroScreen onDone={() => setScreen('setup')} /> : null}
      {screen === 'setup' ? (
        <SetupScreen
          initialCategories={picked}
          initialNames={teamNames}
          onStart={(categories, names) => {
            setPicked(categories);
            setTeamNames(names);
            newBoard(categories, names);
          }}
        />
      ) : null}
      {screen === 'board' && board ? (
        <BoardScreen
          board={board}
          onPick={pickTile}
          onAdjust={(team, delta) => update({ type: 'adjust', team, delta })}
          onSwitchTurn={() => update({ type: 'switchTurn' })}
          onNewGame={() => newBoard(picked, teamNames)}
          onChangeCategories={() => setScreen('setup')}
        />
      ) : null}
      {screen === 'question' && board && active ? (
        <TileQuestionScreen
          key={active.tile.id}
          tile={active.tile}
          questions={active.questions}
          teams={board.teams}
          turn={board.turn}
          onAdjust={(team, delta) => update({ type: 'adjust', team, delta })}
          onDone={({ correct, usedFiftyFifty }) => {
            update({ type: 'resolve', tileId: active.tile.id, correct, usedFiftyFifty });
            setActive(null);
            setScreen('board');
          }}
        />
      ) : null}
    </SafeAreaProvider>
  );
}
