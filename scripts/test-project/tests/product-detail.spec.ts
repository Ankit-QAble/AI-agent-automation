import { test, expect, login, USERS } from './fixtures';

test.beforeEach(async ({ page }) => {
  await login(page, USERS.standard.user, USERS.standard.pass);
  await page.locator('.inventory_item_name').first().click();
});

test('TC-019 product detail page shows full info and Add to cart works', async ({ page }) => {
  await expect(page.locator('.inventory_details_img')).toBeVisible();
  await expect(page.locator('.inventory_details_name')).toBeVisible();
  await expect(page.locator('.inventory_details_desc')).toBeVisible();
  await expect(page.locator('.inventory_details_price')).toBeVisible();
  await page.locator('button', { hasText: 'Add to cart' }).click();
  await expect(page.locator('button', { hasText: 'Remove' })).toBeVisible();
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('TC-020 "Back to products" returns to inventory with cart preserved', async ({ page }) => {
  await page.locator('button', { hasText: 'Add to cart' }).click();
  await page.locator('[data-test="back-to-products"]').click();
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});
