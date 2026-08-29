import appHeader from '../components/appHeader';
import { createModuleLogger } from '../logging/logger';
import CartScreen from '../screens/android/CartScreen';
import MenuScreen from '../screens/android/MenuScreen';

const logger = createModuleLogger('cart-flow');

export async function openCart(): Promise<void> {
  logger.info('Opening the cart');
  await appHeader.openCart();
  await CartScreen.waitForDisplayed();
}

export async function removeProduct(name: string): Promise<void> {
  logger.info({ product: name }, 'Removing product from the cart');
  await CartScreen.product(name).remove();
}

export async function clearCart(): Promise<void> {
  logger.info('Clearing the cart via Reset App State');
  await MenuScreen.resetApplicationState();
}
