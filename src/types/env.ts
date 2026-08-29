export interface EnvConfig {
  nodeEnv: 'development' | 'test' | 'ci';
  androidHome: string;
  javaHome: string;
  androidDeviceName: string;
  androidPlatformVersion: string;
  androidAppPath: string;
  androidAppPackage: string;
  androidAppActivity: string;
  appiumHost: string;
  appiumPort: number;
  wdioLogLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';
  headless: boolean;
  noReset: boolean;
  fullReset: boolean;
  baselineApkPath: string;
  targetApkPath: string;
}
