import { expect } from '@wdio/globals';

import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import CatalogScreen from '../../../src/screens/android/CatalogScreen';
import { parseCurrencyToCents } from '../../../src/utils/money';

describe('Catalog display', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Catalog',
      story: 'Products are displayed with name, price and image',
      severity: 'normal',
      tags: ['functional', 'catalog'],
    });
  });

  it('displays known products with a name, a positive price and an image', async () => {
    const productNames = await CatalogScreen.getProductNames();
    expect(productNames.length).toBeGreaterThan(0);

    const firstProductName = productNames[0] as string;
    const card = CatalogScreen.isProduct(firstProductName);

    const priceCents = parseCurrencyToCents(await card.getPriceText());
    expect(priceCents).toBeGreaterThan(0);
    await expect(card.hasImage()).resolves.toBe(true);
  });

  it('does not show a cart badge when the cart is empty', async () => {
    await expect(CatalogScreen.header.getCartBadgeCount()).resolves.toBe(0);
  });
});
