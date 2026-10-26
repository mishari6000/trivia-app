import { StyleSheet, Text, View } from 'react-native';

import { CategoryBadge } from '../components/CategoryBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, fonts, radius, shadow, spacing } from '../theme/theme';

type WelcomeScreenProps = {
  onStart: () => void;
};

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <ScreenLayout>
      <View style={styles.hero}>
        <View
          style={[styles.emblem, shadow]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.emblemMark}>؟</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          تحدّي اليمعة
        </Text>
        <CategoryBadge label="معلومات عامة" style={styles.badge} />
        <Text style={styles.tagline}>خمس أسئلة... ورّنا معلوماتك!</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="ابدأ التحدّي" onPress={onStart} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xxl,
  },
  emblem: {
    width: 112,
    height: 112,
    borderRadius: radius.lg + 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    transform: [{ rotate: '-6deg' }],
    marginBottom: spacing.sm,
  },
  emblemMark: {
    fontFamily: fonts.extraBold,
    fontSize: 64,
    lineHeight: 92,
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 40,
    lineHeight: 58,
    color: colors.ink,
    textAlign: 'center',
  },
  badge: {
    alignSelf: 'center',
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 19,
    lineHeight: 30,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  actions: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
});
