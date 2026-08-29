export interface EnvironmentRuntimeConfig {
  connectionRetryTimeout: number;
  connectionRetryCount: number;
}

export const localEnvironmentConfig: EnvironmentRuntimeConfig = {
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,
};
