import { $ } from '@wdio/globals';

import { byResourceId } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

class CheckoutCompleteScreen extends BaseScreen {
  private get completeElement() {
    return $(byResourceId('completeTV'));
  }

  private get continueShoppingButton() {
    return $(byResourceId('shoopingBt'));
  }

  async waitForDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(
      this.completeElement,
      'Checkout complete confirmation screen was not displayed',
    );
  }

  async getConfirmationText(): Promise<string> {
    return this.completeElement.getText();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}

export default new CheckoutCompleteScreen();
