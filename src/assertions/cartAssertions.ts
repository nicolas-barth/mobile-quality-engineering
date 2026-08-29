import { expect } from '@wdio/globals';

import CartScreen from '../screens/android/CartScreen';
import { parseCurrencyToCents, sumCents } from '../utils/money';

export async function expectCartToBeEmpty(): Promise<void> {
  const empty = await CartScreen.isEmpty();
  if (!empty) {
    throw new Error('Expected the cart to be empty but it still contains items');
  }
}

export async function expectCartItemCountToEqual(expectedCount: number): Promise<void> {
  const actualCount = await CartScreen.getItemCount();
  expect(actualCount).toBe(expectedCount);
}

export async function expectCartTotalToEqual(itemPricesCents: number[]): Promise<void> {
  const expectedTotalCents = sumCents(itemPricesCents);
  const actualTotalCents = parseCurrencyToCents(await CartScreen.getTotalPriceText());

  if (actualTotalCents !== expectedTotalCents) {
    throw new Error(
      `Expected the cart total to be ${expectedTotalCents} cents but the screen displayed ${actualTotalCents} cents`,
    );
  }
}

export async function expectProductQuantityToEqual(
  productName: string,
  expectedQuantity: number,
): Promise<void> {
  const actualQuantity = await CartScreen.product(productName).getQuantity();
  if (actualQuantity !== expectedQuantity) {
    throw new Error(
      `Expected "${productName}" to have quantity ${expectedQuantity} in the cart but found ${actualQuantity}`,
    );
  }
}
