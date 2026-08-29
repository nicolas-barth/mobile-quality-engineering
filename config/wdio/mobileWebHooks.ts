import type { Frameworks } from '@wdio/types';

import { createModuleLogger } from '../../src/logging/logger';

const logger = createModuleLogger('wdio-mobile-web-hooks');

export function reportMobileWebBeforeSession(): void {
  logger.info('Mobile web session starting against the Chrome browser capability');
}

export function reportMobileWebBeforeTest(test: Frameworks.Test): void {
  logger.info({ test: test.title }, 'Starting mobile web test');
}
