import { expect } from '@wdio/globals';

import * as appLifecycle from '../../../src/device/appLifecycle';
import { lockedOutUser, standardUser } from '../../../src/fixtures/users';
import { login, logout, openLogin } from '../../../src/flows/authenticationFlow';
import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import LoginScreen from '../../../src/screens/android/LoginScreen';
import MenuScreen from '../../../src/screens/android/MenuScreen';

describe('Login', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Authentication',
      story: 'Login validation and session behavior',
      severity: 'critical',
      tags: ['functional', 'authentication'],
    });
  });

  it('logs in with a valid demo user', async () => {
    await openLogin();
    await login(standardUser);

    await expect(MenuScreen.isLoggedIn()).resolves.toBe(true);
  });

  it('rejects a locked out demo user with an error message', async () => {
    await openLogin();
    await login(lockedOutUser);

    const errorDisplayed = await LoginScreen.isPasswordErrorDisplayed();
    expect(errorDisplayed).toBe(true);
  });

  it('requires a username', async () => {
    await openLogin();
    await LoginScreen.enterPassword(standardUser.password);
    await LoginScreen.submit();

    await expect(LoginScreen.isUsernameErrorDisplayed()).resolves.toBe(true);
  });

  it('requires a password', async () => {
    await openLogin();
    await LoginScreen.enterUsername(standardUser.username);
    await LoginScreen.submit();

    await expect(LoginScreen.isPasswordErrorDisplayed()).resolves.toBe(true);
  });

  it('requires both a username and a password', async () => {
    await openLogin();
    await LoginScreen.submit();

    await expect(LoginScreen.isUsernameErrorDisplayed()).resolves.toBe(true);
    await expect(LoginScreen.isPasswordErrorDisplayed()).resolves.toBe(true);
  });

  it('returns to a logged out state after logout', async () => {
    await openLogin();
    await login(standardUser);

    await logout();

    await expect(MenuScreen.isLoggedIn()).resolves.toBe(false);
  });

  it('does not preserve the session across an application restart', async () => {
    await openLogin();
    await login(standardUser);

    await appLifecycle.restart();

    await expect(MenuScreen.isLoggedIn()).resolves.toBe(false);
  });
});
