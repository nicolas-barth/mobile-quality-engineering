import { expect } from '@wdio/globals';

import { expectCartToBeEmpty } from '../../../src/assertions/cartAssertions';
import { expectOrderToBeCompleted } from '../../../src/assertions/checkoutAssertions';
import { pressBack } from '../../../src/device/androidBack';
import * as appState from '../../../src/device/appState';
import { buildCheckoutFixture } from '../../../src/factories/checkoutFactory';
import { standardUser } from '../../../src/fixtures/users';
import { openCart } from '../../../src/flows/cartFlow';
import { placeOrder, reachOverview } from '../../../src/flows/checkoutFlow';
import { addProductToCart } from '../../../src/flows/productFlow';
import { applyTestMetadata } from '../../../src/reporters/allureMetadata';
import CatalogScreen from '../../../src/screens/android/CatalogScreen';
import CheckoutCompleteScreen from '../../../src/screens/android/CheckoutCompleteScreen';
import CheckoutOverviewScreen from '../../../src/screens/android/CheckoutOverviewScreen';
import { AppRunState } from '../../../src/types/appState';
import { parseCurrencyToCents } from '../../../src/utils/money';

describe('Checkout overview and completion', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Checkout',
      story: 'Order review and completion',
      severity: 'blocker',
      tags: ['functional', 'checkout', 'critical'],
    });
  });

  it('displays the product that was added to the cart', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();

    await reachOverview(buildCheckoutFixture(), standardUser);

    await expect(CheckoutOverviewScreen.product(productName).isDisplayed()).resolves.toBe(true);
  });

  it('displays a total consistent with the item price and the delivery fee', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    const priceCents = parseCurrencyToCents(
      await CatalogScreen.isProduct(productName).getPriceText(),
    );
    await addProductToCart(productName);
    await openCart();

    await reachOverview(buildCheckoutFixture(), standardUser);

    const deliveryFeeCents = parseCurrencyToCents(
      await CheckoutOverviewScreen.getDeliveryFeeText(),
    );
    const totalCents = parseCurrencyToCents(await CheckoutOverviewScreen.getTotalAmountText());
    expect(totalCents).toBe(priceCents + deliveryFeeCents);
  });

  it('completes the purchase and reaches the confirmation screen', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();

    await placeOrder(buildCheckoutFixture(), standardUser);

    await expectOrderToBeCompleted();
  });

  it('clears the cart once the order is placed', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();

    await placeOrder(buildCheckoutFixture(), standardUser);
    await CheckoutCompleteScreen.continueShopping();
    await openCart();

    await expectCartToBeEmpty();
  });

  it('leaves the foreground when the Android back button is pressed during checkout', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();
    await reachOverview(buildCheckoutFixture(), standardUser);

    await pressBack();

    const runState = await appState.getRunState();
    expect(runState).not.toBe(AppRunState.RunningInForeground);
  });
});
