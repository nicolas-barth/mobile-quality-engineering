import { expect } from '@wdio/globals';

import { buildShippingAddress } from '../../../src/factories/addressFactory';
import { standardUser } from '../../../src/fixtures/users';
import { login } from '../../../src/flows/authenticationFlow';
import { openCart } from '../../../src/flows/cartFlow';
import { addProductToCart } from '../../../src/flows/productFlow';
import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import CartScreen from '../../../src/screens/android/CartScreen';
import CatalogScreen from '../../../src/screens/android/CatalogScreen';
import CheckoutPaymentScreen from '../../../src/screens/android/CheckoutPaymentScreen';
import CheckoutShippingScreen from '../../../src/screens/android/CheckoutShippingScreen';

async function reachShippingScreen(): Promise<void> {
  const productName = await CatalogScreen.getFirstProductName();
  await addProductToCart(productName);
  await openCart();
  await CartScreen.proceedToCheckout();
  await login(standardUser);
  await CheckoutShippingScreen.waitForDisplayed();
}

describe('Checkout shipping', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Checkout',
      story: 'Shipping information is required to continue',
      severity: 'normal',
      tags: ['functional', 'checkout'],
    });
  });

  it('does not continue to payment when required fields are missing', async () => {
    await reachShippingScreen();

    await CheckoutShippingScreen.proceedToPayment();

    await expect(CheckoutShippingScreen.waitForDisplayed()).resolves.toBeUndefined();
  });

  it('continues to payment with valid shipping information', async () => {
    await reachShippingScreen();

    await CheckoutShippingScreen.fillShippingAddress(buildShippingAddress());
    await CheckoutShippingScreen.proceedToPayment();

    await expect(CheckoutPaymentScreen.waitForDisplayed()).resolves.toBeUndefined();
  });
});
