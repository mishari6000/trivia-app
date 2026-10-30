import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCategory } from '../data/categories';
import type { Tile } from '../game/board';
import { colors, fonts, radius, spacing } from '../theme/theme';
import { AiBadge } from './AiBadge';
import type { CategoryName } from '../types/question';

type BoardGridProps = {
  categories: CategoryName[];
  tiles: Tile[];
  /** Smaller headers and tiles, for phone width. */
  compact: boolean;
  /** A phone on its side: wide layout, but low headers and tiles so more fits. */
  short?: boolean;
  /** The player's topic for the «صمم فئتك» column. */
  customTopic?: string | null;
  onPick: (tile: Tile) => void;
};

/**
 * One column per category: its picture and name, then 100 100 300 300 500 500. The
 * «صمم فئتك» column has an AI mark, the player's topic and five tiles.
 */
export function BoardGrid({ categories, tiles, compact, short = false, customTopic, onPick }: BoardGridProps) {
  return (
    <View style={[styles.board, compact && styles.boardCompact]}>
      {categories.map((name) => {
        const category = getCategory(name);
        const custom = name === 'Custom';
        const label = custom ? (customTopic ?? category.label) : category.label;
        return (
          <View key={name} style={[styles.column, compact && styles.columnCompact]}>
            <View style={[styles.header, compact && styles.headerCompact, short && styles.headerShort]}>
              {category.image ? (
                <Image source={category.image} style={[styles.image, short && styles.imageShort]} resizeMode="cover" />
              ) : (
                <View style={[styles.iconBox, custom && styles.iconBoxCustom, short && styles.imageShort]}>
                  <Ionicons
                    name={category.icon}
                    size={compact ? 24 : 40}
                    color={custom ? colors.textOnLight : colors.primaryBright}
                  />
                </View>
              )}
              {custom ? (
                <View style={styles.aiMark}>
                  <AiBadge small={compact} />
                </View>
              ) : null}
              <View style={[styles.labelBar, compact && styles.labelBarCompact, short && styles.labelBarShort]}>
                <Text
                  style={[styles.label, compact && styles.labelCompact, short && styles.labelShort]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  {label}
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
                    accessibilityLabel={`${label} ${tile.points}${played ? '، انلعب' : ''}`}
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
            {custom ? (
              // Five AI questions a month: the sixth slot stays empty.
              <View
                style={[styles.tile, compact && styles.tileCompact, short && styles.tileShort, styles.emptySlot]}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Ionicons name="sparkles-outline" size={compact ? 16 : 22} color={colors.textMuted} />
              </View>
            ) : null}
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
  iconBoxCustom: {
    backgroundColor: colors.teamTwo,
  },
  aiMark: {
    position: 'absolute',
    top: spacing.xs,
    start: spacing.xs,
  },
  emptySlot: {
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: 'transparent',
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
