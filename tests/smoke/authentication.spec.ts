import { expect } from '@wdio/globals';

import { standardUser } from '../../src/fixtures/users';
import { login, openLogin } from '../../src/flows/authenticationFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import MenuScreen from '../../src/screens/android/MenuScreen';

describe('Authentication', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Authentication',
      story: 'A valid user can log in',
      severity: 'critical',
      tags: ['smoke', 'critical', 'authentication'],
    });
  });

  it('logs in with a valid demo user', async () => {
    await openLogin();
    await login(standardUser);

    await expect(MenuScreen.isLoggedIn()).resolves.toBe(true);
  });
});
