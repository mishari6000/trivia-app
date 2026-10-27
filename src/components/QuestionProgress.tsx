import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type QuestionProgressProps = {
  current: number;
  total: number;
};

/** "السؤال 2 من 5" with a compact step bar; sits on the teal header, apart from the score. */
export function QuestionProgress({ current, total }: QuestionProgressProps) {
  const label = `السؤال ${current} من ${total}`;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: total, now: current }}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.steps}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.step,
              i < current - 1 && styles.done,
              i === current - 1 && styles.active,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
  },
  steps: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  step: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  done: {
    backgroundColor: colors.white,
  },
  active: {
    backgroundColor: colors.accent,
  },
});
