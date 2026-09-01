import { test as base, expect } from '@playwright/test';

// See tests/README-fixtures note in server.js: guarantees no test finishes
// before the Tesbo reporter's setup calls do, so results aren't dropped.
export const test = base.extend({
  page: async ({ page }, use) => {
    await new Promise((r) => setTimeout(r, 2500));
    await use(page);
  },
});
export { expect };
