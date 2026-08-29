import { expect } from '@wdio/globals';

import { buildCheckoutFixture } from '../../src/factories/checkoutFactory';
import { standardUser } from '../../src/fixtures/users';
import { openCart } from '../../src/flows/cartFlow';
import { placeOrder } from '../../src/flows/checkoutFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import { collectLogcat } from '../../src/services/adbService';
import { scanForSecrets } from '../../src/services/secretScanService';

describe('Logcat sensitive data exposure', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Security',
      story: 'Checkout with fictitious payment data does not leak secret-shaped values to Logcat',
      severity: 'normal',
      tags: ['security'],
    });
  });

  it('does not log fictitious payment or credential data during checkout', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();

    await placeOrder(buildCheckoutFixture(), standardUser);

    const logcat = await collectLogcat(2000);
    expect(logcat).not.toBeNull();

    const findings = scanForSecrets((logcat ?? '').split('\n'));

    expect(findings).toEqual([]);
  });
});
