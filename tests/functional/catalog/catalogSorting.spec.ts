import { expect } from '@wdio/globals';

import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import CatalogScreen from '../../../src/screens/android/CatalogScreen';

describe('Catalog sorting', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Catalog',
      story: 'Sort order can be changed',
      severity: 'normal',
      tags: ['functional', 'catalog'],
    });
  });

  it('reorders the catalog when a different sort option is selected', async () => {
    const initialOrder = await CatalogScreen.getProductNames();

    await CatalogScreen.selectSortOption('priceDescending');
    const priceDescendingOrder = await CatalogScreen.getProductNames();

    expect(priceDescendingOrder).not.toEqual(initialOrder);
  });
});
