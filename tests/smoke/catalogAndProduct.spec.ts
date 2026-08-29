import { expect } from '@wdio/globals';

import { expectCartItemCountToEqual } from '../../src/assertions/cartAssertions';
import { openCart } from '../../src/flows/cartFlow';
import { addProductToCart, openProduct } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CartScreen from '../../src/screens/android/CartScreen';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import ProductDetailsScreen from '../../src/screens/android/ProductDetailsScreen';

describe('Catalog and product', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Catalog and product',
      story: 'Browsing and adding a product to the cart',
      severity: 'blocker',
      tags: ['smoke', 'critical', 'catalog', 'product', 'cart'],
    });
  });

  it('opens product details for a catalog product', async () => {
    const productName = await CatalogScreen.getFirstProductName();

    await openProduct(productName);

    await expect(ProductDetailsScreen.getName()).resolves.toBe(productName);
  });

  it('adds the opened product to the cart', async () => {
    const productName = await CatalogScreen.getFirstProductName();

    await openProduct(productName);
    await ProductDetailsScreen.addToCart();

    await expect(ProductDetailsScreen.getName()).resolves.toBe(productName);
  });

  it('displays the selected product in the cart', async () => {
    const productName = await CatalogScreen.getFirstProductName();

    await addProductToCart(productName);
    await openCart();

    await expect(CartScreen.product(productName).isDisplayed()).resolves.toBe(true);
    await expectCartItemCountToEqual(1);
  });
});
