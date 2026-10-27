import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { colors, fonts, gradients, radius, shadow, spacing } from '../theme/theme';

type CategoryTileProps = {
  label: string;
  questionCount: number;
  image?: ImageSourcePropType;
  /** Shown when the category has no illustration. */
  icon: keyof typeof Ionicons.glyphMap;
  onStart: () => void;
};

/** Event-style category card: artwork, info chips, name and a Start pill. Tapping starts it. */
export function CategoryTile({ label, questionCount, image, icon, onStart }: CategoryTileProps) {
  return (
    <Pressable
      onPress={onStart}
      accessibilityRole="button"
      accessibilityLabel={`ابدأ فئة ${label}، ${questionCount} أسئلة`}
      style={({ pressed }) => [styles.tile, shadow, pressed && styles.pressed]}
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
            <Ionicons name="help-circle" size={14} color={colors.white} />
            <Text style={styles.chipText}>{questionCount}</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="time" size={14} color={colors.white} />
            <Text style={styles.chipText}>15ث</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.start}>
          <Text style={styles.startText}>ابدأ</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },
  startText: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 26,
    color: colors.text,
  },
});
