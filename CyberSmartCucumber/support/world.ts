import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { ElectronApplication, Page } from 'playwright';
import ProductsPage from '../tests/pages/ProductsPage';
import CheckoutPage from '../tests/pages/CheckoutPage';

/**
 * Custom World interface
 * Stores Electron app, page, and page objects for use across steps
 */
export interface ICustomWorld extends World {
  electronApp?: ElectronApplication;
  page?: Page;
  productsPage?: ProductsPage;
  checkoutPage?: CheckoutPage;
  context?: {
    scenarioName: string;
    [key: string]: any;
  };
  
  // Add method signatures to interface
  setContext(key: string, value: any): void;
  getContext(key: string): any;
  initializePageObjects(): void;
}

/**
 * Custom World implementation
 */
export class CustomWorld extends World implements ICustomWorld {
  electronApp?: ElectronApplication;
  page?: Page;
  productsPage?: ProductsPage;
  checkoutPage?: CheckoutPage;
  context?: {
    scenarioName: string;
    [key: string]: any;
  };

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Store data in context for later retrieval
   */
  setContext(key: string, value: any): void {
    if (!this.context) {
      this.context = { scenarioName: '' };
    }
    this.context[key] = value;
  }

  /**
   * Retrieve data from context
   */
  getContext(key: string): any {
    return this.context?.[key];
  }

  /**
   * Initialize page objects after app is launched
   */
  initializePageObjects(): void {
    if (!this.page) {
      throw new Error('Page not initialized. Call this after app launch.');
    }
    this.productsPage = new ProductsPage(this.page);
    this.checkoutPage = new CheckoutPage(this.page);
  }
}

setWorldConstructor(CustomWorld);