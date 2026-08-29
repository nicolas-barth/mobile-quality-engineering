import { expectNoAccessibilityIssues } from '../../src/assertions/accessibilityAssertions';
import { auditScreenAccessibility } from '../../src/device/accessibilityInspector';
import { openLogin } from '../../src/flows/authenticationFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';

describe('Login accessibility', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Accessibility',
      story: 'Login form exposes accessible labels and touch targets',
      severity: 'normal',
      tags: ['accessibility', 'authentication'],
    });
  });

  it('exposes accessible labels and adequate touch targets for the login form', async () => {
    await openLogin();

    const result = await auditScreenAccessibility('Login');

    expectNoAccessibilityIssues(result);
  });
});
