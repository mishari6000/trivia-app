import { Tajawal_400Regular } from '@expo-google-fonts/tajawal/400Regular';
import { Tajawal_500Medium } from '@expo-google-fonts/tajawal/500Medium';
import { Tajawal_700Bold } from '@expo-google-fonts/tajawal/700Bold';
import { Tajawal_800ExtraBold } from '@expo-google-fonts/tajawal/800ExtraBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameScreen } from './src/screens/GameScreen';
import { colors } from './src/theme/theme';

export default function App() {
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
      <StatusBar style="dark" />
      <GameScreen />
    </SafeAreaProvider>
  );
}
