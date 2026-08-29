import { expect } from '@wdio/globals';

import CatalogScreen from '../screens/android/CatalogScreen';

export async function expectCatalogToBeReady(): Promise<void> {
  const displayed = await CatalogScreen.isDisplayed();
  expect(displayed).toBe(true);

  const firstProductName = await CatalogScreen.getFirstProductName();
  expect(firstProductName.length).toBeGreaterThan(0);
}

export async function expectProductToBeVisible(productName: string): Promise<void> {
  const displayed = await CatalogScreen.isProduct(productName).isDisplayed();
  if (!displayed) {
    throw new Error(`Expected product "${productName}" to be visible in the catalog`);
  }
}
