import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, MIN_BUTTON_HEIGHT, radius, spacing } from '../theme/theme';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
};

/** Outlined pill for a less important action next to a PrimaryButton. */
export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.logoShadow,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    backgroundColor: colors.frameInner,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 19,
    lineHeight: 28,
    color: colors.logoShadow,
    textAlign: 'center',
  },
});
