import { useEffect, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';

import { AnswerButton } from '../components/AnswerButton';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { FiftyFiftyButton } from '../components/FiftyFiftyButton';
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
import type { CategoryName, PlayableQuestion } from '../types/question';

type GameScreenProps = {
  category: CategoryName;
  /** The prepared session (5 questions); a new game remounts this screen with new ones. */
  questions: PlayableQuestion[];
  onPlayAgain: () => void;
  onChangeCategory: () => void;
};

export function GameScreen({ category, questions, onPlayAgain, onChangeCategory }: GameScreenProps) {
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
    applyFiftyFifty,
  } = useTriviaGame(questions);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const isResults = state.phase === 'results';
  const progress = getQuestionProgress(state);

  // Start each new question (and the results) from the top on small screens.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [state.currentIndex, isResults]);

  return (
    <ScreenLayout
      variant="hero"
      scrollRef={scrollRef}
      header={
        <>
          <View style={styles.topBar}>
            <Pressable
              onPress={onChangeCategory}
              accessibilityRole="button"
              accessibilityLabel="رجوع للفئات"
              style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
            >
              <Ionicons name="arrow-forward" size={24} color={colors.white} />
            </Pressable>
            <ScoreBadge score={state.score} />
          </View>
          <Text style={styles.category} accessibilityRole="header">
            {getCategory(category).label}
          </Text>
          <Text style={styles.subtitle}>تحدّي اليمعة · خمس أسئلة</Text>
          {isResults ? null : <QuestionProgress {...progress} />}
        </>
      }
    >
      {isResults || !currentQuestion ? (
        <ResultsPanel
          score={state.score}
          total={totalQuestions}
          onPlayAgain={onPlayAgain}
          onChangeCategory={onChangeCategory}
        />
      ) : (
        <View style={styles.playArea}>
          <QuestionTimer remainingMs={remainingMs} totalMs={totalMs} />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
  },
  backPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  category: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 46,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.85)',
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
    color: colors.textMuted,
    textAlign: 'center',
  },
});
