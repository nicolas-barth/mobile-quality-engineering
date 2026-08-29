import { $ } from '@wdio/globals';

import appHeader from '../../components/appHeader';
import { pressBack } from '../../device/androidBack';
import { byExactText, byResourceIdAndText } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

class MenuScreen extends BaseScreen {
  private get logoutMenuItem() {
    return $('~Logout Menu Item');
  }

  private get loginMenuItem() {
    return $('~Login Menu Item');
  }

  async open(): Promise<void> {
    await appHeader.openMenu();
    await this.waitUntilDisplayed(this.loginOrLogoutItem(), 'Drawer menu was not displayed');
  }

  async close(): Promise<void> {
    await pressBack();
  }

  private loginOrLogoutItem() {
    return $('android=new UiSelector().descriptionMatches("Login Menu Item|Logout Menu Item")');
  }

  private menuItem(label: string) {
    return $(byResourceIdAndText('itemTV', label));
  }

  async navigateTo(label: string): Promise<void> {
    await this.open();
    const item = this.menuItem(label);
    await item.waitForDisplayed({ timeoutMsg: `Drawer menu item "${label}" was not displayed` });
    await item.click();
  }

  async navigateToCatalog(): Promise<void> {
    await this.navigateTo('Catalog');
  }

  async openScanner(): Promise<void> {
    await this.navigateTo('QR Code Scanner');
  }

  async isLoggedIn(): Promise<boolean> {
    await this.open();
    const loggedIn = await this.logoutMenuItem.isExisting();
    await this.close();
    return loggedIn;
  }

  async openLogin(): Promise<void> {
    await this.open();
    await this.loginMenuItem.click();
  }

  async logout(): Promise<void> {
    await this.open();
    await this.logoutMenuItem.click();
    const confirmButton = $(byExactText('LOGOUT'));
    await confirmButton.waitForDisplayed({
      timeoutMsg: 'Logout confirmation dialog did not appear',
    });
    await confirmButton.click();
  }

  async resetApplicationState(): Promise<void> {
    await this.navigateTo('Reset App State');
    const confirmButton = $(byExactText('RESET APP'));
    await confirmButton.waitForDisplayed({
      timeoutMsg: 'Reset App State confirmation dialog did not appear',
    });
    await confirmButton.click();

    const acknowledgeButton = $(byExactText('OK'));
    await acknowledgeButton.waitForDisplayed({
      timeoutMsg: 'Reset App State acknowledgement dialog did not appear',
    });
    await acknowledgeButton.click();
  }
}

export default new MenuScreen();
