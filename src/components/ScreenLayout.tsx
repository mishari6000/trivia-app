import type { ReactNode, Ref } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, MAX_CONTENT_WIDTH, spacing } from '../theme/theme';
import { GeometricBackground } from './GeometricBackground';

// Native lays out RTL via the `direction` style; React Native Web ignores that style
// and uses its own `dir` prop instead. Scoped to the screen, not a global RTL switch.
const isWeb = Platform.OS === 'web';
const webRtlProps = isWeb ? ({ dir: 'rtl' } as object) : undefined;
const nativeRtlStyle = isWeb ? undefined : ({ direction: 'rtl' } as const);

type ScreenLayoutProps = {
  children: ReactNode;
  scrollRef?: Ref<ScrollViewInstance>;
};

/** Safe areas, background, scrolling and the centered phone-width RTL column. */
export function ScreenLayout({ children, scrollRef }: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <GeometricBackground />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View {...webRtlProps} style={[styles.column, nativeRtlStyle]}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    gap: spacing.xl,
  },
});
