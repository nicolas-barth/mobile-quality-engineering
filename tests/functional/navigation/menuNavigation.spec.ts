import { expect } from '@wdio/globals';

import { openLogin } from '../../../src/flows/authenticationFlow';
import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import CatalogScreen from '../../../src/screens/android/CatalogScreen';
import LoginScreen from '../../../src/screens/android/LoginScreen';
import MenuScreen from '../../../src/screens/android/MenuScreen';
import ScannerScreen from '../../../src/screens/android/ScannerScreen';

describe('Menu navigation', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Navigation',
      story: 'The drawer menu navigates to every primary destination',
      severity: 'normal',
      tags: ['functional', 'navigation'],
    });
  });

  it('opens and closes without navigating away from the catalog', async () => {
    await MenuScreen.open();
    await MenuScreen.close();

    await expect(CatalogScreen.isDisplayed()).resolves.toBe(true);
  });

  it('navigates to the login screen', async () => {
    await openLogin();

    await expect(LoginScreen.waitForDisplayed()).resolves.toBeUndefined();
  });

  it('navigates to the QR code scanner screen', async () => {
    await MenuScreen.openScanner();

    await expect(ScannerScreen.waitForDisplayed()).resolves.toBeUndefined();
  });

  it('navigates back to the catalog from another screen', async () => {
    await MenuScreen.openScanner();
    await ScannerScreen.waitForDisplayed();

    await MenuScreen.navigateToCatalog();

    await expect(CatalogScreen.isDisplayed()).resolves.toBe(true);
  });
});
