import { expect, browser } from '@wdio/globals';

import {
  captureConfigSnapshot,
  disableAnimations,
  restoreConfigSnapshot,
} from '../../src/device/deviceConfig';
import { openCart } from '../../src/flows/cartFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import { DeviceConfigSnapshot } from '../../src/types/deviceConfig';

const MAX_ACCEPTABLE_MISMATCH_PERCENTAGE = 1;

describe('Cart visual regression', () => {
  let snapshot: DeviceConfigSnapshot;

  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Visual regression',
      story: 'Cart layout matches its baseline',
      severity: 'normal',
      tags: ['visual', 'cart'],
    });
    snapshot = await captureConfigSnapshot();
    await disableAnimations();
  });

  afterEach(async () => {
    await restoreConfigSnapshot(snapshot);
  });

  it('matches the cart baseline with one item added', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();

    await expect(browser).toMatchScreenSnapshot('cart', MAX_ACCEPTABLE_MISMATCH_PERCENTAGE);
  });
});
