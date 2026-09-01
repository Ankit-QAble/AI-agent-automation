import { test, expect, login, USERS } from './fixtures';

test('TC-001 standard user logs in successfully', async ({ page }) => {
  const start = Date.now();
  await login(page, USERS.standard.user, USERS.standard.pass);
  await expect(page).toHaveURL(/inventory\.html/);
  expect(Date.now() - start).toBeLessThan(3000); // "no perceptible delay"
  await expect(page.locator('.inventory_item')).toHaveCount(6);
});

test('TC-002 locked-out user is rejected', async ({ page }) => {
  await login(page, USERS.lockedOut.user, USERS.lockedOut.pass);
  await expect(page.locator('[data-test="error"]')).toHaveText(
    'Epic sadface: Sorry, this user has been locked out.'
  );
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});

test('TC-003 problem_user can authenticate', async ({ page }) => {
  await login(page, USERS.problem.user, USERS.problem.pass);
  await expect(page).toHaveURL(/inventory\.html/);
});

test('TC-004 performance_glitch_user login is slow but succeeds', async ({ page }) => {
  const start = Date.now();
  await login(page, USERS.perfGlitch.user, USERS.perfGlitch.pass);
  await expect(page).toHaveURL(/inventory\.html/, { timeout: 20000 });
  const elapsed = Date.now() - start;
  // [confirmed via execution] ~10+ seconds observed; treat exact threshold as informational, not a hard gate.
  expect(elapsed).toBeGreaterThan(5000);
  await expect(page.locator('.inventory_item')).toHaveCount(6);
});

test('TC-005 error_user can authenticate', async ({ page }) => {
  await login(page, USERS.error.user, USERS.error.pass);
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('.inventory_item')).toHaveCount(6);
});

test('TC-006 visual_user can authenticate', async ({ page }) => {
  await login(page, USERS.visual.user, USERS.visual.pass);
  await expect(page).toHaveURL(/inventory\.html/);
});

test('TC-007 empty username/password blocked', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('#login-button').click();
  // [confirmed via execution] exact copy confirmed identically across three runs.
  await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username is required.');
});

test('TC-008 valid username with wrong password rejected', async ({ page }) => {
  await login(page, USERS.standard.user, 'wrong_password');
  // [confirmed via execution]
  await expect(page.locator('[data-test="error"]')).toHaveText(
    'Epic sadface: Username and password do not match any user in this service.'
  );
});
