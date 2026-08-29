import fs from 'node:fs';
import path from 'node:path';

import allureReporter from '@wdio/allure-reporter';
import { expect } from '@wdio/globals';

import { launchApplication } from '../../src/flows/applicationLaunchFlow';
import { openCart } from '../../src/flows/cartFlow';
import { addProductToCart, openProduct } from '../../src/flows/productFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CartScreen from '../../src/screens/android/CartScreen';
import CatalogScreen from '../../src/screens/android/CatalogScreen';
import { measureOperation } from '../../src/services/functionalTimingService';

const RESULTS_FILE_PATH = path.join('reports', 'performance', 'functional-timings.json');

function recordTiming(operation: string, durationMs: number): void {
  fs.mkdirSync(path.dirname(RESULTS_FILE_PATH), { recursive: true });
  const existing = fs.existsSync(RESULTS_FILE_PATH)
    ? (JSON.parse(fs.readFileSync(RESULTS_FILE_PATH, 'utf-8')) as Record<string, number>)
    : {};
  existing[operation] = durationMs;
  fs.writeFileSync(RESULTS_FILE_PATH, JSON.stringify(existing, null, 2));
}

describe('Functional timing (end-to-end, not an Android benchmark)', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Performance',
      story: 'Coarse end-to-end operation timings, sampled once per run',
      severity: 'minor',
      tags: ['performance'],
    });
  });

  it('measures application launch to catalog display', async () => {
    const timing = await measureOperation('launch-to-catalog', async () => {
      await launchApplication();
    });

    recordTiming(timing.operation, timing.durationMs);
    await allureReporter.addAttachment(
      'Functional timing',
      JSON.stringify(timing, null, 2),
      'application/json',
    );
    expect(timing.durationMs).toBeGreaterThan(0);
  });

  it('measures opening product details from the catalog', async () => {
    const productName = await CatalogScreen.getFirstProductName();

    const timing = await measureOperation('open-product-details', async () => {
      await openProduct(productName);
    });

    recordTiming(timing.operation, timing.durationMs);
    await allureReporter.addAttachment(
      'Functional timing',
      JSON.stringify(timing, null, 2),
      'application/json',
    );
    expect(timing.durationMs).toBeGreaterThan(0);
  });

  it('measures opening the cart', async () => {
    const timing = await measureOperation('open-cart', async () => {
      await openCart();
    });

    recordTiming(timing.operation, timing.durationMs);
    await allureReporter.addAttachment(
      'Functional timing',
      JSON.stringify(timing, null, 2),
      'application/json',
    );
    expect(timing.durationMs).toBeGreaterThan(0);
  });

  it('measures navigating from the cart to checkout entry', async () => {
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);
    await openCart();

    const timing = await measureOperation('cart-to-checkout-entry', async () => {
      await CartScreen.proceedToCheckout();
    });

    recordTiming(timing.operation, timing.durationMs);
    await allureReporter.addAttachment(
      'Functional timing',
      JSON.stringify(timing, null, 2),
      'application/json',
    );
    expect(timing.durationMs).toBeGreaterThan(0);
  });
});
