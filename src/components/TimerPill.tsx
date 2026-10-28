import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type TimerPillProps = {
  remainingMs: number;
  paused: boolean;
  /** The question is over: the clock is frozen and the controls are off. */
  stopped: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
};

const URGENT_SECONDS = 5;

/** «00:12» with the host's pause/play and restart buttons; red for the last five seconds. */
export function TimerPill({ remainingMs, paused, stopped, onTogglePause, onRestart }: TimerPillProps) {
  const seconds = Math.ceil(remainingMs / 1000);
  const urgent = !stopped && !paused && seconds <= URGENT_SECONDS;
  const label = `00:${String(seconds).padStart(2, '0')}`;
  return (
    <View
      style={[styles.pill, urgent && styles.urgent]}
      accessibilityLabel={`${paused ? 'الوقت واقف' : 'باقي'} ${seconds} ثانية`}
      accessibilityLiveRegion={urgent ? 'polite' : 'none'}
    >
      <Pressable
        onPress={onTogglePause}
        disabled={stopped}
        accessibilityRole="button"
        accessibilityLabel={paused ? 'كمّل الوقت' : 'وقّف الوقت'}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, stopped && styles.off]}
      >
        <Ionicons name={paused ? 'play' : 'pause'} size={18} color={colors.white} />
      </Pressable>
      <Text style={styles.time}>{label}</Text>
      <Pressable
        onPress={onRestart}
        disabled={stopped}
        accessibilityRole="button"
        accessibilityLabel="أعد الوقت من البداية"
        style={({ pressed }) => [styles.button, pressed && styles.pressed, stopped && styles.off]}
      >
        <Ionicons name="refresh" size={18} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDeep,
    borderWidth: 2,
    borderColor: colors.primaryBright,
  },
  urgent: {
    backgroundColor: colors.errorStrong,
    borderColor: colors.error,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  off: {
    opacity: 0.4,
  },
  time: {
    minWidth: 64,
    textAlign: 'center',
    fontFamily: fonts.extraBold,
    fontSize: 22,
    lineHeight: 30,
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
});
