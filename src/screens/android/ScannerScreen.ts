import { $ } from '@wdio/globals';

import { byResourceId } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

class ScannerScreen extends BaseScreen {
  private get titleElement() {
    return $(byResourceId('qrCodeTV'));
  }

  private get cameraPreview() {
    return $(byResourceId('previewView'));
  }

  async waitForDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(this.titleElement, 'QR code scanner screen was not displayed');
  }

  async isDisplayed(): Promise<boolean> {
    return this.titleElement.isDisplayed();
  }

  async isCameraPreviewVisible(): Promise<boolean> {
    return this.cameraPreview.isDisplayed();
  }
}

export default new ScannerScreen();
