import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AnswerStatus } from '../game/answerStatus';
import { colors, fonts, MIN_BUTTON_HEIGHT, radius, spacing, textDirection } from '../theme/theme';
import type { QuestionLanguage } from '../types/question';

type AnswerButtonProps = {
  label: string;
  language: QuestionLanguage;
  status: AnswerStatus;
  disabled: boolean;
  onPress: () => void;
};

const statusIcon: Partial<
  Record<AnswerStatus, { name: keyof typeof Ionicons.glyphMap; color: string }>
> = {
  correct: { name: 'checkmark-circle', color: colors.white },
  incorrect: { name: 'close-circle', color: colors.white },
  revealed: { name: 'checkmark-circle', color: colors.success },
};

const statusText: Partial<Record<AnswerStatus, string>> = {
  correct: '، إجابة صحيحة',
  incorrect: '، إجابتك خاطئة',
  revealed: '، هذي الإجابة الصحيحة',
};

export function AnswerButton({ label, language, status, disabled, onPress }: AnswerButtonProps) {
  const icon = statusIcon[status];
  const isSolid = status === 'correct' || status === 'incorrect';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${label}${statusText[status] ?? ''}`}
      accessibilityState={{ disabled, selected: isSolid }}
      style={({ pressed }) => [
        styles.button,
        status === 'correct' && styles.correct,
        status === 'incorrect' && styles.incorrect,
        status === 'revealed' && styles.revealed,
        status === 'dimmed' && styles.dimmed,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          textDirection(language),
          isSolid && styles.labelOnColor,
          status === 'revealed' && styles.labelRevealed,
        ]}
      >
        {label}
      </Text>
      <View style={styles.iconSlot}>
        {icon ? <Ionicons name={icon.name} size={26} color={icon.color} /> : null}
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
  revealed: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    borderStyle: 'dashed',
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
  labelRevealed: {
    color: colors.success,
    fontFamily: fonts.bold,
  },
  iconSlot: {
    width: 26,
    alignItems: 'center',
  },
});
