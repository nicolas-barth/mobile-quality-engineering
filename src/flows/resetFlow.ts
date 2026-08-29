import { createModuleLogger } from '../logging/logger';
import MenuScreen from '../screens/android/MenuScreen';
import * as appResetService from '../services/appResetService';
import { ResetTier } from '../types/testExecution';

import { launchApplication } from './applicationLaunchFlow';

const logger = createModuleLogger('reset-flow');

export async function resetToKnownState(tier: ResetTier): Promise<void> {
  logger.info({ tier }, 'Resetting the application to a known state before the test');

  if (tier === 'clean') {
    await appResetService.cleanInstallation();
    await launchApplication();
    return;
  }

  if (tier === 'application') {
    await appResetService.applicationReset();
    await launchApplication();
    return;
  }

  await appResetService.lightweightReset();
  await MenuScreen.resetApplicationState();
  await launchApplication();
}
