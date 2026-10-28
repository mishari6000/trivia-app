import type { TextStyle, ViewStyle } from 'react-native';

import type { QuestionLanguage } from '../types/question';

/** Dark navy surfaces with bright green accents. */
export const colors = {
  background: '#0A1620',
  surface: '#122230',
  surfaceRaised: '#1A2D3C',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',
  text: '#FFFFFF',
  textMuted: '#9DB1BF',
  textOnLight: '#0A1620',
  primary: '#0E9F62',
  primaryBright: '#22DD82',
  primaryDeep: '#076B45',
  primarySoft: 'rgba(34, 221, 130, 0.14)',
  success: '#22DD82',
  successSoft: 'rgba(34, 221, 130, 0.14)',
  error: '#FF5A64',
  errorSoft: 'rgba(255, 90, 100, 0.14)',
  errorStrong: '#D63A45',
  white: '#FFFFFF',
  whitePressed: '#DDE6EC',
  glass: 'rgba(255, 255, 255, 0.12)',
  /** Team colours on the board: team one is the brand green, team two amber. */
  teamOne: '#22DD82',
  teamTwo: '#F5B93B',
  teamTwoSoft: 'rgba(245, 185, 59, 0.16)',
};

/** CSS gradient strings for the `backgroundImage` style (Android, iOS and web). */
export const gradients = {
  hero: `linear-gradient(160deg, #13B573 0%, ${colors.primary} 45%, ${colors.primaryDeep} 100%)`,
  banner: `linear-gradient(110deg, ${colors.primaryDeep} 0%, ${colors.primary} 60%, #14B877 100%)`,
  correct: `linear-gradient(110deg, ${colors.primary} 0%, ${colors.primaryBright} 100%)`,
  cardShade: 'linear-gradient(180deg, rgba(18, 34, 48, 0) 60%, rgba(18, 34, 48, 1) 100%)',
};

/** Tajawal is bundled with the app (no runtime network request). */
export const fonts = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
  extraBold: 'Tajawal_800ExtraBold',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 16, lg: 22, xl: 30, pill: 999 };

export const MAX_CONTENT_WIDTH = 480;
export const MIN_BUTTON_HEIGHT = 56;

export const shadow: ViewStyle = { boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.35)' };

/** Per-language text direction, so English questions can render LTR inside the Arabic UI. */
export function textDirection(language: QuestionLanguage): TextStyle {
  const isRtl = language === 'ar';
  return {
    writingDirection: isRtl ? 'rtl' : 'ltr',
    textAlign: isRtl ? 'right' : 'left',
  };
}
