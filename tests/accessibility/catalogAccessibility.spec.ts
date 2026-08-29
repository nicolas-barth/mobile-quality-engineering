import { expectNoAccessibilityIssues } from '../../src/assertions/accessibilityAssertions';
import { auditScreenAccessibility } from '../../src/device/accessibilityInspector';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';

describe('Catalog accessibility', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Accessibility',
      story: 'Catalog exposes accessible labels and touch targets',
      severity: 'normal',
      tags: ['accessibility'],
    });
  });

  it('exposes accessible labels and adequate touch targets for every clickable element', async () => {
    await CatalogScreen.waitForDisplayed();

    const result = await auditScreenAccessibility('Catalog');

    expectNoAccessibilityIssues(result);
  });
});
