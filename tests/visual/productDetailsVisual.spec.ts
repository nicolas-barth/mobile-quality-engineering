import { expect, browser } from '@wdio/globals';

import {
  captureConfigSnapshot,
  disableAnimations,
  restoreConfigSnapshot,
} from '../../src/device/deviceConfig';
import { openProduct } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import { DeviceConfigSnapshot } from '../../src/types/deviceConfig';

const MAX_ACCEPTABLE_MISMATCH_PERCENTAGE = 1;

describe('Product details visual regression', () => {
  let snapshot: DeviceConfigSnapshot;

  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Visual regression',
      story: 'Product details layout matches its baseline',
      severity: 'normal',
      tags: ['visual', 'product'],
    });
    snapshot = await captureConfigSnapshot();
    await disableAnimations();
  });

  afterEach(async () => {
    await restoreConfigSnapshot(snapshot);
  });

  it('matches the product details baseline', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await openProduct(productName);

    await expect(browser).toMatchScreenSnapshot(
      'product-details',
      MAX_ACCEPTABLE_MISMATCH_PERCENTAGE,
    );
  });
});
