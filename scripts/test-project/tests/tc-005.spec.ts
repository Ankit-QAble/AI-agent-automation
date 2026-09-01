import { test, expect } from '@playwright/test';
import { login, USERS } from './fixtures';

test(
  'TC-005 error_user can authenticate',
  { tag: '@tesbo.testId("AI-TC-5")' },
  async ({ page }) => {
    await login(page, USERS.error.user, USERS.error.pass);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  }
);
