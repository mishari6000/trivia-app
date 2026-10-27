import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, gradients, radius, spacing } from '../theme/theme';
import { ProgressRing } from './ProgressRing';

type InfoBannerProps = {
  seconds: number;
  title: string;
  subtitle: string;
};

/** Green rules banner with a small full ring showing the time per question. */
export function InfoBanner({ seconds, title, subtitle }: InfoBannerProps) {
  return (
    <View style={styles.banner} accessible accessibilityLabel={`${title}. ${subtitle}`}>
      <ProgressRing
        size={58}
        strokeWidth={5}
        progress={1}
        color={colors.white}
        trackColor="rgba(255, 255, 255, 0.25)"
      >
        <Text style={styles.seconds}>{seconds}</Text>
        <Text style={styles.unit}>ثانية</Text>
      </ProgressRing>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xl - 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 221, 130, 0.45)',
    backgroundColor: colors.primary,
    backgroundImage: gradients.banner,
    padding: spacing.md,
  },
  seconds: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    lineHeight: 20,
    color: colors.white,
  },
  unit: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
    color: colors.white,
  },
  texts: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 26,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
