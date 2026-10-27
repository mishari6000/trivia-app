import { StyleSheet, Text, View } from 'react-native';

import { CategoryTile } from '../components/CategoryTile';
import { FramedCard } from '../components/FramedCard';
import { GameTitle } from '../components/GameTitle';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { categories, getCategory } from '../data/categories';
import { colors, fonts, spacing } from '../theme/theme';
import type { CategoryName } from '../types/question';

type WelcomeScreenProps = {
  selectedCategory: CategoryName;
  onSelectCategory: (category: CategoryName) => void;
  onStart: () => void;
};

/** Pairs of tiles, so the grid is two columns wide on every phone. */
const rows = Array.from({ length: Math.ceil(categories.length / 2) }, (_, i) =>
  categories.slice(i * 2, i * 2 + 2),
);

export function WelcomeScreen({ selectedCategory, onSelectCategory, onStart }: WelcomeScreenProps) {
  return (
    <ScreenLayout
      header={
        <View style={styles.hero}>
          <GameTitle size="large" />
          <Text style={styles.tagline}>اختار فئتك... وورّنا معلوماتك!</Text>
        </View>
      }
    >
      <FramedCard style={styles.card}>
        <Text style={styles.cardText}>
          خمس أسئلة، لكل سؤال 15 ثانية وأربع إجابات. وعندك 50/50 مرة وحدة!
        </Text>
        <View style={styles.grid} accessibilityRole="radiogroup">
          {rows.map((row) => (
            <View key={row[0].name} style={styles.row}>
              {row.map((category) => (
                <CategoryTile
                  key={category.name}
                  label={category.label}
                  image={category.image}
                  icon={category.icon}
                  selected={category.name === selectedCategory}
                  onPress={() => onSelectCategory(category.name)}
                />
              ))}
              {row.length === 1 ? <View style={styles.spacer} /> : null}
            </View>
          ))}
        </View>
      </FramedCard>

      <View style={styles.actions}>
        <PrimaryButton
          label={`ابدأ التحدّي · ${getCategory(selectedCategory).label}`}
          onPress={onStart}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  tagline: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 32,
    color: colors.ink,
    textAlign: 'center',
  },
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  cardText: {
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 28,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  grid: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
});
