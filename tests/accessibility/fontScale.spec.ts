import { expect } from '@wdio/globals';

import {
  captureConfigSnapshot,
  restoreConfigSnapshot,
  setFontScale,
} from '../../src/device/deviceConfig';
import { openProduct } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import ProductDetailsScreen from '../../src/screens/android/ProductDetailsScreen';
import { DeviceConfigSnapshot } from '../../src/types/deviceConfig';

const FONT_SCALES = [1.3, 1.5, 2.0] as const;

describe('Font scale resilience', () => {
  let snapshot: DeviceConfigSnapshot;

  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Accessibility',
      story: 'Critical screens remain usable under enlarged font scale',
      severity: 'normal',
      tags: ['accessibility'],
    });
    snapshot = await captureConfigSnapshot();
  });

  afterEach(async () => {
    await restoreConfigSnapshot(snapshot);
  });

  for (const scale of FONT_SCALES) {
    it(`keeps the catalog and product details usable at ${scale}x font scale`, async () => {
      await setFontScale(scale);

      await CatalogScreen.waitForDisplayed();
      const productName = await CatalogScreen.getFirstProductName();
      await expect(CatalogScreen.isProduct(productName).isDisplayed()).resolves.toBe(true);

      await openProduct(productName);
      await expect(ProductDetailsScreen.getName()).resolves.not.toBe('');
    });
  }
});
