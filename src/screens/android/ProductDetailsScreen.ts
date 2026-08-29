import { $ } from '@wdio/globals';

import { byResourceId } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

class ProductDetailsScreen extends BaseScreen {
  private get nameElement() {
    return $(byResourceId('productTV'));
  }

  private get priceElement() {
    return $(byResourceId('priceTV'));
  }

  private get descriptionElement() {
    return $(byResourceId('descTV'));
  }

  private get quantityElement() {
    return $(byResourceId('noTV'));
  }

  private get increaseQuantityButton() {
    return $(byResourceId('plusIV'));
  }

  private get decreaseQuantityButton() {
    return $(byResourceId('minusIV'));
  }

  private get addToCartButton() {
    return $(byResourceId('cartBt'));
  }

  async waitForDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(
      this.nameElement,
      'Product details screen was not displayed after opening a product',
    );
  }

  async getName(): Promise<string> {
    return this.nameElement.getText();
  }

  async getPriceText(): Promise<string> {
    return this.priceElement.getText();
  }

  async getDescription(): Promise<string> {
    return this.descriptionElement.getText();
  }

  async getQuantity(): Promise<number> {
    return Number.parseInt(await this.quantityElement.getText(), 10);
  }

  async increaseQuantity(): Promise<void> {
    await this.increaseQuantityButton.click();
  }

  async decreaseQuantity(): Promise<void> {
    await this.decreaseQuantityButton.click();
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}

export default new ProductDetailsScreen();
