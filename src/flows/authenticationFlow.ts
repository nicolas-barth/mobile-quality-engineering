import { createModuleLogger } from '../logging/logger';
import CatalogScreen from '../screens/android/CatalogScreen';
import LoginScreen from '../screens/android/LoginScreen';
import MenuScreen from '../screens/android/MenuScreen';
import { DemoUser } from '../types/user';

const logger = createModuleLogger('authentication-flow');

export async function openLogin(): Promise<void> {
  logger.info('Opening the login screen from the drawer menu');
  await MenuScreen.openLogin();
  await LoginScreen.waitForDisplayed();
}

export async function login(user: DemoUser): Promise<void> {
  logger.info({ username: user.username }, 'Submitting login credentials');
  await LoginScreen.waitForDisplayed();
  await LoginScreen.enterUsername(user.username);
  await LoginScreen.enterPassword(user.password);
  await LoginScreen.submit();
}

export async function logout(): Promise<void> {
  logger.info('Logging out via the drawer menu');
  await MenuScreen.logout();
  await CatalogScreen.waitForDisplayed();
}
