import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type ScoreBadgeProps = {
  score: number;
};

export function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <View
      style={styles.badge}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`النقاط ${score}`}
    >
      <Text style={styles.label}>النقاط</Text>
      <Text style={styles.value}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
  value: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.accent,
    minWidth: 14,
    textAlign: 'center',
  },
});
