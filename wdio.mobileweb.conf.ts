import { buildAndroidChromeCapability } from './config/capabilities/androidChrome';
import { resolveEnvironmentConfig } from './config/environments';
import { reportAfterTest } from './config/wdio/hooks';
import {
  reportMobileWebBeforeSession,
  reportMobileWebBeforeTest,
} from './config/wdio/mobileWebHooks';
import { mochaOpts } from './config/wdio/mocha';
import { reporters } from './config/wdio/reporters';
import { loadEnv } from './src/config/env';

const env = loadEnv();
const runtimeConfig = resolveEnvironmentConfig();

export const config: WebdriverIO.Config = {
  runner: 'local',

  specs: ['./tests/mobile-web/**/*.spec.ts'],

  maxInstances: 1,
  capabilities: [buildAndroidChromeCapability()],

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
  mochaOpts,

  before: reportMobileWebBeforeSession,
  beforeTest: reportMobileWebBeforeTest,
  afterTest: reportAfterTest,
};
