import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type QuestionTimerProps = {
  remainingMs: number;
  totalMs: number;
};

const URGENT_SECONDS = 5;

/** Arabic number agreement: ثانية واحدة، ثانيتان، 3–10 ثوانٍ، 11+ ثانية. */
function secondsInArabic(n: number): string {
  if (n === 1) return 'ثانية واحدة';
  if (n === 2) return 'ثانيتان';
  if (n <= 10) return `${n} ثوانٍ`;
  return `${n} ثانية`;
}

/** Seconds left plus a shrinking bar. The last five seconds turn red with text, never flash. */
export function QuestionTimer({ remainingMs, totalMs }: QuestionTimerProps) {
  const seconds = Math.ceil(remainingMs / 1000);
  const urgent = seconds <= URGENT_SECONDS;
  const fraction = Math.max(0, Math.min(1, remainingMs / totalMs));
  const label = seconds === 0 ? 'انتهى الوقت' : `باقي ${secondsInArabic(seconds)}`;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={label}
    >
      <View style={[styles.chip, urgent && styles.chipUrgent]}>
        <Ionicons name="time" size={18} color={colors.white} />
        <Text style={styles.seconds}>{seconds}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[styles.fill, urgent && styles.fillUrgent, { width: `${fraction * 100}%` }]}
        />
      </View>
      {urgent ? <Text style={styles.hurry}>{seconds === 0 ? 'انتهى!' : 'أسرع!'}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 58,
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.logoShadow,
  },
  chipUrgent: {
    backgroundColor: colors.error,
  },
  seconds: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    lineHeight: 26,
    color: colors.white,
    minWidth: 20,
    textAlign: 'center',
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  fillUrgent: {
    backgroundColor: colors.error,
  },
  hurry: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
    backgroundColor: colors.error,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    overflow: 'hidden',
  },
});
