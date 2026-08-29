import { expect } from '@wdio/globals';

import { pressBack } from '../../src/device/androidBack';
import { hideKeyboard, isKeyboardShown } from '../../src/device/keyboard';
import { openLogin } from '../../src/flows/authenticationFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import LoginScreen from '../../src/screens/android/LoginScreen';

describe('Keyboard', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Device keyboard',
      story: 'The on-screen keyboard can be hidden explicitly or via back',
      severity: 'normal',
      tags: ['device', 'keyboard'],
    });
  });

  it('hides the keyboard after it is shown by a text field', async () => {
    await openLogin();
    await LoginScreen.enterUsername('temporary-focus-trigger');

    await expect(isKeyboardShown()).resolves.toBe(true);

    await hideKeyboard();

    await expect(isKeyboardShown()).resolves.toBe(false);
  });

  it('closes the keyboard when the Android back button is pressed', async () => {
    await openLogin();
    await LoginScreen.enterUsername('temporary-focus-trigger');
    await expect(isKeyboardShown()).resolves.toBe(true);

    await pressBack();

    await expect(isKeyboardShown()).resolves.toBe(false);
    await expect(LoginScreen.waitForDisplayed()).resolves.toBeUndefined();
  });
});
