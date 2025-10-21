import * as path from 'path';
import { _electron as electron, ElectronApplication, Page } from 'playwright';
import { test as base } from '@playwright/test';

type ElectronFixtures = {
    electronApp: ElectronApplication;
    page: Page;
};

const test = base.extend<ElectronFixtures>({

    electronApp: [async ({ }, use) => {
        const appPath = process.env.APP_PATH || path.resolve(__dirname, '../../../shopping-electron');

        console.log('🚀 Launching Electron app from:', appPath);

        const fs = require('fs');
        if (!fs.existsSync(appPath)) {
            throw new Error(`App path does not exist: ${appPath}`);
        }

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

        const electronApp = await electron.launch({
            args: [mainPath],
            cwd: appPath,
            env: {
                ...process.env,
                NODE_ENV: 'test'
            },
            timeout: 30000
        });

        console.log('✅ Electron app launched successfully');

        await use(electronApp);

        console.log('🔒 Closing Electron app');
        await electronApp.close();
        console.log('✅ Electron app closed');
    }, { scope: 'test' }],

    page: async ({ electronApp }, use) => {
        console.log('⏳ Waiting for first window...');
        const window = await electronApp.firstWindow();
        console.log('✅ Window ready');

        await use(window);
    }
});

export { test };
export default test;