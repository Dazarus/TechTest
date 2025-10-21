import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { _electron as electron } from 'playwright';
import { ICustomWorld } from './world';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Setup test environment before all scenarios
 */
BeforeAll(async function () {
  console.log('🚀 Initializing Cucumber test environment...');
  
  // Create directories if they don't exist
  const dirs = ['screenshots', 'reports'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('✅ Test environment ready');
});

/**
 * Launch Electron app before each scenario
 */
Before(async function (this: ICustomWorld, { pickle }) {
  console.log(`\n📝 Starting scenario: ${pickle.name}`);
  
  // Path to your Electron app directory
  const appPath = process.env.APP_PATH || path.resolve(__dirname, '../../shopping-electron');
  
  console.log('🚀 Launching Electron app from:', appPath);
  
  // Verify the path exists
  if (!fs.existsSync(appPath)) {
    throw new Error(`App path does not exist: ${appPath}`);
  }
  
  // Find the main entry point from package.json
  const packageJsonPath = path.join(appPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`package.json not found at: ${packageJsonPath}`);
  }
  
  const packageJson = require(packageJsonPath);
  const mainFile = packageJson.main || 'main.js';
  const mainPath = path.join(appPath, mainFile);
  
  console.log('📄 Main file:', mainPath);
  
  if (!fs.existsSync(mainPath)) {
    throw new Error(`Main file not found: ${mainPath}`);
  }
  
  try {
    // Launch Electron application
    this.electronApp = await electron.launch({
      args: [mainPath],
      cwd: appPath,
      env: {
        ...process.env,
        NODE_ENV: 'test'
      },
      timeout: 30000
    });
    
    console.log('✅ Electron app launched successfully');
    
    // Get the first window
    this.page = await this.electronApp.firstWindow();
    await this.page.waitForLoadState('domcontentloaded');
    
    // Initialize page objects
    this.initializePageObjects();
    
    // Clear cart before each scenario
const isEmpty = await this.productsPage!.isCartEmpty();
if (!isEmpty) {
  console.log('⚠️ Cart not empty, clearing items...');
  
  let cartItemCount = await this.productsPage!.getCartItemsCount();
  
  while (cartItemCount > 0) {
    await this.productsPage!.removeCartItem(0);
    await this.page!.waitForTimeout(300);
    cartItemCount = await this.productsPage!.getCartItemsCount();
  }
  
  console.log('✅ Cart cleared');
} else {
  console.log('✅ Cart is already empty');
}

    // Store scenario context
    this.context = {
      scenarioName: pickle.name,
      startTime: Date.now()
    };
    
    console.log('✅ Window ready and page objects initialized');
  } catch (error) {
    console.error('❌ Failed to launch application:', error);
    throw error;
  }
});

/**
 * Cleanup after each scenario
 */
After(async function (this: ICustomWorld, { pickle, result }) {
  const duration = this.context?.startTime 
    ? Date.now() - this.context.startTime 
    : 0;
  
  console.log(`⏱️  Scenario duration: ${duration}ms`);
  
  // Take screenshot on failure
  if (result?.status === Status.FAILED && this.page) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = `${pickle.name.replace(/\s+/g, '_')}_${timestamp}.png`;
      const screenshotPath = path.join('screenshots', screenshotName);
      
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error('❌ Failed to take screenshot:', error);
    }
  }

  // Close the application
  if (this.electronApp) {
    try {
      await this.electronApp.close();
      console.log('✅ Application closed');
    } catch (error) {
      console.error('❌ Failed to close application:', error);
    }
  }
  
  // Log result
  const statusEmoji = result?.status === Status.PASSED ? '✅' : '❌';
  console.log(`${statusEmoji} Scenario ${result?.status}: ${pickle.name}\n`);
});

/**
 * Cleanup after all scenarios
 */
AfterAll(async function () {
  console.log('\n🏁 All tests completed');
});