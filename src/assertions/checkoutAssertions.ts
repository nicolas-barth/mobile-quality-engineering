import CheckoutCompleteScreen from '../screens/android/CheckoutCompleteScreen';
import CheckoutOverviewScreen from '../screens/android/CheckoutOverviewScreen';
import { parseCurrencyToCents, sumCents } from '../utils/money';

export async function expectOverviewTotalToEqual(
  itemPricesCents: number[],
  deliveryFeeCents: number,
): Promise<void> {
  const expectedTotalCents = sumCents(itemPricesCents) + deliveryFeeCents;
  const actualTotalCents = parseCurrencyToCents(await CheckoutOverviewScreen.getTotalAmountText());

  if (actualTotalCents !== expectedTotalCents) {
    throw new Error(
      `Expected the checkout overview total to be ${expectedTotalCents} cents but the screen displayed ${actualTotalCents} cents`,
    );
  }
}

export async function expectOrderToBeCompleted(): Promise<void> {
  const confirmationText = await CheckoutCompleteScreen.getConfirmationText();
  if (confirmationText.trim().length === 0) {
    throw new Error('Expected a non-empty order confirmation message after placing an order');
  }
}
