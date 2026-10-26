import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type CategoryBadgeProps = {
  label: string;
};

export function CategoryBadge({ label }: CategoryBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
  },
});
