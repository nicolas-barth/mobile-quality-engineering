import { expect, browser } from '@wdio/globals';

import {
  captureConfigSnapshot,
  disableAnimations,
  restoreConfigSnapshot,
} from '../../src/device/deviceConfig';
import { openLogin } from '../../src/flows/authenticationFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import { DeviceConfigSnapshot } from '../../src/types/deviceConfig';

const MAX_ACCEPTABLE_MISMATCH_PERCENTAGE = 1;

describe('Login visual regression', () => {
  let snapshot: DeviceConfigSnapshot;

  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Visual regression',
      story: 'Login form layout matches its baseline',
      severity: 'normal',
      tags: ['visual', 'authentication'],
    });
    snapshot = await captureConfigSnapshot();
    await disableAnimations();
  });

  afterEach(async () => {
    await restoreConfigSnapshot(snapshot);
  });

  it('matches the login baseline', async () => {
    await openLogin();

    await expect(browser).toMatchScreenSnapshot('login', MAX_ACCEPTABLE_MISMATCH_PERCENTAGE);
  });
});
