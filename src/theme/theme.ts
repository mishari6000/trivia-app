import type { TextStyle, ViewStyle } from 'react-native';

import type { QuestionLanguage } from '../types/question';

export const colors = {
  background: '#FFF8EE',
  primary: '#0F766E',
  primaryPressed: '#0B5E58',
  ink: '#17324D',
  inkMuted: '#5A6B7D',
  accent: '#F7C948',
  success: '#15803D',
  successSoft: '#E6F4EA',
  error: '#B91C1C',
  errorSoft: '#FBE9E9',
  surface: '#FFFFFF',
  border: '#E9DFCF',
  white: '#FFFFFF',
};

/** Tajawal is bundled with the app (no runtime network request). */
export const fonts = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
  extraBold: 'Tajawal_800ExtraBold',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

export const MAX_CONTENT_WIDTH = 480;
export const MIN_BUTTON_HEIGHT = 56;

export const shadow: ViewStyle = { boxShadow: '0px 6px 18px rgba(23, 50, 77, 0.08)' };

/** Per-language text direction, so English questions can render LTR inside the Arabic UI. */
export function textDirection(language: QuestionLanguage): TextStyle {
  const isRtl = language === 'ar';
  return {
    writingDirection: isRtl ? 'rtl' : 'ltr',
    textAlign: isRtl ? 'right' : 'left',
  };
}
