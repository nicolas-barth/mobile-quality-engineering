import { $ } from '@wdio/globals';

import { byResourceId } from '../screens/shared/androidSelector';

class AppHeader {
  private get menuButton() {
    return $(byResourceId('menuIV'));
  }

  private get sortButton() {
    return $(byResourceId('sortIV'));
  }

  private get cartButton() {
    return $(byResourceId('cartRL'));
  }

  private get cartBadgeContainer() {
    return $(byResourceId('cartCircleRL'));
  }

  private get cartBadgeCount() {
    return $(byResourceId('cartTV'));
  }

  async openMenu(): Promise<void> {
    await this.menuButton.waitForDisplayed({ timeoutMsg: 'Menu button was never displayed' });
    await this.menuButton.click();
  }

  async openSort(): Promise<void> {
    await this.sortButton.waitForDisplayed({ timeoutMsg: 'Sort button was never displayed' });
    await this.sortButton.click();
  }

  async openCart(): Promise<void> {
    await this.cartButton.waitForDisplayed({ timeoutMsg: 'Cart button was never displayed' });
    await this.cartButton.click();
  }

  async getCartBadgeCount(): Promise<number> {
    if (!(await this.cartBadgeContainer.isExisting())) {
      return 0;
    }
    const badgeText = await this.cartBadgeCount.getText();
    return Number.parseInt(badgeText, 10);
  }
}

export default new AppHeader();
