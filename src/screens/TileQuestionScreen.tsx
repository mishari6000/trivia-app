import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AnswerButton } from '../components/AnswerButton';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { FiftyFiftyButton } from '../components/FiftyFiftyButton';
import { FramedCard } from '../components/FramedCard';
import { ScreenLayout } from '../components/ScreenLayout';
import { TeamCard } from '../components/TeamCard';
import { TimerPill } from '../components/TimerPill';
import { DIFFICULTY_LABELS } from '../data/bank';
import { getCategory } from '../data/categories';
import { getAnswerStatus, getFeedbackOutcome, getRevealedAnswer } from '../game/answerStatus';
import { SCORE_STEP, type Team, type TeamIndex, type Tile } from '../game/board';
import { useTriviaGame } from '../game/useTriviaGame';
import { colors, fonts, radius, spacing, textDirection } from '../theme/theme';
import type { PlayableQuestion } from '../types/question';
import { WIDE_MIN } from './BoardScreen';

type TileQuestionScreenProps = {
  tile: Tile;
  /** One question; a stable array so the game engine is not reset on re-render. */
  questions: PlayableQuestion[];
  teams: [Team, Team];
  turn: TeamIndex;
  onAdjust: (team: TeamIndex, delta: number) => void;
  onDone: (result: { correct: boolean; usedFiftyFifty: boolean }) => void;
};

/**
 * One board tile. The team in turn taps an answer (right = the tile's points), or the host
 * shows the answer. The host can pause or restart the clock and fix either team's score.
 */
export function TileQuestionScreen({ tile, questions, teams, turn, onAdjust, onDone }: TileQuestionScreenProps) {
  const game = useTriviaGame(questions, { autoAdvance: false });
  const { state, remainingMs, paused, canUseFiftyFifty } = game;
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_MIN;
  const question = game.currentQuestion ?? questions[0];
  const resolved = state.phase !== 'answering';
  const team = teams[turn];
  const correct = state.score > 0;
  const done = () => onDone({ correct, usedFiftyFifty: state.lifelineUsed });

  const topBar = (
    <View style={styles.topBar}>
      <View style={styles.tilePill}>
        <Text style={styles.tileCategory}>{getCategory(tile.category).label}</Text>
        <Text style={styles.tilePoints}>
          {tile.points} نقطة · {DIFFICULTY_LABELS[tile.difficulty]}
        </Text>
      </View>
      <TimerPill
        remainingMs={remainingMs}
        paused={paused}
        stopped={resolved}
        onTogglePause={game.togglePause}
        onRestart={game.restartTimer}
      />
    </View>
  );

  const pairs = [question.options.slice(0, 2), question.options.slice(2, 4)];
  const panel = (
    <FramedCard style={styles.panel}>
      <Text style={[styles.turn, { color: turn === 0 ? colors.teamOne : colors.teamTwo }]}>
        {paused ? 'الوقت واقف' : `دور ${team.name}`}
      </Text>
      <Text
        style={[styles.question, wide && styles.questionWide, textDirection(question.language)]}
        accessibilityRole="header"
      >
        {question.question}
      </Text>

      <View style={styles.answers}>
        {pairs.map((row, r) => (
          <View key={r} style={styles.answerRow}>
            {row.map((option) => (
              <View key={option.id} style={styles.answerCell}>
                <AnswerButton
                  label={option.text}
                  language={question.language}
                  status={getAnswerStatus(state, option.id)}
                  disabled={resolved || paused}
                  onPress={() => game.answer(option.id)}
                />
              </View>
            ))}
          </View>
        ))}
      </View>

      <FiftyFiftyButton
        used={team.fiftyFiftyUsed || state.lifelineUsed}
        disabled={team.fiftyFiftyUsed || !canUseFiftyFifty}
        onPress={game.applyFiftyFifty}
      />
      <FeedbackBanner outcome={getFeedbackOutcome(state)} correctAnswer={getRevealedAnswer(state)} />

      <View style={styles.bottomBar}>
        <Pressable
          onPress={done}
          disabled={!resolved}
          accessibilityRole="button"
          accessibilityState={{ disabled: !resolved }}
          style={({ pressed }) => [styles.back, !resolved && styles.off, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-forward" size={18} color={colors.textOnLight} />
          <Text style={styles.backText}>{correct ? `+${tile.points} · الرجوع للوحة` : 'الرجوع للوحة'}</Text>
        </Pressable>
        {resolved ? null : (
          <Pressable
            onPress={game.reveal}
            accessibilityRole="button"
            style={({ pressed }) => [styles.reveal, pressed && styles.pressed]}
          >
            <Text style={styles.revealText}>اظهر الجواب</Text>
            <Ionicons name="eye" size={18} color={colors.textOnLight} />
          </Pressable>
        )}
      </View>
    </FramedCard>
  );

  const teamCards = ([0, 1] as const).map((i) => (
    <TeamCard
      key={i}
      team={teams[i]}
      index={i}
      active={turn === i}
      compact={!wide}
      onPlus={() => onAdjust(i, SCORE_STEP)}
      onMinus={() => onAdjust(i, -SCORE_STEP)}
    />
  ));

  if (wide) {
    return (
      <ScreenLayout maxWidth={1280} header={topBar}>
        <View style={styles.wideRow}>
          <View style={styles.sidebar}>{teamCards}</View>
          <View style={styles.main}>{panel}</View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout header={topBar}>
      {panel}
      <View style={styles.teamsRow}>{teamCards}</View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tilePill: {
    flexShrink: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    backgroundImage: 'linear-gradient(110deg, #076B45 0%, #0E9F62 100%)',
  },
  tileCategory: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.white,
  },
  tilePoints: {
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  panel: {
    gap: spacing.lg,
  },
  turn: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  question: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    lineHeight: 38,
    color: colors.text,
    textAlign: 'center',
  },
  questionWide: {
    fontSize: 32,
    lineHeight: 48,
  },
  answers: {
    gap: spacing.md,
  },
  answerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  answerCell: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  backText: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.textOnLight,
  },
  reveal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.teamTwo,
  },
  revealText: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.textOnLight,
  },
  off: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  wideRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  sidebar: {
    width: 260,
    gap: spacing.md,
  },
  main: {
    flex: 1,
  },
  teamsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
