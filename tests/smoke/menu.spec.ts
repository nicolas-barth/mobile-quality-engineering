import { expect } from '@wdio/globals';

import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import MenuScreen from '../../src/screens/android/MenuScreen';

describe('Menu', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Navigation',
      story: 'The drawer menu can be opened and closed',
      severity: 'critical',
      tags: ['smoke', 'navigation'],
    });
  });

  it('opens and closes the drawer menu', async () => {
    await MenuScreen.open();
    await MenuScreen.close();

    await expect(CatalogScreen.isDisplayed()).resolves.toBe(true);
  });
});
