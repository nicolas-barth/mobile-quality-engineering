import path from 'node:path';

import { expect } from '@wdio/globals';

import { openCart } from '../../src/flows/cartFlow';
import { addProductToCart } from '../../src/flows/productFlow';
import {
  getInstalledVersionName,
  installBaseline,
  resolveUpgradePrerequisites,
  upgradeToTarget,
} from '../../src/flows/upgradeFlow';
import { createModuleLogger } from '../../src/logging/logger';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CartScreen from '../../src/screens/android/CartScreen';
import CatalogScreen from '../../src/screens/android/CatalogScreen';

const logger = createModuleLogger('application-upgrade-spec');

function parseVersionFromApkFileName(apkPath: string): string {
  const match = /mda-([\d.]+)-\d+\.apk$/.exec(path.basename(apkPath));
  if (!match?.[1]) {
    throw new Error(`Could not parse an app version from APK file name "${apkPath}"`);
  }
  return match[1];
}

describe('Application upgrade', () => {
  beforeEach(async function () {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Upgrade',
      story:
        'Upgrading over an existing installation preserves startup and reports the new version',
      severity: 'normal',
      tags: ['upgrade'],
    });

    if (!resolveUpgradePrerequisites()) {
      this.skip();
    }
  });

  it('starts up after an upgrade and reaches the catalog', async function () {
    const prerequisites = resolveUpgradePrerequisites();
    if (!prerequisites) {
      this.skip();
      return;
    }

    await installBaseline(prerequisites.baselineApkPath);
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);

    await upgradeToTarget(prerequisites.targetApkPath);

    await expect(CatalogScreen.isDisplayed()).resolves.toBe(true);
  });

  it('reports the target version after upgrading and logs observed cart persistence', async function () {
    const prerequisites = resolveUpgradePrerequisites();
    if (!prerequisites) {
      this.skip();
      return;
    }

    await installBaseline(prerequisites.baselineApkPath);
    const productName = await CatalogScreen.getFirstProductName();
    await addProductToCart(productName);

    await upgradeToTarget(prerequisites.targetApkPath);

    const installedVersion = await getInstalledVersionName();
    expect(installedVersion).toBe(parseVersionFromApkFileName(prerequisites.targetApkPath));

    await openCart();
    const cartSurvivedUpgrade = await CartScreen.product(productName).isDisplayed();
    logger.info(
      { productName, cartSurvivedUpgrade },
      'Observed cart persistence behavior across an application upgrade',
    );
  });
});
