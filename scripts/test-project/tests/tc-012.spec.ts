import { test, expect } from './fixtures';
import { login, USERS } from './test-data';

test(
  'TC-012 sort by Price (low to high) — including confirmed tie-break order',
  { tag: '@tesbo.testId("AI-TC-12")' },
  async ({ page }) => {
    await login(page, USERS.standard.user, USERS.standard.pass);
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
    const names = await page.locator('.inventory_item_name').allTextContents();
    // [confirmed via execution] exact tie-break confirmed across runs: Bolt T-Shirt before Test.allTheThings().
    expect(names).toEqual([
      'Sauce Labs Onesie',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Backpack',
      'Sauce Labs Fleece Jacket',
    ]);
  }
);
