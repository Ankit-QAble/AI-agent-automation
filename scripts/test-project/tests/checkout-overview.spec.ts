import { test, expect, login, USERS } from './fixtures';

async function toOverviewWithBackpackOnly(page: import('@playwright/test').Page) {
  await login(page, USERS.standard.user, USERS.standard.pass);
  await page.locator('.inventory_item', { hasText: 'Sauce Labs Backpack' })
    .locator('button', { hasText: 'Add to cart' }).click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('Jane');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('94107');
  await page.locator('[data-test="continue"]').click();
}

test('TC-040 overview shows correct read-only recap', async ({ page }) => {
  await toOverviewWithBackpackOnly(page);
  await expect(page.locator('.cart_item')).toHaveCount(1);
  await expect(page.locator('.summary_value_label').first()).toHaveText('SauceCard #31337');
  await expect(page.locator('.summary_value_label').nth(1)).toHaveText('Free Pony Express Delivery!');
});

test('TC-041 tax and total calculated correctly (single item)', async ({ page }) => {
  await toOverviewWithBackpackOnly(page);
  const subtotalText = await page.locator('.summary_subtotal_label').textContent();
  const taxText = await page.locator('.summary_tax_label').textContent();
  const totalText = await page.locator('.summary_total_label').textContent();
  expect(parseFloat(subtotalText!.replace(/[^0-9.]/g, ''))).toBeCloseTo(29.99, 2);
  expect(parseFloat(taxText!.replace(/[^0-9.]/g, ''))).toBeCloseTo(2.4, 2); // [confirmed] exact every run
  expect(parseFloat(totalText!.replace(/[^0-9.]/g, ''))).toBeCloseTo(32.39, 2);
});

test('TC-042 tax/total scale correctly for multi-item cart; watch for float-precision display bug', async ({ page }) => {
  await login(page, USERS.standard.user, USERS.standard.pass);
  const items = page.locator('.inventory_item');
  const count = await items.count();
  for (let i = 0; i < count - 1; i++) { // 5-item combo, matching the scale of the observed repro
    await items.nth(i).locator('button', { hasText: 'Add to cart' }).click();
  }
  await page.locator('.shopping_cart_link').click();
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('Jane');
  await page.locator('[data-test="lastName"]').fill('Doe');
  await page.locator('[data-test="postalCode"]').fill('94107');
  await page.locator('[data-test="continue"]').click();

  const subtotalText = (await page.locator('.summary_subtotal_label').textContent())!;
  const taxText = (await page.locator('.summary_tax_label').textContent())!;
  const totalText = (await page.locator('.summary_total_label').textContent())!;

  // [confirmed via execution — intermittent] One run found a raw unrounded float
  // ($121.94999999999999) on Item Total for a specific 5-item combo; two other combos didn't
  // reproduce it. This regex is the general defense: it catches ANY combo showing more than
  // 2 decimals, rather than depending on reproducing the exact original combination.
  expect(subtotalText).toMatch(/^Item total: \$\d+\.\d{2}$/);
  expect(taxText).toMatch(/^Tax: \$\d+\.\d{2}$/);
  expect(totalText).toMatch(/^Total: \$\d+\.\d{2}$/);

  const subtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
  const tax = parseFloat(taxText.replace(/[^0-9.]/g, ''));
  const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));
  expect(tax).toBeCloseTo(Math.round(subtotal * 0.08 * 100) / 100, 2);
  expect(total).toBeCloseTo(subtotal + tax, 2);
  // ⚠ If this fails specifically on the regex checks, treat it as a real repro worth filing —
  // not a flake to retry away.
});

test('TC-043 Cancel from overview returns to inventory', async ({ page }) => {
  await toOverviewWithBackpackOnly(page);
  await page.locator('[data-test="cancel"]').click();
  await expect(page).toHaveURL(/inventory\.html/); // not cart, per KB
});

test('TC-044 Finish completes the order', async ({ page }) => {
  await toOverviewWithBackpackOnly(page);
  await page.locator('[data-test="finish"]').click();
  await expect(page).toHaveURL(/checkout-complete\.html/);
});
