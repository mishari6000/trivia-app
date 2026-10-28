import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Team } from '../game/board';
import { colors, fonts, radius, spacing } from '../theme/theme';

type TeamCardProps = {
  team: Team;
  /** 0 = green, 1 = amber, matching the team's tiles on the board. */
  index: 0 | 1;
  active: boolean;
  compact: boolean;
  onPlus: () => void;
  onMinus: () => void;
};

/** A team's name, score with the host's −/+ fix buttons, turn marker and 50/50 state. */
export function TeamCard({ team, index, active, compact, onPlus, onMinus }: TeamCardProps) {
  const color = index === 0 ? colors.teamOne : colors.teamTwo;
  return (
    <View
      style={[styles.card, compact && styles.compact, active && { borderColor: color }]}
      accessibilityLabel={`${team.name}: ${team.score} نقطة${active ? '، الدور عنده' : ''}`}
    >
      <View style={styles.top}>
        <Text style={[styles.name, { color }]} numberOfLines={1}>
          {team.name}
        </Text>
        {active ? (
          <View style={[styles.turn, { backgroundColor: color }]}>
            <Text style={styles.turnText}>الدور</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.scoreRow}>
        <Pressable
          onPress={onPlus}
          accessibilityRole="button"
          accessibilityLabel={`زيد ${team.name} 100`}
          style={({ pressed }) => [styles.step, compact && styles.stepCompact, pressed && styles.stepPressed]}
        >
          <Ionicons name="add" size={compact ? 18 : 22} color={colors.text} />
        </Pressable>
        <Text style={[styles.score, compact && styles.scoreCompact]}>{team.score}</Text>
        <Pressable
          onPress={onMinus}
          accessibilityRole="button"
          accessibilityLabel={`نقّص ${team.name} 100`}
          style={({ pressed }) => [styles.step, compact && styles.stepCompact, pressed && styles.stepPressed]}
        >
          <Ionicons name="remove" size={compact ? 18 : 22} color={colors.text} />
        </Pressable>
      </View>

      <Text style={styles.lifeline}>{team.fiftyFiftyUsed ? '50/50 · استخدمه' : '50/50 · متاح'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  compact: {
    gap: spacing.xs,
    padding: spacing.sm,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  name: {
    flexShrink: 1,
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 26,
  },
  turn: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  turnText: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    lineHeight: 20,
    color: colors.textOnLight,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    backgroundColor: colors.background,
    padding: spacing.xs,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  stepCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  stepPressed: {
    backgroundColor: colors.glass,
  },
  score: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 40,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  scoreCompact: {
    fontSize: 22,
    lineHeight: 30,
  },
  lifeline: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
