import { expectNoAccessibilityIssues } from '../../src/assertions/accessibilityAssertions';
import { auditScreenAccessibility } from '../../src/device/accessibilityInspector';
import { openCart } from '../../src/flows/cartFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';

describe('Cart accessibility', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Accessibility',
      story: 'Cart exposes accessible labels and touch targets for line items',
      severity: 'normal',
      tags: ['accessibility', 'cart'],
    });
  });

  it('exposes accessible labels and adequate touch targets for cart line items', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();

    const result = await auditScreenAccessibility('Cart');

    expectNoAccessibilityIssues(result);
  });
});
