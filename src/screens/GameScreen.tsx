import { useEffect, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerButton, type AnswerButtonStatus } from '../components/AnswerButton';
import { CategoryBadge } from '../components/CategoryBadge';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { GeometricBackground } from '../components/GeometricBackground';
import { PrimaryButton } from '../components/PrimaryButton';
import { QuestionCard } from '../components/QuestionCard';
import { ResultsPanel } from '../components/ResultsPanel';
import { ScoreBadge } from '../components/ScoreBadge';
import { useTriviaGame } from '../game/useTriviaGame';
import { colors, fonts, MAX_CONTENT_WIDTH, MIN_BUTTON_HEIGHT, spacing } from '../theme/theme';

// Native lays out RTL via the `direction` style; React Native Web ignores that style
// and uses its own `dir` prop instead. Scoped to this screen, not a global RTL switch.
const isWeb = Platform.OS === 'web';
const webRtlProps = isWeb ? ({ dir: 'rtl' } as object) : undefined;
const nativeRtlStyle = isWeb ? undefined : ({ direction: 'rtl' } as const);

export function GameScreen() {
  const { state, currentQuestion, totalQuestions, isLastQuestion, answer, next, restart } =
    useTriviaGame();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const isResults = state.phase === 'results';

  // Start each new question (and the results) from the top on small screens.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [state.currentIndex, isResults]);

  const statusFor = (optionId: string): AnswerButtonStatus => {
    if (state.selectedOptionId === null) return 'idle';
    if (optionId !== state.selectedOptionId) return 'dimmed';
    return state.lastAnswerCorrect ? 'correct' : 'incorrect';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <GeometricBackground />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View {...webRtlProps} style={[styles.column, nativeRtlStyle]}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.title} accessibilityRole="header">
                تحدّي اليمعة
              </Text>
              <CategoryBadge label="معلومات عامة" />
            </View>
            <ScoreBadge score={state.score} />
          </View>

          {isResults || !currentQuestion ? (
            <ResultsPanel score={state.score} total={totalQuestions} onPlayAgain={restart} />
          ) : (
            <View style={styles.playArea}>
              <QuestionCard
                question={currentQuestion.question}
                language={currentQuestion.language}
              />

              <View style={styles.answers}>
                {currentQuestion.options.map((option) => (
                  <AnswerButton
                    key={option.id}
                    label={option.text}
                    language={currentQuestion.language}
                    status={statusFor(option.id)}
                    disabled={state.phase !== 'answering'}
                    onPress={() => answer(option.id)}
                  />
                ))}
              </View>

              <FeedbackBanner isCorrect={state.lastAnswerCorrect} />

              <View style={styles.nextSlot}>
                {state.phase === 'feedback' ? (
                  <PrimaryButton label={isLastQuestion ? 'شوف النتيجة' : 'التالي'} onPress={next} />
                ) : null}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: {
    flexShrink: 1,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 26,
    lineHeight: 38,
    color: colors.ink,
  },
  playArea: {
    flex: 1,
    gap: spacing.lg,
  },
  answers: {
    gap: spacing.md,
  },
  nextSlot: {
    marginTop: 'auto',
    minHeight: MIN_BUTTON_HEIGHT,
  },
});
