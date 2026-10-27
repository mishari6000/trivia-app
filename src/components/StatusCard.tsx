import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme/theme';
import { FramedCard } from './FramedCard';

type StatusCardProps = {
  /** An icon, or `'loading'` for a spinner. */
  visual: keyof typeof Ionicons.glyphMap | 'loading';
  tone?: 'neutral' | 'error';
  title: string;
  body?: string;
  /** Small print under the body (e.g. the questions' source). */
  note?: string;
  /** Buttons under the card. */
  children?: ReactNode;
};

/** One face of a loading flow: loading, error or empty — never a blank screen. */
export function StatusCard({ visual, tone = 'neutral', title, body, note, children }: StatusCardProps) {
  return (
    <>
      <FramedCard style={styles.card}>
        {visual === 'loading' ? (
          <ActivityIndicator size="large" color={colors.primaryBright} />
        ) : (
          <Ionicons
            name={visual}
            size={52}
            color={tone === 'error' ? colors.error : colors.primaryBright}
          />
        )}
        <Text
          style={styles.title}
          accessibilityRole={tone === 'error' ? 'alert' : 'header'}
          accessibilityLiveRegion="polite"
        >
          {title}
        </Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </FramedCard>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    lineHeight: 34,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 28,
    color: colors.textMuted,
    textAlign: 'center',
  },
  note: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
});
