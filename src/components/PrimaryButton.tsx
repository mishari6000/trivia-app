import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, MIN_BUTTON_HEIGHT, radius, spacing } from '../theme/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** `light` is the big white pill; `dark` sits on light or green surfaces. */
  tone?: 'light' | 'dark';
};

/** Large pill for the main action on each screen. */
export function PrimaryButton({ label, onPress, disabled = false, tone = 'light' }: PrimaryButtonProps) {
  const dark = tone === 'dark';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        dark && styles.dark,
        pressed && (dark ? styles.darkPressed : styles.pressed),
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_BUTTON_HEIGHT + 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    backgroundColor: colors.whitePressed,
    transform: [{ scale: 0.98 }],
  },
  dark: {
    minHeight: 48,
    backgroundColor: colors.background,
  },
  darkPressed: {
    backgroundColor: colors.surface,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 30,
    color: colors.textOnLight,
    textAlign: 'center',
  },
  labelDark: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
  },
});
