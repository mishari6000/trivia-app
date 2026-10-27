import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { SecondaryButton } from '../components/SecondaryButton';
import { StatusCard } from '../components/StatusCard';
import { getCategory, hasLocalQuestions, pickOtherCategory } from '../data/categories';
import { OpenTriviaError, type OpenTriviaErrorKind, type WaitReason } from '../data/openTrivia';
import { loadSession } from '../game/loadSession';
import { colors, fonts } from '../theme/theme';
import type { CategoryName, PlayableQuestion, QuestionSource } from '../types/question';
import { secondsInArabic } from '../utils/arabic';
import { GameScreen } from './GameScreen';

type GameSessionScreenProps = {
  category: CategoryName;
  source: QuestionSource;
  onExit: () => void;
  /** Switch to another category (used by the empty face's «جرّب فئة ثانية»). */
  onChangeCategory: (category: CategoryName) => void;
};

type Result =
  | { key: string; status: 'ready'; questions: PlayableQuestion[] }
  | { key: string; status: 'error'; kind: OpenTriviaErrorKind; at: number };
type Wait = { key: string; until: number; reason: WaitReason };

/** After the client's own retries give up on a busy server, try again by itself after this. */
export const AUTO_RETRY_MS = 10_000;

export const ONLINE_CREDIT = 'الأسئلة من Open Trivia DB · CC BY-SA 4.0';

/**
 * Loads each game's questions (local or internet) and shows one of three faces until the
 * game can start: loading (with what it is waiting for), error (friendly, with retry; a busy
 * server is retried automatically) or empty (no questions, with another choice).
 */
export function GameSessionScreen({
  category,
  source: initialSource,
  onExit,
  onChangeCategory,
}: GameSessionScreenProps) {
  const [source, setSource] = useState(initialSource);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [wait, setWait] = useState<Wait | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const key = `${category}|${source}|${round}`;

  useEffect(() => {
    const controller = new AbortController();
    loadSession(category, source, {
      signal: controller.signal,
      onWait: (ms, reason) => setWait({ key, until: Date.now() + ms, reason }),
    })
      .then((questions) => {
        if (!controller.signal.aborted) setResult({ key, status: 'ready', questions });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const kind = error instanceof OpenTriviaError ? error.kind : 'unknown';
        setResult({ key, status: 'error', kind, at: Date.now() });
      });
    return () => controller.abort();
  }, [category, source, round, key]);

  const current = result?.key === key ? result : null;
  const waiting = wait?.key === key && !current ? wait : null;
  const busy = current?.status === 'error' && current.kind === 'rate-limit' ? current : null;

  // A ticking clock, only while a countdown is on screen.
  const counting = Boolean(waiting || busy);
  useEffect(() => {
    if (!counting) return;
    const tick = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(tick);
  }, [counting]);

  // A busy server is retried by itself once the countdown runs out.
  const busyAt = busy?.at;
  useEffect(() => {
    if (busyAt === undefined) return;
    const retry = setTimeout(() => setRound((r) => r + 1), Math.max(0, busyAt + AUTO_RETRY_MS - Date.now()));
    return () => clearTimeout(retry);
  }, [busyAt]);

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

  const label = getCategory(category).label;
  const online = source === 'online';
  const secondsLeft = (until: number) => Math.max(1, Math.ceil((until - now) / 1000));
  const header = (
    <>
      <Text style={styles.category} accessibilityRole="header">
        {label}
      </Text>
      <Text style={styles.subtitle}>{online ? 'أسئلة من الإنترنت · English' : 'أسئلة اليمعة · عربي'}</Text>
    </>
  );
  const retry = () => setRound((r) => r + 1);
  const arabicFallback =
    online && hasLocalQuestions(category) ? (
      <SecondaryButton label="العب بالأسئلة العربية" onPress={() => setSource('local')} />
    ) : null;
  const back = <SecondaryButton label="رجوع للفئات" onPress={onExit} />;

  // ---- Face 1: loading — always something on screen, and why it may take a moment.
  if (!current) {
    const busyWait = waiting?.reason === 'rate-limit';
    const gapWait = waiting?.reason === 'gap' && waiting.until - now > 1_000;
    return (
      <ScreenLayout variant="hero" header={header}>
        <StatusCard
          visual="loading"
          title={busyWait ? 'الخادم مشغول شوي…' : 'نجيب الأسئلة…'}
          body={
            busyWait
              ? `نعيد المحاولة بروحنا بعد ${secondsInArabic(secondsLeft(waiting.until))}`
              : gapWait
                ? `ننتظر ${secondsInArabic(secondsLeft(waiting.until))} عشان ما نضغط على الخادم`
                : online
                  ? 'نجيب 10 أسئلة من الإنترنت ونختار منها 5'
                  : 'نجهّز خمس أسئلة من أسئلة اليمعة'
          }
          note={online ? ONLINE_CREDIT : undefined}
        />
      </ScreenLayout>
    );
  }

  // ---- Face 3: empty — no questions, and another choice.
  if (current.kind === 'no-results') {
    return (
      <ScreenLayout variant="hero" header={header}>
        <StatusCard
          visual="file-tray-outline"
          title="ما لقينا أسئلة"
          body={`فئة «${label}» ما فيها أسئلة كفاية الحين. جرّب فئة ثانية.`}
        >
          <PrimaryButton
            label="جرّب فئة ثانية"
            onPress={() => onChangeCategory(pickOtherCategory(category, source))}
          />
          {arabicFallback}
          {back}
        </StatusCard>
      </ScreenLayout>
    );
  }

  // ---- Face 2: error — a friendly message and «حاول مرة ثانية».
  if (busy) {
    return (
      <ScreenLayout variant="hero" header={header}>
        <StatusCard
          visual="hourglass-outline"
          title="خادم الأسئلة مشغول"
          body={`ما عليك، نعيد المحاولة بروحنا بعد ${secondsInArabic(secondsLeft(busy.at + AUTO_RETRY_MS))}`}
        >
          <PrimaryButton label="حاول الحين" onPress={retry} />
          {arabicFallback}
          {back}
        </StatusCard>
      </ScreenLayout>
    );
  }

  const network = current.kind === 'network';
  return (
    <ScreenLayout variant="hero" header={header}>
      <StatusCard
        visual={network ? 'cloud-offline-outline' : 'warning-outline'}
        tone="error"
        title={network ? 'ما قدرنا نوصل للإنترنت' : 'صار خطأ من خادم الأسئلة'}
        body={network ? 'تأكد من الاتصال وحاول مرة ثانية.' : 'مو منك، حاول مرة ثانية.'}
      >
        <PrimaryButton label="حاول مرة ثانية" onPress={retry} />
        {arabicFallback}
        {back}
      </StatusCard>
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
});
