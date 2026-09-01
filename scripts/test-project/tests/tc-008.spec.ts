import { test, expect } from './fixtures';
import { login, USERS } from './test-data';

test(
  'TC-008 valid username with wrong password rejected',
  { tag: '@tesbo.testId("AI-TC-8")' },
  async ({ page }) => {
    await login(page, USERS.standard.user, 'wrong_password');
    // [confirmed via execution]
    await expect(page.locator('[data-test="error"]')).toHaveText(
      'Epic sadface: Username and password do not match any user in this service.'
    );
  }
);
