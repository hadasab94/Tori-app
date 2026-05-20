// qa/tori-smoke.spec.js
// Smoke tests: app loads, journey tab accessible, no stale content

const { test, expect } = require('@playwright/test');
const { gotoApp, goToJourneyTab } = require('./helpers');

test.describe('Smoke Tests', () => {

  // ── S1: App loads without errors ────────────────────────────────────────────
  test('S1: app loads and shows main UI', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await gotoApp(page);

    // Basic check — page should have a title or some visible content
    const body = await page.$('body');
    expect(body).toBeTruthy();

    // No critical JS errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('manifest')
    );
    if (criticalErrors.length > 0) {
      console.log('JS errors on load:', criticalErrors);
    }
    expect(criticalErrors.length).toBe(0);
  });

  // ── S2: Journey tab is reachable ────────────────────────────────────────────
  test('S2: journey tab navigation works', async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);

    const journeyInner = page.locator('#journey-inner');
    await expect(journeyInner).toBeVisible({ timeout: 3000 });
  });

  // ── S3: Companion select screen appears in clean state ──────────────────────
  test('S3: companion selection screen shown when no companion saved', async ({ page }) => {
    await gotoApp(page); // clears storage
    await goToJourneyTab(page);

    // Should see the card list
    const cardList = page.locator('#jcs-card-list');
    await expect(cardList).toBeVisible({ timeout: 3000 });
  });

  // ── S4: No stale "יבחושונת" text in the companion list ─────────────────────
  test('S4: "יבחושונת" does not appear anywhere on the companion selection screen', async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);

    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const content = await page.textContent('#jcs-card-list');
    expect(content).not.toContain('יבחושונת');
  });

  // ── S5: All 5 companion cards render ────────────────────────────────────────
  test('S5: all 5 companion cards are present', async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);

    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const cards = await page.$$('#jcs-card-list .jcc-btn');
    expect(cards.length).toBe(5);
  });

  // ── S6: Each card has an image ──────────────────────────────────────────────
  test('S6: each companion card has an image that loads', async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);

    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const images = await page.$$('#jcs-card-list img');
    expect(images.length).toBeGreaterThanOrEqual(5);

    for (const img of images) {
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});
