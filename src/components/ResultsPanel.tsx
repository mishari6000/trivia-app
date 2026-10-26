import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, shadow, spacing } from '../theme/theme';
import { PrimaryButton } from './PrimaryButton';

type ResultsPanelProps = {
  score: number;
  total: number;
  onPlayAgain: () => void;
};

export function ResultsPanel({ score, total, onPlayAgain }: ResultsPanelProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.card, shadow]}>
        <View style={styles.trophy}>
          <Ionicons name="trophy" size={44} color={colors.ink} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          نتيجتك: {score} من {total}
        </Text>
      </View>
      <PrimaryButton label="العب مرة ثانية" onPress={onPlayAgain} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  trophy: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 44,
    color: colors.ink,
    textAlign: 'center',
  },
});
