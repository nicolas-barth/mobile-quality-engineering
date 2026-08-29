import { createModuleLogger } from '../logging/logger';
import CartScreen from '../screens/android/CartScreen';
import CheckoutCompleteScreen from '../screens/android/CheckoutCompleteScreen';
import CheckoutOverviewScreen from '../screens/android/CheckoutOverviewScreen';
import CheckoutPaymentScreen from '../screens/android/CheckoutPaymentScreen';
import CheckoutShippingScreen from '../screens/android/CheckoutShippingScreen';
import { CheckoutFixture } from '../types/checkout';
import { DemoUser } from '../types/user';

import { login } from './authenticationFlow';

const logger = createModuleLogger('checkout-flow');

export async function reachOverview(fixture: CheckoutFixture, user: DemoUser): Promise<void> {
  logger.info('Proceeding from the cart to checkout, authenticating if required');
  await CartScreen.proceedToCheckout();
  await login(user);

  await CheckoutShippingScreen.waitForDisplayed();
  await CheckoutShippingScreen.fillShippingAddress(fixture.shippingAddress);
  await CheckoutShippingScreen.proceedToPayment();

  await CheckoutPaymentScreen.waitForDisplayed();
  await CheckoutPaymentScreen.fillPaymentDetails(fixture.payment);
  await CheckoutPaymentScreen.proceedToReview();

  await CheckoutOverviewScreen.waitForDisplayed();
}

export async function placeOrder(fixture: CheckoutFixture, user: DemoUser): Promise<void> {
  logger.info('Completing checkout end to end');
  await reachOverview(fixture, user);
  await CheckoutOverviewScreen.placeOrder();
  await CheckoutCompleteScreen.waitForDisplayed();
}
