import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type ScoreBadgeProps = {
  score: number;
};

/** Glassy score pill for the top bar. */
export function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <View
      style={styles.badge}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`النقاط ${score}`}
    >
      <Ionicons name="star" size={16} color={colors.primaryBright} />
      <Text style={styles.value}>{score}</Text>
      <Text style={styles.label}>نقاط</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.glass,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  value: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
    minWidth: 14,
    textAlign: 'center',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
