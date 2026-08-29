import fs from 'node:fs';
import path from 'node:path';

import { pressBack } from '../../src/device/androidBack';
import * as appLifecycle from '../../src/device/appLifecycle';
import { launchApplication } from '../../src/flows/applicationLaunchFlow';
import { openCart } from '../../src/flows/cartFlow';
import { addProductToCart, openProduct } from '../../src/flows/productFlow';
import { createModuleLogger } from '../../src/logging/logger';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';

const logger = createModuleLogger('soak-spec');
const RESULTS_PATH = path.join('reports', 'stability', 'soak.json');
const soakDurationMinutes = process.env.SOAK_DURATION_MINUTES
  ? Number.parseFloat(process.env.SOAK_DURATION_MINUTES)
  : 0;

async function runIteration(): Promise<void> {
  await CatalogScreen.waitForDisplayed();
  const productName = await CatalogScreen.getFirstProductName();
  await openProduct(productName);
  await addProductToCart(productName);
  await openCart();
  await pressBack();
  await appLifecycle.sendToBackground(2);
  await appLifecycle.returnToForeground();
  await launchApplication();
}

describe('Soak', () => {
  beforeEach(async function () {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Stability',
      story: 'The application survives a sustained loop of catalog, cart and lifecycle transitions',
      severity: 'normal',
      tags: ['stability', 'soak'],
    });

    if (soakDurationMinutes <= 0) {
      this.skip();
    }
  });

  it('completes repeated catalog, cart and lifecycle cycles without crashing', async function () {
    if (soakDurationMinutes <= 0) {
      this.skip();
      return;
    }

    this.timeout(soakDurationMinutes * 60_000 + 120_000);

    const deadline = Date.now() + soakDurationMinutes * 60_000;
    let iterations = 0;
    let failures = 0;

    while (Date.now() < deadline) {
      try {
        await runIteration();
        iterations += 1;
      } catch (error) {
        failures += 1;
        logger.error({ err: error, iterations }, 'Soak iteration failed');
      }
    }

    fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
    fs.writeFileSync(
      RESULTS_PATH,
      JSON.stringify({ soakDurationMinutes, iterations, failures }, null, 2),
    );

    if (failures > 0) {
      throw new Error(`${failures} of ${iterations + failures} soak iterations failed`);
    }
  });
});
