import { buildAndroidStandardProfile } from '../devices/android-standard';

import { buildAndroidCapability } from './androidCapabilityBuilder';

export function buildAndroidStandardCapability(): WebdriverIO.Capabilities {
  return buildAndroidCapability(buildAndroidStandardProfile());
}
