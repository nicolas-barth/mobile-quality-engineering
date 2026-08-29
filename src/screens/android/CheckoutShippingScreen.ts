import { $ } from '@wdio/globals';

import { ShippingAddress } from '../../types/address';
import { byResourceId } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

class CheckoutShippingScreen extends BaseScreen {
  private get fullNameField() {
    return $(byResourceId('fullNameET'));
  }

  private get address1Field() {
    return $(byResourceId('address1ET'));
  }

  private get address2Field() {
    return $(byResourceId('address2ET'));
  }

  private get cityField() {
    return $(byResourceId('cityET'));
  }

  private get stateField() {
    return $(byResourceId('stateET'));
  }

  private get zipField() {
    return $(byResourceId('zipET'));
  }

  private get countryField() {
    return $(byResourceId('countryET'));
  }

  private get toPaymentButton() {
    return $(byResourceId('paymentBtn'));
  }

  async waitForDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(this.fullNameField, 'Checkout shipping screen was not displayed');
  }

  async fillShippingAddress(address: ShippingAddress): Promise<void> {
    await this.fullNameField.setValue(address.fullName);
    await this.address1Field.setValue(address.address1);
    if (address.address2) {
      await this.address2Field.setValue(address.address2);
    }
    await this.cityField.setValue(address.city);
    if (address.state) {
      await this.stateField.setValue(address.state);
    }
    await this.zipField.setValue(address.zip);
    await this.countryField.setValue(address.country);
  }

  async proceedToPayment(): Promise<void> {
    await this.toPaymentButton.click();
  }
}

export default new CheckoutShippingScreen();
