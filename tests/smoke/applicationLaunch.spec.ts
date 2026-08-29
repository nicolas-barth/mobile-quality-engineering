import { expectCatalogToBeReady } from '../../src/assertions/catalogAssertions';
import { launchApplication } from '../../src/flows/applicationLaunchFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';

describe('Application launch', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Application launch',
      story: 'Startup reaches the catalog',
      severity: 'blocker',
      tags: ['smoke', 'critical', 'catalog'],
    });
  });

  it('displays the product catalog after startup', async () => {
    await launchApplication();
    await expectCatalogToBeReady();
  });
});
