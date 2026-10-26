import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/theme';

/** Subtle decorative shapes behind the game. Not interactive or announced. */
export function GeometricBackground() {
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.shape, styles.diamondTop]} />
      <View style={[styles.shape, styles.ringBottom]} />
      <View style={[styles.shape, styles.dotMiddle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
  },
  diamondTop: {
    top: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 28,
    backgroundColor: colors.accent,
    opacity: 0.18,
    transform: [{ rotate: '45deg' }],
  },
  ringBottom: {
    bottom: -70,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 28,
    borderColor: colors.primary,
    opacity: 0.07,
  },
  dotMiddle: {
    top: '38%',
    right: 18,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    opacity: 0.12,
  },
});
