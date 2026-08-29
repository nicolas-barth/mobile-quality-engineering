import { $ } from '@wdio/globals';

import { PaymentDetails } from '../../types/checkout';
import { byResourceId } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

class CheckoutPaymentScreen extends BaseScreen {
  private get cardHolderField() {
    return $(byResourceId('nameET'));
  }

  private get cardNumberField() {
    return $(byResourceId('cardNumberET'));
  }

  private get expirationDateField() {
    return $(byResourceId('expirationDateET'));
  }

  private get securityCodeField() {
    return $(byResourceId('securityCodeET'));
  }

  private get reviewOrderButton() {
    return $(byResourceId('paymentBtn'));
  }

  async waitForDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(
      this.cardNumberField,
      'Checkout payment screen was not displayed',
    );
  }

  async fillPaymentDetails(payment: PaymentDetails): Promise<void> {
    await this.cardHolderField.setValue(payment.cardHolder);
    await this.cardNumberField.setValue(payment.cardNumber);
    await this.expirationDateField.setValue(payment.expirationDate);
    await this.securityCodeField.setValue(payment.securityCode);
  }

  async proceedToReview(): Promise<void> {
    await this.reviewOrderButton.click();
  }
}

export default new CheckoutPaymentScreen();
