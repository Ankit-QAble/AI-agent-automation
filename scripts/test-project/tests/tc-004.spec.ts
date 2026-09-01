import { test, expect } from '@playwright/test';
import { login, USERS } from './fixtures';

test(
  'TC-004 performance_glitch_user login is slow but succeeds',
  { tag: '@tesbo.testId("AI-TC-4")' },
  async ({ page }) => {
    const start = Date.now();
    await login(page, USERS.perfGlitch.user, USERS.perfGlitch.pass);
    await expect(page).toHaveURL(/inventory\.html/, { timeout: 20000 });
    const elapsed = Date.now() - start;
    // [confirmed via execution] ~10+ seconds observed; treat exact threshold as informational, not a hard gate.
    expect(elapsed).toBeGreaterThan(5000);
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  }
);
