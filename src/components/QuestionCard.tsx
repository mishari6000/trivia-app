import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, shadow, spacing, textDirection } from '../theme/theme';
import type { QuestionLanguage } from '../types/question';

type QuestionCardProps = {
  question: string;
  language: QuestionLanguage;
};

export function QuestionCard({ question, language }: QuestionCardProps) {
  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.accentBar} />
      <Text style={[styles.text, textDirection(language)]} accessibilityRole="header">
        {question}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    height: 6,
    backgroundColor: colors.primary,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 36,
    color: colors.ink,
  },
});
