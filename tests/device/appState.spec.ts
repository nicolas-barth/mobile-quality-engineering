import { expect } from '@wdio/globals';

import { getRunState, isInstalled } from '../../src/device/appState';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import { AppRunState } from '../../src/types/appState';

describe('Application state reporting', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Device lifecycle',
      story: 'Application state is reported through a semantic type',
      severity: 'normal',
      tags: ['device'],
    });
  });

  it('reports the application as running in the foreground after launch', async () => {
    await expect(getRunState()).resolves.toBe(AppRunState.RunningInForeground);
  });

  it('reports the application as installed for the configured package', async () => {
    await expect(isInstalled()).resolves.toBe(true);
  });
});
