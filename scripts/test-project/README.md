# Swag Labs (saucedemo.com) — Playwright Automation

Automation for the Functional Tester's TC-001–TC-055 test cases against `https://www.saucedemo.com/`.

## Setup

```bash
npm install
npm run install:browsers
```

## Run

```bash
npm test              # headless, all specs
npm run test:headed   # headed
npm run test:ui       # Playwright UI mode
npm run report         # open the HTML report from the last run
```

## Layout

```
tests/
  fixtures.ts                 shared login helper + constants (users, product catalog)
  auth.spec.ts                TC-001–008  Authentication
  inventory.spec.ts           TC-009–018  Inventory / Product Catalog
  product-detail.spec.ts      TC-019–020  Product Detail Page
  seeded-bugs.spec.ts         TC-021–028  Account-specific seeded-bug verification
  cart.spec.ts                TC-029–033  Cart Page
  checkout-info.spec.ts       TC-034–039  Checkout — Your Information
  checkout-overview.spec.ts   TC-040–044  Checkout — Overview
  checkout-complete.spec.ts   TC-045–048  Checkout — Complete
  nav-menu.spec.ts            TC-049–053  Navigation — Hamburger Menu
  footer.spec.ts              TC-054–055  Footer
```

## Read before running

Seven specs intentionally assert **current (including buggy) behavior** as the expected result, to catch regressions in the defect itself: TC-013, TC-022, TC-025, TC-027, TC-033, TC-052, TC-055. A failure on any of these is an ambiguous signal — it may mean the underlying defect was fixed (good news, update the test) rather than a real regression. Read the inline comment in each before triaging a failure.

Two specs still carry open `TODO`s pending further confirmation: TC-042 (float-precision display bug, reproduced once) and TC-053 (gap-fill, first-pass probe).

See the Automation Report (from the Automation Tester agent) for full coverage breakdown and confidence notes.
