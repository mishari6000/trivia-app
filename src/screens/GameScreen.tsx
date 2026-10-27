import { useEffect, useRef } from 'react';
import { StyleSheet, View, type ScrollViewInstance } from 'react-native';

import { AnswerButton, type AnswerButtonStatus } from '../components/AnswerButton';
import { CategoryBadge } from '../components/CategoryBadge';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { GameTitle } from '../components/GameTitle';
import { PrimaryButton } from '../components/PrimaryButton';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionProgress } from '../components/QuestionProgress';
import { ResultsPanel } from '../components/ResultsPanel';
import { ScoreBadge } from '../components/ScoreBadge';
import { ScreenLayout } from '../components/ScreenLayout';
import { getQuestionProgress } from '../game/progress';
import { useTriviaGame } from '../game/useTriviaGame';
import { MIN_BUTTON_HEIGHT, spacing } from '../theme/theme';

export function GameScreen() {
  const { state, currentQuestion, totalQuestions, isLastQuestion, answer, next, restart } =
    useTriviaGame();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const isResults = state.phase === 'results';
  const progress = getQuestionProgress(state);

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
    <ScreenLayout
      scrollRef={scrollRef}
      header={
        <>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <GameTitle size="compact" />
              <CategoryBadge label="معلومات عامة" />
            </View>
            <ScoreBadge score={state.score} />
          </View>
          {isResults ? null : <QuestionProgress {...progress} />}
        </>
      }
    >
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
