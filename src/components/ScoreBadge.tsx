import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type ScoreBadgeProps = {
  score: number;
};

/** Outlined score pill that sits on the teal header. */
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
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.white,
  },
  value: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    lineHeight: 30,
    color: colors.white,
    minWidth: 16,
    textAlign: 'center',
  },
});
