import { $, $$ } from '@wdio/globals';

import appHeader from '../../components/appHeader';
import { productCard } from '../../components/productCard';
import { byResourceId } from '../shared/androidSelector';
import { BaseScreen } from '../shared/BaseScreen';

export type SortOption = 'nameAscending' | 'nameDescending' | 'priceAscending' | 'priceDescending';

const SORT_OPTION_IDS: Record<SortOption, string> = {
  nameAscending: 'nameAscCL',
  nameDescending: 'nameDesCL',
  priceAscending: 'priceAscCL',
  priceDescending: 'priceDesCL',
};

class CatalogScreen extends BaseScreen {
  readonly header = appHeader;

  private get productList() {
    return $('~Displays all products of catalog');
  }

  private get productTitles() {
    return $$('~Product Title');
  }

  async waitForDisplayed(): Promise<void> {
    await this.waitUntilDisplayed(
      this.productList,
      'Product catalog was not displayed after application launch',
    );
  }

  async isDisplayed(): Promise<boolean> {
    return this.productList.isDisplayed();
  }

  async getFirstProductName(): Promise<string> {
    const products = await this.productTitles.getElements();
    const firstProduct = products[0];
    if (!firstProduct) {
      throw new Error('No product titles were found in the catalog');
    }
    return firstProduct.getText();
  }

  async getProductNames(): Promise<string[]> {
    const products = await this.productTitles.getElements();
    return products.map((product) => product.getText());
  }

  isProduct(name: string) {
    return productCard(name);
  }

  async openProduct(name: string): Promise<void> {
    await this.isProduct(name).open();
  }

  async selectSortOption(option: SortOption): Promise<void> {
    await this.header.openSort();
    const optionElement = $(byResourceId(SORT_OPTION_IDS[option]));
    await optionElement.waitForDisplayed({
      timeoutMsg: `Sort option "${option}" was never displayed`,
    });
    await optionElement.click();
  }
}

export default new CatalogScreen();
