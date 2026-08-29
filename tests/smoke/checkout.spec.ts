import { expect } from '@wdio/globals';

import { buildCheckoutFixture } from '../../src/factories/checkoutFactory';
import { standardUser } from '../../src/fixtures/users';
import { openCart } from '../../src/flows/cartFlow';
import { placeOrder, reachOverview } from '../../src/flows/checkoutFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import CheckoutCompleteScreen from '../../src/screens/android/CheckoutCompleteScreen';
import CheckoutOverviewScreen from '../../src/screens/android/CheckoutOverviewScreen';

describe('Checkout', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Checkout',
      story: 'A shopper can complete an order',
      severity: 'blocker',
      tags: ['smoke', 'critical', 'checkout'],
    });
  });

  it('reaches the checkout overview from the cart', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    const fixture = buildCheckoutFixture();
    await addProductToCart(productName);
    await openCart();

    await reachOverview(fixture, standardUser);

    await expect(CheckoutOverviewScreen.getDeliverToName()).resolves.toBe(
      fixture.shippingAddress.fullName,
    );
  });

  it('completes a purchase end to end', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();

    await placeOrder(buildCheckoutFixture(), standardUser);

    const confirmationText = await CheckoutCompleteScreen.getConfirmationText();
    expect(confirmationText.length).toBeGreaterThan(0);
  });
});
