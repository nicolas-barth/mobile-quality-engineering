import { $, $$, browser } from '@wdio/globals';

import { BaseScreen } from '../shared/BaseScreen';

const SAUCE_DEMO_URL = 'https://www.saucedemo.com/';

class SauceDemoPage extends BaseScreen {
  private get usernameField() {
    return $('#user-name');
  }

  private get passwordField() {
    return $('#password');
  }

  private get loginButton() {
    return $('#login-button');
  }

  private get inventoryList() {
    return $('.inventory_list');
  }

  private get inventoryItems() {
    return $$('.inventory_item');
  }

  private get menuButton() {
    return $('#react-burger-menu-btn');
  }

  private get menuPanel() {
    return $('.bm-menu-wrap');
  }

  async open(): Promise<void> {
    await browser.url(SAUCE_DEMO_URL);
  }

  async waitForLoginFormDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(this.loginButton, 'Sauce Demo login form was not displayed');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField.setValue(username);
    await this.passwordField.setValue(password);
    await this.loginButton.click();
  }

  async waitForInventoryDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(
      this.inventoryList,
      'Sauce Demo inventory list was not displayed',
    );
  }

  async getInventoryItemCount(): Promise<number> {
    const items = await this.inventoryItems.getElements();
    return items.length;
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
  }

  async isMenuDisplayed(): Promise<boolean> {
    return this.menuPanel.isDisplayed();
  }

  async scrollToLastInventoryItem(): Promise<void> {
    const items = await this.inventoryItems.getElements();
    const lastItem = items[items.length - 1];
    if (lastItem) {
      await lastItem.scrollIntoView();
    }
  }
}

export default new SauceDemoPage();
