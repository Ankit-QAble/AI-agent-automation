import { test, expect, login, USERS, PRODUCTS } from './fixtures';

test.beforeEach(async ({ page }) => {
  await login(page, USERS.standard.user, USERS.standard.pass);
});

test('TC-009 all 6 products display with correct data', async ({ page }) => {
  const items = page.locator('.inventory_item');
  await expect(items).toHaveCount(6);
  for (const p of PRODUCTS) {
    const item = page.locator('.inventory_item', { hasText: p.name });
    await expect(item.locator('.inventory_item_price')).toHaveText(p.price);
    await expect(item.locator('img')).toBeVisible();
    await expect(item.locator('button', { hasText: 'Add to cart' })).toBeVisible();
  }
});

test('TC-010 default sort is Name (A to Z)', async ({ page }) => {
  await expect(page.locator('[data-test="product-sort-container"]')).toHaveValue('az');
  const names = await page.locator('.inventory_item_name').allTextContents();
  expect(names).toEqual([...names].sort());
});

test('TC-011 sort by Name (Z to A)', async ({ page }) => {
  await page.locator('[data-test="product-sort-container"]').selectOption('za');
  const names = await page.locator('.inventory_item_name').allTextContents();
  expect(names[0]).toBe('Test.allTheThings() T-Shirt (Red)');
  expect(names[names.length - 1]).toBe('Sauce Labs Backpack');
});

test('TC-012 sort by Price (low to high) — including confirmed tie-break order', async ({ page }) => {
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
});

test('TC-013 sort by Price (high to low) — tie-break is NOT a strict reverse (confirmed quirk)', async ({ page }) => {
  await page.locator('[data-test="product-sort-container"]').selectOption('hilo');
  const names = await page.locator('.inventory_item_name').allTextContents();
  // [KB discrepancy] Overall price order is the reverse of TC-012, but the $15.99 tie-break is NOT
  // swapped — Bolt T-Shirt stays before Test.allTheThings() in both directions. This is documented
  // as a minor sort-stability quirk, not asserted as "wrong" — a future fix to make it a strict
  // reverse would show up here as a (expected, welcome) test failure.
  expect(names).toEqual([
    'Sauce Labs Fleece Jacket',
    'Sauce Labs Backpack',
    'Sauce Labs Bolt T-Shirt',
    'Test.allTheThings() T-Shirt (Red)',
    'Sauce Labs Bike Light',
    'Sauce Labs Onesie',
  ]);
});

test('TC-014 add to cart updates button and badge (per product)', async ({ page }) => {
  const item = page.locator('.inventory_item').first();
  await item.locator('button', { hasText: 'Add to cart' }).click();
  await expect(item.locator('button', { hasText: 'Remove' })).toBeVisible();
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('TC-015 remove from cart via inventory page', async ({ page }) => {
  const item = page.locator('.inventory_item').first();
  await item.locator('button', { hasText: 'Add to cart' }).click();
  await item.locator('button', { hasText: 'Remove' }).click();
  await expect(item.locator('button', { hasText: 'Add to cart' })).toBeVisible();
  await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
});

test('TC-016 add multiple products increments badge cumulatively', async ({ page }) => {
  const items = page.locator('.inventory_item');
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    await items.nth(i).locator('button', { hasText: 'Add to cart' }).click();
  }
  await expect(page.locator('.shopping_cart_badge')).toHaveText('6');
  await expect(page.locator('button', { hasText: 'Remove' })).toHaveCount(6);
});

test('TC-017 product name links to correct detail page', async ({ page }) => {
  await page.locator('.inventory_item_name', { hasText: 'Sauce Labs Backpack' }).click();
  await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
  await expect(page.locator('.inventory_details_name')).toHaveText('Sauce Labs Backpack');
});

test('TC-018 direct navigation to product detail by ID', async ({ page }) => {
  for (const p of PRODUCTS) {
    await page.goto(`https://www.saucedemo.com/inventory-item.html?id=${p.id}`);
    await expect(page.locator('.inventory_details_name')).toHaveText(p.name);
    await expect(page.locator('.inventory_details_price')).toHaveText(p.price);
  }
});
