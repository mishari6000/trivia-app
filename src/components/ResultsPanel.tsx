import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme/theme';
import { FramedCard } from './FramedCard';
import { PrimaryButton } from './PrimaryButton';

type ResultsPanelProps = {
  score: number;
  total: number;
  onPlayAgain: () => void;
};

export function ResultsPanel({ score, total, onPlayAgain }: ResultsPanelProps) {
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
