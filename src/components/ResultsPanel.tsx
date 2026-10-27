import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme/theme';
import { FramedCard } from './FramedCard';
import { PrimaryButton } from './PrimaryButton';
import { ProgressRing } from './ProgressRing';
import { SecondaryButton } from './SecondaryButton';

type ResultsPanelProps = {
  score: number;
  total: number;
  onPlayAgain: () => void;
  onChangeCategory: () => void;
};

export function ResultsPanel({ score, total, onPlayAgain, onChangeCategory }: ResultsPanelProps) {
  return (
    <View style={styles.container}>
      <FramedCard style={styles.card}>
        <ProgressRing size={168} strokeWidth={12} progress={score / total} color={colors.primaryBright}>
          <Ionicons name="trophy" size={34} color={colors.primaryBright} />
          <Text style={styles.ringScore}>
            {score}/{total}
          </Text>
        </ProgressRing>
        <Text style={styles.title} accessibilityRole="header">
          نتيجتك: {score} من {total}
        </Text>
      </FramedCard>
      <View style={styles.actions}>
        <PrimaryButton label="العب مرة ثانية" onPress={onPlayAgain} />
        <SecondaryButton label="غيّر الفئة" onPress={onChangeCategory} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  ringScore: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 40,
    color: colors.text,
    writingDirection: 'ltr',
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    lineHeight: 42,
    color: colors.text,
    textAlign: 'center',
  },
});
