import type { ReactNode, Ref } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, gradients, MAX_CONTENT_WIDTH, radius, spacing } from '../theme/theme';

// Native lays out RTL via the `direction` style; React Native Web ignores that style
// and uses its own `dir` prop instead. Scoped to the screen, not a global RTL switch.
const isWeb = Platform.OS === 'web';
const webRtlProps = isWeb ? ({ dir: 'rtl' } as object) : undefined;
const nativeRtlStyle = isWeb ? undefined : ({ direction: 'rtl' } as const);

type ScreenLayoutProps = {
  header: ReactNode;
  children: ReactNode;
  /** `hero` puts the header on a rounded green gradient block; `plain` keeps it on the page. */
  variant?: 'hero' | 'plain';
  scrollRef?: Ref<ScrollViewInstance>;
  /** Wider than a phone column, for the board on tablets and the web. */
  maxWidth?: number;
};

/** Header, safe areas, scrolling and the centered phone-width RTL column. */
export function ScreenLayout({
  header,
  children,
  variant = 'plain',
  scrollRef,
  maxWidth = MAX_CONTENT_WIDTH,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const sidePadding = {
    paddingLeft: insets.left + spacing.lg,
    paddingRight: insets.right + spacing.lg,
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.header,
            variant === 'hero' && styles.hero,
            sidePadding,
            { paddingTop: insets.top + spacing.lg },
          ]}
        >
          <View {...webRtlProps} style={[styles.column, { maxWidth }, nativeRtlStyle]}>
            {header}
          </View>
        </View>

        <View style={[styles.body, sidePadding]}>
          <View {...webRtlProps} style={[styles.column, { maxWidth }, styles.bodyColumn, nativeRtlStyle]}>
            {children}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  hero: {
    backgroundColor: colors.primary,
    backgroundImage: gradients.hero,
    borderBottomLeftRadius: radius.xl + 10,
    borderBottomRightRadius: radius.xl + 10,
    paddingBottom: spacing.xl,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  column: {
    width: '100%',
  },
  bodyColumn: {
    flex: 1,
    gap: spacing.lg,
  },
});
