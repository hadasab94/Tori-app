var fs = require('fs');
var content = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
var crlf = content.indexOf('\r\n') !== -1;
var NL = crlf ? '\r\n' : '\n';
console.log('line ending:', crlf ? 'CRLF' : 'LF', '| size:', content.length);

// ── 1. REPLACE CD WINS CSS BLOCK ─────────────────────────────────────────────
var cssOld = '.cd-wins-title {' + NL
  + '  font-size: 15px; font-weight: 700;' + NL
  + '  color: #4A2C7A; margin-bottom: 10px;' + NL
  + '}' + NL
  + '.cd-wins-grid {' + NL
  + '  display: flex; flex-wrap: wrap; gap: 8px;' + NL
  + '  margin-bottom: 12px;' + NL
  + '}' + NL
  + '.compassion-win-card {' + NL
  + '  display: flex; align-items: flex-start; gap: 6px;' + NL
  + '  background: #F0E8FF;' + NL
  + '  border: 1.5px solid rgba(107,76,154,0.18);' + NL
  + '  border-radius: 16px; padding: 10px 14px;' + NL
  + '  font-size: 13px; color: #5A3A8A;' + NL
  + '  font-family: inherit; cursor: pointer;' + NL
  + '  text-align: right; line-height: 1.5;' + NL
  + '  transition: background 0.15s, border-color 0.15s;' + NL
  + '  width: 100%;' + NL
  + '  touch-action: manipulation;' + NL
  + '}' + NL
  + '.compassion-win-card.done {' + NL
  + '  background: #DDD0FF;' + NL
  + '  border-color: rgba(107,76,154,0.35);' + NL
  + '  color: #3A1A6A;' + NL
  + '}' + NL
  + '.cd-win-check {' + NL
  + '  flex-shrink: 0; font-size: 14px;' + NL
  + '  color: #6B4C9A; font-weight: 700;' + NL
  + '  margin-top: 1px;' + NL
  + '}' + NL
  + '.cd-win-text { flex: 1; }';

if (content.indexOf(cssOld) === -1) { console.error('CSS block not found'); process.exit(1); }

var cssNew = '.cd-wins-title {' + NL
  + '  font-size: 15px; font-weight: 700;' + NL
  + '  color: #4A2C7A; margin-bottom: 12px;' + NL
  + '}' + NL
  + '.cd-wins-grid {' + NL
  + '  display: grid;' + NL
  + '  grid-template-columns: repeat(2, 1fr);' + NL
  + '  gap: 9px;' + NL
  + '  margin-bottom: 14px;' + NL
  + '}' + NL
  + '.compassion-win-card {' + NL
  + '  display: flex; flex-direction: column;' + NL
  + '  align-items: center; justify-content: center;' + NL
  + '  text-align: center;' + NL
  + '  background: #F2ECFF;' + NL
  + '  border: 1px solid rgba(140,110,200,0.14);' + NL
  + '  border-radius: 20px; padding: 14px 12px 10px;' + NL
  + '  font-size: 13px; color: #5A3A8A;' + NL
  + '  font-family: inherit; cursor: pointer;' + NL
  + '  line-height: 1.55;' + NL
  + '  transition: background 0.14s, border-color 0.14s, transform 0.1s;' + NL
  + '  touch-action: manipulation; min-height: 72px;' + NL
  + '}' + NL
  + '.compassion-win-card:active { transform: scale(0.96); }' + NL
  + '.compassion-win-card.done {' + NL
  + '  background: #D8CCFF;' + NL
  + '  border-color: rgba(107,76,154,0.28);' + NL
  + '  color: #3A1A6A;' + NL
  + '}' + NL
  + '.cd-win-text { font-size: 13px; line-height: 1.55; }' + NL
  + '.cd-win-collected {' + NL
  + '  font-size: 11px; color: #6B4C9A; font-weight: 600;' + NL
  + '  margin-top: 6px; opacity: 0.88;' + NL
  + '}';

content = content.replace(cssOld, cssNew);
console.log('CSS wins block replaced');

// ── 2. REPLACE WINS HTML LOOP (default wins) ─────────────────────────────────
var winsOld = "winsHTML += '<button class=\"compassion-win-card' + (done ? ' done' : '') + '\" onclick=\"tapCompassionWin(' + idx + ')\">'" + NL
  + "              + (done ? '<span class=\"cd-win-check\">✓</span>' : '')" + NL
  + "              + '<span class=\"cd-win-text\">' + _escH(text) + '</span>'" + NL
  + "              + '</button>';";
if (content.indexOf(winsOld) === -1) { console.error('winsHTML loop not found'); process.exit(1); }

var winsNew = "winsHTML += '<button class=\"compassion-win-card' + (done ? ' done' : '') + '\" onclick=\"tapCompassionWin(' + idx + ')\">'" + NL
  + "              + '<div class=\"cd-win-text\">' + _escH(text) + '</div>'" + NL
  + "              + (done ? '<div class=\"cd-win-collected\">נאסף ✨</div>' : '')" + NL
  + "              + '</button>';";
content = content.replace(winsOld, winsNew);
console.log('winsHTML loop updated');

// ── 3. REPLACE CUSTOM WINS HTML LOOP ─────────────────────────────────────────
var customOld = "customHTML += '<button class=\"compassion-win-card done\" onclick=\"tapCustomCompassionWin(\\'' + cw.id + '\\')\">'" + NL
  + "             + '<span class=\"cd-win-check\">✓</span>'" + NL
  + "             + '<span class=\"cd-win-text\">' + _escH(cw.text) + '</span>'" + NL
  + "             + '</button>';";
if (content.indexOf(customOld) === -1) { console.error('customHTML loop not found'); process.exit(1); }

var customNew = "customHTML += '<button class=\"compassion-win-card done\" onclick=\"tapCustomCompassionWin(\\'' + cw.id + '\\')\">'" + NL
  + "             + '<div class=\"cd-win-text\">' + _escH(cw.text) + '</div>'" + NL
  + "             + '<div class=\"cd-win-collected\">נאסף ✨</div>'" + NL
  + "             + '</button>';";
content = content.replace(customOld, customNew);
console.log('customHTML loop updated');

// ── 4. VERSION MARKER ────────────────────────────────────────────────────────
content = content.replace(
  /<!-- Tori version: [^>]+ -->/,
  '<!-- Tori version: victory-notes-2026-05-29 -->'
);
console.log('version marker bumped');

// ── WRITE ─────────────────────────────────────────────────────────────────────
fs.writeFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', content, 'utf8');
console.log('written. bytes:', content.length);

// ── VERIFY ───────────────────────────────────────────────────────────────────
var v = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
console.log('\n── VERIFY ──');
console.log('grid-template-columns:', v.indexOf('grid-template-columns: repeat(2, 1fr)') !== -1);
console.log('flex-direction: column:', v.indexOf('flex-direction: column') !== -1);
console.log('text-align: center:', v.indexOf('text-align: center') !== -1);
console.log('.cd-win-collected:', v.indexOf('.cd-win-collected') !== -1);
console.log('min-height: 72px:', v.indexOf('min-height: 72px') !== -1);
console.log('cd-win-text div (wins):', v.indexOf('<div class=\"cd-win-text\">') !== -1);
console.log('cd-win-collected div (wins):', v.indexOf('<div class=\"cd-win-collected\">') !== -1);
console.log('old cd-win-check span GONE:', v.indexOf('<span class="cd-win-check">') === -1);
console.log('old width:100% GONE:', v.indexOf('  width: 100%;') === -1);
console.log('COMPASSION_DAY_WINS bank untouched:', v.indexOf('var COMPASSION_DAY_WINS') !== -1);
console.log('renderCompassionDay exists:', v.indexOf('function renderCompassionDay') !== -1);
console.log('tapCompassionWin exists:', v.indexOf('function tapCompassionWin') !== -1);
console.log('version marker:', v.match(/<!-- Tori version: [^>]+ -->/)[0]);
