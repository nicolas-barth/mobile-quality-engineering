import { $ } from '@wdio/globals';

import { cartItemRow } from '../../components/cartItemRow';
import { byResourceId } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

class CartScreen extends BaseScreen {
  private get emptyCartContainer() {
    return $(byResourceId('noItemCL'));
  }

  private get goShoppingButton() {
    return $(byResourceId('shoppingBt'));
  }

  private get filledCartContainer() {
    return $(byResourceId('cartCL'));
  }

  private get itemCountElement() {
    return $(byResourceId('itemsTV'));
  }

  private get totalPriceElement() {
    return $(byResourceId('totalPriceTV'));
  }

  private get proceedToCheckoutButton() {
    return $(byResourceId('cartBt'));
  }

  async waitForDisplayed(): Promise<void> {
    try {
      await this.filledCartContainer.waitForDisplayed({ timeout: 5000, timeoutMsg: '' });
    } catch {
      await this.emptyCartContainer.waitForDisplayed({
        timeoutMsg: 'Cart screen never reached a determined (empty or filled) state',
      });
    }
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyCartContainer.isDisplayed();
  }

  async getItemCount(): Promise<number> {
    const text = await this.itemCountElement.getText();
    const match = /\d+/.exec(text);
    if (!match) {
      throw new Error(`Could not read an item count from cart text "${text}"`);
    }
    return Number.parseInt(match[0], 10);
  }

  async getTotalPriceText(): Promise<string> {
    return this.totalPriceElement.getText();
  }

  product(name: string) {
    return cartItemRow(name);
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }

  async goShopping(): Promise<void> {
    await this.goShoppingButton.click();
  }
}

export default new CartScreen();
