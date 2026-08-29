import path from 'node:path';

export const visualService: [string, Record<string, unknown>] = [
  'visual',
  {
    baselineFolder: path.join(process.cwd(), 'tests/visual/baselines'),
    screenshotPath: path.join(process.cwd(), 'reports/visual'),
    formatImageName: '{tag}-{platformName}-{platformVersion}',
    savePerInstance: false,
    autoSaveBaseline: false,
    blockOutStatusBar: true,
  },
];
