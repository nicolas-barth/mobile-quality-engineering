import { $ } from '@wdio/globals';

import { byDescriptionAndText } from '../screens/shared/androidSelector';

export function productCard(productName: string) {
  const nameElement = () => $(byDescriptionAndText('Product Title', productName));
  const container = () => nameElement().$('..').$('..');
  const priceElement = () => container().$('~Product Price');
  const imageElement = () => container().$('~Product Image');

  return {
    async isDisplayed(): Promise<boolean> {
      return nameElement().isDisplayed();
    },
    async open(): Promise<void> {
      await nameElement().waitForDisplayed({
        timeoutMsg: `Product "${productName}" was never displayed in the catalog`,
      });
      await container().click();
    },
    async getPriceText(): Promise<string> {
      return priceElement().getText();
    },
    async hasImage(): Promise<boolean> {
      return imageElement().isExisting();
    },
  };
}
