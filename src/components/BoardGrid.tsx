import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCategory } from '../data/categories';
import type { Tile } from '../game/board';
import { colors, fonts, radius, spacing } from '../theme/theme';
import type { CategoryName } from '../types/question';

type BoardGridProps = {
  categories: CategoryName[];
  tiles: Tile[];
  /** Smaller headers and tiles, for phone width. */
  compact: boolean;
  /** A phone on its side: wide layout, but low headers and tiles so more fits. */
  short?: boolean;
  onPick: (tile: Tile) => void;
};

/** One column per category: its picture and name, then 100 100 300 300 500 500. */
export function BoardGrid({ categories, tiles, compact, short = false, onPick }: BoardGridProps) {
  return (
    <View style={[styles.board, compact && styles.boardCompact]}>
      {categories.map((name) => {
        const category = getCategory(name);
        return (
          <View key={name} style={[styles.column, compact && styles.columnCompact]}>
            <View style={[styles.header, compact && styles.headerCompact, short && styles.headerShort]}>
              {category.image ? (
                <Image source={category.image} style={[styles.image, short && styles.imageShort]} resizeMode="cover" />
              ) : (
                <View style={styles.iconBox}>
                  <Ionicons name={category.icon} size={compact ? 24 : 40} color={colors.primaryBright} />
                </View>
              )}
              <View style={[styles.labelBar, compact && styles.labelBarCompact, short && styles.labelBarShort]}>
                <Text
                  style={[styles.label, compact && styles.labelCompact, short && styles.labelShort]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  {category.label}
                </Text>
              </View>
            </View>

            {tiles
              .filter((t) => t.category === name)
              .map((tile) => {
                const played = tile.result;
                const teamColor = played?.team === 1 ? colors.teamTwo : colors.teamOne;
                return (
                  <Pressable
                    key={tile.id}
                    onPress={() => onPick(tile)}
                    disabled={played !== null}
                    accessibilityRole="button"
                    accessibilityLabel={`${category.label} ${tile.points}${played ? '، انلعب' : ''}`}
                    accessibilityState={{ disabled: played !== null }}
                    style={({ pressed }) => [
                      styles.tile,
                      compact && styles.tileCompact,
                      short && styles.tileShort,
                      played && styles.played,
                      pressed && styles.pressed,
                    ]}
                  >
                    {played ? (
                      <Ionicons
                        name={played.correct ? 'checkmark-circle' : 'close-circle'}
                        size={compact ? 20 : 28}
                        color={played.correct ? teamColor : colors.textMuted}
                      />
                    ) : (
                      <Text style={[styles.points, compact && styles.pointsCompact]}>{tile.points}</Text>
                    )}
                  </Pressable>
                );
              })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  boardCompact: {
    gap: spacing.xs,
  },
  column: {
    flex: 1,
    gap: spacing.sm,
  },
  columnCompact: {
    gap: spacing.xs,
  },
  header: {
    aspectRatio: 0.9,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
  },
  headerCompact: {
    aspectRatio: 0.62,
    borderRadius: radius.sm,
  },
  headerShort: {
    aspectRatio: undefined,
  },
  imageShort: {
    flex: undefined,
    height: 52,
  },
  labelBarShort: {
    minHeight: 34,
  },
  labelShort: {
    fontSize: 13,
    lineHeight: 17,
  },
  image: {
    width: '100%',
    flex: 1,
  },
  iconBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBar: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.primary,
    backgroundImage: 'linear-gradient(180deg, #13B573 0%, #0E9F62 100%)',
  },
  labelBarCompact: {
    minHeight: 34,
    paddingHorizontal: 2,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.white,
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  tile: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primaryBright,
    backgroundColor: colors.surface,
  },
  tileShort: {
    minHeight: 44,
  },
  tileCompact: {
    minHeight: 44,
    borderRadius: radius.sm,
    borderWidth: 1.5,
  },
  played: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
    transform: [{ scale: 0.96 }],
  },
  points: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.primaryBright,
    fontVariant: ['tabular-nums'],
  },
  pointsCompact: {
    fontSize: 15,
    lineHeight: 20,
  },
});
