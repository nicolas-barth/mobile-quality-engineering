import { expect } from '@wdio/globals';

import {
  expectCartItemCountToEqual,
  expectCartToBeEmpty,
} from '../../../src/assertions/cartAssertions';
import { openCart } from '../../../src/flows/cartFlow';
import { addProductToCart } from '../../../src/flows/productFlow';
import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import CartScreen from '../../../src/screens/android/CartScreen';
import CatalogScreen from '../../../src/screens/android/CatalogScreen';

describe('Cart basics', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Cart',
      story: 'Adding products updates the cart and its badge',
      severity: 'critical',
      tags: ['functional', 'cart'],
    });
  });

  it('displays an empty state when no products have been added', async () => {
    await openCart();

    await expectCartToBeEmpty();
  });

  it('displays a product after it is added', async () => {
    const productName = await CatalogScreen.getFirstProductName();

    await addProductToCart(productName);
    await openCart();

    await expect(CartScreen.product(productName).isDisplayed()).resolves.toBe(true);
  });

  it('increments the quantity when the same product is added again', async () => {
    const productNames = await CatalogScreen.getProductNames();
    const productName = productNames[0] as string;

    await addProductToCart(productName);
    await addProductToCart(productName);
    await openCart();

    await expect(CartScreen.product(productName).getQuantity()).resolves.toBe(2);
  });

  it('displays multiple distinct products that were added', async () => {
    const productNames = await CatalogScreen.getProductNames();
    const [firstProduct, secondProduct] = productNames;
    if (!firstProduct || !secondProduct) {
      throw new Error('The catalog does not have at least two products to exercise this scenario');
    }

    await addProductToCart(firstProduct);
    await addProductToCart(secondProduct);
    await openCart();

    await expectCartItemCountToEqual(2);
  });

  it('updates the header badge to match the number of items in the cart', async () => {
    const productName = await CatalogScreen.getFirstProductName();

    await addProductToCart(productName);

    await expect(CatalogScreen.header.getCartBadgeCount()).resolves.toBe(1);
  });
});
