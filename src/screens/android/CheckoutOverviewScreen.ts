import { $ } from '@wdio/globals';

import { cartItemRow } from '../../components/cartItemRow';
import { byResourceId } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

class CheckoutOverviewScreen extends BaseScreen {
  private get fullNameElement() {
    return $(byResourceId('fullNameTV'));
  }

  private get deliveryFeeElement() {
    return $(byResourceId('amountTV'));
  }

  private get itemCountElement() {
    return $(byResourceId('itemNumberTV'));
  }

  private get totalAmountElement() {
    return $(byResourceId('totalAmountTV'));
  }

  private get placeOrderButton() {
    return $(byResourceId('paymentBtn'));
  }

  async waitForDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(
      this.totalAmountElement,
      'Checkout overview screen was not displayed',
    );
  }

  async getDeliverToName(): Promise<string> {
    return this.fullNameElement.getText();
  }

  product(name: string) {
    return cartItemRow(name);
  }

  async getItemCountText(): Promise<string> {
    return this.itemCountElement.getText();
  }

  async getDeliveryFeeText(): Promise<string> {
    return this.deliveryFeeElement.getText();
  }

  async getTotalAmountText(): Promise<string> {
    return this.totalAmountElement.getText();
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }
}

export default new CheckoutOverviewScreen();
