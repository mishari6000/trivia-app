import { StyleSheet, Text } from 'react-native';

import { colors, fonts, textDirection } from '../theme/theme';
import type { QuestionLanguage } from '../types/question';
import { FramedCard } from './FramedCard';

type QuestionCardProps = {
  question: string;
  language: QuestionLanguage;
};

export function QuestionCard({ question, language }: QuestionCardProps) {
  return (
    <FramedCard>
      <Text style={[styles.text, textDirection(language)]} accessibilityRole="header">
        {question}
      </Text>
    </FramedCard>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 36,
    color: colors.text,
  },
});
