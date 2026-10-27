import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';
import type { QuestionSource } from '../types/question';

type SourceToggleProps = {
  value: QuestionSource;
  onChange: (source: QuestionSource) => void;
};

const OPTIONS: { value: QuestionSource; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'local', label: 'عربي', icon: 'chatbubble-ellipses' },
  { value: 'online', label: 'English · إنترنت', icon: 'globe' },
];

/** Segmented pill choosing where the questions come from. */
export function SourceToggle({ value, onChange }: SourceToggleProps) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            role="radio"
            aria-checked={selected}
            aria-label={`مصدر الأسئلة: ${option.label}`}
            style={[styles.option, selected && styles.selected]}
          >
            <Ionicons
              name={option.icon}
              size={18}
              color={selected ? colors.textOnLight : colors.textMuted}
            />
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
  },
  selected: {
    backgroundColor: colors.white,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.textOnLight,
  },
});
