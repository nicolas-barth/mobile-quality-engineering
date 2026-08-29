import { buildCompatibilityCapabilities } from './config/capabilities/androidCompatibility';
import { resolveEnvironmentConfig } from './config/environments';
import {
  reportAfterTest,
  reportBeforeSession,
  reportBeforeTest,
  reportRunSummary,
} from './config/wdio/hooks';
import { mochaOpts } from './config/wdio/mocha';
import { reporters } from './config/wdio/reporters';
import { loadEnv } from './src/config/env';

const env = loadEnv();
const runtimeConfig = resolveEnvironmentConfig();

export const config: WebdriverIO.Config = {
  runner: 'local',

  specs: ['./tests/compatibility/**/*.spec.ts'],

  maxInstances: 1,
  capabilities: buildCompatibilityCapabilities(process.env.COMPATIBILITY_PROFILE),

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

  before: reportBeforeSession,
  beforeTest: reportBeforeTest,
  afterTest: reportAfterTest,
  onComplete: reportRunSummary,
};
