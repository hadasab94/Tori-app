// qa/helpers.js
// Shared helpers for Tori QA tests

// Supports both the live GitHub Pages site and a local dev server.
// When running with playwright.local.config.js, baseURL is http://localhost:7777/
// When running with playwright.config.js, baseURL is https://hadasab94.github.io/Tori-app/
// The APP_HTML path is always body-soul-app.html (relative to base).
const APP_HTML = 'body-soul-app.html';

/**
 * Navigate to the app with a pre-seeded auth session so the auth screen
 * is bypassed. Uses addInitScript so localStorage is set BEFORE any app
 * JS runs.
 *
 * Seeds:
 *   user:session  → valid session expiring 30 days from now
 *   user:profile  → minimal profile { name: 'QA', password: '' }
 *   (clears tori_companion_v1.state so every test starts without a companion)
 */
async function gotoApp(page) {
  await page.addInitScript(() => {
    try {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('user:session',  JSON.stringify({ expiry }));
      localStorage.setItem('user:profile',  JSON.stringify({ name: 'QA', password: '' }));
      localStorage.removeItem('tori_companion_v1.state');
    } catch(e) {}
  });
  // Resolve URL relative to baseURL set in playwright config
  const base = page.context().browser()._options?.args?.join?.(' ') || '';
  // Use page.goto with the html file — Playwright resolves relative to baseURL
  await page.goto(APP_HTML, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}

/**
 * Navigate to the journey tab using switchView('journey').
 * Waits until the companion select screen (or journey main) is visible.
 */
async function goToJourneyTab(page) {
  await page.evaluate(() => {
    if (typeof switchView === 'function') {
      switchView('journey');
    } else {
      const el = document.getElementById('nav-journey');
      if (el) el.click();
    }
  });

  // Wait for #view-journey to be active AND #jcs-card-list to exist
  await page.waitForFunction(() => {
    const view = document.getElementById('view-journey');
    return view && view.classList.contains('active');
  }, { timeout: 5000 });

  // Also wait for the companion card list (or journey main content) to appear
  await page.waitForFunction(() => {
    return !!document.getElementById('jcs-card-list') ||
           !!document.getElementById('journey-inner')?.children.length;
  }, { timeout: 5000 });

  // Final settle: async renderJourneyTab chain + checkAndShowCompanion (50ms in app)
  await page.waitForTimeout(600);
}

/**
 * Dump the companion selection DOM state for debugging.
 */
async function dumpCompanionSelectState(page) {
  return await page.evaluate(() => {
    const result = {
      journeyInnerExists: !!document.getElementById('journey-inner'),
      cardListExists: !!document.getElementById('jcs-card-list'),
      cards: [],
      hitareas: [],
      csState: null,
    };

    try {
      if (window.cs) {
        result.csState = {
          companionId: window.cs.companionId,
          _pendingId: window.cs._pendingId,
          _switching: window.cs._switching,
        };
      }
    } catch(e) { result.csState = 'error: ' + e.message; }

    const list = document.getElementById('jcs-card-list');
    if (!list) return result;

    list.querySelectorAll('.jcc-btn').forEach(function(card) {
      const dataId = card.getAttribute('data-id');
      const tagName = card.tagName;
      const hitarea = card.querySelector('.jcc-radio-hitarea');
      const radio = card.querySelector('.jcc-radio');

      result.cards.push({
        tagName: tagName,
        dataId: dataId,
        isButton: tagName === 'BUTTON',
        hasHitarea: !!hitarea,
        hasRadio: !!radio,
        radioHasOn: radio ? radio.classList.contains('on') : null,
        nestedButtons: card.querySelectorAll('button').length,
      });

      if (hitarea) {
        const rect = hitarea.getBoundingClientRect();
        const style = window.getComputedStyle(hitarea);
        result.hitareas.push({
          dataId: dataId,
          ariaLabel: hitarea.getAttribute('aria-label'),
          ariaChecked: hitarea.getAttribute('aria-checked'),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          right: Math.round(window.innerWidth - rect.right),
          zIndex: style.zIndex,
          pointerEvents: style.pointerEvents,
          tagName: hitarea.tagName,
          dataCompanionId: hitarea.getAttribute('data-companion-id'),
          hasOnclick: !!hitarea.onclick,
        });
      }
    });

    // elementFromPoint check on first hitarea
    if (result.hitareas.length > 0) {
      const h = result.hitareas[0];
      const x = window.innerWidth - h.right - (h.width / 2);
      const y = h.top + (h.height / 2);
      const el = document.elementFromPoint(x, y);
      result.elementFromPointFirst = el ? {
        tagName: el.tagName,
        className: el.className,
        id: el.id,
      } : null;
      result.elementFromPointCoords = { x: Math.round(x), y: Math.round(y) };
    }

    return result;
  });
}

module.exports = { gotoApp, goToJourneyTab, dumpCompanionSelectState, APP_HTML };
