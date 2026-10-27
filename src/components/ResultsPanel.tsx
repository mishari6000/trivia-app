import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme/theme';
import { FramedCard } from './FramedCard';
import { PrimaryButton } from './PrimaryButton';
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
        <View style={styles.trophy}>
          <Ionicons name="trophy" size={48} color={colors.ink} />
        </View>
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
  trophy: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sun,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 46,
    color: colors.ink,
    textAlign: 'center',
  },
});
