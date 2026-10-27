import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '../theme/theme';

type FramedCardProps = {
  children: ReactNode;
  /** Style for the inner panel (padding, alignment, gaps). */
  style?: StyleProp<ViewStyle>;
};

/** Soft cyan double-frame card used for the question, results and welcome info. */
export function FramedCard({ children, style }: FramedCardProps) {
  return (
    <View style={[styles.frame, shadow]}>
      <View style={[styles.inner, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.frame,
    borderRadius: radius.xl,
    padding: spacing.sm + 2,
  },
  inner: {
    backgroundColor: colors.frameInner,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
});
