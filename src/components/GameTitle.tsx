import { StyleSheet, Text } from 'react-native';

import { logoText } from '../theme/theme';

type GameTitleProps = {
  size: 'large' | 'compact';
};

/** The game's typographic logo: chunky blue letters with a hard navy offset shadow. */
export function GameTitle({ size }: GameTitleProps) {
  return (
    <Text
      style={[logoText, size === 'large' ? styles.large : styles.compact]}
      accessibilityRole="header"
    >
      تحدّي اليمعة
    </Text>
  );
}

const styles = StyleSheet.create({
  large: {
    fontSize: 48,
    lineHeight: 72,
    textAlign: 'center',
  },
  compact: {
    fontSize: 28,
    lineHeight: 42,
  },
});
