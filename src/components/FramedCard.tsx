import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../theme/theme';

type FramedCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Dark rounded surface with a hairline border, used for the question and results. */
export function FramedCard({ children, style }: FramedCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
});
