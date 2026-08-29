import { createModuleLogger } from '../logging/logger';
import CatalogScreen from '../screens/android/CatalogScreen';

const logger = createModuleLogger('application-launch-flow');

export async function launchApplication(): Promise<void> {
  logger.info('Waiting for the application to reach the product catalog after startup');
  await CatalogScreen.waitForDisplayed();
  logger.info('Application launched, product catalog is displayed');
}
