import { expect } from '@wdio/globals';

import { allow, deny } from '../../src/components/systemPermissionDialog';
import * as permissions from '../../src/device/permissions';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import MenuScreen from '../../src/screens/android/MenuScreen';
import ScannerScreen from '../../src/screens/android/ScannerScreen';

describe('Camera permission', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Runtime permissions',
      story: 'Camera permission can be granted or denied',
      severity: 'critical',
      tags: ['device', 'permissions', 'camera', 'emulator'],
    });
  });

  it('shows the camera preview once the permission has already been granted', async () => {
    await permissions.grant('camera');

    await MenuScreen.openScanner();

    await expect(ScannerScreen.isCameraPreviewVisible()).resolves.toBe(true);
  });

  it('returns to the catalog when the camera permission is denied from the system dialog', async () => {
    await permissions.revoke('camera');

    await MenuScreen.openScanner();
    await deny();

    await expect(CatalogScreen.isDisplayed()).resolves.toBe(true);
  });

  it('shows the camera preview after the permission is accepted from the system dialog', async () => {
    await permissions.revoke('camera');

    await MenuScreen.openScanner();
    await allow();

    await expect(ScannerScreen.isCameraPreviewVisible()).resolves.toBe(true);
  });
});
