import { expect } from '@wdio/globals';

import { buildShippingAddress } from '../../../src/factories/addressFactory';
import { buildPaymentDetails } from '../../../src/factories/checkoutFactory';
import { standardUser } from '../../../src/fixtures/users';
import { login } from '../../../src/flows/authenticationFlow';
import { openCart } from '../../../src/flows/cartFlow';
import { addProductToCart } from '../../../src/flows/productFlow';
import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import CartScreen from '../../../src/screens/android/CartScreen';
import CatalogScreen from '../../../src/screens/android/CatalogScreen';
import CheckoutOverviewScreen from '../../../src/screens/android/CheckoutOverviewScreen';
import CheckoutPaymentScreen from '../../../src/screens/android/CheckoutPaymentScreen';
import CheckoutShippingScreen from '../../../src/screens/android/CheckoutShippingScreen';

async function reachPaymentScreen(): Promise<void> {
  const productName = await CatalogScreen.getFirstProductName();
  await addProductToCart(productName);
  await openCart();
  await CartScreen.proceedToCheckout();
  await login(standardUser);
  await CheckoutShippingScreen.waitForDisplayed();
  await CheckoutShippingScreen.fillShippingAddress(buildShippingAddress());
  await CheckoutShippingScreen.proceedToPayment();
  await CheckoutPaymentScreen.waitForDisplayed();
}

describe('Checkout payment', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Checkout',
      story: 'Payment information is required to continue',
      severity: 'normal',
      tags: ['functional', 'checkout'],
    });
  });

  it('does not continue to the review screen when required fields are missing', async () => {
    await reachPaymentScreen();

    await CheckoutPaymentScreen.proceedToReview();

    await expect(CheckoutPaymentScreen.waitForDisplayed()).resolves.toBeUndefined();
  });

  it('continues to the review screen with valid payment information', async () => {
    await reachPaymentScreen();

    await CheckoutPaymentScreen.fillPaymentDetails(buildPaymentDetails());
    await CheckoutPaymentScreen.proceedToReview();

    await expect(CheckoutOverviewScreen.waitForDisplayed()).resolves.toBeUndefined();
  });
});
