import { test, expect, login, USERS, PRODUCTS } from './fixtures';

test('TC-021 problem_user: all product images render the same sl-404 placeholder', async ({ page }) => {
  await login(page, USERS.problem.user, USERS.problem.pass);
  // [confirmed via execution] specific placeholder filename pattern confirmed across all runs —
  // no longer just a same-src proxy, this asserts the exact known bug signature.
  const srcs = await page.locator('.inventory_item_img img').evaluateAll(
    imgs => imgs.map(img => (img as HTMLImageElement).src)
  );
  const unique = new Set(srcs);
  expect(unique.size).toBe(1);
  expect(srcs[0]).toContain('sl-404');
});

test('TC-022 problem_user: Add to cart succeeds only for even-id products (id-parity pattern)', async ({ page }) => {
  await login(page, USERS.problem.user, USERS.problem.pass);
  // [KB discrepancy] KB previously claimed Add to cart "never" works. Most recent, most careful
  // execution run isolated a deterministic id-parity pattern instead: even-id products succeed
  // (Backpack id4, Bike Light id0, Onesie id2), odd-id products silently fail (Bolt id1,
  // Fleece Jacket id5, Test.allTheThings id3). An earlier "3-of-4 succeed" result is attributed to
  // a stale-DOM-reference measurement error in that run.
  // Confidence: isolated cleanly once — recommend one more independent confirmation.
  for (const p of PRODUCTS) {
    const item = page.locator('.inventory_item', { hasText: p.name });
    const addButton = item.locator('button', { hasText: 'Add to cart' });
    await addButton.click();
    if (p.id % 2 === 0) {
      await expect(item.locator('button', { hasText: 'Remove' })).toBeVisible();
    } else {
      await expect(addButton).toBeVisible(); // did NOT flip — reproduces the odd-id failure
    }
  }
  await expect(page.locator('.shopping_cart_badge')).toHaveText('3'); // only the 3 even-id products
});

test('TC-023 error_user: Add to cart is completely non-functional', async ({ page }) => {
  await login(page, USERS.error.user, USERS.error.pass);
  const items = page.locator('.inventory_item');
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    await items.nth(i).locator('button', { hasText: 'Add to cart' }).click();
  }
  await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  await expect(page.locator('button', { hasText: 'Remove' })).toHaveCount(0);
});

test('TC-024 visual_user: cart icon renders misaligned/overlapping the sort control', async ({ page }) => {
  await login(page, USERS.visual.user, USERS.visual.pass);
  // ⚠ Not cleanly automatable via plain assertions — layout/visual defect. Best-effort proxy:
  // cart icon and sort-control rows overlap (vs. clean separation for standard_user).
  const cartBox = await page.locator('.shopping_cart_link').boundingBox();
  const sortBox = await page.locator('[data-test="product-sort-container"]').boundingBox();
  expect(cartBox && sortBox && Math.abs(cartBox.y - sortBox.y) > 15).toBeTruthy();
  // Recommend supplementing with: await expect(page).toHaveScreenshot('visual-user-header.png')
});

test('TC-025 visual_user: all prices scrambled, randomized per session', async ({ page }) => {
  await login(page, USERS.visual.user, USERS.visual.pass);
  // [confirmed via execution — stronger than KB] All 6 prices mismatch every load, with different
  // wrong values each session (not a fixed value like the KB's $51.32 example). Do NOT assert
  // exact wrong values — assert only that every price deviates from the known-correct catalog.
  const prices = await page.locator('.inventory_item_price').allTextContents();
  const correctPrices = PRODUCTS.map(p => p.price); // assumes default A-Z sort order
  expect(prices.length).toBe(correctPrices.length);
  expect(prices.every((p, i) => p !== correctPrices[i])).toBeTruthy();
});

test('TC-026 visual_user: Backpack shows wrong placeholder image', async ({ page }) => {
  await login(page, USERS.visual.user, USERS.visual.pass);
  // [confirmed via execution] Now a specific, stable claim rather than "some photo, needs a visual
  // baseline" — converted from a skip to a real assertion.
  const backpackImg = page.locator('.inventory_item', { hasText: 'Sauce Labs Backpack' }).locator('img');
  await expect(backpackImg).toHaveAttribute('src', /sl-404/);
});

test('TC-027 visual_user: Test.allTheThings() button is shifted, not oversized', async ({ page }) => {
  await login(page, USERS.visual.user, USERS.visual.pass);
  // [KB discrepancy] KB claimed one button is both oversized and shifted. Execution across
  // multiple runs found only a horizontal shift (~54px); dimensions (160x34) are identical to
  // every other button. Assert BOTH halves of the finding: uniform size (disproves "oversized")
  // and the x-offset (confirms "shifted").
  const boxes = await page.locator('button', { hasText: 'Add to cart' }).evaluateAll(
    btns => btns.map(b => {
      const r = b.getBoundingClientRect();
      return { w: r.width, h: r.height, x: r.x };
    })
  );
  expect(new Set(boxes.map(b => b.w)).size).toBe(1);
  expect(new Set(boxes.map(b => b.h)).size).toBe(1);

  const targetBox = await page
    .locator('.inventory_item', { hasText: 'Test.allTheThings() T-Shirt' })
    .locator('button', { hasText: 'Add to cart' })
    .boundingBox();
  const otherXs = boxes.slice(0, -1).map(b => b.x); // default A-Z order puts this button last
  const avgOtherX = otherXs.reduce((a, b) => a + b, 0) / otherXs.length;
  expect(Math.abs(targetBox!.x - avgOtherX)).toBeGreaterThan(30); // ~54px shift observed
});

test('TC-028 performance_glitch_user: post-load interactions may also be slow (KB likely understates scope)', async ({ page }) => {
  await login(page, USERS.perfGlitch.user, USERS.perfGlitch.pass);
  await expect(page).toHaveURL(/inventory\.html/, { timeout: 20000 });

  // [partially contradicted] KB says "otherwise normal once loaded," but execution found in-app
  // navigation/sort interactions also incur multi-second delay in some runs. Measure
  // informationally — do not hard-fail, timing against a glitch-seeded account is flaky.
  const sortStart = Date.now();
  await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
  const sortElapsed = Date.now() - sortStart;
  if (sortElapsed > 3000) {
    console.log(`[info] sort interaction took ${sortElapsed}ms — consistent with KB understatement finding`);
  }

  const item = page.locator('.inventory_item').first();
  await item.locator('button', { hasText: 'Add to cart' }).click();
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  await item.locator('.inventory_item_name').click();
  await expect(page).toHaveURL(/inventory-item\.html/, { timeout: 20000 });
});
