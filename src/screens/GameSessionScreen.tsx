import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FramedCard } from '../components/FramedCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { SecondaryButton } from '../components/SecondaryButton';
import { getCategory, hasLocalQuestions } from '../data/categories';
import { OpenTriviaError, type OpenTriviaErrorKind } from '../data/openTrivia';
import { loadSession } from '../game/loadSession';
import { colors, fonts, spacing } from '../theme/theme';
import type { CategoryName, PlayableQuestion, QuestionSource } from '../types/question';
import { GameScreen } from './GameScreen';

type GameSessionScreenProps = {
  category: CategoryName;
  source: QuestionSource;
  onExit: () => void;
};

type Result =
  | { key: string; status: 'ready'; questions: PlayableQuestion[] }
  | { key: string; status: 'error'; kind: OpenTriviaErrorKind };

const ERROR_TEXT: Record<OpenTriviaErrorKind, { title: string; body: string }> = {
  network: { title: 'ما قدرنا نوصل للإنترنت', body: 'تأكد من الاتصال وحاول مرة ثانية.' },
  'no-results': { title: 'ما لقينا أسئلة كافية', body: 'هالفئة ما فيها أسئلة كفاية الحين.' },
  'rate-limit': { title: 'خادم الأسئلة مشغول', body: 'انتظر ثواني وحاول مرة ثانية.' },
  invalid: { title: 'صار خطأ من خادم الأسئلة', body: 'حاول مرة ثانية.' },
  unknown: { title: 'صار خطأ من خادم الأسئلة', body: 'حاول مرة ثانية.' },
};

export const ONLINE_CREDIT = 'الأسئلة من Open Trivia DB · CC BY-SA 4.0';

/**
 * Loads each game's questions (local or internet), shows loading and errors, then runs the
 * game. «العب مرة ثانية» loads a fresh session; a failed internet load can retry or fall back
 * to the Arabic questions when the category has them.
 */
export function GameSessionScreen({ category, source: initialSource, onExit }: GameSessionScreenProps) {
  const [source, setSource] = useState(initialSource);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = `${category}|${source}|${round}`;

  useEffect(() => {
    const controller = new AbortController();
    loadSession(category, source, { signal: controller.signal })
      .then((questions) => {
        if (!controller.signal.aborted) setResult({ key, status: 'ready', questions });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const kind = error instanceof OpenTriviaError ? error.kind : 'unknown';
        setResult({ key, status: 'error', kind });
      });
    return () => controller.abort();
  }, [category, source, round, key]);

  const label = getCategory(category).label;
  const current = result?.key === key ? result : null;

  if (current?.status === 'ready') {
    return (
      <GameScreen
        key={key}
        category={category}
        questions={current.questions}
        onPlayAgain={() => setRound((r) => r + 1)}
        onChangeCategory={onExit}
      />
    );
  }

  const header = (
    <>
      <Text style={styles.category} accessibilityRole="header">
        {label}
      </Text>
      <Text style={styles.subtitle}>
        {source === 'online' ? 'أسئلة من الإنترنت · English' : 'أسئلة اليمعة · عربي'}
      </Text>
    </>
  );

  if (!current) {
    return (
      <ScreenLayout variant="hero" header={header}>
        <FramedCard style={styles.card}>
          <ActivityIndicator size="large" color={colors.primaryBright} />
          <Text style={styles.title} accessibilityLiveRegion="polite">
            نجيب الأسئلة…
          </Text>
          {source === 'online' ? <Text style={styles.credit}>{ONLINE_CREDIT}</Text> : null}
        </FramedCard>
      </ScreenLayout>
    );
  }

  const text = ERROR_TEXT[current.kind];
  return (
    <ScreenLayout variant="hero" header={header}>
      <FramedCard style={styles.card}>
        <Ionicons name="cloud-offline" size={52} color={colors.error} />
        <Text style={styles.title} accessibilityRole="alert">
          {text.title}
        </Text>
        <Text style={styles.body}>{text.body}</Text>
      </FramedCard>
      <View style={styles.actions}>
        <PrimaryButton label="حاول مرة ثانية" onPress={() => setRound((r) => r + 1)} />
        {hasLocalQuestions(category) ? (
          <SecondaryButton label="العب بالأسئلة العربية" onPress={() => setSource('local')} />
        ) : null}
        <SecondaryButton label="رجوع للفئات" onPress={onExit} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  credit: {
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
