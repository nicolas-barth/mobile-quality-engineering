import { createModuleLogger } from '../logging/logger';
import CatalogScreen from '../screens/android/CatalogScreen';
import MenuScreen from '../screens/android/MenuScreen';
import ProductDetailsScreen from '../screens/android/ProductDetailsScreen';

const logger = createModuleLogger('product-flow');

export async function openProduct(name: string): Promise<void> {
  logger.info({ product: name }, 'Opening product details from the catalog');
  await CatalogScreen.openProduct(name);
  await ProductDetailsScreen.waitForDisplayed();
}

export async function setQuantity(targetQuantity: number): Promise<void> {
  if (targetQuantity < 1) {
    throw new Error(`Cannot set a product quantity below 1, received ${targetQuantity}`);
  }

  let currentQuantity = await ProductDetailsScreen.getQuantity();
  while (currentQuantity < targetQuantity) {
    await ProductDetailsScreen.increaseQuantity();
    currentQuantity += 1;
  }
  while (currentQuantity > targetQuantity) {
    await ProductDetailsScreen.decreaseQuantity();
    currentQuantity -= 1;
  }
}

export async function addCurrentProductToCart(): Promise<void> {
  await ProductDetailsScreen.addToCart();
}

export async function addProductToCart(name: string, quantity: number = 1): Promise<void> {
  await openProduct(name);
  await setQuantity(quantity);
  await addCurrentProductToCart();
  await MenuScreen.navigateToCatalog();
}
