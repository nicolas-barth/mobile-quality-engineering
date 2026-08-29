import { expect } from '@wdio/globals';

import { pressBack } from '../../src/device/androidBack';
import { getRunState } from '../../src/device/appState';
import { openCart } from '../../src/flows/cartFlow';
import { openProduct } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CartScreen from '../../src/screens/android/CartScreen';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import ProductDetailsScreen from '../../src/screens/android/ProductDetailsScreen';
import { AppRunState } from '../../src/types/appState';

describe('Critical path across the compatibility matrix', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Compatibility',
      story:
        'Launch, catalog, product details, cart and checkout entry behave consistently across profiles',
      severity: 'critical',
      tags: ['compatibility'],
    });
  });

  it('reaches checkout entry through the primary user journey', async () => {
    await CatalogScreen.waitForDisplayed();

    const productName = await CatalogScreen.getFirstProductName();
    await openProduct(productName);
    await expect(ProductDetailsScreen.getName()).resolves.toBe(productName);

    await ProductDetailsScreen.addToCart();
    await openCart();
    await expect(CartScreen.product(productName).isDisplayed()).resolves.toBe(true);

    await pressBack();
    await expect(getRunState()).resolves.not.toBe(AppRunState.RunningInForeground);
  });
});
