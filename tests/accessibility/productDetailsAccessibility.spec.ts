import { expectNoAccessibilityIssues } from '../../src/assertions/accessibilityAssertions';
import { auditScreenAccessibility } from '../../src/device/accessibilityInspector';
import { openProduct } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';

describe('Product details accessibility', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Accessibility',
      story: 'Product details exposes accessible labels and touch targets',
      severity: 'normal',
      tags: ['accessibility', 'product'],
    });
  });

  it('exposes accessible labels and adequate touch targets for quantity and cart controls', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await openProduct(productName);

    const result = await auditScreenAccessibility('Product details');

    expectNoAccessibilityIssues(result);
  });
});
