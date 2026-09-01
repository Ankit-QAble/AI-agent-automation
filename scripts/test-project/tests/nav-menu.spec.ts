import { test, expect, login, USERS } from './fixtures';

test.beforeEach(async ({ page }) => {
  await login(page, USERS.standard.user, USERS.standard.pass);
});

test('TC-049 All Items returns to inventory from any page', async ({ page }) => {
  await page.locator('.shopping_cart_link').click();
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#inventory_sidebar_link').click();
  await expect(page).toHaveURL(/inventory\.html/);
});

test('TC-050 About links out to the real Sauce Labs site', async ({ page }) => {
  // [confirmed via execution] destination confirmed across runs; content of the external site
  // remains out of scope.
  await page.locator('#react-burger-menu-btn').click();
  const [popup] = await Promise.all([
    page.waitForEvent('popup').catch(() => null),
    page.locator('#about_sidebar_link').click(),
  ]);
  const targetPage = popup ?? page;
  await targetPage.waitForURL(/saucelabs\.com/, { timeout: 10000 });
  expect(targetPage.url()).toContain('saucelabs.com');
});

test('TC-051 Logout ends session; direct nav afterward redirects with exact error', async ({ page }) => {
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#logout_sidebar_link').click();
  await expect(page).toHaveURL('https://www.saucedemo.com/');

  await page.goto('https://www.saucedemo.com/inventory.html');
  // [confirmed via execution] exact redirect + error copy confirmed across runs.
  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await expect(page.locator('[data-test="error"]')).toHaveText(
    "Epic sadface: You can only access '/inventory.html' when you are logged in."
  );
});

test('TC-052 Reset App State: cart state clears immediately, but Remove buttons stay stale until reload', async ({ page }) => {
  // [KB discrepancy — confirmed via execution, every run] KB said "cart clears cleanly." Reality:
  // underlying state resets correctly (badge clears right away) but the already-rendered
  // "Remove" buttons do NOT visually revert until reload/navigation — a real UI-staleness bug.
  const item = page.locator('.inventory_item').first();
  await item.locator('button', { hasText: 'Add to cart' }).click();
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#reset_sidebar_link').click();

  await expect(page.locator('.shopping_cart_badge')).toHaveCount(0); // state is correct immediately
  await expect(item.locator('button', { hasText: 'Remove' })).toBeVisible(); // BUG: button hasn't caught up

  await page.reload();
  await expect(page.locator('.inventory_item').first().locator('button', { hasText: 'Add to cart' })).toBeVisible();
  await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
});

test('TC-053 [gap-fill] Reset App State from the cart page — does the same staleness pattern apply?', async ({ page }) => {
  // Not yet tested per the functional tester. This script documents the intended probe and
  // records what's observed — treat the assertions below as a first pass, update once a real
  // run confirms actual behavior on /cart.html.
  await page.locator('.inventory_item').first().locator('button', { hasText: 'Add to cart' }).click();
  await page.locator('.shopping_cart_link').click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(page.locator('.cart_item')).toHaveCount(1);

  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#reset_sidebar_link').click();

  // TODO: confirm at execution — does the cart_item row go stale like the inventory Remove button
  // (TC-052), or does the cart page's list update live? Only asserting the badge for now.
  await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  // TODO: once observed, add either `.toHaveCount(0)` (updates live) or `.toHaveCount(1)` +
  // a follow-up reload check (stale, like TC-052) for `.cart_item`.
});
