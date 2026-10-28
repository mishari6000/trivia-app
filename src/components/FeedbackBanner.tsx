import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import type { FeedbackOutcome } from '../game/answerStatus';
import { colors, fonts, radius, spacing } from '../theme/theme';

type FeedbackBannerProps = {
  /** null keeps the reserved space empty so the layout does not jump. */
  outcome: FeedbackOutcome | null;
  /** Shown after a wrong answer or a timeout as «الإجابة الصحيحة: …». */
  correctAnswer?: string | null;
};

const content: Record<
  FeedbackOutcome,
  { icon: keyof typeof Ionicons.glyphMap; text: string; color: string; background: string }
> = {
  correct: {
    icon: 'checkmark-circle',
    text: 'صح عليك!',
    color: colors.success,
    background: colors.successSoft,
  },
  incorrect: {
    icon: 'close-circle',
    text: 'مو هذي الإجابة',
    color: colors.error,
    background: colors.errorSoft,
  },
  timeout: {
    icon: 'time',
    text: 'انتهى الوقت',
    color: colors.error,
    background: colors.errorSoft,
  },
  revealed: {
    icon: 'eye',
    text: 'هذي الإجابة',
    color: colors.teamTwo,
    background: colors.teamTwoSoft,
  },
};

export function FeedbackBanner({ outcome, correctAnswer }: FeedbackBannerProps) {
  if (outcome === null) {
    return <View style={styles.placeholder} />;
  }

  const { icon, text, color, background } = content[outcome];
  return (
    <View
      style={[styles.banner, { borderColor: color, backgroundColor: background }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Ionicons name={icon} size={28} color={color} />
      <View style={styles.texts}>
        <Text style={[styles.text, { color }]}>{text}</Text>
        {outcome !== 'correct' && correctAnswer ? (
          <Text style={styles.reveal}>الإجابة الصحيحة: {correctAnswer}</Text>
        ) : null}
      </View>
    </View>
  );
}

// Tall enough for the two-line wrong-answer state, so showing feedback doesn't shift the layout.
const BANNER_MIN_HEIGHT = 84;

const styles = StyleSheet.create({
  placeholder: {
    minHeight: BANNER_MIN_HEIGHT,
  },
  banner: {
    minHeight: BANNER_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  texts: {
    flexShrink: 1,
  },
  text: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 30,
  },
  reveal: {
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 26,
    color: colors.text,
  },
});
