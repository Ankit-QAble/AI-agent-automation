import { test, expect, login, USERS } from './fixtures';

test(
  'TC-010 default sort is Name (A to Z)',
  { tag: '@tesbo.testId("AI-TC-10")' },
  async ({ page }) => {
    await login(page, USERS.standard.user, USERS.standard.pass);
    await expect(page.locator('[data-test="product-sort-container"]')).toHaveValue('az');
    const names = await page.locator('.inventory_item_name').allTextContents();
    expect(names).toEqual([...names].sort());
  }
);
