import { test, expect } from '@playwright/test';
import { login, USERS } from './fixtures';

test(
  'TC-001 standard user logs in successfully',
  { tag: '@tesbo.testId("AI-TC-1")' },
  async ({ page }) => {
    const start = Date.now();
    await login(page, USERS.standard.user, USERS.standard.pass);
    await expect(page).toHaveURL(/inventory\.html/);
    expect(Date.now() - start).toBeLessThan(3000); // "no perceptible delay"
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  }
);
