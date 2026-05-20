# QA System — תורי

Permanent automated QA for the תורי app.

---

## Quick Start

```bash
# Test the live GitHub Pages site
node qa/qa-runner.js

# Test a local dev server (must be running on port 7777)
npx serve -l 7777 &
node qa/qa-runner.js --local

# Test only one suite
node qa/qa-runner.js --suite QA3

# Run with visible browser (debug mode)
node qa/qa-runner.js --headed
```

After each run:
- `qa/QA_REPORT.md` — full pass/fail results
- `qa/REPAIR_PROMPT.md` — ready-to-paste repair prompt (only created when tests fail)

---

## Rules

| Rule | Value |
|---|---|
| Auto-fix bugs? | ❌ Never |
| Auto-commit? | ❌ Never |
| Auto-deploy? | ❌ Never |
| Generates report? | ✅ Always |
| Generates repair prompt? | ✅ When failures found |

---

## Test Suites

| Suite | Description | Tests |
|---|---|---|
| **QA1** | Smoke — app loads, correct tabs present | A–F |
| **QA2** | Stale content — no forbidden visible text | A–B |
| **QA3** | Companion selection — full 11-step flow | A–K |
| **QA4** | Card structure — only radio hitarea selects | A–F |
| **QA5** | Journey screen after selection | A–D |
| **QA6** | Action buttons — each chip produces a response | A–E |
| **QA7** | Water drops — visible, clickable, no double-count | A–D |
| **QA8** | Compassion day — modal, cancel, activation | A–D |
| **QA9** | RTL & mobile — 390×844, no scroll, text direction | A–F |

---

## Stale Content Checked (QA2)

These strings must NOT be visible in any view:

- `אבנים` · `אבני דרך`
- `גינה` · `גינת האור` · `פרחים`
- `garden` · `stones` · `milestone`
- `בוט תורי`
- `WhatsApp` · `צ'אט`

---

## How to Fix a Failure

1. Run `node qa/qa-runner.js` to generate `qa/REPAIR_PROMPT.md`
2. Open a new Claude Code session
3. Paste the contents of `qa/REPAIR_PROMPT.md` as your first message
4. Claude Code will suggest a fix to `body-soul-app.html`
5. Review the fix
6. Re-run: `node qa/qa-runner.js --local` to verify locally
7. If all tests pass, commit and push manually

---

## File Structure

```
qa/
  tori-qa.spec.js           # Main QA spec — 9 suites
  qa-runner.js              # Run this to execute tests and generate reports
  helpers.js                # gotoApp, goToJourneyTab (shared helpers)
  QA_REPORT.md              # Auto-generated after each run
  REPAIR_PROMPT.md          # Auto-generated when tests fail
  README.md                 # This file
  tori-companion-selection.spec.js  # Original companion selection spec (legacy)
  tori-smoke.spec.js        # Original smoke spec (legacy)
playwright.config.js        # Playwright config — targets live GitHub Pages
playwright.local.config.js  # Playwright config — targets localhost:7777
```

---

## package.json scripts

```bash
npm run qa:permanent         # node qa/qa-runner.js  (live site)
npm run qa:permanent:local   # node qa/qa-runner.js --local
```

---

## Technical Notes

- **Auth bypass**: `page.addInitScript()` seeds `user:session` + `user:profile` in localStorage before any app JS runs
- **Service workers**: blocked via `serviceWorkers: 'block'` in Playwright config (prevents reload race)
- **`cs` is `let`**: `cs` (companion state) is declared with `let` at script scope — NOT on `window`. Always access as `cs._pendingId`, never `window.cs`
- **Companion localStorage key**: `tori_companion_v1.state`
- **Compassion localStorage key**: `compassion:state`
- **Action response area**: `#j-action-response` inside `buildCompanionActionsHTML()`
- **Browser**: Chromium only (`browserName: 'chromium'`). WebKit is not installed.
- **Viewport**: 390×844 with `isMobile: true, hasTouch: true`
