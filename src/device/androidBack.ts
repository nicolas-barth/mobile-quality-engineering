import { browser } from '@wdio/globals';

import { createModuleLogger } from '../logging/logger';

const logger = createModuleLogger('android-back');

export async function pressBack(): Promise<void> {
  logger.info('Pressing the Android back button');
  await browser.back();
}
