import { test, expect } from '@playwright/test';
import { login, USERS } from './fixtures';

test(
  'TC-003 problem_user can authenticate',
  { tag: '@tesbo.testId("AI-TC-3")' },
  async ({ page }) => {
    await login(page, USERS.problem.user, USERS.problem.pass);
    await expect(page).toHaveURL(/inventory\.html/);
  }
);
