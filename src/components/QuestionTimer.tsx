import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';
import { secondsInArabic } from '../utils/arabic';
import { ProgressRing } from './ProgressRing';

type QuestionTimerProps = {
  remainingMs: number;
  totalMs: number;
};

const URGENT_SECONDS = 5;

/** Countdown ring. The last five seconds turn red with «أسرع!», never flash. */
export function QuestionTimer({ remainingMs, totalMs }: QuestionTimerProps) {
  const seconds = Math.ceil(remainingMs / 1000);
  const urgent = seconds <= URGENT_SECONDS;
  const label = seconds === 0 ? 'انتهى الوقت' : `باقي ${secondsInArabic(seconds)}`;

  return (
    <View style={styles.container} accessible accessibilityRole="timer" accessibilityLabel={label}>
      <ProgressRing
        size={108}
        strokeWidth={9}
        progress={remainingMs / totalMs}
        color={urgent ? colors.error : colors.primaryBright}
      >
        <Text style={[styles.seconds, urgent && styles.secondsUrgent]}>{seconds}</Text>
        <Text style={styles.unit}>ثانية</Text>
      </ProgressRing>
      {urgent ? <Text style={styles.hurry}>{seconds === 0 ? 'انتهى!' : 'أسرع!'}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  seconds: {
    fontFamily: fonts.extraBold,
    fontSize: 34,
    lineHeight: 40,
    color: colors.text,
  },
  secondsUrgent: {
    color: colors.error,
  },
  unit: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 16,
    color: colors.textMuted,
  },
  hurry: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
    backgroundColor: colors.errorStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
});
