import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme/theme';

type ProgressRingProps = {
  size: number;
  strokeWidth: number;
  /** 0 → empty, 1 → full circle. */
  progress: number;
  color: string;
  trackColor?: string;
  children?: ReactNode;
};

/** Circular progress (countdowns, scores) with content centered inside. */
export function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = colors.surfaceRaised,
  children,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={{ width: size, height: size }}>
      {/* Rotated so the arc starts at 12 o'clock. */}
      <Svg width={size} height={size} style={styles.svg}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          fill="none"
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
