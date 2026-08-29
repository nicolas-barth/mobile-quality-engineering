import { EnvironmentRuntimeConfig } from './local';

export const ciEnvironmentConfig: EnvironmentRuntimeConfig = {
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,
};
