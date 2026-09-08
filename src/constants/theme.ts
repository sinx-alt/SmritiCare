import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // SmritiCare
    text: '#3F3036',
    background: '#FFFFFF',

    primary: '#5A1735',
    accent: '#7A2348',

    backgroundElement: '#F9DDE8',
    backgroundSelected: '#F0E1E7',

    textSecondary: '#6F5962',
    textMuted: '#8C7A82',

    border: '#F0E1E7',
  },

  dark: {
    // SmritiCare currently uses the same visual system.
    // Dark mode can be designed separately later if needed.
    text: '#3F3036',
    background: '#FFFFFF',

    primary: '#5A1735',
    accent: '#7A2348',

    backgroundElement: '#F9DDE8',
    backgroundSelected: '#F0E1E7',

    textSecondary: '#6F5962',
    textMuted: '#8C7A82',

    border: '#F0E1E7',
  },
} as const;

export type ThemeColor =
  keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },

  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },

  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset =
  Platform.select({
    ios: 50,
    android: 80,
  }) ?? 0;

export const MaxContentWidth = 800;