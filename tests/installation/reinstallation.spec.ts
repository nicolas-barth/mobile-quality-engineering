import { expect } from '@wdio/globals';

import { loadEnv } from '../../src/config/env';
import { openCart } from '../../src/flows/cartFlow';
import { installCleanly, uninstallCompletely } from '../../src/flows/installationFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CartScreen from '../../src/screens/android/CartScreen';
import CatalogScreen from '../../src/screens/android/CatalogScreen';

describe('Reinstallation', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Installation',
      story: 'Cart state does not survive an uninstall and reinstall cycle',
      severity: 'normal',
      tags: ['installation'],
    });
  });

  it('starts with an empty cart after uninstalling and reinstalling with cart contents', async () => {
    const env = loadEnv();
    await installCleanly(env.androidAppPath);

    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);

    await uninstallCompletely();
    await installCleanly(env.androidAppPath);
    await openCart();

    await expect(CartScreen.product(productName).isDisplayed()).resolves.toBe(false);
  });
});
