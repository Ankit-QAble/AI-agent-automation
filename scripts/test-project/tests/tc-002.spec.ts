import { test, expect } from '@playwright/test';
import { login, USERS } from './fixtures';

test(
  'TC-002 locked-out user is rejected',
  { tag: '@tesbo.testId("AI-TC-2")' },
  async ({ page }) => {
    await login(page, USERS.lockedOut.user, USERS.lockedOut.pass);
    await expect(page.locator('[data-test="error"]')).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.'
    );
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  }
);
