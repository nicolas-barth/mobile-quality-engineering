import type { ChainablePromiseElement } from 'webdriverio';

export const DEFAULT_SCREEN_TIMEOUT_MS = 15000;

export abstract class BaseScreen {
  protected async waitUntilDisplayed(
    element: ChainablePromiseElement,
    timeoutMessage: string,
    timeoutMs: number = DEFAULT_SCREEN_TIMEOUT_MS,
  ): Promise<void> {
    await element.waitForDisplayed({ timeout: timeoutMs, timeoutMsg: timeoutMessage });
  }
}
