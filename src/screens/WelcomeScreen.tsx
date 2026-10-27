import { StyleSheet, Text, View } from 'react-native';

import { CategoryTile } from '../components/CategoryTile';
import { FramedCard } from '../components/FramedCard';
import { GameTitle } from '../components/GameTitle';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, fonts, spacing } from '../theme/theme';

type WelcomeScreenProps = {
  onStart: () => void;
};

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <ScreenLayout
      header={
        <View style={styles.hero}>
          <GameTitle size="large" />
          <Text style={styles.tagline}>خمس أسئلة... ورّنا معلوماتك!</Text>
        </View>
      }
    >
      <FramedCard style={styles.card}>
        <CategoryTile
          label="معلومات عامة"
          image={require('../../assets/images/category-general.png')}
        />
        <Text style={styles.cardTitle}>تحدّي المعلومات العامة</Text>
        <Text style={styles.cardText}>
          خمس أسئلة، لكل سؤال 15 ثانية وأربع إجابات. وعندك 50/50 مرة وحدة!
        </Text>
      </FramedCard>

      <View style={styles.actions}>
        <PrimaryButton label="ابدأ التحدّي" onPress={onStart} />
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
    alignItems: 'center',
    gap: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    lineHeight: 36,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  cardText: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 30,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  actions: {
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
});
