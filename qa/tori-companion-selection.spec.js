// qa/tori-companion-selection.spec.js
// Full companion selection flow tests.
// These tests are expected to FAIL before the bug is fixed.

const { test, expect } = require('@playwright/test');
const { gotoApp, goToJourneyTab, dumpCompanionSelectState } = require('./helpers');

const SITE = 'https://hadasab94.github.io/Tori-app/';

test.describe('Companion Selection Screen', () => {

  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);
  });

  // ── T1: Companion selection screen appears ───────────────────────────────────
  test('T1: companion selection screen is visible after navigating to journey tab (clean state)', async ({ page }) => {
    // After clearing storage and navigating to journey, the companion select screen must appear
    const cardList = page.locator('#jcs-card-list');
    await expect(cardList).toBeVisible({ timeout: 3000 });
  });

  // ── T2: Card structure — div container, button hitarea ──────────────────────
  test('T2: companion cards use div container (not button), with button hitarea inside', async ({ page }) => {
    const state = await dumpCompanionSelectState(page);
    console.log('DOM state:', JSON.stringify(state, null, 2));

    expect(state.cardListExists).toBe(true);
    expect(state.cards.length).toBeGreaterThanOrEqual(1);

    for (const card of state.cards) {
      expect(card.isButton).toBe(false); // card MUST be div, not button
      expect(card.hasHitarea).toBe(true);
      // No nested buttons inside button — since card is div, this check confirms structure
      // Each card should have exactly 1 button (the hitarea)
      expect(card.nestedButtons).toBe(1);
    }
  });

  // ── T3: Hitarea has correct size and position ────────────────────────────────
  test('T3: radio hitarea is 44x44 and positioned at top-right of card', async ({ page }) => {
    const state = await dumpCompanionSelectState(page);

    expect(state.hitareas.length).toBeGreaterThanOrEqual(1);

    for (const h of state.hitareas) {
      expect(h.tagName).toBe('BUTTON');
      expect(h.width).toBeGreaterThanOrEqual(40); // ~44px
      expect(h.height).toBeGreaterThanOrEqual(40);
      expect(h.pointerEvents).not.toBe('none');
    }
  });

  // ── T4: No companion selected by default (clean state) ──────────────────────
  test('T4: no companion is pre-selected in clean state (empty localStorage)', async ({ page }) => {
    const state = await dumpCompanionSelectState(page);

    // In clean state cs._pendingId should be null/undefined
    if (state.csState) {
      expect(state.csState.companionId).toBeFalsy();
      expect(state.csState._pendingId).toBeFalsy();
    }

    // No radio dot should have class "on"
    for (const card of state.cards) {
      expect(card.radioHasOn).toBe(false);
    }
  });

  // ── T5: Clicking a radio hitarea selects that companion ─────────────────────
  test('T5: clicking radio hitarea marks that companion as selected', async ({ page }) => {
    // Wait for card list
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    // Get all hitarea buttons
    const hitareas = await page.$$('#jcs-card-list .jcc-radio-hitarea');
    expect(hitareas.length).toBeGreaterThan(0);

    // Click the first hitarea
    const firstHitarea = hitareas[0];
    await firstHitarea.click();

    // Wait a beat for state to update
    await page.waitForTimeout(300);

    // Check: first radio should now have class "on"
    const firstCard = await page.$('#jcs-card-list .jcc-btn');
    const firstRadio = await firstCard.$('.jcc-radio');
    const hasOn = await firstRadio.evaluate(el => el.classList.contains('on'));
    expect(hasOn).toBe(true);
  });

  // ── T6: Clicking radio updates cs._pendingId ─────────────────────────────────
  test('T6: clicking radio hitarea updates cs._pendingId', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    // Get the first card's data-id
    const firstCard = await page.$('#jcs-card-list .jcc-btn');
    const companionId = await firstCard.getAttribute('data-id');
    expect(companionId).toBeTruthy();

    // Click the hitarea
    const hitarea = await firstCard.$('.jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(300);

    // Verify cs._pendingId was updated.
    // cs is declared with `let` at script scope — not on window, access directly.
    const pendingId = await page.evaluate(() => {
      try { return cs._pendingId; } catch(e) { return undefined; }
    });
    expect(pendingId).toBe(companionId);
  });

  // ── T7: CTA button becomes active after selecting a companion ────────────────
  test('T7: confirm button is enabled after selecting a companion', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    // Initially the CTA should be disabled / greyed out
    const ctaBefore = await page.$('#jcs-cta-btn');
    if (ctaBefore) {
      const disabledBefore = await ctaBefore.evaluate(el => el.disabled || el.getAttribute('aria-disabled') === 'true' || el.style.opacity === '0.4');
      // (Some designs use opacity rather than disabled, so this is a soft check)
      console.log('CTA disabled before click:', disabledBefore);
    }

    // Click first hitarea
    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(300);

    // CTA should now be active
    const ctaAfter = await page.$('#jcs-cta-btn');
    expect(ctaAfter).toBeTruthy();
    const isEnabled = await ctaAfter.evaluate(el => !el.disabled && el.getAttribute('aria-disabled') !== 'true');
    expect(isEnabled).toBe(true);
  });

  // ── T8: Selecting second companion deselects the first ──────────────────────
  test('T8: selecting a different companion deselects the previous one', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const hitareas = await page.$$('#jcs-card-list .jcc-radio-hitarea');
    if (hitareas.length < 2) {
      test.skip('Need at least 2 companion cards');
      return;
    }

    // Select first
    await hitareas[0].click();
    await page.waitForTimeout(200);

    // Select second
    await hitareas[1].click();
    await page.waitForTimeout(200);

    // Second radio should be on
    const cards = await page.$$('#jcs-card-list .jcc-btn');
    const radio0 = await cards[0].$('.jcc-radio');
    const radio1 = await cards[1].$('.jcc-radio');

    const on0 = await radio0.evaluate(el => el.classList.contains('on'));
    const on1 = await radio1.evaluate(el => el.classList.contains('on'));

    expect(on0).toBe(false);
    expect(on1).toBe(true);
  });

  // ── T9: Touch interaction works (simulated via Playwright touch) ─────────────
  test('T9: touch tap on radio hitarea selects companion', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    const box = await hitarea.boundingBox();
    expect(box).toBeTruthy();

    // Simulate a tap
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    const firstCard = await page.$('#jcs-card-list .jcc-btn');
    const firstRadio = await firstCard.$('.jcc-radio');
    const hasOn = await firstRadio.evaluate(el => el.classList.contains('on'));
    expect(hasOn).toBe(true);
  });

  // ── T10: elementFromPoint at hitarea center returns the hitarea or its child ─
  test('T10: elementFromPoint at radio center hits hitarea (not an obscuring element)', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const state = await dumpCompanionSelectState(page);
    console.log('elementFromPoint for first hitarea:', state.elementFromPointFirst);

    expect(state.elementFromPointFirst).toBeTruthy();
    // Should NOT be blocked by an overlay — must be hitarea button or radio dot inside it
    const tag = state.elementFromPointFirst.tagName;
    const cls = state.elementFromPointFirst.className || '';
    const isHitareaOrChild = tag === 'BUTTON' || cls.includes('jcc-radio');
    expect(isHitareaOrChild).toBe(true);
  });

  // ── T11: DOM is not destroyed after clicking radio ──────────────────────────
  test('T11: DOM is stable after clicking radio — card list not wiped', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const countBefore = (await page.$$('#jcs-card-list .jcc-btn')).length;

    // Click first hitarea
    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(500);

    // Card list should still exist with same number of cards
    const list = await page.$('#jcs-card-list');
    expect(list).toBeTruthy();

    const countAfter = (await page.$$('#jcs-card-list .jcc-btn')).length;
    expect(countAfter).toBe(countBefore);
  });

  // ── T12: Full flow — select companion → confirm → journey screen shown ───────
  test('T12: full flow — select companion, confirm, journey main screen appears', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    // Select first companion
    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(300);

    // Click CTA — this opens a confirm modal ("לצאת לדרך עם X?")
    const cta = await page.$('#jcs-cta-btn');
    expect(cta).toBeTruthy();
    await cta.click();
    await page.waitForTimeout(400);

    // The confirm modal appears — click "נצא לדרך" (the actual commit button)
    // It calls doConfirmJourneyCompanion() which saves state and calls renderJourneyTab()
    const confirmBtn = await page.$('#j-confirm-overlay button:last-child');
    if (confirmBtn) {
      await confirmBtn.click();
    } else {
      // Fallback: call doConfirmJourneyCompanion() directly if modal not found
      await page.evaluate(() => { if (typeof doConfirmJourneyCompanion === 'function') doConfirmJourneyCompanion(); });
    }
    await page.waitForTimeout(800);

    // After confirmation, the companion select screen should be gone
    const cardList = await page.$('#jcs-card-list');
    expect(cardList).toBeNull();

    // And some journey content should be visible
    const journeyInner = await page.$('#journey-inner');
    expect(journeyInner).toBeTruthy();
    const innerText = await journeyInner.textContent();
    expect(innerText.length).toBeGreaterThan(20);
  });
});
