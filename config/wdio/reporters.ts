import type { Options } from '@wdio/types';

export const reporters: Options.Testrunner['reporters'] = [
  'spec',
  [
    'allure',
    {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: false,
      disableWebdriverScreenshotsReporting: false,
      addConsoleLogs: true,
    },
  ],
  [
    'junit',
    {
      outputDir: 'test-results',
      outputFileFormat: (options: { cid: string }): string => `results-${options.cid}.xml`,
    },
  ],
];
