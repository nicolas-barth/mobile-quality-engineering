import { browser } from '@wdio/globals';

import { createModuleLogger } from '../logging/logger';
import { DeviceConfigSnapshot, FontScale, ThemeMode } from '../types/deviceConfig';

const logger = createModuleLogger('device-config');

async function runShell(command: string, args: string[]): Promise<string> {
  const result = await browser.execute('mobile: shell', { command, args, includeStderr: true });
  return String((result as { stdout?: string }).stdout ?? '').trim();
}

async function getSetting(namespace: string, key: string): Promise<string> {
  return runShell('settings', ['get', namespace, key]);
}

async function putSetting(namespace: string, key: string, value: string): Promise<void> {
  await runShell('settings', ['put', namespace, key, value]);
}

export async function getFontScale(): Promise<string> {
  return getSetting('system', 'font_scale');
}

export async function setFontScale(scale: FontScale): Promise<void> {
  logger.info({ scale }, 'Setting Android font scale');
  await putSetting('system', 'font_scale', scale.toString());
}

export async function getNightMode(): Promise<string> {
  return runShell('cmd', ['uimode', 'night']);
}

export async function setNightMode(mode: ThemeMode): Promise<void> {
  logger.info({ mode }, 'Setting Android night mode');
  await runShell('cmd', ['uimode', 'night', mode === 'dark' ? 'yes' : 'no']);
}

export async function getLocale(): Promise<string> {
  return getSetting('system', 'system_locales');
}

export async function setLocale(localeTag: string): Promise<void> {
  logger.info({ localeTag }, 'Setting Android system locale');
  await putSetting('system', 'system_locales', localeTag);
}

export async function setAnimationScale(scale: number): Promise<void> {
  logger.info({ scale }, 'Setting Android animation scales');
  await Promise.all([
    putSetting('global', 'window_animation_scale', scale.toString()),
    putSetting('global', 'transition_animation_scale', scale.toString()),
    putSetting('global', 'animator_duration_scale', scale.toString()),
  ]);
}

export async function disableAnimations(): Promise<void> {
  await setAnimationScale(0);
}

export async function getDisplayDensity(): Promise<string> {
  return runShell('wm', ['density']);
}

export async function setDisplayDensity(dpi: number): Promise<void> {
  logger.info({ dpi }, 'Setting Android display density');
  await runShell('wm', ['density', dpi.toString()]);
}

export async function resetDisplayDensity(): Promise<void> {
  await runShell('wm', ['density', 'reset']);
}

export async function captureConfigSnapshot(): Promise<DeviceConfigSnapshot> {
  const [
    fontScale,
    nightMode,
    locale,
    displayDensity,
    windowAnimationScale,
    transitionAnimationScale,
    animatorDurationScale,
  ] = await Promise.all([
    getSetting('system', 'font_scale'),
    getNightMode(),
    getSetting('system', 'system_locales'),
    getDisplayDensity(),
    getSetting('global', 'window_animation_scale'),
    getSetting('global', 'transition_animation_scale'),
    getSetting('global', 'animator_duration_scale'),
  ]);

  return {
    fontScale,
    nightMode,
    locale,
    displayDensity,
    windowAnimationScale,
    transitionAnimationScale,
    animatorDurationScale,
  };
}

export async function restoreConfigSnapshot(snapshot: DeviceConfigSnapshot): Promise<void> {
  logger.info({ snapshot }, 'Restoring device configuration to its captured snapshot');
  await Promise.all([
    putSetting('system', 'font_scale', snapshot.fontScale || '1.0'),
    runShell('cmd', ['uimode', 'night', snapshot.nightMode.includes('yes') ? 'yes' : 'no']),
    resetDisplayDensity(),
    putSetting('global', 'window_animation_scale', snapshot.windowAnimationScale || '1'),
    putSetting('global', 'transition_animation_scale', snapshot.transitionAnimationScale || '1'),
    putSetting('global', 'animator_duration_scale', snapshot.animatorDurationScale || '1'),
    snapshot.locale ? putSetting('system', 'system_locales', snapshot.locale) : Promise.resolve(),
  ]);
}
