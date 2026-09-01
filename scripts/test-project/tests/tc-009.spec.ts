import { test, expect } from './fixtures';
import { login, USERS, PRODUCTS } from './test-data';

test(
  'TC-009 all 6 products display with correct data',
  { tag: '@tesbo.testId("AI-TC-9")' },
  async ({ page }) => {
    await login(page, USERS.standard.user, USERS.standard.pass);
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
    for (const p of PRODUCTS) {
      const item = page.locator('.inventory_item', { hasText: p.name });
      await expect(item.locator('.inventory_item_price')).toHaveText(p.price);
      await expect(item.locator('img')).toBeVisible();
      await expect(item.locator('button', { hasText: 'Add to cart' })).toBeVisible();
    }
  }
);
