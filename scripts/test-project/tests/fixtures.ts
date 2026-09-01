import { Page } from '@playwright/test';

export const BASE_URL = 'https://www.saucedemo.com/';

export const USERS = {
  visual: { user: 'visual_user', pass: 'secret_sauce' },
};

export async function login(page: Page, user: string, pass: string) {
  await page.goto(BASE_URL);
  await page.locator('#user-name').fill(user);
  await page.locator('#password').fill(pass);
  await page.locator('#login-button').click();
}
