// patch15.js — Remove "בוט תורי" tab entirely from the app
//
// Changes:
//   1. Remove bot chat CSS block (active#view-bot rule + all .bot-* classes)
//   2. Remove <!-- BOT VIEW --> comment + view-bot div from HTML
//   3. Remove nav-bot item from bottom nav
//   4. Update switchView() — remove bot branch, redirect 'bot' → 'journey' (safety)
//   5. Stub updateBotUI(), updateBotBadge(), async initBot() → no-ops
//      (keep bp, bs.compassionDay, bs.quietMode, loadBotData, saveBotData, onboarding JS)

const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ─────────────────────────────────────────────────────
// 1. Remove bot chat CSS block
//    From: .view.active#view-bot { ... }
//    To:   (just before /* ONBOARDING */)
// ─────────────────────────────────────────────────────
const BOT_CSS_START = '.view.active#view-bot { display: flex !important; flex-direction: column; height: calc(100vh - 110px); }';
const BOT_CSS_END_MARKER = '/* ONBOARDING */';

const botCSSIdx = html.indexOf(BOT_CSS_START);
const obCSSIdx = html.indexOf(BOT_CSS_END_MARKER);

if (botCSSIdx === -1) {
  console.error('✗ Bot CSS start not found');
  process.exit(1);
}
if (obCSSIdx === -1) {
  console.error('✗ Onboarding CSS marker not found');
  process.exit(1);
}
if (botCSSIdx >= obCSSIdx) {
  console.error('✗ Bot CSS start is after onboarding CSS marker — unexpected');
  process.exit(1);
}

// Remove: from BOT_CSS_START up to (not including) BOT_CSS_END_MARKER
// Keep the newline before /* ONBOARDING */
html = html.slice(0, botCSSIdx) + html.slice(obCSSIdx);
console.log('✓ Bot CSS removed (' + (obCSSIdx - botCSSIdx) + ' chars)');

// ─────────────────────────────────────────────────────
// 2. Remove <!-- BOT VIEW --> + view-bot div
//    From: \n\n<!-- BOT VIEW -->
//    To:   just before \n<!-- ONBOARDING -->
// ─────────────────────────────────────────────────────
const BOT_VIEW_START = '\n\n<!-- BOT VIEW -->\n';
const BOT_VIEW_END_MARKER = '\n<!-- ONBOARDING -->';

const botViewIdx = html.indexOf(BOT_VIEW_START);
const obHtmlIdx = html.indexOf(BOT_VIEW_END_MARKER);

if (botViewIdx === -1) {
  console.error('✗ <!-- BOT VIEW --> comment not found');
  process.exit(1);
}
if (obHtmlIdx === -1) {
  console.error('✗ <!-- ONBOARDING --> marker not found');
  process.exit(1);
}

// Remove from <!-- BOT VIEW --> up to (not including) \n<!-- ONBOARDING -->
html = html.slice(0, botViewIdx) + html.slice(obHtmlIdx);
console.log('✓ view-bot div removed (' + (obHtmlIdx - botViewIdx) + ' chars)');

// ─────────────────────────────────────────────────────
// 3. Remove nav-bot item from nav HTML
// ─────────────────────────────────────────────────────
const NAV_BOT_ITEM = '  <div class="nav-item" id="nav-bot" onclick="switchView(\'bot\')">\n    <div class="nav-icon">🤖</div><div class="nav-label">בוט תורי</div>\n    <div class="bot-badge" id="bot-badge">0</div>\n  </div>';

if (html.includes(NAV_BOT_ITEM)) {
  html = html.replace(NAV_BOT_ITEM, '');
  console.log('✓ nav-bot item removed');
} else {
  console.error('✗ nav-bot item not found');
  process.exit(1);
}

// ─────────────────────────────────────────────────────
// 4. Update switchView() — remove bot branch, add 'bot' redirect
// ─────────────────────────────────────────────────────
const OLD_SWITCH = `function switchView(v) {
  document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  document.getElementById('nav-'+v).classList.add('active');
  if(v==='journey'){updateJourney();setTimeout(checkWildReveal,400);setTimeout(checkAndShowCompanion,50);}
  if(v==='bot') {
    bs.unreadCount=0; updateBotBadge();
    if(!bs.botInited) initBot();
  }
}`;

const NEW_SWITCH = `function switchView(v) {
  if (v === 'bot') v = 'journey'; // bot tab removed — redirect to journey
  document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  var viewEl = document.getElementById('view-'+v);
  var navEl  = document.getElementById('nav-'+v);
  if (viewEl) viewEl.classList.add('active');
  if (navEl)  navEl.classList.add('active');
  if (v==='journey'){updateJourney();setTimeout(checkWildReveal,400);setTimeout(checkAndShowCompanion,50);}
}`;

if (html.includes(OLD_SWITCH)) {
  html = html.replace(OLD_SWITCH, NEW_SWITCH);
  console.log('✓ switchView() updated (bot redirect added)');
} else {
  console.error('✗ switchView() not found');
  process.exit(1);
}

// ─────────────────────────────────────────────────────
// 5a. Stub updateBotUI() — called from activateCompassionDay, keep as no-op
// ─────────────────────────────────────────────────────
const OLD_UPDATE_BOT_UI = `function updateBotUI() {
  const pq=document.getElementById('pill-quiet'), pc=document.getElementById('pill-comp'), st=document.getElementById('bot-st');
  if(pq) pq.classList.toggle('on',bs.quietMode);
  if(pc) pc.classList.toggle('on',bs.compassionDay);
  if(st) st.textContent=bs.quietMode?'🤫 מצב שקט':bs.compassionDay?'🫶 יום חמלה':'חברה טובה שמזכירה';
}`;

const NEW_UPDATE_BOT_UI = `function updateBotUI() { /* bot tab removed — no-op stub */ }`;

if (html.includes(OLD_UPDATE_BOT_UI)) {
  html = html.replace(OLD_UPDATE_BOT_UI, NEW_UPDATE_BOT_UI);
  console.log('✓ updateBotUI() stubbed');
} else {
  console.error('✗ updateBotUI() not found — skipping');
}

// ─────────────────────────────────────────────────────
// 5b. Stub updateBotBadge() — nav badge element removed, keep as no-op
// ─────────────────────────────────────────────────────
const OLD_BOT_BADGE = `function updateBotBadge() {
  const badge=document.getElementById('bot-badge'); if(!badge) return;
  if(bs.unreadCount>0) { badge.textContent=bs.unreadCount>9?'9+':bs.unreadCount; badge.classList.add('show'); }
  else { badge.classList.remove('show'); }
}`;

const NEW_BOT_BADGE = `function updateBotBadge() { /* bot tab removed — no-op stub */ }`;

if (html.includes(OLD_BOT_BADGE)) {
  html = html.replace(OLD_BOT_BADGE, NEW_BOT_BADGE);
  console.log('✓ updateBotBadge() stubbed');
} else {
  console.error('✗ updateBotBadge() not found — skipping');
}

// ─────────────────────────────────────────────────────
// 5c. Stub async initBot() — no longer called, stub to no-op
// ─────────────────────────────────────────────────────
(function() {
  const start = html.indexOf('async function initBot()');
  if (start === -1) { console.log('~ initBot() not found'); return; }
  const end = html.indexOf('\n}', start) + 2;
  html = html.slice(0, start)
    + 'async function initBot() { /* bot tab removed — no-op stub */ }'
    + html.slice(end);
  console.log('✓ initBot() stubbed');
})();

// ─────────────────────────────────────────────────────
// 6. Write + verify
// ─────────────────────────────────────────────────────
fs.writeFileSync('body-soul-app.html', html, 'utf8');

// Syntax check
const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || [];
let allJS = '';
scripts.forEach(function(s) {
  allJS += s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '') + '\n';
});
fs.writeFileSync('_tmp_check15.js', allJS, 'utf8');
const { execSync } = require('child_process');
try {
  execSync('node --check _tmp_check15.js', { stdio: 'pipe' });
  console.log('✓ Syntax OK');
} catch (e) {
  console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0, 5).join('\n'));
}
try { fs.unlinkSync('_tmp_check15.js'); } catch (e) {}

// Verify: no view-bot or nav-bot references remain in the active DOM
const checks = [
  { label: 'view-bot div absent', absent: true,  needle: 'id="view-bot"' },
  { label: 'nav-bot absent',      absent: true,  needle: 'id="nav-bot"' },
  { label: 'bot-badge absent',    absent: true,  needle: 'id="bot-badge"' },
  { label: 'ob-ov present',       absent: false, needle: 'class="ob-ov"' },
  { label: 'bp.quickFoods present', absent: false, needle: 'quickFoods' },
  { label: 'loadBotData present', absent: false, needle: 'async function loadBotData()' },
];
console.log('\n--- Verification ---');
checks.forEach(function(c) {
  var found = html.includes(c.needle);
  var ok = c.absent ? !found : found;
  console.log((ok ? '✓' : '✗') + ' ' + c.label);
});

console.log('\nDone. Size:', Buffer.byteLength(html), 'bytes');
