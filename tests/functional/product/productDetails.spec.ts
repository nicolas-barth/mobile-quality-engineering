import { expect } from '@wdio/globals';

import { openCart } from '../../../src/flows/cartFlow';
import { addProductToCart, openProduct, setQuantity } from '../../../src/flows/productFlow';
import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import CartScreen from '../../../src/screens/android/CartScreen';
import CatalogScreen from '../../../src/screens/android/CatalogScreen';
import ProductDetailsScreen from '../../../src/screens/android/ProductDetailsScreen';
import { parseCurrencyToCents } from '../../../src/utils/money';

const QUANTITY_OVERRIDE_PRODUCT = 'Sauce Labs Bolt T-Shirt';

async function firstProductWithoutQuantityOverride(): Promise<string> {
  const productNames = await CatalogScreen.getProductNames();
  const eligibleProduct = productNames.find((name) => name !== QUANTITY_OVERRIDE_PRODUCT);
  if (!eligibleProduct) {
    throw new Error('No catalog product without a known quantity override was found');
  }
  return eligibleProduct;
}

describe('Product details', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Product details',
      story: 'Product information and quantity selection',
      severity: 'normal',
      tags: ['functional', 'product'],
    });
  });

  it('matches the name and price shown in the catalog', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    const catalogPriceCents = parseCurrencyToCents(
      await CatalogScreen.isProduct(productName).getPriceText(),
    );

    await openProduct(productName);

    await expect(ProductDetailsScreen.getName()).resolves.toBe(productName);
    const detailsPriceCents = parseCurrencyToCents(await ProductDetailsScreen.getPriceText());
    expect(detailsPriceCents).toBe(catalogPriceCents);
  });

  it('increases the quantity when the increase control is used', async () => {
    const productName = await firstProductWithoutQuantityOverride();
    await openProduct(productName);
    const initialQuantity = await ProductDetailsScreen.getQuantity();

    await ProductDetailsScreen.increaseQuantity();

    await expect(ProductDetailsScreen.getQuantity()).resolves.toBe(initialQuantity + 1);
  });

  it('does not allow the quantity to go below one', async () => {
    const productName = await firstProductWithoutQuantityOverride();
    await openProduct(productName);
    await setQuantity(1);

    await ProductDetailsScreen.decreaseQuantity();

    await expect(ProductDetailsScreen.getQuantity()).resolves.toBe(1);
  });

  it('adds the product to the cart with the selected quantity', async () => {
    const productName = await firstProductWithoutQuantityOverride();

    await addProductToCart(productName, 3);
    await openCart();

    await expect(CartScreen.product(productName).getQuantity()).resolves.toBe(3);
  });
});
