import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, MIN_BUTTON_HEIGHT, radius, spacing, textDirection } from '../theme/theme';
import type { QuestionLanguage } from '../types/question';

export type AnswerButtonStatus = 'idle' | 'correct' | 'incorrect' | 'dimmed';

type AnswerButtonProps = {
  label: string;
  language: QuestionLanguage;
  status: AnswerButtonStatus;
  disabled: boolean;
  onPress: () => void;
};

const statusIcon: Partial<Record<AnswerButtonStatus, keyof typeof Ionicons.glyphMap>> = {
  correct: 'checkmark-circle',
  incorrect: 'close-circle',
};

export function AnswerButton({ label, language, status, disabled, onPress }: AnswerButtonProps) {
  const icon = statusIcon[status];
  const statusText = status === 'correct' ? '، إجابة صحيحة' : status === 'incorrect' ? '، إجابة خاطئة' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${label}${statusText}`}
      accessibilityState={{ disabled, selected: status === 'correct' || status === 'incorrect' }}
      style={({ pressed }) => [
        styles.button,
        status === 'correct' && styles.correct,
        status === 'incorrect' && styles.incorrect,
        status === 'dimmed' && styles.dimmed,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          textDirection(language),
          (status === 'correct' || status === 'incorrect') && styles.labelOnColor,
        ]}
      >
        {label}
      </Text>
      <View style={styles.iconSlot}>
        {icon ? <Ionicons name={icon} size={26} color={colors.white} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_BUTTON_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    borderColor: colors.primary,
    backgroundColor: colors.frameInner,
  },
  correct: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  incorrect: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  dimmed: {
    opacity: 0.55,
  },
  label: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 28,
    color: colors.ink,
  },
  labelOnColor: {
    color: colors.white,
    fontFamily: fonts.bold,
  },
  iconSlot: {
    width: 26,
    alignItems: 'center',
  },
});
