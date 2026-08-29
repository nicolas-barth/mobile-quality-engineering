import { $ } from '@wdio/globals';

import { byResourceId, byResourceIdAndText } from '../screens/shared/androidSelector';

export function cartItemRow(productName: string) {
  const titleElement = () => $(byResourceIdAndText('titleTV', productName));
  const container = () => titleElement().$('..').$('..');
  const priceElement = () => container().$(byResourceId('priceTV'));
  const quantityElement = () => container().$(byResourceId('noTV'));
  const increaseButton = () => container().$(byResourceId('plusIV'));
  const decreaseButton = () => container().$(byResourceId('minusIV'));
  const removeButton = () => container().$(byResourceId('removeBt'));

  return {
    async isDisplayed(): Promise<boolean> {
      return titleElement().isDisplayed();
    },
    async getPriceText(): Promise<string> {
      return priceElement().getText();
    },
    async getQuantity(): Promise<number> {
      return Number.parseInt(await quantityElement().getText(), 10);
    },
    async increaseQuantity(): Promise<void> {
      await increaseButton().click();
    },
    async decreaseQuantity(): Promise<void> {
      await decreaseButton().click();
    },
    async remove(): Promise<void> {
      await removeButton().click();
    },
  };
}
