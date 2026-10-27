import type { TextStyle, ViewStyle } from 'react-native';

import type { QuestionLanguage } from '../types/question';

export const colors = {
  background: '#F5FBFC',
  primary: '#1AA6C0',
  primaryDark: '#12839A',
  ink: '#16213E',
  inkMuted: '#4A5872',
  logoFill: '#3AB0E4',
  logoShadow: '#2C3A8F',
  accent: '#DDE23A',
  accentPressed: '#C9CF2A',
  sun: '#F6C445',
  frame: '#A9DEE7',
  frameInner: '#E3F4F7',
  cardTop: '#F9DE84',
  cardBand: '#F2B63C',
  success: '#15803D',
  successSoft: '#E6F4EA',
  error: '#B91C1C',
  errorSoft: '#FBE9E9',
  surface: '#FFFFFF',
  border: '#CDEAF0',
  white: '#FFFFFF',
};

/** CSS gradient strings for the `backgroundImage` style (Android, iOS and web). */
export const gradients = {
  header: `radial-gradient(circle at 50% 45%, #A6DCE1 0%, #4FBACB 45%, ${colors.primary} 100%)`,
  accent: `linear-gradient(90deg, ${colors.accent} 0%, #EFEA86 100%)`,
  card: `linear-gradient(180deg, ${colors.cardTop} 0%, #F7CF5E 100%)`,
};

/** Tajawal is bundled with the app (no runtime network request). */
export const fonts = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
  extraBold: 'Tajawal_800ExtraBold',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };

export const MAX_CONTENT_WIDTH = 480;
export const MIN_BUTTON_HEIGHT = 56;

export const shadow: ViewStyle = { boxShadow: '0px 8px 20px rgba(22, 33, 62, 0.10)' };

/** Chunky offset shadow for the game title, in the spirit of a 3D sticker logo. */
export const logoText: TextStyle = {
  fontFamily: fonts.extraBold,
  color: colors.logoFill,
  textShadowColor: colors.logoShadow,
  textShadowOffset: { width: 3, height: 4 },
  textShadowRadius: 0,
};

/** Per-language text direction, so English questions can render LTR inside the Arabic UI. */
export function textDirection(language: QuestionLanguage): TextStyle {
  const isRtl = language === 'ar';
  return {
    writingDirection: isRtl ? 'rtl' : 'ltr',
    textAlign: isRtl ? 'right' : 'left',
  };
}
