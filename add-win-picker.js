var fs = require('fs');
var content = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
var NL = '\r\n';
console.log('size:', content.length);

function rep(old, nw, label) {
  if (content.indexOf(old) === -1) { console.error('NOT FOUND: ' + label); process.exit(1); }
  content = content.replace(old, nw);
  console.log('OK:', label);
}

// ── 1. UPDATE cd DEFAULTS ────────────────────────────────────────────────────
rep(
  'let cd = { active: false, daysUsed: 0, startDate: null, wins: {}, visibleWins: [], customWins: [] };',
  'let cd = { active: false, daysUsed: 0, startDate: null, wins: {}, visibleWins: [], customWins: [], currentSuggestedWin: null };',
  'cd defaults + currentSuggestedWin'
);

// ── 2. UPDATE loadCompassionWins — load currentSuggestedWin ──────────────────
rep(
  '     cd.customWins  = d.customWins  || [];' + NL + '    } else {',
  '     cd.customWins  = d.customWins  || [];' + NL
  + '      cd.currentSuggestedWin = (typeof d.currentSuggestedWin === \'number\') ? d.currentSuggestedWin : null;' + NL
  + '    } else {',
  'loadCompassionWins + currentSuggestedWin'
);

// ── 3. UPDATE saveCompassionWins — save currentSuggestedWin ──────────────────
rep(
  'await store.set(_cdWinsKey, JSON.stringify({' + NL
  + '    wins:        cd.wins        || {},' + NL
  + '    visibleWins: cd.visibleWins || [],' + NL
  + '    customWins:  cd.customWins  || [],' + NL
  + '  }));',

  'await store.set(_cdWinsKey, JSON.stringify({' + NL
  + '    wins:               cd.wins               || {},' + NL
  + '    visibleWins:        cd.visibleWins        || [],' + NL
  + '    customWins:         cd.customWins         || [],' + NL
  + '    currentSuggestedWin: (typeof cd.currentSuggestedWin === \'number\') ? cd.currentSuggestedWin : null,' + NL
  + '  }));',
  'saveCompassionWins + currentSuggestedWin'
);

// ── 4. ADD CSS — win picker new classes ──────────────────────────────────────
var cssAnchor = '.cd-win-collected {' + NL
  + '  font-size: 11px; color: #7A5A2E; font-weight: 600;' + NL
  + '  margin-top: 6px; opacity: 0.90;' + NL
  + '}';
if (content.indexOf(cssAnchor) === -1) { console.error('css anchor not found'); process.exit(1); }

var newCSS = NL
  + '.cd-wins-subtitle {' + NL
  + '  font-size: 12px; color: #7A6E5C; line-height: 1.5; margin-bottom: 14px;' + NL
  + '}' + NL
  + '.cd-win-picker { margin-bottom: 14px; }' + NL
  + '.cd-win-card-main {' + NL
  + '  position: relative;' + NL
  + '  display: flex; flex-direction: column;' + NL
  + '  align-items: center; justify-content: center;' + NL
  + '  text-align: center;' + NL
  + '  background: #FFF3C4;' + NL
  + '  border: 1px solid rgba(205,178,70,0.28);' + NL
  + '  border-radius: 22px;' + NL
  + '  padding: 32px 20px 16px;' + NL
  + '  font-size: 14.5px; color: #4F4638; line-height: 1.65;' + NL
  + '  box-shadow: 0 3px 10px rgba(140,110,20,0.10), 0 0 0 0.5px rgba(205,178,70,0.14);' + NL
  + '  margin-bottom: 10px; min-height: 96px;' + NL
  + '}' + NL
  + '.cd-win-card-main::before {' + NL
  + '  content: ""; position: absolute; top: 10px; left: 50%;' + NL
  + '  transform: translateX(-50%); width: 12px; height: 12px;' + NL
  + '  border-radius: 50%; background: #D8A7A1;' + NL
  + '  box-shadow: 0 1px 3px rgba(160,80,80,0.22), inset 0 1px 1px rgba(255,255,255,0.45);' + NL
  + '}' + NL
  + '.cd-picker-btns { display: flex; gap: 8px; margin-top: 2px; }' + NL
  + '.cd-collect-btn {' + NL
  + '  flex: 1; padding: 11px 14px; border-radius: 999px; border: none;' + NL
  + '  background: #C8B9E8; color: #3F3558;' + NL
  + '  font-family: inherit; font-size: 13px; font-weight: 600;' + NL
  + '  cursor: pointer; touch-action: manipulation; transition: transform 0.1s;' + NL
  + '}' + NL
  + '.cd-collect-btn:active { transform: scale(0.96); }' + NL
  + '.cd-skip-btn {' + NL
  + '  flex: 1; padding: 11px 14px; border-radius: 999px;' + NL
  + '  border: 1.5px solid rgba(185,158,100,0.38);' + NL
  + '  background: #FFF8EA; color: #5A4830;' + NL
  + '  font-family: inherit; font-size: 13px;' + NL
  + '  cursor: pointer; touch-action: manipulation; transition: transform 0.1s;' + NL
  + '}' + NL
  + '.cd-skip-btn:active { transform: scale(0.96); }' + NL
  + '.cd-all-done {' + NL
  + '  text-align: center; font-size: 13px; color: #7A6E5C; line-height: 1.6;' + NL
  + '  padding: 18px 12px; margin-bottom: 14px;' + NL
  + '  background: #FFFDF7; border-radius: 16px; border: 1px solid rgba(210,190,150,0.40);' + NL
  + '}' + NL
  + '.cd-collected-section { margin-bottom: 14px; }' + NL
  + '.cd-collected-title {' + NL
  + '  font-size: 13px; font-weight: 700; color: #4F4638; margin-bottom: 10px;' + NL
  + '}' + NL
  + '.cd-collected-empty {' + NL
  + '  font-size: 12.5px; color: #7A6E5C; line-height: 1.65; font-style: italic; padding: 4px 0;' + NL
  + '}' + NL
  + '.cd-collected-grid {' + NL
  + '  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;' + NL
  + '}' + NL
  + '.cd-collected-chip {' + NL
  + '  position: relative;' + NL
  + '  display: flex; flex-direction: column;' + NL
  + '  align-items: center; justify-content: center;' + NL
  + '  text-align: center;' + NL
  + '  background: #FFE79E;' + NL
  + '  border: 1px solid rgba(185,140,30,0.38);' + NL
  + '  border-radius: 16px; padding: 20px 10px 8px;' + NL
  + '  font-size: 12px; color: #4A3818; line-height: 1.5; min-height: 58px;' + NL
  + '  box-shadow: 0 1px 4px rgba(140,100,10,0.09);' + NL
  + '}' + NL
  + '.cd-collected-chip::before {' + NL
  + '  content: ""; position: absolute; top: 7px; left: 50%;' + NL
  + '  transform: translateX(-50%); width: 9px; height: 9px;' + NL
  + '  border-radius: 50%; background: #D8A7A1;' + NL
  + '  box-shadow: 0 1px 2px rgba(160,80,80,0.20), inset 0 1px 1px rgba(255,255,255,0.40);' + NL
  + '}';

content = content.replace(cssAnchor, cssAnchor + newCSS);
console.log('OK: CSS new classes added');

// ── 5. ADD NEW JS HELPER FUNCTIONS before renderCompassionDay ────────────────
var rFnAnchor = NL + 'function renderCompassionDay() {';
if (content.indexOf(rFnAnchor) === -1) { console.error('renderCompassionDay anchor not found'); process.exit(1); }

var newFunctions = NL
  // drawNextCompassionWin
  + 'function drawNextCompassionWin() {' + NL
  + '  var marked = Object.keys(cd.wins || {}).map(Number);' + NL
  + '  var pool = [];' + NL
  + '  for (var i = 0; i < COMPASSION_DAY_WINS.length; i++) {' + NL
  + '    if (marked.indexOf(i) === -1) pool.push(i);' + NL
  + '  }' + NL
  + '  if (pool.length === 0) { cd.currentSuggestedWin = -1; return -1; }' + NL
  + '  // Avoid repeating the same note if alternatives exist' + NL
  + '  var curr = cd.currentSuggestedWin;' + NL
  + '  var filtered = (typeof curr === \'number\' && curr >= 0 && pool.length > 1)' + NL
  + '    ? pool.filter(function(i) { return i !== curr; })' + NL
  + '    : pool;' + NL
  + '  var idx = filtered[Math.floor(Math.random() * filtered.length)];' + NL
  + '  cd.currentSuggestedWin = idx;' + NL
  + '  return idx;' + NL
  + '}' + NL
  + NL
  // getCurrentCompassionWin
  + 'function getCurrentCompassionWin() {' + NL
  + '  var marked = Object.keys(cd.wins || {}).map(Number);' + NL
  + '  var curr = cd.currentSuggestedWin;' + NL
  + '  if (typeof curr === \'number\' && curr >= 0 && marked.indexOf(curr) === -1) return curr;' + NL
  + '  return drawNextCompassionWin();' + NL
  + '}' + NL
  + NL
  // collectCurrentCompassionWin
  + 'async function collectCurrentCompassionWin() {' + NL
  + '  var idx = getCurrentCompassionWin();' + NL
  + '  if (idx < 0) return;' + NL
  + '  if (!cd.wins) cd.wins = {};' + NL
  + '  cd.wins[idx] = true;' + NL
  + '  drawNextCompassionWin();' + NL
  + '  await saveCompassionWins();' + NL
  + '  renderCompassionDay();' + NL
  + '}' + NL
  + NL
  // skipCurrentCompassionWin
  + 'function skipCurrentCompassionWin() {' + NL
  + '  drawNextCompassionWin();' + NL
  + '  renderCompassionDay();' + NL
  + '}' + NL;

content = content.replace(rFnAnchor, newFunctions + rFnAnchor);
console.log('OK: new JS helper functions added');

// ── 6. REPLACE renderCompassionDay() ─────────────────────────────────────────
// Find the full function by its distinctive start+end
var oldRenderFn = NL + 'function renderCompassionDay() {' + NL
  + '  var panel = document.getElementById(\'compassion-day-panel\');' + NL
  + '  if (!panel) return;' + NL
  + '  if (!cd.active) { panel.style.display = \'none\'; return; }';

if (content.indexOf(oldRenderFn) === -1) { console.error('renderCompassionDay start not found'); process.exit(1); }
// Find the end of this function — the closing } before // AUTH
var renderStart = content.indexOf(oldRenderFn);
var authIdx = content.indexOf(NL + '// AUTH' + NL, renderStart);
if (authIdx === -1) { console.error('// AUTH anchor not found after renderCompassionDay'); process.exit(1); }

var oldRenderFull = content.slice(renderStart, authIdx);

var newRenderFn = NL
  + 'function renderCompassionDay() {' + NL
  + '  var panel = document.getElementById(\'compassion-day-panel\');' + NL
  + '  if (!panel) return;' + NL
  + '  if (!cd.active) { panel.style.display = \'none\'; return; }' + NL
  + '  panel.style.display = \'\';' + NL
  + '  var c = cs && COMPANIONS[cs.companionId];' + NL
  + '  var compLine = \'\';' + NL
  + '  var compIconHTML = \'<span style="font-size:22px">🫶</span>\';' + NL
  + '  if (c) {' + NL
  + '    compLine = COMPASSION_DAY_COMPANION_LINES[c.id] || COMPASSION_DAY_COMPANION_LINES[cs.companionId] || \'\';' + NL
  + '    var iconSrc = (typeof COMPANION_UI_ICONS !== \'undefined\' && COMPANION_UI_ICONS[c.id]) || \'\';' + NL
  + '    if (iconSrc) compIconHTML = \'<img class="cd-comp-icon" src="\' + iconSrc + \'" alt="\' + c.name + \'">\';' + NL
  + '  }' + NL
  + NL
  + '  // Current suggested win (single note picker)' + NL
  + '  var currentIdx = getCurrentCompassionWin();' + NL
  + '  var currentText = currentIdx >= 0 ? (COMPASSION_DAY_WINS[currentIdx] || \'\') : \'\';' + NL
  + '  var allCollected = currentIdx < 0;' + NL
  + NL
  + '  var pickerHTML = \'\';' + NL
  + '  if (allCollected) {' + NL
  + '    pickerHTML = \'<div class="cd-all-done">אספת את כל הניצחונות הזמינים להיום ✨<br>אפשר עדיין להוסיף ניצחון משלך.</div>\';' + NL
  + '  } else {' + NL
  + '    pickerHTML = \'<div class="cd-win-picker">\'' + NL
  + '      + \'<div class="cd-win-card-main">\'' + NL
  + '      + \'<div class="cd-win-text">\' + _escH(currentText) + \'</div>\'' + NL
  + '      + \'</div>\'' + NL
  + '      + \'<div class="cd-picker-btns">\'' + NL
  + '      + \'<button class="cd-collect-btn" onclick="collectCurrentCompassionWin()">נאסף ✨</button>\'' + NL
  + '      + \'<button class="cd-skip-btn" onclick="skipCurrentCompassionWin()">עוד פתק מצחיק</button>\'' + NL
  + '      + \'</div>\'' + NL
  + '      + \'</div>\';' + NL
  + '  }' + NL
  + NL
  + '  // Collected wins' + NL
  + '  var collectedKeys = Object.keys(cd.wins || {}).map(Number);' + NL
  + '  var customWins = cd.customWins || [];' + NL
  + '  var hasCollected = collectedKeys.length > 0 || customWins.length > 0;' + NL
  + '  var collectedGridHTML = \'\';' + NL
  + '  if (hasCollected) {' + NL
  + '    collectedKeys.forEach(function(idx) {' + NL
  + '      var text = COMPASSION_DAY_WINS[idx] || \'\';' + NL
  + '      collectedGridHTML += \'<div class="cd-collected-chip">\'' + NL
  + '        + \'<div class="cd-win-text">\' + _escH(text) + \'</div>\'' + NL
  + '        + \'<div class="cd-win-collected">נאסף ✨</div>\'' + NL
  + '        + \'</div>\';' + NL
  + '    });' + NL
  + '    customWins.forEach(function(cw) {' + NL
  + '      collectedGridHTML += \'<div class="cd-collected-chip">\'' + NL
  + '        + \'<div class="cd-win-text">\' + _escH(cw.text) + \'</div>\'' + NL
  + '        + \'<div class="cd-win-collected">נאסף ✨</div>\'' + NL
  + '        + \'</div>\';' + NL
  + '    });' + NL
  + '  }' + NL
  + '  var collectedHTML = \'<div class="cd-collected-section">\'' + NL
  + '    + \'<div class="cd-collected-title">נאסף היום</div>\'' + NL
  + '    + (hasCollected' + NL
  + '        ? \'<div class="cd-collected-grid">\' + collectedGridHTML + \'</div>\'' + NL
  + '        : \'<div class="cd-collected-empty">עוד לא נאסף כאן פתק. אפשר לשלוף אחד, ואם הוא מתאים — לאסוף.</div>\')\'' + NL
  + '    + \'</div>\';' + NL
  + NL
  + '  // Custom input area' + NL
  + '  var inputHTML = \'\';' + NL
  + '  if (_cdCustomInput) {' + NL
  + '    inputHTML = \'<div class="cd-custom-input-area">\'' + NL
  + '      + \'<input type="text" id="cd-custom-input" class="cd-custom-input" placeholder="הניצחון הקטן שלי..." maxlength="60">\'' + NL
  + '      + \'<div class="cd-custom-input-btns">\'' + NL
  + '      + \'<button class="cd-custom-save" onclick="saveCustomWinFromInput()">שמרי ✓</button>\'' + NL
  + '      + \'<button class="cd-custom-cancel" onclick="cancelAddCustomWin()">ביטול</button>\'' + NL
  + '      + \'</div>\'' + NL
  + '      + \'</div>\';' + NL
  + '  }' + NL
  + NL
  + '  // Exit area' + NL
  + '  var exitHTML = \'\';' + NL
  + '  if (_cdExitConfirm) {' + NL
  + '    exitHTML = \'<div class="cd-confirm-area" id="cd-exit-confirm">\'' + NL
  + '      + \'<div class="cd-confirm-title">להחזיר את היום למצב רגיל?</div>\'' + NL
  + '      + \'<div class="cd-confirm-body">ניצחונות קטנים שסימנת היום יישמרו, אבל מסך היום יחזור למשימות הרגילות.</div>\'' + NL
  + '      + \'<div class="cd-confirm-btns">\'' + NL
  + '      + \'<button class="cd-confirm-yes" onclick="confirmExitCompassionDay()">כן, לחזור ליום רגיל</button>\'' + NL
  + '      + \'<button class="cd-confirm-no" onclick="cancelExitCompassionDay()">להישאר ביום חמלה</button>\'' + NL
  + '      + \'</div>\'' + NL
  + '      + \'</div>\';' + NL
  + '  } else {' + NL
  + '    exitHTML = \'<button class="compassion-exit-btn" onclick="exitCompassionDayConfirm()">לחזור ליום רגיל</button>\';' + NL
  + '  }' + NL
  + NL
  + '  panel.innerHTML =' + NL
  + '      \'<div class="compassion-day-header">יום חמלה</div>\'' + NL
  + '    + \'<div class="compassion-day-sub">ביום כזה משחקים לפי חוקים אחרים.</div>\'' + NL
  + '    + \'<div class="cd-companion-row">\'' + NL
  + '    + \'  \' + compIconHTML' + NL
  + '    + \'  <div class="cd-companion-line">\' + compLine + \'</div>\'' + NL
  + '    + \'</div>\'' + NL
  + '    + \'<div class="cd-wins-title">ניצחונות קטנים</div>\'' + NL
  + '    + \'<div class="cd-wins-subtitle">פתק אחד בכל פעם. בלי רשימות ענק.</div>\'' + NL
  + '    + pickerHTML' + NL
  + '    + collectedHTML' + NL
  + '    + (!_cdCustomInput ? \'<button class="compassion-add-btn" onclick="openAddCustomWin()">+ להוסיף ניצחון קטן משלי</button>\' : \'\')\'' + NL
  + '    + inputHTML' + NL
  + '    + \'<div class="cd-custom-helper">כל ניצחון קטן מתקבל פה בכבוד מוגזם.</div>\'' + NL
  + '    + exitHTML;' + NL
  + '}';

content = content.slice(0, renderStart) + newRenderFn + content.slice(renderStart + oldRenderFull.length);
console.log('OK: renderCompassionDay replaced');

// ── 7. BUMP VERSION ──────────────────────────────────────────────────────────
content = content.replace(/<!-- Tori version: [^>]+ -->/, '<!-- Tori version: win-picker-2026-05-31 -->');
console.log('OK: version bumped');

// ── WRITE ────────────────────────────────────────────────────────────────────
fs.writeFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', content, 'utf8');
console.log('written. bytes:', content.length);

// ── VERIFY ───────────────────────────────────────────────────────────────────
var v = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
console.log('\n── VERIFY ──');
console.log('currentSuggestedWin in cd defaults:', v.indexOf('currentSuggestedWin: null') !== -1);
console.log('drawNextCompassionWin fn:', v.indexOf('function drawNextCompassionWin()') !== -1);
console.log('getCurrentCompassionWin fn:', v.indexOf('function getCurrentCompassionWin()') !== -1);
console.log('collectCurrentCompassionWin fn:', v.indexOf('async function collectCurrentCompassionWin()') !== -1);
console.log('skipCurrentCompassionWin fn:', v.indexOf('function skipCurrentCompassionWin()') !== -1);
console.log('cd-win-card-main CSS:', v.indexOf('.cd-win-card-main {') !== -1);
console.log('cd-collected-chip CSS:', v.indexOf('.cd-collected-chip {') !== -1);
console.log('cd-collect-btn CSS:', v.indexOf('.cd-collect-btn {') !== -1);
console.log('cd-skip-btn CSS:', v.indexOf('.cd-skip-btn {') !== -1);
console.log('renderCompassionDay has pickerHTML:', v.indexOf('pickerHTML') !== -1);
console.log('renderCompassionDay has collectedHTML:', v.indexOf('collectedHTML') !== -1);
console.log('renderCompassionDay has cd-wins-subtitle:', v.indexOf('cd-wins-subtitle') !== -1);
console.log('collectCurrentCompassionWin onclick:', v.indexOf('onclick="collectCurrentCompassionWin()"') !== -1);
console.log('skipCurrentCompassionWin onclick:', v.indexOf('onclick="skipCurrentCompassionWin()"') !== -1);
console.log('נאסף היום text:', v.indexOf('נאסף היום') !== -1);
console.log('cd-collected-empty text:', v.indexOf('עוד לא נאסף כאן פתק') !== -1);
console.log('COMPASSION_DAY_WINS bank untouched:', v.indexOf('var COMPASSION_DAY_WINS') !== -1);
console.log('old 12-grid winsHTML GONE:', v.indexOf('var winsHTML = \'\';') === -1);
console.log('version:', v.match(/<!-- Tori version: [^>]+ -->/)[0]);
