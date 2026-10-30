import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  canGenerate,
  CUSTOM_QUESTIONS,
  CustomCategoryError,
  hasCustom,
  MONTHLY_LIMIT,
  nextMonthStart,
  remainingThisMonth,
  type CustomErrorKind,
  type SavedCustom,
} from '../data/customCategory';
import { colors, fonts, radius, spacing } from '../theme/theme';
import { AiBadge } from './AiBadge';

type CustomCategoryCardProps = {
  /** null while the saved category is still loading. */
  saved: SavedCustom | null;
  /** Its place in the pick order, or null when not picked. */
  order: number | null;
  /** Six already picked and this is not one of them. */
  disabled: boolean;
  onToggle: () => void;
  onGenerate: (topic: string) => Promise<void>;
};

const ERRORS: Record<CustomErrorKind, string> = {
  limit: 'خلصت أسئلتك لهالشهر.',
  network: 'ما قدرنا نوصل للإنترنت، تأكد من الاتصال.',
  timeout: 'الذكاء الاصطناعي طوّل، حاول مرة ثانية.',
  'bad-topic': 'ما نقدر نسوي أسئلة عن هالموضوع، جرّب موضوع ثاني.',
  'invalid-topic': 'اكتب موضوع من حرفين إلى 40 حرف.',
  'not-enough': 'ما طلعت أسئلة مضبوطة كفاية، جرّب موضوع أوضح.',
  'rate-limit': 'طلبات كثير، جرّب بعد دقيقة.',
  unavailable: 'الخدمة مو متاحة الحين، جرّب بعدين.',
};

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const dayMonth = (date: Date) => `${date.getDate()} ${MONTHS[date.getMonth()]}`;

/** «صمم فئتك»: type a topic, AI writes five questions (five a month per device), pick it for the board. */
export function CustomCategoryCard({ saved, order, disabled, onToggle, onGenerate }: CustomCategoryCardProps) {
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CustomErrorKind | null>(null);

  const ready = saved !== null && hasCustom(saved);
  const allowedNow = saved !== null && canGenerate(saved);
  const selected = order !== null;

  const generate = async () => {
    setError(null);
    setBusy(true);
    try {
      await onGenerate(topic.trim());
      setTopic('');
    } catch (e) {
      setError(e instanceof CustomCategoryError ? e.kind : 'unavailable');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.card, selected && styles.selected]}>
      <View style={styles.head}>
        <View style={styles.iconBox}>
          <Ionicons name="sparkles" size={24} color={colors.textOnLight} />
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>صمم فئتك</Text>
          <Text style={styles.subtitle}>اكتب أي موضوع، والذكاء الاصطناعي يولّد لك {CUSTOM_QUESTIONS} أسئلة</Text>
        </View>
        <AiBadge />
      </View>

      {ready ? (
        <View style={styles.mine}>
          <Text style={styles.mineText} numberOfLines={1}>
            فئتك: {saved.topic}
          </Text>
          <Pressable
            onPress={onToggle}
            disabled={disabled}
            role="checkbox"
            aria-checked={selected}
            accessibilityLabel={`فئتك ${saved.topic}`}
            style={({ pressed }) => [styles.pick, selected && styles.pickSelected, disabled && styles.off, pressed && styles.pressed]}
          >
            {selected ? <Ionicons name="checkmark" size={18} color={colors.textOnLight} /> : null}
            <Text style={[styles.pickText, selected && styles.pickTextSelected]}>
              {selected ? `مختارة · ${order}` : 'اختار'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {busy ? (
        <View style={styles.busy} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.primaryBright} />
          <Text style={styles.busyText}>الذكاء الاصطناعي يكتب أسئلتك ويتأكد منها…</Text>
        </View>
      ) : allowedNow ? (
        <View style={styles.form}>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder={ready ? 'أو صمم فئة جديدة: اكتب موضوع' : 'مثلًا: تاريخ الكويت، الفضاء، كرة القدم'}
            placeholderTextColor={colors.textMuted}
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={topic.trim().length >= 2 ? generate : undefined}
            accessibilityLabel="موضوع فئتك"
            style={styles.input}
          />
          <Pressable
            onPress={generate}
            disabled={topic.trim().length < 2}
            accessibilityRole="button"
            accessibilityLabel="ولّد الأسئلة بالذكاء الاصطناعي"
            style={({ pressed }) => [styles.go, topic.trim().length < 2 && styles.off, pressed && styles.pressed]}
          >
            <Ionicons name="sparkles" size={16} color={colors.textOnLight} />
            <Text style={styles.goText}>ولّد</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {ERRORS[error]}
        </Text>
      ) : null}

      <Text style={styles.quota}>
        {saved === null
          ? ' '
          : allowedNow
            ? `باقي لك هالشهر: ${remainingThisMonth(saved)} من ${MONTHLY_LIMIT} أسئلة`
            : `استخدمت أسئلة هالشهر. تقدر تصمم فئة جديدة من ${dayMonth(nextMonthStart(new Date()))}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl - 4,
    borderWidth: 2,
    borderColor: colors.teamTwo,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.primaryBright,
    borderWidth: 3,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teamTwo,
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  mine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    paddingStart: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  mineText: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  pickSelected: {
    backgroundColor: colors.primaryBright,
  },
  pickText: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.text,
  },
  pickTextSelected: {
    color: colors.textOnLight,
  },
  form: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15,
    textAlign: 'right',
  },
  go: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.teamTwo,
  },
  goText: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: colors.textOnLight,
  },
  busy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
  },
  busyText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.error,
  },
  quota: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  off: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
