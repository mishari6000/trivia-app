import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';

import { AnswerButton } from '../components/AnswerButton';
import { CategoryBadge } from '../components/CategoryBadge';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { FiftyFiftyButton } from '../components/FiftyFiftyButton';
import { GameTitle } from '../components/GameTitle';
import { PrimaryButton } from '../components/PrimaryButton';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionProgress } from '../components/QuestionProgress';
import { QuestionTimer } from '../components/QuestionTimer';
import { ResultsPanel } from '../components/ResultsPanel';
import { ScoreBadge } from '../components/ScoreBadge';
import { ScreenLayout } from '../components/ScreenLayout';
import { getCategory } from '../data/categories';
import { getAnswerStatus, getFeedbackOutcome, getRevealedAnswer } from '../game/answerStatus';
import { getQuestionProgress } from '../game/progress';
import { useTriviaGame } from '../game/useTriviaGame';
import { colors, fonts, MIN_BUTTON_HEIGHT, spacing } from '../theme/theme';
import type { CategoryName } from '../types/question';

type GameScreenProps = {
  category: CategoryName;
  onChangeCategory: () => void;
};

export function GameScreen({ category, onChangeCategory }: GameScreenProps) {
  const {
    state,
    currentQuestion,
    totalQuestions,
    isLastQuestion,
    remainingMs,
    totalMs,
    canUseFiftyFifty,
    answer,
    next,
    restart,
    applyFiftyFifty,
  } = useTriviaGame(category);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const isResults = state.phase === 'results';
  const progress = getQuestionProgress(state);

  // Start each new question (and the results) from the top on small screens.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [state.currentIndex, isResults]);

  return (
    <ScreenLayout
      scrollRef={scrollRef}
      header={
        <>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <GameTitle size="compact" />
              <CategoryBadge label={getCategory(category).label} />
            </View>
            <ScoreBadge score={state.score} />
          </View>
          {isResults ? null : (
            <>
              <QuestionProgress {...progress} />
              <QuestionTimer remainingMs={remainingMs} totalMs={totalMs} />
            </>
          )}
        </>
      }
    >
      {isResults || !currentQuestion ? (
        <ResultsPanel
          score={state.score}
          total={totalQuestions}
          onPlayAgain={restart}
          onChangeCategory={onChangeCategory}
        />
      ) : (
        <View style={styles.playArea}>
          <QuestionCard
            question={currentQuestion.question}
            language={currentQuestion.language}
          />

          <FiftyFiftyButton
            used={state.lifelineUsed}
            disabled={!canUseFiftyFifty}
            onPress={applyFiftyFifty}
          />

          <View style={styles.answers}>
            {currentQuestion.options.map((option) => (
              <AnswerButton
                key={option.id}
                label={option.text}
                language={currentQuestion.language}
                status={getAnswerStatus(state, option.id)}
                disabled={state.phase !== 'answering'}
                onPress={() => answer(option.id)}
              />
            ))}
          </View>

          <FeedbackBanner
            outcome={getFeedbackOutcome(state)}
            correctAnswer={getRevealedAnswer(state)}
          />

          <View style={styles.nextSlot}>
            {state.phase === 'feedback' && !state.timedOut ? (
              <PrimaryButton label={isLastQuestion ? 'شوف النتيجة' : 'التالي'} onPress={next} />
            ) : null}
            {state.phase === 'feedback' && state.timedOut ? (
              <Text style={styles.autoNext}>
                {isLastQuestion ? 'نروح للنتيجة…' : 'ننتقل للسؤال التالي…'}
              </Text>
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
    justifyContent: 'center',
  },
  autoNext: {
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 26,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
