import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { colors, fonts, gradients, radius, shadow, spacing } from '../theme/theme';

type CategoryTileProps = {
  label: string;
  /** Small chip on the art, e.g. the question count. */
  badge: { icon: keyof typeof Ionicons.glyphMap; text: string };
  image?: ImageSourcePropType;
  /** Shown when the category has no illustration. */
  icon: keyof typeof Ionicons.glyphMap;
  /** Picked for the board: green frame, a check and its place in the pick order. */
  selected?: number | null;
  /** Six already picked: the rest are dimmed until one is unpicked. */
  disabled?: boolean;
  onPress: () => void;
};

/** Event-style category card: artwork, a count chip, name and a pick pill. */
export function CategoryTile({ label, badge, image, icon, selected = null, disabled = false, onPress }: CategoryTileProps) {
  const isSelected = selected !== null;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      role="checkbox"
      aria-checked={isSelected}
      accessibilityLabel={`فئة ${label}`}
      accessibilityState={{ checked: isSelected, disabled }}
      style={({ pressed }) => [
        styles.tile,
        shadow,
        isSelected && styles.selected,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.art}>
        {image ? (
          <Image source={image} style={styles.image} resizeMode="cover" />
        ) : (
          <Ionicons name={icon} size={56} color={colors.primaryBright} />
        )}
        <View style={[StyleSheet.absoluteFill, styles.shade]} />
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Ionicons name={badge.icon} size={14} color={colors.white} />
            <Text style={styles.chipText}>{badge.text}</Text>
          </View>
        </View>
        {isSelected ? (
          <View style={styles.order}>
            <Text style={styles.orderText}>{selected}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.start, isSelected && styles.startSelected]}>
          {isSelected ? <Ionicons name="checkmark" size={18} color={colors.textOnLight} /> : null}
          <Text style={[styles.startText, isSelected && styles.startTextSelected]}>
            {isSelected ? 'مختارة' : 'اختار'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.xl - 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  selected: {
    borderColor: colors.primaryBright,
    borderWidth: 3,
  },
  disabled: {
    opacity: 0.4,
  },
  order: {
    position: 'absolute',
    top: spacing.sm,
    end: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBright,
  },
  orderText: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: colors.textOnLight,
  },
  art: {
    aspectRatio: 1.05,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shade: {
    backgroundImage: gradients.cardShade,
  },
  chips: {
    position: 'absolute',
    top: spacing.sm,
    start: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(10, 22, 32, 0.55)',
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
  },
  chipText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.white,
  },
  footer: {
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 19,
    lineHeight: 28,
    color: colors.white,
  },
  start: {
    minHeight: 44,
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },
  startSelected: {
    backgroundColor: colors.primaryBright,
  },
  startText: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 26,
    color: colors.text,
  },
  startTextSelected: {
    color: colors.textOnLight,
  },
});
