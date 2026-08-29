import fs from 'node:fs';

import { expect } from '@wdio/globals';

import { loadEnv } from '../../src/config/env';
import { isInstalled } from '../../src/device/appState';
import {
  installCleanly,
  uninstallCompletely,
  verifyInstalledVersion,
} from '../../src/flows/installationFlow';
import { applyTestMetadata } from '../../src/reporters/allureMetadata';
import CatalogScreen from '../../src/screens/android/CatalogScreen';

function readExpectedVersionName(): string {
  const versionFilePath = 'app/android/VERSION.txt';
  const contents = fs.readFileSync(versionFilePath, 'utf-8');
  const match = /^version=(.+)$/m.exec(contents);
  if (!match?.[1]) {
    throw new Error(`Could not read the expected app version from ${versionFilePath}`);
  }
  return match[1].trim();
}

describe('Clean installation', () => {
  beforeEach(async () => {
    await applyTestMetadata({
      epic: 'Mobile Commerce',
      feature: 'Installation',
      story: 'A clean install reaches the catalog with the expected version',
      severity: 'critical',
      tags: ['installation'],
    });
  });

  it('installs the application and reaches the catalog', async () => {
    const env = loadEnv();

    await installCleanly(env.androidAppPath);

    await expect(CatalogScreen.isDisplayed()).resolves.toBe(true);
    await expect(isInstalled()).resolves.toBe(true);
  });

  it('installs the version recorded for this test run', async () => {
    const env = loadEnv();
    await installCleanly(env.androidAppPath);

    await verifyInstalledVersion(readExpectedVersionName());
  });

  it('removes the package completely on uninstall', async () => {
    const env = loadEnv();
    await installCleanly(env.androidAppPath);

    await uninstallCompletely();

    await expect(isInstalled()).resolves.toBe(false);
  });
});
