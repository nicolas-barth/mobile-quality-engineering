import { ciEnvironmentConfig } from './ci';
import { EnvironmentRuntimeConfig, localEnvironmentConfig } from './local';

export function resolveEnvironmentConfig(): EnvironmentRuntimeConfig {
  return process.env.CI === 'true' ? ciEnvironmentConfig : localEnvironmentConfig;
}
