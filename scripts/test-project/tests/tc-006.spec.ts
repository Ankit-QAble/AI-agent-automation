import { test, expect } from '@playwright/test';
import { login, USERS } from './fixtures';

test(
  'TC-006 visual_user can authenticate',
  { tag: '@tesbo.testId("AI-TC-6")' },
  async ({ page }) => {
    await login(page, USERS.visual.user, USERS.visual.pass);
    await expect(page).toHaveURL(/inventory\.html/);
  }
);
