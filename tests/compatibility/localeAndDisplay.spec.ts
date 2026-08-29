import { expect } from '@wdio/globals';

import {
  captureConfigSnapshot,
  restoreConfigSnapshot,
  setDisplayDensity,
  setLocale,
} from '../../src/device/deviceConfig';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import { DeviceConfigSnapshot } from '../../src/types/deviceConfig';

const LOCALE_TAGS = ['en-US', 'pt-BR'];

describe('Locale compatibility', () => {
  let snapshot: DeviceConfigSnapshot;

  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Compatibility',
      story: 'The catalog does not crash or lose its product list under a different system locale',
      severity: 'normal',
      tags: ['compatibility'],
    });
    snapshot = await captureConfigSnapshot();
  });

  afterEach(async () => {
    await restoreConfigSnapshot(snapshot);
  });

  for (const localeTag of LOCALE_TAGS) {
    it(`keeps the catalog populated under the ${localeTag} system locale`, async () => {
      await setLocale(localeTag);

      await CatalogScreen.waitForDisplayed();
      const productNames = await CatalogScreen.getProductNames();

      expect(productNames.length).toBeGreaterThan(0);
    });
  }
});

const SCALED_UP_DENSITY_DPI = 560;

describe('Display density compatibility', () => {
  let snapshot: DeviceConfigSnapshot;

  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Compatibility',
      story:
        'The catalog does not crash or lose its product list under a scaled up display density',
      severity: 'normal',
      tags: ['compatibility'],
    });
    snapshot = await captureConfigSnapshot();
  });

  afterEach(async () => {
    await restoreConfigSnapshot(snapshot);
  });

  it('keeps the catalog populated under a scaled up display density', async () => {
    await setDisplayDensity(SCALED_UP_DENSITY_DPI);

    await CatalogScreen.waitForDisplayed();
    const productNames = await CatalogScreen.getProductNames();

    expect(productNames.length).toBeGreaterThan(0);
  });
});
