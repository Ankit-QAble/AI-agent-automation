import { test, expect } from './fixtures';
import { login, USERS } from './test-data';

test(
  'TC-011 sort by Name (Z to A)',
  { tag: '@tesbo.testId("AI-TC-11")' },
  async ({ page }) => {
    await login(page, USERS.standard.user, USERS.standard.pass);
    await page.locator('[data-test="product-sort-container"]').selectOption('za');
    const names = await page.locator('.inventory_item_name').allTextContents();
    expect(names[0]).toBe('Test.allTheThings() T-Shirt (Red)');
    expect(names[names.length - 1]).toBe('Sauce Labs Backpack');
  }
);
