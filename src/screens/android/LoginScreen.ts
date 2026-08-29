import { $ } from '@wdio/globals';

import { byResourceId } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

class LoginScreen extends BaseScreen {
  private get usernameField() {
    return $(byResourceId('nameET'));
  }

  private get passwordField() {
    return $(byResourceId('passwordET'));
  }

  private get loginButton() {
    return $(byResourceId('loginBtn'));
  }

  private get usernameErrorElement() {
    return $(byResourceId('nameErrorTV'));
  }

  private get passwordErrorElement() {
    return $(byResourceId('passwordErrorTV'));
  }

  async waitForDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(this.usernameField, 'Login screen was not displayed');
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameField.setValue(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordField.setValue(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async isUsernameErrorDisplayed(): Promise<boolean> {
    return this.usernameErrorElement.isDisplayed();
  }

  async isPasswordErrorDisplayed(): Promise<boolean> {
    return this.passwordErrorElement.isDisplayed();
  }

  async getUsernameErrorText(): Promise<string> {
    return this.usernameErrorElement.getText();
  }

  async getPasswordErrorText(): Promise<string> {
    return this.passwordErrorElement.getText();
  }
}

export default new LoginScreen();
