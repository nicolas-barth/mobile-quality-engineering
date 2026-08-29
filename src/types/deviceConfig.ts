export type FontScale = 1.0 | 1.3 | 1.5 | 2.0;

export type ThemeMode = 'light' | 'dark';

export interface DeviceConfigSnapshot {
  fontScale: string;
  nightMode: string;
  locale: string;
  displayDensity: string;
  windowAnimationScale: string;
  transitionAnimationScale: string;
  animatorDurationScale: string;
}
