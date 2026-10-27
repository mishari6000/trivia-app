import Ionicons from '@expo/vector-icons/Ionicons';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, MAX_CONTENT_WIDTH, radius, spacing } from '../theme/theme';

type IntroScreenProps = {
  onDone: () => void;
};

const INTRO_VIDEO = require('../../assets/intro/intro.mp4');
const IS_WEB = Platform.OS === 'web';
// Browsers only autoplay muted video, so the web starts muted with a sound button.
const START_MUTED = IS_WEB;
/** The intro is rendered at 9:16; its background is the app background (#0A1620). */
const VIDEO_ASPECT = 9 / 16;
const FRAME_MARGIN = 24;
/** Wider than this, the web shows the intro as a framed phone-sized card. */
const FRAMED_MIN_WIDTH = 520;

/**
 * Largest 9:16 box that fits. On phones (app or phone browser) it fills the width with no
 * crop or zoom, and the matching background fills the rest; on wide screens it is a card.
 */
function videoSize(width: number, height: number, framed: boolean) {
  const maxW = framed ? Math.min(width - FRAME_MARGIN * 2, MAX_CONTENT_WIDTH) : width;
  const maxH = framed ? height - FRAME_MARGIN * 2 : height;
  const w = Math.min(maxW, maxH * VIDEO_ASPECT);
  return { width: w, height: w / VIDEO_ASPECT };
}

/** Plays the motion-graphics intro once on launch, then hands over to the welcome screen. */
export function IntroScreen({ onDone }: IntroScreenProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const framed = IS_WEB && width >= FRAMED_MIN_WIDTH;
  const size = videoSize(width, height, framed);
  const [muted, setMuted] = useState(START_MUTED);
  const player = useVideoPlayer(INTRO_VIDEO, (p) => {
    p.loop = false;
    p.muted = START_MUTED;
  });

  // Start once the view is mounted; on the web the <video> element must exist first.
  useEffect(() => {
    player.play();
  }, [player]);

  useEventListener(player, 'playToEnd', onDone);
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') onDone();
  });

  useEffect(() => {
    // expo-video players are controlled by setting properties; this is its documented API.
    // eslint-disable-next-line react-hooks/immutability
    player.muted = muted;
  }, [player, muted]);

  // Inside the card on wide screens; over the screen, below the notch, on phones.
  const controls = (
    <View style={[styles.bar, { top: framed ? spacing.md : insets.top + spacing.md }]}>
      <Pressable
        onPress={onDone}
        accessibilityRole="button"
        accessibilityLabel="تخطّي المقدمة"
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
      >
        <Text style={styles.pillText}>تخطّي</Text>
        <Ionicons name="play-skip-back" size={18} color={colors.white} />
      </Pressable>
      {IS_WEB ? (
        <Pressable
          onPress={() => setMuted((m) => !m)}
          accessibilityRole="button"
          accessibilityLabel={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
          style={({ pressed }) => [styles.round, pressed && styles.pillPressed]}
        >
          <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={22} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.frame, size, framed && styles.webFrame]}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
          accessible
          accessibilityLabel="مقدمة تحدّي اليمعة"
        />
        {framed ? controls : null}
      </View>
      {framed ? null : controls}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  // Explicit size: on the web a <video> ignores `inset: 0` and keeps its intrinsic size.
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  webFrame: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 24px 60px rgba(0, 0, 0, 0.45)',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.glass,
  },
  pillPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  pillText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
  },
});
