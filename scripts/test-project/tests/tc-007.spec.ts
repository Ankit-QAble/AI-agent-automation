import { test, expect } from './fixtures';

test(
  'TC-007 empty username/password blocked',
  { tag: '@tesbo.testId("AI-TC-7")' },
  async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.locator('#login-button').click();
    // [confirmed via execution] exact copy confirmed identically across three runs.
    await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username is required.');
  }
);
