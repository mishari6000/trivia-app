import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '../components/ScreenLayout';
import { countQuestions, DIFFICULTIES, DIFFICULTY_INFO, isPlayable } from '../data/bank';
import { getCategory } from '../data/categories';
import { colors, fonts, radius, spacing } from '../theme/theme';
import type { CategoryName, Difficulty } from '../types/question';

type LevelScreenProps = {
  category: CategoryName;
  onPick: (difficulty: Difficulty) => void;
  onBack: () => void;
};

/** Arabic agreement for a question count: 3–10 أسئلة، 11+ سؤال. */
const questionCount = (n: number) => (n >= 3 && n <= 10 ? `${n} أسئلة` : `${n} سؤال`);

/** After a category: choose easy, medium or hard. Levels without a full game are disabled. */
export function LevelScreen({ category, onPick, onBack }: LevelScreenProps) {
  return (
    <ScreenLayout
      variant="hero"
      header={
        <>
          <View style={styles.topBar}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="رجوع للفئات"
              style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
            >
              <Ionicons name="arrow-forward" size={24} color={colors.white} />
            </Pressable>
          </View>
          <Text style={styles.category} accessibilityRole="header">
            {getCategory(category).label}
          </Text>
          <Text style={styles.subtitle}>اختار المستوى اللي يناسبك</Text>
        </>
      }
    >
      <View style={styles.list}>
        {DIFFICULTIES.map((difficulty) => {
          const info = DIFFICULTY_INFO[difficulty];
          const playable = isPlayable(category, difficulty);
          return (
            <Pressable
              key={difficulty}
              onPress={() => onPick(difficulty)}
              disabled={!playable}
              accessibilityRole="button"
              accessibilityLabel={`مستوى ${info.label}`}
              accessibilityState={{ disabled: !playable }}
              style={({ pressed }) => [styles.level, pressed && styles.pressed, !playable && styles.disabled]}
            >
              <View style={[styles.icon, styles[difficulty]]}>
                <Ionicons name={info.icon} size={26} color={colors.white} />
              </View>
              <View style={styles.texts}>
                <Text style={styles.label}>{info.label}</Text>
                <Text style={styles.hint}>{playable ? info.hint : 'قريبًا'}</Text>
              </View>
              {playable ? (
                <Text style={styles.count}>{questionCount(countQuestions(category, difficulty))}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.note}>كل لعبة خمس أسئلة جديدة، وما تتكرر لين تخلص أسئلة المستوى.</Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  list: {
    gap: spacing.md,
  },
  level: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  easy: {
    backgroundColor: colors.primary,
  },
  medium: {
    backgroundColor: '#E39B17',
  },
  hard: {
    backgroundColor: colors.errorStrong,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    lineHeight: 32,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  count: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textMuted,
  },
  note: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
