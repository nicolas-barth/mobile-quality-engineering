import { expect, browser } from '@wdio/globals';

import { sauceDemoStandardUser } from '../../src/fixtures/webUsers';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import SauceDemoPage from '../../src/screens/web/SauceDemoPage';

describe('Sauce Demo mobile web browsing', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Web',
      feature: 'Chrome on Android',
      story: 'A responsive e-commerce page is usable through Chrome on an Android device',
      severity: 'normal',
      tags: ['mobile-web'],
    });
    await SauceDemoPage.open();
  });

  it('creates a mobile browser session and loads the page', async () => {
    await SauceDemoPage.waitForLoginFormDisplayed();

    await expect(browser).toHaveTitle('Swag Labs');
  });

  it('renders the login form without horizontal overflow on the mobile viewport', async () => {
    await SauceDemoPage.waitForLoginFormDisplayed();

    const { scrollWidth, viewportWidth } = await browser.execute(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });

  it('accepts keyboard input and a tap to log in', async () => {
    await SauceDemoPage.waitForLoginFormDisplayed();

    await SauceDemoPage.login(sauceDemoStandardUser.username, sauceDemoStandardUser.password);

    await SauceDemoPage.waitForInventoryDisplayed();
    await expect(SauceDemoPage.getInventoryItemCount()).resolves.toBeGreaterThan(0);
  });

  it('scrolls through the product inventory after logging in', async () => {
    await SauceDemoPage.waitForLoginFormDisplayed();
    await SauceDemoPage.login(sauceDemoStandardUser.username, sauceDemoStandardUser.password);
    await SauceDemoPage.waitForInventoryDisplayed();

    await SauceDemoPage.scrollToLastInventoryItem();

    await expect(SauceDemoPage.getInventoryItemCount()).resolves.toBeGreaterThan(0);
  });

  it('opens the navigation menu on tap', async () => {
    await SauceDemoPage.waitForLoginFormDisplayed();
    await SauceDemoPage.login(sauceDemoStandardUser.username, sauceDemoStandardUser.password);
    await SauceDemoPage.waitForInventoryDisplayed();

    await SauceDemoPage.openMenu();

    await expect(SauceDemoPage.isMenuDisplayed()).resolves.toBe(true);
  });
});
