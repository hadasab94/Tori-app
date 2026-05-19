// patch14.js — Add "החלף דמות" switch button to companion screen
//
// Changes:
//   1. Add switchJourneyCompanion() function — pre-selects current, shows select screen
//   2. Add cs._switching flag so renderJourneyTab shows select without nulling companionId
//   3. Clear cs._switching in doConfirmJourneyCompanion
//   4. Add switch button to buildCompanionTopCardHTML
//   5. CSS for the switch button

const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ─────────────────────────────────────────────────────
// 1. CSS — switch button link style
// ─────────────────────────────────────────────────────
const NEW_CSS = `
/* ===== COMPANION SWITCH BUTTON ===== */
.j-switch-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--g-ink-3);
  background: rgba(70,55,30,0.07);
  border: none;
  border-radius: 999px;
  padding: 5px 11px;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(0,0,0,0.04);
  transition: background 0.15s, color 0.15s;
  font-family: 'Assistant', sans-serif;
}
.j-switch-btn:active {
  background: rgba(70,55,30,0.14);
  color: var(--g-ink-2);
}
`;

const styleClose = html.lastIndexOf('</style>');
html = html.slice(0, styleClose) + NEW_CSS + html.slice(styleClose);
console.log('✓ CSS added');

// ─────────────────────────────────────────────────────
// 2. Add switchJourneyCompanion() function before last </script>
// ─────────────────────────────────────────────────────
const SWITCH_JS = `
// ── Switch companion — shows select screen without losing current companion ──
function switchJourneyCompanion() {
  cs._pendingId = cs.companionId; // pre-select current companion in the grid
  cs._switching = true;           // flag: show select screen even if companion is set
  renderJourneyTab();
  // Scroll to top of journey inner
  var inner = document.getElementById('journey-inner');
  if (inner) inner.scrollTop = 0;
}
`;

const lastScript = html.lastIndexOf('</script>');
html = html.slice(0, lastScript) + SWITCH_JS + html.slice(lastScript);
console.log('✓ switchJourneyCompanion() added');

// ─────────────────────────────────────────────────────
// 3. Update renderJourneyTab — respect cs._switching flag
// ─────────────────────────────────────────────────────
const OLD_RENDER = `function renderJourneyTab() {
  var inner = document.getElementById('journey-inner');
  if (!inner) return;
  if (!cs.companionId) {
    renderCompanionSelectDOM(inner);
  } else {
    inner.innerHTML = buildJourneyMainHTML();
  }
}`;

const NEW_RENDER = `function renderJourneyTab() {
  var inner = document.getElementById('journey-inner');
  if (!inner) return;
  if (!cs.companionId || cs._switching) {
    renderCompanionSelectDOM(inner);
  } else {
    inner.innerHTML = buildJourneyMainHTML();
  }
}`;

if (html.includes(OLD_RENDER)) {
  html = html.replace(OLD_RENDER, NEW_RENDER);
  console.log('✓ renderJourneyTab updated (respects _switching flag)');
} else {
  console.error('✗ renderJourneyTab not found');
  process.exit(1);
}

// ─────────────────────────────────────────────────────
// 4. Update doConfirmJourneyCompanion — clear _switching flag on confirm
// ─────────────────────────────────────────────────────
const OLD_CONFIRM_LINE = `  cs._pendingId = null;
  saveCompanionState();
  cancelJourneyConfirm();`;

const NEW_CONFIRM_LINE = `  cs._pendingId = null;
  cs._switching = false; // clear switch mode
  saveCompanionState();
  cancelJourneyConfirm();`;

if (html.includes(OLD_CONFIRM_LINE)) {
  html = html.replace(OLD_CONFIRM_LINE, NEW_CONFIRM_LINE);
  console.log('✓ doConfirmJourneyCompanion clears _switching');
} else {
  console.error('✗ doConfirmJourneyCompanion confirm line not found');
}

// ─────────────────────────────────────────────────────
// 5. Update buildCompanionTopCardHTML — add switch button in top row
// ─────────────────────────────────────────────────────
const OLD_TOP = `function buildCompanionTopCardHTML(c, today) {
  return '<div style="padding:4px 4px 0">'
    +'<div style="font-size:12px;color:var(--g-ink-3);margin-bottom:6px;letter-spacing:0.3px">'+today+' · '+c.name+' איתך</div>'
    +'<div class="serif" style="font-size:30px;line-height:1.1;font-weight:500;color:var(--g-ink);margin-bottom:8px">המסע של היום</div>'
    +'<div style="font-size:14.5px;line-height:1.55;color:var(--g-ink-2);max-width:320px">אנחנו פשוט עוברים את היום עם נוכחות אחת קטנה לידנו.</div>'
    +'</div>';
}`;

const NEW_TOP = `function buildCompanionTopCardHTML(c, today) {
  return '<div style="padding:4px 4px 0">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
    +'<div style="font-size:12px;color:var(--g-ink-3);letter-spacing:0.3px">'+today+' · '+c.name+' איתך</div>'
    +'<button type="button" class="j-switch-btn" onclick="switchJourneyCompanion()">החלף דמות</button>'
    +'</div>'
    +'<div class="serif" style="font-size:30px;line-height:1.1;font-weight:500;color:var(--g-ink);margin-bottom:8px">המסע של היום</div>'
    +'<div style="font-size:14.5px;line-height:1.55;color:var(--g-ink-2);max-width:320px">אנחנו פשוט עוברים את היום עם נוכחות אחת קטנה לידנו.</div>'
    +'</div>';
}`;

if (html.includes(OLD_TOP)) {
  html = html.replace(OLD_TOP, NEW_TOP);
  console.log('✓ buildCompanionTopCardHTML: switch button added');
} else {
  console.error('✗ buildCompanionTopCardHTML not found');
  process.exit(1);
}

// ─────────────────────────────────────────────────────
// 6. Write + verify
// ─────────────────────────────────────────────────────
fs.writeFileSync('body-soul-app.html', html, 'utf8');

const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || [];
let allJS = '';
scripts.forEach(function(s) {
  allJS += s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '') + '\n';
});
fs.writeFileSync('_tmp_check14.js', allJS, 'utf8');
const { execSync } = require('child_process');
try {
  execSync('node --check _tmp_check14.js', { stdio: 'pipe' });
  console.log('✓ Syntax OK');
} catch (e) {
  console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0, 5).join('\n'));
}
try { fs.unlinkSync('_tmp_check14.js'); } catch (e) {}
console.log('Done. Size:', Buffer.byteLength(html), 'bytes');
