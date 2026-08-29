import { DeviceProfile } from './android-standard';

export type CompatibilityProfileName =
  'android-min-supported' | 'android-latest' | 'android-small' | 'android-large';

const COMPATIBILITY_PROFILES: Record<CompatibilityProfileName, DeviceProfile> = {
  'android-min-supported': {
    name: 'android-min-supported',
    deviceName: 'Android Emulator',
    platformVersion: '10',
    orientation: 'PORTRAIT',
  },
  'android-latest': {
    name: 'android-latest',
    deviceName: 'Android Emulator',
    platformVersion: '15',
    orientation: 'PORTRAIT',
  },
  'android-small': {
    name: 'android-small',
    deviceName: 'Android Emulator - Small Phone',
    platformVersion: '13',
    orientation: 'PORTRAIT',
  },
  'android-large': {
    name: 'android-large',
    deviceName: 'Android Emulator - Tablet',
    platformVersion: '13',
    orientation: 'PORTRAIT',
  },
};

export function buildCompatibilityProfile(name: CompatibilityProfileName): DeviceProfile {
  return COMPATIBILITY_PROFILES[name];
}

export function listCompatibilityProfileNames(): CompatibilityProfileName[] {
  return Object.keys(COMPATIBILITY_PROFILES) as CompatibilityProfileName[];
}
