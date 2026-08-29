import { expect, browser } from '@wdio/globals';

import {
  captureConfigSnapshot,
  disableAnimations,
  restoreConfigSnapshot,
} from '../../src/device/deviceConfig';
import { buildCheckoutFixture } from '../../src/factories/checkoutFactory';
import { standardUser } from '../../src/fixtures/users';
import { openCart } from '../../src/flows/cartFlow';
import { reachOverview } from '../../src/flows/checkoutFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import { DeviceConfigSnapshot } from '../../src/types/deviceConfig';

const MAX_ACCEPTABLE_MISMATCH_PERCENTAGE = 1;

describe('Checkout overview visual regression', () => {
  let snapshot: DeviceConfigSnapshot;

  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Visual regression',
      story: 'Checkout overview layout matches its baseline',
      severity: 'normal',
      tags: ['visual', 'checkout'],
    });
    snapshot = await captureConfigSnapshot();
    await disableAnimations();
  });

  afterEach(async () => {
    await restoreConfigSnapshot(snapshot);
  });

  it('matches the checkout overview baseline', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();
    await reachOverview(buildCheckoutFixture(), standardUser);

    await expect(browser).toMatchScreenSnapshot(
      'checkout-overview',
      MAX_ACCEPTABLE_MISMATCH_PERCENTAGE,
    );
  });
});
