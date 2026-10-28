import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryTile } from '../components/CategoryTile';
import { GameTitle } from '../components/GameTitle';
import { InfoBanner } from '../components/InfoBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { boardCategories, countQuestions } from '../data/bank';
import { BOARD_CATEGORIES } from '../game/board';
import { QUESTION_TIME_MS } from '../game/gameReducer';
import { colors, fonts, radius, spacing } from '../theme/theme';
import type { CategoryName } from '../types/question';

type SetupScreenProps = {
  initialCategories: CategoryName[];
  initialNames: [string, string];
  onStart: (categories: CategoryName[], teamNames: [string, string]) => void;
};

export const DEFAULT_TEAM_NAMES: [string, string] = ['الفريق الأول', 'الفريق الثاني'];

/** Pairs of cards, so the grid is two columns wide on every phone. */
function pairs<T>(items: T[]): T[][] {
  return Array.from({ length: Math.ceil(items.length / 2) }, (_, i) => items.slice(i * 2, i * 2 + 2));
}

/** Before a game: name the two teams and pick the board's six categories. */
export function SetupScreen({ initialCategories, initialNames, onStart }: SetupScreenProps) {
  const [picked, setPicked] = useState<CategoryName[]>(initialCategories);
  const [names, setNames] = useState<[string, string]>(initialNames);
  const list = boardCategories();
  const full = picked.length === BOARD_CATEGORIES;

  const toggle = (name: CategoryName) =>
    setPicked((current) =>
      current.includes(name)
        ? current.filter((c) => c !== name)
        : current.length < BOARD_CATEGORIES
          ? [...current, name]
          : current,
    );
  const setName = (team: 0 | 1, value: string) =>
    setNames((current) => (team === 0 ? [value, current[1]] : [current[0], value]));
  const start = () =>
    onStart(picked, [names[0].trim() || DEFAULT_TEAM_NAMES[0], names[1].trim() || DEFAULT_TEAM_NAMES[1]]);

  return (
    <ScreenLayout
      header={
        <View style={styles.hero}>
          <GameTitle size="large" />
          <View style={styles.greeting}>
            <Text style={styles.hello}>هلا والله!</Text>
            <Text style={styles.tagline}>فريقين، ست فئات، و36 سؤال. مين يفوز؟</Text>
          </View>
        </View>
      }
    >
      <InfoBanner
        seconds={QUESTION_TIME_MS / 1000}
        title="100 سهل · 300 متوسط · 500 صعب"
        subtitle="الجواب الصح يجيب النقاط، وكل فريق عنده 50/50 مرة وحدة"
      />

      <Text style={styles.section} accessibilityRole="header">
        أسماء الفرق
      </Text>
      <View style={styles.teams}>
        {([0, 1] as const).map((team) => (
          <TextInput
            key={team}
            value={names[team]}
            onChangeText={(value) => setName(team, value)}
            placeholder={DEFAULT_TEAM_NAMES[team]}
            placeholderTextColor={colors.textMuted}
            maxLength={16}
            accessibilityLabel={`اسم ${DEFAULT_TEAM_NAMES[team]}`}
            style={[styles.input, team === 1 && styles.inputSecond]}
          />
        ))}
      </View>

      <Text style={styles.section} accessibilityRole="header">
        اختار {BOARD_CATEGORIES} فئات · {picked.length}/{BOARD_CATEGORIES}
      </Text>
      <View style={styles.grid}>
        {pairs(list).map((row) => (
          <View key={row[0].name} style={styles.row}>
            {row.map((category) => {
              const order = picked.indexOf(category.name);
              return (
                <CategoryTile
                  key={category.name}
                  label={category.label}
                  badge={{ icon: 'help-circle', text: String(countQuestions(category.name)) }}
                  image={category.image}
                  icon={category.icon}
                  selected={order === -1 ? null : order + 1}
                  disabled={full && order === -1}
                  onPress={() => toggle(category.name)}
                />
              );
            })}
            {row.length === 1 ? <View style={styles.spacer} /> : null}
          </View>
        ))}
      </View>

      <PrimaryButton
        label={full ? 'ابدأ اللعبة' : `باقي ${BOARD_CATEGORIES - picked.length} من الفئات`}
        disabled={!full}
        onPress={start}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
  },
  greeting: {
    gap: spacing.xs,
  },
  hello: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 44,
    color: colors.text,
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 28,
    color: colors.textMuted,
  },
  section: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 30,
    color: colors.text,
    marginTop: spacing.sm,
  },
  teams: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primaryBright,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
    textAlign: 'right',
  },
  inputSecond: {
    borderColor: colors.teamTwo,
  },
  grid: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  spacer: {
    flex: 1,
  },
});
