import { expect } from '@wdio/globals';

import { pressBack } from '../../src/device/androidBack';
import { getRunState } from '../../src/device/appState';
import { openProduct } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import { AppRunState } from '../../src/types/appState';

describe('Android back button', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Device navigation',
      story: 'Back button behavior matches the single-activity, no-back-stack navigation model',
      severity: 'normal',
      tags: ['device', 'navigation'],
    });
  });

  it('leaves the foreground when pressed on the catalog root screen', async () => {
    await CatalogScreen.waitForDisplayed();

    await pressBack();

    await expect(getRunState()).resolves.not.toBe(AppRunState.RunningInForeground);
  });

  it('leaves the foreground rather than returning to the catalog from product details', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await openProduct(productName);

    await pressBack();

    await expect(getRunState()).resolves.not.toBe(AppRunState.RunningInForeground);
  });
});
