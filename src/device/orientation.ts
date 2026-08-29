import { browser } from '@wdio/globals';

import { createModuleLogger } from '../logging/logger';

const logger = createModuleLogger('orientation');

export type Orientation = 'PORTRAIT' | 'LANDSCAPE';

export async function getOrientation(): Promise<Orientation> {
  const orientation = await browser.getOrientation();
  return orientation.toUpperCase() as Orientation;
}

export async function setOrientation(orientation: Orientation): Promise<void> {
  logger.info({ orientation }, 'Requesting orientation change');
  await browser.setOrientation(orientation);
}

export async function restorePortrait(): Promise<void> {
  if ((await getOrientation()) !== 'PORTRAIT') {
    await setOrientation('PORTRAIT');
  }
}
