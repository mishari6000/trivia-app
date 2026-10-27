import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { colors, fonts, radius, shadow, spacing } from '../theme/theme';

type CategoryTileProps = {
  label: string;
  image: ImageSourcePropType;
};

/** Illustrated category card: square artwork with a bold label band. */
export function CategoryTile({ label, image }: CategoryTileProps) {
  return (
    <View style={[styles.tile, shadow]} accessible accessibilityLabel={`الفئة: ${label}`}>
      <Image source={image} style={styles.art} resizeMode="cover" />
      <View style={styles.band}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const TILE_WIDTH = 220;

const styles = StyleSheet.create({
  tile: {
    width: TILE_WIDTH,
    alignSelf: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.cardBand,
  },
  art: {
    width: TILE_WIDTH,
    height: TILE_WIDTH,
    backgroundColor: colors.cardTop,
  },
  band: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBand,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    lineHeight: 34,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(22, 33, 62, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
});
