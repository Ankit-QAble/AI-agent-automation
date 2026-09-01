import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'report.json' }],
    // Config is env-only (TESBO_BASE_URL/TESBO_PROJECT_ID/TESBO_API_TOKEN) —
    // never inline here, so the token never ends up in committed code.
    // Untagged tests are skipped/counted, not failed (strict: false, the default).
    // The relative path (not the bare package name) is deliberate — Playwright's
    // reporter resolution doesn't reliably load a scoped-package-name string in
    // this environment (verified: the bare name silently no-ops, the path doesn't).
    ['./node_modules/@tesbox/playwright-reporter/dist/index.js'],
  ],
  use: { screenshot: 'only-on-failure', trace: 'retain-on-failure' },
});
