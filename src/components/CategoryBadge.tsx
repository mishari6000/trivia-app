import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/theme';

type CategoryBadgeProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function CategoryBadge({ label, style }: CategoryBadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.glass,
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
});
