import { test, expect, login, USERS } from './fixtures';

test.beforeEach(async ({ page }) => {
  await login(page, USERS.standard.user, USERS.standard.pass);
});

test('TC-029 cart page lists added items correctly', async ({ page }) => {
  const items = page.locator('.inventory_item');
  await items.nth(0).locator('button', { hasText: 'Add to cart' }).click();
  await items.nth(1).locator('button', { hasText: 'Add to cart' }).click();
  await page.locator('.shopping_cart_link').click();
  await expect(page).toHaveURL(/cart\.html/);
  const cartItems = page.locator('.cart_item');
  await expect(cartItems).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    await expect(cartItems.nth(i).locator('.cart_quantity')).toHaveText('1');
    await expect(cartItems.nth(i).locator('[data-test^="remove"]')).toBeVisible();
  }
});

test('TC-030 remove item from cart page', async ({ page }) => {
  await page.locator('.inventory_item').first().locator('button', { hasText: 'Add to cart' }).click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('.cart_item [data-test^="remove"]').click();
  await expect(page.locator('.cart_item')).toHaveCount(0);
  await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
});

test('TC-031 Continue Shopping returns to inventory', async ({ page }) => {
  await page.locator('.inventory_item').first().locator('button', { hasText: 'Add to cart' }).click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('[data-test="continue-shopping"]').click();
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('TC-032 Checkout button starts purchase flow', async ({ page }) => {
  await page.locator('.inventory_item').first().locator('button', { hasText: 'Add to cart' }).click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('[data-test="checkout"]').click();
  await expect(page).toHaveURL(/checkout-step-one\.html/);
});

test('TC-033 checkout proceeds with empty cart and completes (confirmed business-logic gap)', async ({ page }) => {
  // [confirmed via execution] NOT blocked — proceeds through the full flow with $0.00 totals and
  // Finish succeeds. This is a real business-logic gap (an order with nothing in it can be
  // placed), so the script asserts the full flow rather than just "isn't blocked."
  await page.locator('.shopping_cart_link').click();
  await expect(page.locator('.cart_item')).toHaveCount(0);
  await page.locator('[data-test="checkout"]').click();
  await expect(page).toHaveURL(/checkout-step-one\.html/);

  await page.locator('[data-test="firstName"]').fill('Jane');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('94107');
  await page.locator('[data-test="continue"]').click();
  await expect(page).toHaveURL(/checkout-step-two\.html/);

  await expect(page.locator('.summary_subtotal_label')).toHaveText('Item total: $0.00');
  await expect(page.locator('.summary_tax_label')).toHaveText('Tax: $0.00');
  await expect(page.locator('.summary_total_label')).toHaveText('Total: $0.00');

  await page.locator('[data-test="finish"]').click();
  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
});
