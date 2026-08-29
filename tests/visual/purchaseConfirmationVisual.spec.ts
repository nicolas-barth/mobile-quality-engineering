import { expect, browser } from '@wdio/globals';

import {
  captureConfigSnapshot,
  disableAnimations,
  restoreConfigSnapshot,
} from '../../src/device/deviceConfig';
import { buildCheckoutFixture } from '../../src/factories/checkoutFactory';
import { standardUser } from '../../src/fixtures/users';
import { openCart } from '../../src/flows/cartFlow';
import { placeOrder } from '../../src/flows/checkoutFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import { DeviceConfigSnapshot } from '../../src/types/deviceConfig';

const MAX_ACCEPTABLE_MISMATCH_PERCENTAGE = 1;

describe('Purchase confirmation visual regression', () => {
  let snapshot: DeviceConfigSnapshot;

  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Visual regression',
      story: 'Purchase confirmation layout matches its baseline',
      severity: 'normal',
      tags: ['visual', 'checkout'],
    });
    snapshot = await captureConfigSnapshot();
    await disableAnimations();
  });

  afterEach(async () => {
    await restoreConfigSnapshot(snapshot);
  });

  it('matches the purchase confirmation baseline', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();
    await placeOrder(buildCheckoutFixture(), standardUser);

    await expect(browser).toMatchScreenSnapshot(
      'purchase-confirmation',
      MAX_ACCEPTABLE_MISMATCH_PERCENTAGE,
    );
  });
});
