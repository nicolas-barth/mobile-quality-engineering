import path from 'node:path';

import Ajv, { JSONSchemaType } from 'ajv';
import dotenv from 'dotenv';

import { EnvConfig } from '../types/env';

dotenv.config();

interface RawEnv {
  NODE_ENV: string;
  ANDROID_HOME: string;
  JAVA_HOME: string;
  ANDROID_DEVICE_NAME: string;
  ANDROID_PLATFORM_VERSION: string;
  ANDROID_APP_PATH: string;
  ANDROID_APP_PACKAGE: string;
  ANDROID_APP_ACTIVITY: string;
  APPIUM_HOST: string;
  APPIUM_PORT: number;
  WDIO_LOG_LEVEL: string;
  HEADLESS: boolean;
  NO_RESET: boolean;
  FULL_RESET: boolean;
  BASELINE_APK_PATH: string;
  TARGET_APK_PATH: string;
}

const rawEnvSchema: JSONSchemaType<RawEnv> = {
  type: 'object',
  properties: {
    NODE_ENV: { type: 'string', enum: ['development', 'test', 'ci'], default: 'development' },
    ANDROID_HOME: { type: 'string', minLength: 1 },
    JAVA_HOME: { type: 'string', minLength: 1 },
    ANDROID_DEVICE_NAME: { type: 'string', minLength: 1 },
    ANDROID_PLATFORM_VERSION: { type: 'string', minLength: 1 },
    ANDROID_APP_PATH: { type: 'string', minLength: 1 },
    ANDROID_APP_PACKAGE: { type: 'string', minLength: 1 },
    ANDROID_APP_ACTIVITY: { type: 'string', minLength: 1 },
    APPIUM_HOST: { type: 'string', minLength: 1, default: '127.0.0.1' },
    APPIUM_PORT: { type: 'number', default: 4723 },
    WDIO_LOG_LEVEL: {
      type: 'string',
      enum: ['trace', 'debug', 'info', 'warn', 'error', 'silent'],
      default: 'info',
    },
    HEADLESS: { type: 'boolean', default: false },
    NO_RESET: { type: 'boolean', default: false },
    FULL_RESET: { type: 'boolean', default: false },
    BASELINE_APK_PATH: { type: 'string', default: '' },
    TARGET_APK_PATH: { type: 'string', default: '' },
  },
  required: [
    'ANDROID_HOME',
    'JAVA_HOME',
    'ANDROID_DEVICE_NAME',
    'ANDROID_PLATFORM_VERSION',
    'ANDROID_APP_PATH',
    'ANDROID_APP_PACKAGE',
    'ANDROID_APP_ACTIVITY',
  ],
  additionalProperties: true,
};

const ajv = new Ajv({ useDefaults: true, coerceTypes: true });
const validateRawEnv = ajv.compile(rawEnvSchema);

function readRawEnv(): RawEnv {
  const candidate = {
    NODE_ENV: process.env.NODE_ENV,
    ANDROID_HOME: process.env.ANDROID_HOME,
    JAVA_HOME: process.env.JAVA_HOME,
    ANDROID_DEVICE_NAME: process.env.ANDROID_DEVICE_NAME,
    ANDROID_PLATFORM_VERSION: process.env.ANDROID_PLATFORM_VERSION,
    ANDROID_APP_PATH: process.env.ANDROID_APP_PATH,
    ANDROID_APP_PACKAGE: process.env.ANDROID_APP_PACKAGE,
    ANDROID_APP_ACTIVITY: process.env.ANDROID_APP_ACTIVITY,
    APPIUM_HOST: process.env.APPIUM_HOST,
    APPIUM_PORT: process.env.APPIUM_PORT,
    WDIO_LOG_LEVEL: process.env.WDIO_LOG_LEVEL,
    HEADLESS: process.env.HEADLESS,
    NO_RESET: process.env.NO_RESET,
    FULL_RESET: process.env.FULL_RESET,
    BASELINE_APK_PATH: process.env.BASELINE_APK_PATH,
    TARGET_APK_PATH: process.env.TARGET_APK_PATH,
  } as unknown as RawEnv;

  if (!validateRawEnv(candidate)) {
    const details = (validateRawEnv.errors ?? [])
      .map((error) => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return candidate;
}

function resolveAppPath(appPath: string): string {
  return path.isAbsolute(appPath) ? appPath : path.resolve(process.cwd(), appPath);
}

export function loadEnv(): EnvConfig {
  const raw = readRawEnv();

  return {
    nodeEnv: raw.NODE_ENV as EnvConfig['nodeEnv'],
    androidHome: raw.ANDROID_HOME,
    javaHome: raw.JAVA_HOME,
    androidDeviceName: raw.ANDROID_DEVICE_NAME,
    androidPlatformVersion: raw.ANDROID_PLATFORM_VERSION,
    androidAppPath: resolveAppPath(raw.ANDROID_APP_PATH),
    androidAppPackage: raw.ANDROID_APP_PACKAGE,
    androidAppActivity: raw.ANDROID_APP_ACTIVITY,
    appiumHost: raw.APPIUM_HOST,
    appiumPort: raw.APPIUM_PORT,
    wdioLogLevel: raw.WDIO_LOG_LEVEL as EnvConfig['wdioLogLevel'],
    headless: raw.HEADLESS,
    noReset: raw.NO_RESET,
    fullReset: raw.FULL_RESET,
    baselineApkPath: raw.BASELINE_APK_PATH,
    targetApkPath: raw.TARGET_APK_PATH,
  };
}
