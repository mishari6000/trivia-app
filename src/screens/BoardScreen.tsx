import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BoardGrid } from '../components/BoardGrid';
import { FramedCard } from '../components/FramedCard';
import { GameTitle } from '../components/GameTitle';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { SecondaryButton } from '../components/SecondaryButton';
import { TeamCard } from '../components/TeamCard';
import { isFinished, SCORE_STEP, winner, type BoardState, type TeamIndex, type Tile } from '../game/board';
import { colors, fonts, radius, spacing } from '../theme/theme';

type BoardScreenProps = {
  board: BoardState;
  onPick: (tile: Tile) => void;
  onAdjust: (team: TeamIndex, delta: number) => void;
  onSwitchTurn: () => void;
  onNewGame: () => void;
  onChangeCategories: () => void;
};

/** From this width the teams move to a side panel and the board gets full-size tiles. */
export const WIDE_MIN = 760;
/** A phone on its side: wide enough for the side panel, but short, so tiles stay small. */
const SHORT_MAX = 520;

/** The game board: six category columns of point tiles, with both teams' scores. */
export function BoardScreen({
  board,
  onPick,
  onAdjust,
  onSwitchTurn,
  onNewGame,
  onChangeCategories,
}: BoardScreenProps) {
  const { width, height } = useWindowDimensions();
  const wide = width >= WIDE_MIN;
  const short = height <= SHORT_MAX;
  // An upright phone squeezes six columns: ask to turn it sideways for the full board.
  const rotateHint = !wide && height > width;
  const finished = isFinished(board);
  const left = board.tiles.filter((t) => !t.result).length;

  const teams = ([0, 1] as const).map((i) => (
    <TeamCard
      key={i}
      team={board.teams[i]}
      index={i}
      active={!finished && board.turn === i}
      compact={!wide}
      onPlus={() => onAdjust(i, SCORE_STEP)}
      onMinus={() => onAdjust(i, -SCORE_STEP)}
    />
  ));
  const switchTurn = finished ? null : (
    <Pressable
      onPress={onSwitchTurn}
      accessibilityRole="button"
      style={({ pressed }) => [styles.switch, pressed && styles.switchPressed]}
    >
      <Ionicons name="swap-horizontal" size={18} color={colors.text} />
      <Text style={styles.switchText}>بدّل الدور</Text>
    </Pressable>
  );

  const champion = winner(board);
  const results = finished ? (
    <FramedCard style={styles.results}>
      <Ionicons name="trophy" size={52} color={colors.teamTwo} />
      <Text style={styles.resultsTitle} accessibilityRole="header">
        {champion === null ? 'تعادل!' : `فاز ${board.teams[champion].name}!`}
      </Text>
      <Text style={styles.resultsScores}>
        {board.teams[0].name} {board.teams[0].score} · {board.teams[1].name} {board.teams[1].score}
      </Text>
      <View style={styles.resultsActions}>
        <PrimaryButton label="لعبة جديدة بنفس الفئات" onPress={onNewGame} />
        <SecondaryButton label="غيّر الفئات" onPress={onChangeCategories} />
      </View>
    </FramedCard>
  ) : null;

  const topBar = (
    <View style={styles.topBar}>
      <Pressable
        onPress={onChangeCategories}
        accessibilityRole="button"
        accessibilityLabel="خروج للفئات"
        style={({ pressed }) => [styles.exit, pressed && styles.switchPressed]}
      >
        <Ionicons name="exit-outline" size={20} color={colors.text} />
        <Text style={styles.exitText}>خروج</Text>
      </Pressable>
      <GameTitle size="compact" />
      <Text style={styles.left}>{finished ? 'خلصت اللعبة' : `باقي ${left}`}</Text>
    </View>
  );

  if (wide) {
    return (
      <ScreenLayout maxWidth={1280} header={topBar}>
        <View style={styles.wideRow}>
          <View style={[styles.sidebar, short && styles.sidebarShort]}>
            {teams[0]}
            {switchTurn}
            {teams[1]}
          </View>
          <View style={styles.wideBoard}>
            {results}
            <BoardGrid categories={board.categories} tiles={board.tiles} compact={false} short={short} onPick={onPick} />
          </View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      header={
        <>
          {topBar}
          <View style={styles.teamsRow}>{teams}</View>
          {switchTurn}
        </>
      }
    >
      {rotateHint && !finished ? (
        <View style={styles.rotate} accessibilityRole="alert">
          <Ionicons name="phone-landscape-outline" size={26} color={colors.teamTwo} />
          <Text style={styles.rotateText}>لفّ جوالك بالعرض عشان تشوف اللوحة كاملة</Text>
        </View>
      ) : null}
      {results}
      <BoardGrid categories={board.categories} tiles={board.tiles} compact onPick={onPick} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  exit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  exitText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  left: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textMuted,
  },
  teamsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rotate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.teamTwo,
    backgroundColor: colors.teamTwoSoft,
  },
  rotateText: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 40,
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  switchPressed: {
    backgroundColor: colors.glass,
  },
  switchText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  wideRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  sidebar: {
    width: 260,
    gap: spacing.sm,
  },
  sidebarShort: {
    width: 210,
  },
  wideBoard: {
    flex: 1,
    gap: spacing.lg,
  },
  results: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  resultsTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    lineHeight: 40,
    color: colors.text,
    textAlign: 'center',
  },
  resultsScores: {
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 26,
    color: colors.textMuted,
    textAlign: 'center',
  },
  resultsActions: {
    alignSelf: 'stretch',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
