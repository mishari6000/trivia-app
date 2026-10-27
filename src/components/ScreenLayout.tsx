import type { ReactNode, Ref } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, gradients, MAX_CONTENT_WIDTH, spacing } from '../theme/theme';

// Native lays out RTL via the `direction` style; React Native Web ignores that style
// and uses its own `dir` prop instead. Scoped to the screen, not a global RTL switch.
const isWeb = Platform.OS === 'web';
const webRtlProps = isWeb ? ({ dir: 'rtl' } as object) : undefined;
const nativeRtlStyle = isWeb ? undefined : ({ direction: 'rtl' } as const);

type ScreenLayoutProps = {
  /** Content of the curved gradient header band. */
  header: ReactNode;
  /** Body content; its first card overlaps the header curve. */
  children: ReactNode;
  scrollRef?: Ref<ScrollViewInstance>;
};

/** Curved gradient header, safe areas, scrolling and the centered phone-width RTL column. */
export function ScreenLayout({ header, children, scrollRef }: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + spacing.lg,
              paddingLeft: insets.left + spacing.lg,
              paddingRight: insets.right + spacing.lg,
            },
          ]}
        >
          <View {...webRtlProps} style={[styles.column, nativeRtlStyle]}>
            {header}
          </View>
        </View>

        <View
          style={[
            styles.body,
            { paddingLeft: insets.left + spacing.lg, paddingRight: insets.right + spacing.lg },
          ]}
        >
          <View {...webRtlProps} style={[styles.column, styles.bodyColumn, nativeRtlStyle]}>
            {children}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const HEADER_CURVE = 56;
const CARD_OVERLAP = 40;

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
    backgroundColor: colors.primary,
    backgroundImage: gradients.header,
    borderBottomLeftRadius: HEADER_CURVE,
    borderBottomRightRadius: HEADER_CURVE,
    paddingBottom: CARD_OVERLAP + spacing.xl,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    marginTop: -CARD_OVERLAP,
  },
  column: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
  },
  bodyColumn: {
    flex: 1,
    gap: spacing.lg,
  },
});
