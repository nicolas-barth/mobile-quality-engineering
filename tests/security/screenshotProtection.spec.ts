import { expect, browser } from '@wdio/globals';

import { buildCheckoutFixture } from '../../src/factories/checkoutFactory';
import { standardUser } from '../../src/fixtures/users';
import { login } from '../../src/flows/authenticationFlow';
import { openCart } from '../../src/flows/cartFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import { createModuleLogger } from '../../src/logging/logger';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CartScreen from '../../src/screens/android/CartScreen';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import CheckoutPaymentScreen from '../../src/screens/android/CheckoutPaymentScreen';
import CheckoutShippingScreen from '../../src/screens/android/CheckoutShippingScreen';
import { isLikelyProtectedScreenshot } from '../../src/services/screenshotProtectionService';

const logger = createModuleLogger('screenshot-protection-spec');

describe('Payment screen screenshot protection', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Security',
      story:
        'Observe whether the payment form is protected against screenshots and screen recording',
      severity: 'minor',
      tags: ['security'],
    });
  });

  it('records whether a screenshot of the payment form is suppressed by FLAG_SECURE', async () => {
    const fixture = buildCheckoutFixture();
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();
    await CartScreen.proceedToCheckout();
    await login(standardUser);

    await CheckoutShippingScreen.waitForDisplayed();
    await CheckoutShippingScreen.fillShippingAddress(fixture.shippingAddress);
    await CheckoutShippingScreen.proceedToPayment();

    await CheckoutPaymentScreen.waitForDisplayed();
    await CheckoutPaymentScreen.fillPaymentDetails(fixture.payment);

    const screenshot = await browser.takeScreenshot();
    expect(screenshot.length).toBeGreaterThan(0);

    const likelyProtected = isLikelyProtectedScreenshot(screenshot);

    logger.info(
      { likelyProtected },
      'Observed screenshot protection state for the payment form; this is a finding, not an assertion of a defect',
    );
  });
});
