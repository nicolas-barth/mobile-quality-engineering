import { expect } from '@wdio/globals';

import * as appLifecycle from '../../src/device/appLifecycle';
import { getRunState } from '../../src/device/appState';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import { AppRunState } from '../../src/types/appState';

describe('Application lifecycle', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Device lifecycle',
      story: 'The application survives background, termination and restart',
      severity: 'critical',
      tags: ['device', 'lifecycle'],
    });
  });

  it('moves to the background and returns to the foreground', async () => {
    await appLifecycle.sendToBackground(2);
    await expect(getRunState()).resolves.not.toBe(AppRunState.RunningInForeground);

    await appLifecycle.returnToForeground();

    await expect(getRunState()).resolves.toBe(AppRunState.RunningInForeground);
    await expect(CatalogScreen.isDisplayed()).resolves.toBe(true);
  });

  it('terminates and reactivates without crashing', async () => {
    await appLifecycle.terminate();
    await expect(getRunState()).resolves.toBe(AppRunState.NotRunning);

    await appLifecycle.returnToForeground();

    await expect(getRunState()).resolves.toBe(AppRunState.RunningInForeground);
    await CatalogScreen.waitForDisplayed();
  });

  it('restarts and returns to a predictable initial screen', async () => {
    await appLifecycle.restart();

    await CatalogScreen.waitForDisplayed();
    await expect(CatalogScreen.isDisplayed()).resolves.toBe(true);
  });
});
