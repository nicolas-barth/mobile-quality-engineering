import { expectNoAccessibilityIssues } from '../../src/assertions/accessibilityAssertions';
import { auditScreenAccessibility } from '../../src/device/accessibilityInspector';
import { buildCheckoutFixture } from '../../src/factories/checkoutFactory';
import { standardUser } from '../../src/fixtures/users';
import { openCart } from '../../src/flows/cartFlow';
import { reachOverview } from '../../src/flows/checkoutFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';

describe('Checkout overview accessibility', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Accessibility',
      story: 'Checkout overview exposes accessible labels and touch targets',
      severity: 'normal',
      tags: ['accessibility', 'checkout'],
    });
  });

  it('exposes accessible labels and adequate touch targets on the order review screen', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();
    await reachOverview(buildCheckoutFixture(), standardUser);

    const result = await auditScreenAccessibility('Checkout overview');

    expectNoAccessibilityIssues(result);
  });
});
