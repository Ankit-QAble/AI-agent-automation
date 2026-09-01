import { test, expect, login, USERS } from './fixtures';

test.beforeEach(async ({ page }) => {
  await login(page, USERS.standard.user, USERS.standard.pass);
});

test('TC-054 social links point to real Sauce Labs accounts with target=_blank', async ({ page }) => {
  // [confirmed via execution] both destination and target="_blank" confirmed across runs.
  const links = [
    { selector: '.social_twitter a', host: /twitter\.com|x\.com/ },
    { selector: '.social_facebook a', host: /facebook\.com/ },
    { selector: '.social_linkedin a', host: /linkedin\.com/ },
  ];
  for (const l of links) {
    const link = page.locator(l.selector);
    await expect(link).toHaveAttribute('href', l.host);
    await expect(link).toHaveAttribute('target', '_blank');
  }
});

test('TC-055 Terms of Service / Privacy Policy are plain static text, not links (confirmed defect)', async ({ page }) => {
  // [KB discrepancy — confirmed via execution, every run] These are NOT functional links: plain
  // text inside <div class="footer_copy">, zero <a> elements. This asserts the defect itself so a
  // future fix (making them real links) shows up as a (welcome) test failure to update.
  const footerCopy = page.locator('.footer_copy');
  await expect(footerCopy).toContainText('Terms of Service');
  await expect(footerCopy).toContainText('Privacy Policy');
  await expect(footerCopy.locator('a')).toHaveCount(0);
});
