# Playwright + TypeScript Framework for Electron App (Windows)

## Setup
1. Place this folder next to your `shopping-electron` app folder.
2. In `shopping-electron`:
   ```bash
   npm install
   ```
3. In this folder:
   ```bash
   npm install
   npx playwright install --with-deps
   npm test
   ```
4. For headed/debug runs:
   ```bash
   npm run test:headed
   npm run test:debug
   ```

## Notes
- Override app path if needed:
  ```bash
  set APP_PATH=C:\path\to\shopping-electron
  npm test
  ```
