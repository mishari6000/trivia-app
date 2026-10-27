import { StyleSheet, Text, View } from 'react-native';

import { CategoryTile } from '../components/CategoryTile';
import { GameTitle } from '../components/GameTitle';
import { InfoBanner } from '../components/InfoBanner';
import { ScreenLayout } from '../components/ScreenLayout';
import { categories } from '../data/categories';
import { getLocalQuestions } from '../data/getLocalQuestions';
import { QUESTION_TIME_MS } from '../game/gameReducer';
import { colors, fonts, spacing } from '../theme/theme';
import type { CategoryName } from '../types/question';

type WelcomeScreenProps = {
  onStart: (category: CategoryName) => void;
};

/** Pairs of cards, so the grid is two columns wide on every phone. */
const rows = Array.from({ length: Math.ceil(categories.length / 2) }, (_, i) =>
  categories.slice(i * 2, i * 2 + 2),
);

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <ScreenLayout
      header={
        <View style={styles.hero}>
          <GameTitle size="large" />
          <View style={styles.greeting}>
            <Text style={styles.hello}>هلا والله!</Text>
            <Text style={styles.tagline}>جاهز تتحدّى معلوماتك؟</Text>
          </View>
        </View>
      }
    >
      <InfoBanner
        seconds={QUESTION_TIME_MS / 1000}
        title="خمس أسئلة، لكل سؤال 15 ثانية"
        subtitle="وعندك 50/50 مرة وحدة بكل لعبة!"
      />

      <Text style={styles.section} accessibilityRole="header">
        اختار فئتك
      </Text>
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row[0].name} style={styles.row}>
            {row.map((category) => (
              <CategoryTile
                key={category.name}
                label={category.label}
                questionCount={getLocalQuestions(category.name).length}
                image={category.image}
                icon={category.icon}
                onStart={() => onStart(category.name)}
              />
            ))}
            {row.length === 1 ? <View style={styles.spacer} /> : null}
          </View>
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
  },
  greeting: {
    gap: spacing.xs,
  },
  hello: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 44,
    color: colors.text,
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 19,
    lineHeight: 30,
    color: colors.textMuted,
  },
  section: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 30,
    color: colors.text,
    marginTop: spacing.sm,
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
});
