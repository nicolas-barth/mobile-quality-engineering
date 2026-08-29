import { browser } from '@wdio/globals';

import { createModuleLogger } from '../logging/logger';

import { pressBack } from './androidBack';

const logger = createModuleLogger('keyboard');

export async function isKeyboardShown(): Promise<boolean> {
  return browser.isKeyboardShown();
}

export async function hideKeyboard(): Promise<void> {
  if (!(await isKeyboardShown())) {
    return;
  }

  try {
    await browser.hideKeyboard();
  } catch (hideError) {
    logger.warn(
      { err: hideError },
      'browser.hideKeyboard failed, falling back to the Android back button',
    );
    await pressBack();
  }

  if (await isKeyboardShown()) {
    throw new Error('Keyboard is still displayed after attempting to hide it');
  }
}
