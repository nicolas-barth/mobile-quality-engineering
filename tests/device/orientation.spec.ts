import { expectOrientationToBe } from '../../src/assertions/deviceAssertions';
import { restorePortrait, setOrientation } from '../../src/device/orientation';
import { openProduct } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import ProductDetailsScreen from '../../src/screens/android/ProductDetailsScreen';

describe('Orientation', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Device orientation',
      story: 'Portrait is enforced on manifest-locked screens',
      severity: 'normal',
      tags: ['device', 'orientation'],
    });
  });

  it('remains in portrait on the catalog after requesting landscape', async () => {
    try {
      await setOrientation('LANDSCAPE');

      await expectOrientationToBe('PORTRAIT');
      await CatalogScreen.waitForDisplayed();
    } finally {
      await restorePortrait();
    }
  });

  it('remains in portrait on the product details screen after requesting landscape', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await openProduct(productName);

    try {
      await setOrientation('LANDSCAPE');

      await expectOrientationToBe('PORTRAIT');
      await ProductDetailsScreen.waitForDisplayed();
    } finally {
      await restorePortrait();
    }
  });
});
