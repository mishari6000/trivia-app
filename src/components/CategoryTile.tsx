import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { colors, fonts, gradients, radius, shadow, spacing } from '../theme/theme';

type CategoryTileProps = {
  label: string;
  image?: ImageSourcePropType;
  /** Shown on the warm art area when the category has no illustration yet. */
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
};

/** Illustrated category card: square artwork with a bold label band. Tap to select. */
export function CategoryTile({ label, image, icon, selected, onPress }: CategoryTileProps) {
  return (
    <Pressable
      onPress={onPress}
      role="radio"
      aria-label={`الفئة: ${label}`}
      aria-checked={selected}
      style={({ pressed }) => [
        styles.tile,
        shadow,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.art}>
        {image ? (
          <Image source={image} style={styles.image} resizeMode="cover" />
        ) : (
          <Ionicons name={icon} size={64} color={colors.logoShadow} />
        )}
        {selected ? (
          <View style={styles.check}>
            <Ionicons name="checkmark-circle" size={30} color={colors.success} />
          </View>
        ) : null}
      </View>
      <View style={styles.band}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.cardBand,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.logoShadow,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  art: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardTop,
    backgroundImage: gradients.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  check: {
    position: 'absolute',
    top: spacing.sm,
    start: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  band: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.cardBand,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 19,
    lineHeight: 28,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(22, 33, 62, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
});
