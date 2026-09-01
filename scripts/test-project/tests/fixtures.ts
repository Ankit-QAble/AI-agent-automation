import { Page } from '@playwright/test';

export const BASE_URL = 'https://www.saucedemo.com/';

export const USERS = {
  standard: { user: 'standard_user', pass: 'secret_sauce' },
  lockedOut: { user: 'locked_out_user', pass: 'secret_sauce' },
  problem: { user: 'problem_user', pass: 'secret_sauce' },
  perfGlitch: { user: 'performance_glitch_user', pass: 'secret_sauce' },
  error: { user: 'error_user', pass: 'secret_sauce' },
};

export async function login(page: Page, user: string, pass: string) {
  await page.goto(BASE_URL);
  await page.locator('#user-name').fill(user);
  await page.locator('#password').fill(pass);
  await page.locator('#login-button').click();
}
