import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type FeedbackBannerProps = {
  /** null keeps the reserved space empty so the layout does not jump. */
  isCorrect: boolean | null;
};

export function FeedbackBanner({ isCorrect }: FeedbackBannerProps) {
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
      <Text style={[styles.text, { color }]}>{isCorrect ? 'صح عليك!' : 'مو هذي الإجابة'}</Text>
    </View>
  );
}

const BANNER_MIN_HEIGHT = 56;

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
  text: {
    flexShrink: 1,
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 30,
  },
});
