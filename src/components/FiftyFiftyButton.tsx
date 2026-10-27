import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type FiftyFiftyButtonProps = {
  used: boolean;
  disabled: boolean;
  onPress: () => void;
};

/** Once-per-game lifeline that removes two wrong answers. */
export function FiftyFiftyButton({ used, disabled, onPress }: FiftyFiftyButtonProps) {
  const isDisabled = used || disabled;
  const label = used ? '50/50 · استخدمته' : '50/50 · احذف إجابتين';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={used ? 'خمسين خمسين، مستخدمة' : 'خمسين خمسين، احذف إجابتين خطأ'}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <Ionicons
        name="cut"
        size={20}
        color={isDisabled ? colors.textMuted : colors.primaryBright}
      />
      <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primaryBright,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
  },
  disabled: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 26,
    color: colors.primaryBright,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
});
