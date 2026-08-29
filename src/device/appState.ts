import { browser } from '@wdio/globals';

import { loadEnv } from '../config/env';
import { createModuleLogger } from '../logging/logger';
import { AppRunState } from '../types/appState';

const logger = createModuleLogger('app-state');

const KNOWN_APP_RUN_STATES: ReadonlySet<number> = new Set(
  Object.values(AppRunState).filter((value): value is number => typeof value === 'number'),
);

function toAppRunState(rawState: number): AppRunState {
  if (!KNOWN_APP_RUN_STATES.has(rawState)) {
    throw new Error(`Appium reported an unknown application state code: ${rawState}`);
  }

  return rawState;
}

export async function getRunState(): Promise<AppRunState> {
  const env = loadEnv();
  const rawState = await browser.queryAppState(env.androidAppPackage);
  const state = toAppRunState(rawState);
  logger.info({ state }, 'Queried application run state');
  return state;
}

export async function isInstalled(): Promise<boolean> {
  const env = loadEnv();
  return browser.isAppInstalled(env.androidAppPackage);
}
