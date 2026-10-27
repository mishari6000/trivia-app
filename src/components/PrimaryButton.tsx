import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, gradients, MIN_BUTTON_HEIGHT, radius, shadow, spacing } from '../theme/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

/** Large yellow pill for the main action on each screen. */
export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        shadow,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_BUTTON_HEIGHT + 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    backgroundImage: gradients.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    backgroundImage: 'none',
    backgroundColor: colors.accentPressed,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    lineHeight: 32,
    color: colors.ink,
    textAlign: 'center',
  },
});
