import { buildAndroidStandardCapability } from './config/capabilities/android-standard';
import { resolveEnvironmentConfig } from './config/environments';
import {
  reportAfterTest,
  reportBeforeSession,
  reportBeforeTest,
  reportRunSummary,
} from './config/wdio/hooks';
import { mochaOpts } from './config/wdio/mocha';
import { reporters } from './config/wdio/reporters';
import { visualService } from './config/wdio/visual';
import { loadEnv } from './src/config/env';

const env = loadEnv();
const runtimeConfig = resolveEnvironmentConfig();

export const config: WebdriverIO.Config = {
  runner: 'local',

  specs: ['./tests/**/*.spec.ts'],
  suites: {
    smoke: ['./tests/smoke/**/*.spec.ts'],
    functional: ['./tests/functional/**/*.spec.ts'],
    device: ['./tests/device/**/*.spec.ts'],
    critical: [
      './tests/smoke/**/*.spec.ts',
      './tests/functional/checkout/checkoutOverviewAndCompletion.spec.ts',
      './tests/functional/cart/cartBasics.spec.ts',
      './tests/functional/authentication/login.spec.ts',
    ],
    permissions: ['./tests/device/permissions.spec.ts', './tests/device/scanner.spec.ts'],
    'device-lifecycle': ['./tests/device/lifecycle.spec.ts', './tests/device/appState.spec.ts'],
    checkout: ['./tests/functional/checkout/**/*.spec.ts'],
    accessibility: ['./tests/accessibility/**/*.spec.ts'],
    visual: ['./tests/visual/**/*.spec.ts'],
    installation: ['./tests/installation/**/*.spec.ts'],
    upgrade: ['./tests/upgrade/**/*.spec.ts'],
    security: ['./tests/security/**/*.spec.ts'],
    performance: ['./tests/performance/**/*.spec.ts'],
    stability: ['./tests/stability/**/*.spec.ts'],
    advanced: [
      './tests/accessibility/**/*.spec.ts',
      './tests/visual/**/*.spec.ts',
      './tests/installation/**/*.spec.ts',
      './tests/upgrade/**/*.spec.ts',
      './tests/security/**/*.spec.ts',
      './tests/performance/**/*.spec.ts',
      './tests/stability/**/*.spec.ts',
    ],
    regression: [
      './tests/smoke/**/*.spec.ts',
      './tests/functional/**/*.spec.ts',
      './tests/device/**/*.spec.ts',
      './tests/accessibility/**/*.spec.ts',
      './tests/visual/**/*.spec.ts',
      './tests/installation/**/*.spec.ts',
      './tests/upgrade/**/*.spec.ts',
      './tests/security/**/*.spec.ts',
      './tests/performance/**/*.spec.ts',
      './tests/stability/**/*.spec.ts',
    ],
  },
  exclude: ['./tests/compatibility/**/*.spec.ts', './tests/mobile-web/**/*.spec.ts'],

  maxInstances: 1,
  capabilities: [buildAndroidStandardCapability()],

  hostname: env.appiumHost,
  port: env.appiumPort,
  path: '/',

  logLevel: env.wdioLogLevel,
  outputDir: './test-results',

  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: runtimeConfig.connectionRetryTimeout,
  connectionRetryCount: runtimeConfig.connectionRetryCount,

  framework: 'mocha',
  reporters,
  services: [visualService],
  mochaOpts,

  before: reportBeforeSession,
  beforeTest: reportBeforeTest,
  afterTest: reportAfterTest,
  onComplete: reportRunSummary,
};
