import { Page } from '@playwright/test';

export const BASE_URL = 'https://www.saucedemo.com/';

export const USERS = {
  standard: { user: 'standard_user', pass: 'secret_sauce' },
  lockedOut: { user: 'locked_out_user', pass: 'secret_sauce' },
  problem: { user: 'problem_user', pass: 'secret_sauce' },
  perfGlitch: { user: 'performance_glitch_user', pass: 'secret_sauce' },
  error: { user: 'error_user', pass: 'secret_sauce' },
  visual: { user: 'visual_user', pass: 'secret_sauce' },
};

export const PRODUCTS = [
  { name: 'Sauce Labs Backpack', price: '$29.99', id: 4, slug: 'sauce-labs-backpack' },
  { name: 'Sauce Labs Bike Light', price: '$9.99', id: 0, slug: 'sauce-labs-bike-light' },
  { name: 'Sauce Labs Bolt T-Shirt', price: '$15.99', id: 1, slug: 'sauce-labs-bolt-t-shirt' },
  { name: 'Sauce Labs Fleece Jacket', price: '$49.99', id: 5, slug: 'sauce-labs-fleece-jacket' },
  { name: 'Sauce Labs Onesie', price: '$7.99', id: 2, slug: 'sauce-labs-onesie' },
  { name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99', id: 3, slug: 'test.allthethings()-t-shirt-(red)' },
];

export async function login(page: Page, user: string, pass: string) {
  await page.goto(BASE_URL);
  await page.locator('#user-name').fill(user);
  await page.locator('#password').fill(pass);
  await page.locator('#login-button').click();
}
