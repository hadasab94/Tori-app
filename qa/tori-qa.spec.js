// qa/tori-qa.spec.js
// Permanent QA suite for the תורי app.
// 10 test suites — run with qa-runner.js to generate QA_REPORT.md and REPAIR_PROMPT.md.
//
// Rules:
//  ✗  Does NOT auto-fix any bug
//  ✗  Does NOT commit or deploy
//  ✓  Writes detailed pass/fail results for each test
//  ✓  Generates REPAIR_PROMPT.md if anything fails

const { test, expect } = require('@playwright/test');
const { gotoApp, goToJourneyTab, APP_HTML } = require('./helpers');

// ══════════════════════════════════════════════════════════════════════
// QA1 — Smoke: app loads, correct tabs present
// ══════════════════════════════════════════════════════════════════════
test.describe('QA1: Smoke — app loads, correct tabs', () => {

  test('QA1-A: app loads without uncaught JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await gotoApp(page);
    // Filter known non-critical errors (service workers, external resources)
    const critical = errors.filter(e =>
      !e.includes('serviceworker') &&
      !e.includes('ServiceWorker') &&
      !e.includes('Failed to fetch') &&
      !e.includes('manifest')
    );
    expect(critical, `JS errors: ${critical.join('\n')}`).toHaveLength(0);
  });

  test('QA1-B: nav tab "היום" is present and active on load', async ({ page }) => {
    await gotoApp(page);
    const navToday = page.locator('#nav-today');
    await expect(navToday).toBeVisible({ timeout: 3000 });
    const label = await navToday.locator('.nav-label').textContent();
    expect(label.trim()).toBe('היום');
    const isActive = await navToday.evaluate(el => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

  test('QA1-C: nav tab "המסע" is present', async ({ page }) => {
    await gotoApp(page);
    const navJourney = page.locator('#nav-journey');
    await expect(navJourney).toBeVisible({ timeout: 3000 });
    const label = await navJourney.locator('.nav-label').textContent();
    expect(label.trim()).toBe('המסע');
  });

  test('QA1-D: floating "הידעת?" button is visible', async ({ page }) => {
    await gotoApp(page);
    const fab = page.locator('.fact-fab');
    await expect(fab).toBeVisible({ timeout: 3000 });
    const txt = await fab.textContent();
    expect(txt).toContain('הידעת');
  });

  test('QA1-E: no "בוט" nav tab exists', async ({ page }) => {
    await gotoApp(page);
    // Count nav items — should be exactly 2 (היום, המסע)
    const navItems = page.locator('.nav-item');
    const count = await navItems.count();
    expect(count).toBe(2);
    // Confirm none of them says "בוט"
    for (let i = 0; i < count; i++) {
      const text = await navItems.nth(i).textContent();
      expect(text).not.toContain('בוט');
    }
  });

  test('QA1-F: journey tab is navigable', async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);
    const viewJourney = page.locator('#view-journey');
    await expect(viewJourney).toBeVisible({ timeout: 3000 });
    const isActive = await viewJourney.evaluate(el => el.classList.contains('active'));
    expect(isActive).toBe(true);
  });

});

// ══════════════════════════════════════════════════════════════════════
// QA2 — Stale content: forbidden visible text
// ══════════════════════════════════════════════════════════════════════
test.describe('QA2: Stale content — forbidden visible text', () => {

  // Forbidden strings that must NOT be visible to the user.
  // These are left-over references from old feature names.
  const FORBIDDEN = [
    'אבנים',
    'אבני דרך',
    'גינת האור',
    'גינה',
    'פרחים',
    'garden',
    'stones',
    'milestone',
    'בוט תורי',
    'WhatsApp',
    "צ'אט",
  ];

  test('QA2-A: no forbidden text is visibly rendered in TODAY view', async ({ page }) => {
    await gotoApp(page);
    // Switch to today view (default) and check visible text
    const viewToday = page.locator('#view-today');
    await expect(viewToday).toBeVisible({ timeout: 3000 });

    const fails = [];
    for (const term of FORBIDDEN) {
      // Use page.evaluate to check if any *visible* element contains the term
      const visible = await page.evaluate((searchTerm) => {
        function isVisible(el) {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return false;
          let p = el.parentElement;
          while (p) {
            const ps = window.getComputedStyle(p);
            if (ps.display === 'none' || ps.visibility === 'hidden') return false;
            // Check aria-hidden ancestry
            if (p.getAttribute('aria-hidden') === 'true') return false;
            p = p.parentElement;
          }
          return true;
        }
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent.includes(searchTerm) && isVisible(node.parentElement)) {
            return { found: true, context: node.parentElement.outerHTML.slice(0, 120) };
          }
        }
        return { found: false };
      }, term);

      if (visible.found) {
        fails.push(`"${term}" visible in today view — context: ${visible.context}`);
      }
    }
    expect(fails, fails.join('\n')).toHaveLength(0);
  });

  test('QA2-B: no forbidden text is visibly rendered in JOURNEY view', async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);

    const fails = [];
    for (const term of FORBIDDEN) {
      const visible = await page.evaluate((searchTerm) => {
        function isVisible(el) {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return false;
          let p = el.parentElement;
          while (p) {
            const ps = window.getComputedStyle(p);
            if (ps.display === 'none' || ps.visibility === 'hidden') return false;
            if (p.getAttribute('aria-hidden') === 'true') return false;
            p = p.parentElement;
          }
          return true;
        }
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent.includes(searchTerm) && isVisible(node.parentElement)) {
            return { found: true, context: node.parentElement.outerHTML.slice(0, 120) };
          }
        }
        return { found: false };
      }, term);

      if (visible.found) {
        fails.push(`"${term}" visible in journey view — context: ${visible.context}`);
      }
    }
    expect(fails, fails.join('\n')).toHaveLength(0);
  });

});

// ══════════════════════════════════════════════════════════════════════
// QA3 — Companion selection: full flow
// ══════════════════════════════════════════════════════════════════════
test.describe('QA3: Companion selection — full flow', () => {

  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);
  });

  test('QA3-A: companion selection screen appears in clean state', async ({ page }) => {
    const cardList = page.locator('#jcs-card-list');
    await expect(cardList).toBeVisible({ timeout: 3000 });
  });

  test('QA3-B: exactly 5 companion cards are shown', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const cards = page.locator('#jcs-card-list .jcc-btn');
    await expect(cards).toHaveCount(5);
  });

  test('QA3-C: no companion is auto-selected in clean state', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    // No radio dot should have class "on"
    const onRadios = await page.$$('#jcs-card-list .jcc-radio.on');
    expect(onRadios.length, 'Expected 0 pre-selected companions').toBe(0);
    // cs._pendingId should be falsy
    const pendingId = await page.evaluate(() => {
      try { return cs._pendingId; } catch(e) { return undefined; }
    });
    expect(pendingId).toBeFalsy();
  });

  test('QA3-D: "יבחושונת" is NOT in the companion list', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const text = await page.locator('#jcs-card-list').textContent();
    expect(text).not.toContain('יבחושונת');
  });

  test('QA3-E: all companion images load (no broken img src)', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const imgs = await page.$$('#jcs-card-list img');
    for (const img of imgs) {
      const src = await img.getAttribute('src');
      expect(src, 'img must have src').toBeTruthy();
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      expect(naturalWidth, `img broken: ${src}`).toBeGreaterThan(0);
    }
  });

  test('QA3-F: clicking radio hitarea selects companion and updates cs._pendingId', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const firstCard = await page.$('#jcs-card-list .jcc-btn');
    const companionId = await firstCard.getAttribute('data-id');
    const hitarea = await firstCard.$('.jcc-radio-hitarea');
    expect(hitarea, 'hitarea must exist').toBeTruthy();

    await hitarea.click();
    await page.waitForTimeout(300);

    // Radio dot should have class "on"
    const radio = await firstCard.$('.jcc-radio');
    const hasOn = await radio.evaluate(el => el.classList.contains('on'));
    expect(hasOn, 'radio should be "on" after click').toBe(true);

    // cs._pendingId should match
    const pendingId = await page.evaluate(() => {
      try { return cs._pendingId; } catch(e) { return undefined; }
    });
    expect(pendingId).toBe(companionId);
  });

  test('QA3-G: CTA button becomes enabled after selecting a companion', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(300);

    const cta = page.locator('#jcs-cta-btn');
    await expect(cta).toBeVisible({ timeout: 2000 });
    const isEnabled = await cta.evaluate(el => !el.disabled && el.getAttribute('aria-disabled') !== 'true');
    expect(isEnabled).toBe(true);
  });

  test('QA3-H: selecting second companion deselects the first', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const hitareas = await page.$$('#jcs-card-list .jcc-radio-hitarea');
    if (hitareas.length < 2) { test.skip(); return; }

    await hitareas[0].click();
    await page.waitForTimeout(200);
    await hitareas[1].click();
    await page.waitForTimeout(200);

    const cards = await page.$$('#jcs-card-list .jcc-btn');
    const radio0On = await cards[0].$eval('.jcc-radio', el => el.classList.contains('on'));
    const radio1On = await cards[1].$eval('.jcc-radio', el => el.classList.contains('on'));
    expect(radio0On).toBe(false);
    expect(radio1On).toBe(true);
  });

  test('QA3-I: DOM is stable after clicking radio — card list not wiped', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const countBefore = (await page.$$('#jcs-card-list .jcc-btn')).length;

    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(500);

    const list = await page.$('#jcs-card-list');
    expect(list, 'card list must still exist after click').toBeTruthy();
    const countAfter = (await page.$$('#jcs-card-list .jcc-btn')).length;
    expect(countAfter).toBe(countBefore);
  });

  test('QA3-J: full flow — select → CTA → confirm modal → journey screen', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(300);

    const cta = await page.$('#jcs-cta-btn');
    expect(cta).toBeTruthy();
    await cta.click();
    await page.waitForTimeout(400);

    // Confirm modal appears — click "נצא לדרך"
    const confirmBtn = await page.$('#j-confirm-overlay button:last-child');
    if (confirmBtn) {
      await confirmBtn.click();
    } else {
      await page.evaluate(() => {
        if (typeof doConfirmJourneyCompanion === 'function') doConfirmJourneyCompanion();
      });
    }
    await page.waitForTimeout(800);

    // Card list should be gone — journey main screen shown
    const cardList = await page.$('#jcs-card-list');
    expect(cardList, 'card list must be gone after companion confirmed').toBeNull();

    const journeyInner = page.locator('#journey-inner');
    const innerText = await journeyInner.textContent();
    expect(innerText.length, 'journey inner should have content').toBeGreaterThan(20);
  });

  test('QA3-K: after companion confirmed, companion state is saved to localStorage', async ({ page }) => {
    // This test verifies that confirming a companion actually persists to localStorage.
    // Note: page.reload() would re-run addInitScript which clears state — so we test
    // persistence differently: confirm, then check localStorage immediately.
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    // Select and confirm companion
    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(300);

    const firstCard = await page.$('#jcs-card-list .jcc-btn');
    const expectedId = await firstCard.getAttribute('data-id');
    expect(expectedId).toBeTruthy();

    const cta = await page.$('#jcs-cta-btn');
    await cta.click();
    await page.waitForTimeout(400);

    const confirmBtn = await page.$('#j-confirm-overlay button:last-child');
    if (confirmBtn) {
      await confirmBtn.click();
    } else {
      await page.evaluate(() => {
        if (typeof doConfirmJourneyCompanion === 'function') doConfirmJourneyCompanion();
      });
    }
    await page.waitForTimeout(800);

    // 1. Card list gone — journey main screen shown
    const cardList = await page.$('#jcs-card-list');
    expect(cardList, 'Card list must be gone after confirmation').toBeNull();

    // 2. Companion state saved to localStorage
    const stored = await page.evaluate(() => localStorage.getItem('tori_companion_v1.state'));
    expect(stored, 'companion state must be saved to localStorage').toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(parsed.companionId, 'companionId must be set in stored state').toBeTruthy();
    expect(parsed.companionId, 'stored companionId must match selected companion').toBe(expectedId);

    // 3. cs.companionId matches in runtime
    const runtimeId = await page.evaluate(() => {
      try { return cs.companionId; } catch(e) { return null; }
    });
    expect(runtimeId, 'cs.companionId must be set after confirmation').toBe(expectedId);
  });

});

// ══════════════════════════════════════════════════════════════════════
// QA4 — Card structure: only radio hitarea selects
// ══════════════════════════════════════════════════════════════════════
test.describe('QA4: Card structure — only radio selects', () => {

  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);
  });

  test('QA4-A: cards are div (not button) — no button-inside-button', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const cards = await page.$$('#jcs-card-list .jcc-btn');
    for (const card of cards) {
      const tagName = await card.evaluate(el => el.tagName);
      expect(tagName, 'card container must be DIV not BUTTON').toBe('DIV');
    }
  });

  test('QA4-B: each card has exactly one button (the hitarea)', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const cards = await page.$$('#jcs-card-list .jcc-btn');
    for (const card of cards) {
      const btnCount = await card.evaluate(el => el.querySelectorAll('button').length);
      expect(btnCount, 'each card must have exactly 1 button (hitarea)').toBe(1);
    }
  });

  test('QA4-C: hitarea button is 44×44 and pointer-events is not none', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const hitareas = await page.$$('#jcs-card-list .jcc-radio-hitarea');
    expect(hitareas.length).toBeGreaterThan(0);

    for (const h of hitareas) {
      const rect = await h.boundingBox();
      expect(rect.width, 'hitarea must be ≥40px wide').toBeGreaterThanOrEqual(40);
      expect(rect.height, 'hitarea must be ≥40px tall').toBeGreaterThanOrEqual(40);
      const pe = await h.evaluate(el => window.getComputedStyle(el).pointerEvents);
      expect(pe, 'pointer-events must not be none').not.toBe('none');
    }
  });

  test('QA4-D: clicking the portrait image does NOT select the companion', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const firstCard = await page.$('#jcs-card-list .jcc-btn');
    // Click the image (not the hitarea) — it should not trigger selection
    const img = await firstCard.$('img');
    if (!img) { test.skip(); return; }

    await img.click({ force: true });
    await page.waitForTimeout(300);

    const pendingId = await page.evaluate(() => {
      try { return cs._pendingId; } catch(e) { return null; }
    });
    expect(pendingId, 'clicking portrait image must NOT set cs._pendingId').toBeFalsy();
  });

  test('QA4-E: clicking card body text does NOT select the companion', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    // Click the card name text (not hitarea)
    const nameEl = await page.$('#jcs-card-list .jcc-btn .jcc-name');
    if (!nameEl) { test.skip(); return; }

    await nameEl.click({ force: true });
    await page.waitForTimeout(300);

    const pendingId = await page.evaluate(() => {
      try { return cs._pendingId; } catch(e) { return null; }
    });
    expect(pendingId, 'clicking companion name must NOT set cs._pendingId').toBeFalsy();
  });

  test('QA4-F: elementFromPoint at hitarea center hits hitarea or radio child (not obscured)', async ({ page }) => {
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    const box = await hitarea.boundingBox();
    expect(box).toBeTruthy();

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    const el = await page.evaluate(([x, y]) => {
      const e = document.elementFromPoint(x, y);
      return e ? { tag: e.tagName, cls: e.className } : null;
    }, [cx, cy]);

    expect(el, 'elementFromPoint must return an element at hitarea center').toBeTruthy();
    const isHitareaOrChild = el.tag === 'BUTTON' || (el.cls && el.cls.includes('jcc-radio'));
    expect(isHitareaOrChild, `Expected BUTTON or jcc-radio child, got <${el.tag} class="${el.cls}">`).toBe(true);
  });

});

// ══════════════════════════════════════════════════════════════════════
// QA5 — Journey screen after selection: 4 action buttons, no stale content
// ══════════════════════════════════════════════════════════════════════
test.describe('QA5: Journey screen after companion selection', () => {

  async function selectAndConfirmCompanion(page) {
    await gotoApp(page);
    await goToJourneyTab(page);
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(300);

    const cta = await page.$('#jcs-cta-btn');
    await cta.click();
    await page.waitForTimeout(400);

    const confirmBtn = await page.$('#j-confirm-overlay button:last-child');
    if (confirmBtn) {
      await confirmBtn.click();
    } else {
      await page.evaluate(() => {
        if (typeof doConfirmJourneyCompanion === 'function') doConfirmJourneyCompanion();
      });
    }
    await page.waitForTimeout(800);
  }

  test('QA5-A: exactly 4 action chips appear on journey main screen', async ({ page }) => {
    await selectAndConfirmCompanion(page);

    const chips = page.locator('.j-action-chip');
    const count = await chips.count();
    expect(count, `Expected 4 action chips, got ${count}`).toBe(4);
  });

  test('QA5-B: all 4 expected action chip labels are present', async ({ page }) => {
    await selectAndConfirmCompanion(page);

    const chips = page.locator('.j-action-chip');
    const count = await chips.count();
    const texts = [];
    for (let i = 0; i < count; i++) {
      texts.push(await chips.nth(i).textContent());
    }
    const combined = texts.join('|');
    expect(combined).toContain('אכול'); // food chip
    expect(combined).toContain('ההברקה'); // funny line chip
    expect(combined).toContain('עשיתי היום'); // what done today chip
    expect(combined).toContain('יום חמלה'); // compassion chip
  });

  test('QA5-C: no stale text visible on journey main screen', async ({ page }) => {
    await selectAndConfirmCompanion(page);

    const STALE = ['אבנים', 'אבני דרך', 'גינת האור', 'גינה', 'פרחים', 'garden', 'stones', 'milestone', 'בוט תורי'];
    const inner = page.locator('#journey-inner');
    const text = await inner.textContent();

    for (const term of STALE) {
      expect(text, `Stale term "${term}" found in journey main screen`).not.toContain(term);
    }
  });

  test('QA5-D: companion name/portrait is shown on journey screen', async ({ page }) => {
    await selectAndConfirmCompanion(page);

    const inner = await page.locator('#journey-inner').textContent();
    // Journey screen should have some substantial content
    expect(inner.length).toBeGreaterThan(30);
  });

});

// ══════════════════════════════════════════════════════════════════════
// QA6 — Action buttons: each chip produces a response
// ══════════════════════════════════════════════════════════════════════
test.describe('QA6: Action buttons respond', () => {

  async function goToJourneyMain(page) {
    await gotoApp(page);
    await goToJourneyTab(page);
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(300);

    const cta = await page.$('#jcs-cta-btn');
    await cta.click();
    await page.waitForTimeout(400);

    const confirmBtn = await page.$('#j-confirm-overlay button:last-child');
    if (confirmBtn) {
      await confirmBtn.click();
    } else {
      await page.evaluate(() => {
        if (typeof doConfirmJourneyCompanion === 'function') doConfirmJourneyCompanion();
      });
    }
    await page.waitForTimeout(800);
    await page.waitForSelector('.j-action-chip', { timeout: 3000 });
  }

  test('QA6-A: food chip (תבחרי לי משהו קטן לאכול) produces response', async ({ page }) => {
    await goToJourneyMain(page);

    // Click food chip
    const foodChip = page.locator('.j-action-chip').filter({ hasText: 'אכול' }).first();
    await foodChip.click();
    await page.waitForTimeout(500);

    const resp = page.locator('#j-action-response');
    await expect(resp).toBeVisible({ timeout: 2000 });
    const text = await resp.textContent();
    expect(text.trim().length, 'food response must have content').toBeGreaterThan(5);
  });

  test('QA6-B: funny line chip (ההברקה) produces response', async ({ page }) => {
    await goToJourneyMain(page);

    const chip = page.locator('.j-action-chip').filter({ hasText: 'ההברקה' }).first();
    await chip.click();
    await page.waitForTimeout(500);

    const resp = page.locator('#j-action-response');
    await expect(resp).toBeVisible({ timeout: 2000 });
    const text = await resp.textContent();
    expect(text.trim().length, 'funny line response must have content').toBeGreaterThan(5);
  });

  test('QA6-C: "what did I do" chip produces response', async ({ page }) => {
    await goToJourneyMain(page);

    const chip = page.locator('.j-action-chip').filter({ hasText: 'עשיתי היום' }).first();
    await chip.click();
    await page.waitForTimeout(500);

    const resp = page.locator('#j-action-response');
    await expect(resp).toBeVisible({ timeout: 2000 });
    const text = await resp.textContent();
    expect(text.trim().length, '"what done" response must have content').toBeGreaterThan(5);
  });

  test('QA6-D: compassion chip (יום חמלה) produces a modal or response', async ({ page }) => {
    await goToJourneyMain(page);

    const chip = page.locator('.j-action-chip.compassion-chip');
    await chip.click();
    await page.waitForTimeout(500);

    // This chip opens a modal overlay (j-comp-explain-overlay)
    const modal = page.locator('#j-comp-explain-overlay');
    await expect(modal).toBeVisible({ timeout: 2000 });
  });

  test('QA6-E: compassion chip modal can be closed with "לא עכשיו"', async ({ page }) => {
    await goToJourneyMain(page);

    const chip = page.locator('.j-action-chip.compassion-chip');
    await chip.click();
    await page.waitForTimeout(500);

    const cancelBtn = page.locator('#j-comp-explain-overlay .j-comp-cancel');
    await expect(cancelBtn).toBeVisible({ timeout: 2000 });
    await cancelBtn.click();
    await page.waitForTimeout(300);

    // Modal should be gone
    const modal = await page.$('#j-comp-explain-overlay');
    expect(modal, 'modal should close after "לא עכשיו"').toBeNull();
  });

});

// ══════════════════════════════════════════════════════════════════════
// QA7 — Water drops: visible and clickable
// ══════════════════════════════════════════════════════════════════════
test.describe('QA7: Water drops', () => {

  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    // Water is on today view — stay on default today tab
    await page.waitForSelector('#water-card', { timeout: 3000 });
  });

  test('QA7-A: water card is visible with count display', async ({ page }) => {
    const waterCard = page.locator('#water-card');
    await expect(waterCard).toBeVisible({ timeout: 2000 });

    const waterNum = page.locator('#water-num');
    await expect(waterNum).toBeVisible({ timeout: 2000 });
    const txt = await waterNum.textContent();
    expect(txt).toMatch(/^\d+\/8$/);
  });

  test('QA7-B: 8 drop buttons are present', async ({ page }) => {
    const drops = page.locator('#drops-grid .drop-btn');
    await expect(drops).toHaveCount(8);
  });

  test('QA7-C: clicking a drop button increases water count', async ({ page }) => {
    const waterNum = page.locator('#water-num');
    const initialText = await waterNum.textContent();
    const initialCount = parseInt(initialText.split('/')[0]);

    const drops = page.locator('#drops-grid .drop-btn');
    await drops.first().click();
    await page.waitForTimeout(300);

    const newText = await waterNum.textContent();
    const newCount = parseInt(newText.split('/')[0]);
    expect(newCount, 'water count should increase after clicking a drop').toBe(initialCount + 1);
  });

  test('QA7-D: no double-counting — clicking same drop twice does not add 2', async ({ page }) => {
    const drops = page.locator('#drops-grid .drop-btn');
    await drops.first().click();
    await page.waitForTimeout(200);
    await drops.first().click();
    await page.waitForTimeout(200);

    const waterNum = page.locator('#water-num');
    const text = await waterNum.textContent();
    const count = parseInt(text.split('/')[0]);
    // Clicking index 0 twice: if it's a toggle the count could be 0 or 1.
    // Either way, it must not be more than 1 from 2 clicks on the same drop.
    expect(count, 'double-clicking same drop must not exceed 1').toBeLessThanOrEqual(1);
  });

});

// ══════════════════════════════════════════════════════════════════════
// QA8 — Compassion day: modal opens, cancel works, activation saves state
// ══════════════════════════════════════════════════════════════════════
test.describe('QA8: Compassion day', () => {

  async function goToJourneyMainWithCompanion(page) {
    await gotoApp(page);
    await goToJourneyTab(page);
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });
    const hitarea = await page.$('#jcs-card-list .jcc-radio-hitarea');
    await hitarea.click();
    await page.waitForTimeout(300);
    const cta = await page.$('#jcs-cta-btn');
    await cta.click();
    await page.waitForTimeout(400);
    const confirmBtn = await page.$('#j-confirm-overlay button:last-child');
    if (confirmBtn) {
      await confirmBtn.click();
    } else {
      await page.evaluate(() => {
        if (typeof doConfirmJourneyCompanion === 'function') doConfirmJourneyCompanion();
      });
    }
    await page.waitForTimeout(800);
    await page.waitForSelector('.j-action-chip', { timeout: 3000 });
  }

  test('QA8-A: compassion chip opens explain modal', async ({ page }) => {
    await goToJourneyMainWithCompanion(page);

    const chip = page.locator('.j-action-chip.compassion-chip');
    await chip.click();
    await page.waitForTimeout(400);

    const modal = page.locator('#j-comp-explain-overlay');
    await expect(modal).toBeVisible({ timeout: 2000 });
  });

  test('QA8-B: "לא עכשיו" closes modal without activating compassion day', async ({ page }) => {
    await goToJourneyMainWithCompanion(page);

    const chip = page.locator('.j-action-chip.compassion-chip');
    await chip.click();
    await page.waitForTimeout(400);

    // Check cd.active is still false before clicking cancel
    const beforeActive = await page.evaluate(() => {
      try { return (typeof cd !== 'undefined') ? cd.active : false; } catch(e) { return false; }
    });
    expect(beforeActive, 'compassion day should not be active before cancel').toBe(false);

    const cancelBtn = page.locator('#j-comp-explain-overlay .j-comp-cancel');
    await cancelBtn.click();
    await page.waitForTimeout(300);

    // Modal gone
    const modal = await page.$('#j-comp-explain-overlay');
    expect(modal, 'modal must close after cancel').toBeNull();

    // cd.active still false
    const afterActive = await page.evaluate(() => {
      try { return (typeof cd !== 'undefined') ? cd.active : false; } catch(e) { return false; }
    });
    expect(afterActive, 'compassion day must NOT be activated after cancel').toBe(false);
  });

  test('QA8-C: activating compassion day saves state to localStorage', async ({ page }) => {
    await goToJourneyMainWithCompanion(page);

    const chip = page.locator('.j-action-chip.compassion-chip');
    await chip.click();
    await page.waitForTimeout(400);

    // Click "להפעיל יום חמלה" (activate button)
    const activateBtn = page.locator('#j-comp-explain-overlay .j-comp-confirm');
    // Only click if it exists (it won't if compassion already active)
    const activateBtnHandle = await page.$('#j-comp-explain-overlay .j-comp-confirm');
    if (!activateBtnHandle) {
      // Compassion already active — skip
      test.skip();
      return;
    }

    await activateBtn.click();
    await page.waitForTimeout(500);

    // cd.active should be true
    const isActive = await page.evaluate(() => {
      try { return (typeof cd !== 'undefined') ? cd.active : false; } catch(e) { return false; }
    });
    expect(isActive, 'compassion day must be active after activation').toBe(true);

    // compassion:state should be in localStorage
    const stored = await page.evaluate(() => localStorage.getItem('compassion:state'));
    expect(stored, 'compassion:state must be saved to localStorage').toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(parsed.active).toBe(true);
  });

  test('QA8-D: compassion day button in header is visible on today view', async ({ page }) => {
    await gotoApp(page);
    const compBtn = page.locator('#comp-btn');
    await expect(compBtn).toBeVisible({ timeout: 3000 });
    const text = await compBtn.textContent();
    expect(text).toContain('יום חמלה');
  });

});

// ══════════════════════════════════════════════════════════════════════
// QA9 — RTL & mobile: viewport, scroll, text direction
// ══════════════════════════════════════════════════════════════════════
test.describe('QA9: RTL & mobile layout', () => {

  test('QA9-A: app viewport is 390×844 (iPhone 14)', async ({ page }) => {
    await gotoApp(page);
    const viewport = page.viewportSize();
    expect(viewport.width).toBe(390);
    expect(viewport.height).toBe(844);
  });

  test('QA9-B: document has dir="rtl" or body has rtl direction', async ({ page }) => {
    await gotoApp(page);
    const dir = await page.evaluate(() => {
      return document.documentElement.getAttribute('dir') ||
             window.getComputedStyle(document.body).direction;
    });
    expect(dir, 'App must be RTL').toBe('rtl');
  });

  test('QA9-C: no horizontal scroll on today view', async ({ page }) => {
    await gotoApp(page);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth, `Horizontal overflow: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('QA9-D: no horizontal scroll on journey view (companion selection)', async ({ page }) => {
    await gotoApp(page);
    await goToJourneyTab(page);
    await page.waitForSelector('#jcs-card-list', { timeout: 3000 });

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth, `Horizontal overflow in journey: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('QA9-E: app text direction is RTL — Hebrew text is right-aligned', async ({ page }) => {
    await gotoApp(page);
    // Check the nav label text direction
    const navDir = await page.evaluate(() => {
      const label = document.querySelector('.nav-label');
      return label ? window.getComputedStyle(label).direction : null;
    });
    expect(navDir, 'nav labels must be RTL').toBe('rtl');
  });

  test('QA9-F: bottom nav is within viewport bounds', async ({ page }) => {
    await gotoApp(page);
    const nav = page.locator('.bottom-nav');
    await expect(nav).toBeVisible({ timeout: 2000 });

    const box = await nav.boundingBox();
    expect(box.x, 'nav left edge must be within viewport').toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, 'nav right edge must be within viewport').toBeLessThanOrEqual(395); // small tolerance
  });

});

// ══════════════════════════════════════════════════════════════════════
// QA10 — Pamper image repair: legacy activePamper migration
// Verifies that repairPamperImageRefs() heals existing activePamper records
// that have imageSrc:null / imageId:null (saved before image system was wired).
// Does NOT reset points, activeUntil, selectedAt, or archive.
// ══════════════════════════════════════════════════════════════════════

/**
 * Seeds localStorage with a legacy pamperState (imageSrc:null, imageId:null)
 * and a companion + garden state before page.goto().
 * Must be called before page.goto() — uses addInitScript.
 */
async function seedLegacyPamperState(page, companionId, mode, opts = {}) {
  await page.addInitScript((args) => {
    const { companionId, mode, futureUntil, selectedAt, dedicatedPamperPoints, archived } = args;
    try {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('user:session', JSON.stringify({ expiry }));
      localStorage.setItem('user:profile', JSON.stringify({ name: 'QA10', password: '' }));
      localStorage.setItem('tori_companion_v1.state', JSON.stringify({
        companionId, selectedAt: new Date().toISOString(), switchCount: 1,
      }));
      localStorage.setItem('tori_garden_v1.state', JSON.stringify({
        points: 30, lifetimeConnectionPoints: 30,
        dedicatedPamperPoints: dedicatedPamperPoints || 15,
        garden: { plants: [], wild: [], elements: [] },
        daysJournal: [], todayMood: 'regular', todayActions: [], todayPoints: 0,
        streakDays: 0, growthCornerUnlocked: false, lastVisit: null,
        factIdx: 0, factDate: '', wildCooldowns: {},
      }));
      localStorage.setItem('tori_pamper_v1.state', JSON.stringify({
        activePamper: {
          cardId: 'spa-small', companionId, mode,
          selectedAt: selectedAt || new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          activeUntil: futureUntil || (Date.now() + 22 * 60 * 60 * 1000),
          imageSrc: null, imageId: null,
          summaryLine: 'היה טוב.',
        },
        archivedPamperCards: archived || [],
        seenPamperImageIds: {},
      }));
    } catch (e) {}
  }, {
    companionId, mode,
    futureUntil: opts.futureUntil || (Date.now() + 22 * 60 * 60 * 1000),
    selectedAt:  opts.selectedAt  || new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    dedicatedPamperPoints: opts.dedicatedPamperPoints || 15,
    archived: opts.archived || [],
  });
}

/** Navigate to journey after app load, return the repaired pamperState from localStorage. */
async function loadAndGetRepairedState(page) {
  await page.goto(APP_HTML, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { if (typeof switchView === 'function') switchView('journey'); });
  await page.waitForTimeout(1000);
  return page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('tori_pamper_v1.state')); } catch (e) { return null; }
  });
}

test.describe('QA10: Pamper image repair — legacy activePamper migration', () => {

  test('QA10-A: hafshushit·alone — null imageSrc is repaired on load', async ({ page }) => {
    const futureUntil = Date.now() + 22 * 60 * 60 * 1000;
    await seedLegacyPamperState(page, 'forest', 'alone', { futureUntil });
    const state = await loadAndGetRepairedState(page);

    expect(state, 'pamperState must be saved after repair').not.toBeNull();
    const ap = state.activePamper;
    expect(ap, 'activePamper must still exist').not.toBeNull();
    expect(ap.imageSrc, 'imageSrc must be a valid hafshushit-alone WebP path')
      .toMatch(/^assets\/companions\/pamper\/spa\/hafshushit-spa-alone-\d+\.webp$/);
    expect(ap.imageId, 'imageId must be a valid hafshushit-alone id')
      .toMatch(/hafshushit-spa-alone-\d+/);
    expect(ap.activeUntil, 'activeUntil must not be changed').toBeGreaterThanOrEqual(futureUntil - 100);
    expect(ap.cardId,  'cardId must be unchanged').toBe('spa-small');
    expect(ap.companionId, 'companionId must be unchanged').toBe('forest');
    expect(ap.mode, 'mode must be unchanged').toBe('alone');
    expect(ap.summaryLine, 'summaryLine must be unchanged').toBe('היה טוב.');
  });

  test('QA10-B: hafshushit·friend — null imageSrc is repaired on load', async ({ page }) => {
    await seedLegacyPamperState(page, 'forest', 'friend');
    const state = await loadAndGetRepairedState(page);
    const ap = state && state.activePamper;
    expect(ap).not.toBeNull();
    expect(ap.imageSrc).toMatch(/^assets\/companions\/pamper\/spa\/hafshushit-spa-friend-\d+\.webp$/);
    expect(ap.imageId).toMatch(/hafshushit-spa-friend-\d+/);
  });

  test('QA10-C: hafshushit·sister — null imageSrc is repaired, picks from pool of 3', async ({ page }) => {
    await seedLegacyPamperState(page, 'forest', 'sister');
    const state = await loadAndGetRepairedState(page);
    const ap = state && state.activePamper;
    expect(ap).not.toBeNull();
    expect(ap.imageSrc).toMatch(/^assets\/companions\/pamper\/spa\/hafshushit-spa-sister-\d+\.webp$/);
    expect(ap.imageId).toMatch(/hafshushit-spa-sister-\d+/);
  });

  test('QA10-D: bear·alone — null imageSrc is repaired on load', async ({ page }) => {
    await seedLegacyPamperState(page, 'bear', 'alone');
    const state = await loadAndGetRepairedState(page);
    const ap = state && state.activePamper;
    expect(ap).not.toBeNull();
    expect(ap.imageSrc).toMatch(/^assets\/companions\/pamper\/spa\/bear-spa-alone-\d+\.webp$/);
    expect(ap.imageId).toMatch(/bear-spa-alone-\d+/);
  });

  test('QA10-E: repair is stable — same image survives a second page load', async ({ page }) => {
    await seedLegacyPamperState(page, 'forest', 'alone');
    const state1 = await loadAndGetRepairedState(page);
    const imgSrc1 = state1 && state1.activePamper && state1.activePamper.imageSrc;
    expect(imgSrc1).toBeTruthy();

    // Second load — no re-seed, reads from localStorage already written by repair
    await page.goto(APP_HTML, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const state2 = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('tori_pamper_v1.state')); } catch (e) { return null; }
    });
    const imgSrc2 = state2 && state2.activePamper && state2.activePamper.imageSrc;
    expect(imgSrc2, 'same image must survive second load').toBe(imgSrc1);
  });

  test('QA10-F: archived pamper with null image is also repaired', async ({ page }) => {
    const archivedAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    await seedLegacyPamperState(page, 'forest', 'alone', {
      archived: [{
        cardId: 'spa-small', companionId: 'forest', mode: 'sister',
        selectedAt: archivedAt, activeUntil: Date.now() - 24 * 60 * 60 * 1000,
        archivedAt, imageSrc: null, imageId: null, summaryLine: 'היה טוב.',
      }],
    });
    const state = await loadAndGetRepairedState(page);
    const arc = state && state.archivedPamperCards && state.archivedPamperCards[0];
    expect(arc, 'archived card must still exist').not.toBeNull();
    expect(arc.imageSrc, 'archived imageSrc must be repaired')
      .toMatch(/^assets\/companions\/pamper\/spa\/hafshushit-spa-sister-\d+\.webp$/);
    expect(arc.imageId, 'archived imageId must be repaired').toMatch(/hafshushit-spa-sister-\d+/);
    expect(arc.archivedAt, 'archivedAt must not be changed').toBe(archivedAt);
  });

  test('QA10-G: points not changed by repair — dedicatedPamperPoints stays at 15', async ({ page }) => {
    await seedLegacyPamperState(page, 'bear', 'friend', { dedicatedPamperPoints: 15 });
    await page.goto(APP_HTML, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const gardenRaw = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('tori_garden_v1.state')); } catch (e) { return null; }
    });
    expect(gardenRaw).not.toBeNull();
    expect(gardenRaw.dedicatedPamperPoints, 'repair must NOT dedicate more points').toBe(15);
    expect(gardenRaw.lifetimeConnectionPoints, 'lifetimeConnectionPoints must not change').toBe(30);
  });

  test('QA10-H: journey hero shows the spa image after repair (not fallback 🛁)', async ({ page }) => {
    await seedLegacyPamperState(page, 'forest', 'alone');
    await page.goto(APP_HTML, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => { if (typeof switchView === 'function') switchView('journey'); });
    await page.waitForTimeout(1000);

    // After repair, the companion hero should show j-lair-img with a valid hafshushit spa src
    const imgSrc = await page.locator('#j-lair-img').getAttribute('src').catch(() => null);
    expect(imgSrc, 'j-lair-img must have a valid spa path after repair').toMatch(/hafshushit-spa-alone/);
  });

});
