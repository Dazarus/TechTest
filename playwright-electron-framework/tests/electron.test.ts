import { expect } from '@playwright/test';
import test from './fixtures/electron-fixture';

test('app launches and has a window', async ({ page }) => {
  await page.waitForLoadState('domcontentloaded');
  const title = await page.title();
  expect(title).toBeTruthy();
  console.log('Window title:', title);
  const maybeHeader = page.locator('h1').first();
  if (await maybeHeader.count()) await expect(maybeHeader).toBeVisible();
  else await expect(page.locator('body')).toBeVisible();
});
