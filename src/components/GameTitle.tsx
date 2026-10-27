import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../theme/theme';

type GameTitleProps = {
  size: 'large' | 'compact';
};

/** The game's wordmark: a small green «؟» mark next to the name. */
export function GameTitle({ size }: GameTitleProps) {
  const large = size === 'large';
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="تحدّي اليمعة">
      <View style={[styles.mark, large && styles.markLarge]}>
        <Text style={[styles.markText, large && styles.markTextLarge]}>؟</Text>
      </View>
      <Text style={[styles.name, large && styles.nameLarge]}>تحدّي اليمعة</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBright,
    transform: [{ rotate: '-8deg' }],
  },
  markLarge: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  markText: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textOnLight,
  },
  markTextLarge: {
    fontSize: 26,
    lineHeight: 36,
  },
  name: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    lineHeight: 32,
    color: colors.text,
  },
  nameLarge: {
    fontSize: 24,
    lineHeight: 34,
  },
});
