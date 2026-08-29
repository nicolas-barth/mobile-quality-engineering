import { expect } from '@wdio/globals';

import { allow } from '../../src/components/systemPermissionDialog';
import * as permissions from '../../src/device/permissions';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import MenuScreen from '../../src/screens/android/MenuScreen';
import ScannerScreen from '../../src/screens/android/ScannerScreen';

describe('QR code scanner screen', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'QR code scanner',
      story: 'The scanner screen renders regardless of pending permission state',
      severity: 'minor',
      tags: ['device', 'camera', 'emulator'],
    });
  });

  it('shows its title while the camera permission is still pending', async () => {
    await permissions.revoke('camera');

    await MenuScreen.openScanner();

    await expect(ScannerScreen.isDisplayed()).resolves.toBe(true);

    await allow();
  });

  it.skip('decodes a real QR code payload and opens it externally (requires a real device or emulator virtual camera feed; not automatable in this sandboxed environment) @manual @real-device', () =>
    undefined);
});
