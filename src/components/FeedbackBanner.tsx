import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type FeedbackBannerProps = {
  /** null keeps the reserved space empty so the layout does not jump. */
  isCorrect: boolean | null;
  /** Shown under a wrong answer as «الإجابة الصحيحة: …». */
  correctAnswer?: string | null;
};

export function FeedbackBanner({ isCorrect, correctAnswer }: FeedbackBannerProps) {
  if (isCorrect === null) {
    return <View style={styles.placeholder} />;
  }

  const color = isCorrect ? colors.success : colors.error;
  return (
    <View
      style={[
        styles.banner,
        { borderColor: color, backgroundColor: isCorrect ? colors.successSoft : colors.errorSoft },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={28} color={color} />
      <View style={styles.texts}>
        <Text style={[styles.text, { color }]}>{isCorrect ? 'صح عليك!' : 'مو هذي الإجابة'}</Text>
        {!isCorrect && correctAnswer ? (
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
    color: colors.ink,
  },
});
