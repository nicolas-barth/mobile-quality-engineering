export const mochaOpts: WebdriverIO.MochaOpts = {
  ui: 'bdd',
  timeout: 60000,
  retries: process.env.CI === 'true' ? 1 : 0,
};
