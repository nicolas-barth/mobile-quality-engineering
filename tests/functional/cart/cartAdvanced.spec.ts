import { expect } from '@wdio/globals';

import {
  expectCartTotalToEqual,
  expectCartToBeEmpty,
} from '../../../src/assertions/cartAssertions';
import * as appLifecycle from '../../../src/device/appLifecycle';
import { clearCart, openCart, removeProduct } from '../../../src/flows/cartFlow';
import { addProductToCart } from '../../../src/flows/productFlow';
import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import CatalogScreen from '../../../src/screens/android/CatalogScreen';
import { parseCurrencyToCents } from '../../../src/utils/money';

describe('Cart advanced behavior', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Cart',
      story: 'Removing items, clearing the cart, and cart lifetime',
      severity: 'critical',
      tags: ['functional', 'cart'],
    });
  });

  it('recalculates the subtotal after a product is removed', async () => {
    const productNames = await CatalogScreen.getProductNames();
    const [firstProduct, secondProduct] = productNames;
    if (!firstProduct || !secondProduct) {
      throw new Error('The catalog does not have at least two products to exercise this scenario');
    }
    const firstPriceCents = parseCurrencyToCents(
      await CatalogScreen.isProduct(firstProduct).getPriceText(),
    );
    const secondPriceCents = parseCurrencyToCents(
      await CatalogScreen.isProduct(secondProduct).getPriceText(),
    );

    await addProductToCart(firstProduct);
    await addProductToCart(secondProduct);
    await openCart();
    await expectCartTotalToEqual([firstPriceCents, secondPriceCents]);

    await removeProduct(firstProduct);

    await expectCartTotalToEqual([secondPriceCents]);
  });

  it('empties the cart when it is cleared', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();

    await clearCart();
    await openCart();

    await expectCartToBeEmpty();
  });

  it('does not preserve cart contents across an application restart', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);

    await appLifecycle.restart();

    await expect(CatalogScreen.header.getCartBadgeCount()).resolves.toBe(0);
    await openCart();
    await expectCartToBeEmpty();
  });
});
