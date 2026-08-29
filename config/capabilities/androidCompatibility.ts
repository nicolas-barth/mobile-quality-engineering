import {
  buildCompatibilityProfile,
  CompatibilityProfileName,
  listCompatibilityProfileNames,
} from '../devices/compatibilityProfiles';

import { buildAndroidCapability } from './androidCapabilityBuilder';

function isCompatibilityProfileName(value: string): value is CompatibilityProfileName {
  return listCompatibilityProfileNames().includes(value as CompatibilityProfileName);
}

export function buildCompatibilityCapabilities(
  onlyProfileName?: string,
): WebdriverIO.Capabilities[] {
  if (onlyProfileName) {
    if (!isCompatibilityProfileName(onlyProfileName)) {
      throw new Error(`Unknown compatibility profile name: "${onlyProfileName}"`);
    }
    return [buildAndroidCapability(buildCompatibilityProfile(onlyProfileName))];
  }

  return listCompatibilityProfileNames().map((name) =>
    buildAndroidCapability(buildCompatibilityProfile(name)),
  );
}
