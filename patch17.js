// patch17.js
// 1. Add personalitySummary to each companion in HTML COMPANIONS
// 2. Show personalitySummary in the companion selection card (replaces short bio)
// 3. Fix click: only the radio dot selects a companion, not the whole card

const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ─── 1. Add personalitySummary to COMPANIONS ──────────────────────────────────

const summaries = {
  capy:   'קפיברה היא החברה הרגועה־יבשה. ההומור שלה דד־פאן, מינימליסטי, רגוע ולא מתרגש. היא מורידה לחץ דרך משפטים פשוטים, יבשים ומדויקים שמחזירים את המשתמשת לפעולה אחת קטנה בלי רעש. היא לא מנסה להלהיב, לא מדרבנת בקול גדול ולא עושה עניין. מתאימה במיוחד למצבים של הצפה, לחץ, עומס משימות, צורך להאט או תחושה שהכול דחוף.',
  bear:   'דובה היא החברה המחבקת־פרקטית. ההומור שלה חם, ביתי ומאמאצחיק — כזה שמזכיר למשתמשת לאכול, לשתות, לנשום ולעשות צעד קטן בלי אשמה. היא לא דוחפת ולא מאתגרת בכוח, אלא מרגיעה דרך דאגה פשוטה לגוף ולרגע הנוכחי. מתאימה במיוחד למצבים של עייפות, עומס, צורך במנוחה, אוכל, מים או פעולה בסיסית.',
  fox:    'שועלה היא החברה הערמומית־מוטיבציונית. ההומור שלה משחקי, חכם, זריז ומניע לפעולה, אבל בלי להיות קשוח או נוזף. היא עוזרת להתחיל דרך מיני־אתגרים קטנים, עקיפה חכמה של התנגדות ותחושת "עשינו מהלך". מתאימה במיוחד להתחלת משימות, סימון הרגלים, יציאה מתקיעות או כשצריך דחיפה קטנה.',
  forest: 'חפשושית היא החברה הפייתית־אבסורדית. ההומור שלה מוזר־מתוק, יערי, קליל ומקטין איום. היא הופכת משימות גדולות למשהו קטן, מצחיק ואפשרי, כאילו המשימה היא מפלצת קטנה עם יחסי ציבור מוגזמים. מתאימה במיוחד למצבים של הימנעות, פחד מהתחלה, משימות ביתיות או תחושה שהכול גדול מדי.',
  cat:    'חתולה היא החברה השנונה־קסומה. ההומור שלה חכם, אלגנטי וממסגר מחדש מחשבות מלחיצות. היא עוזרת להסתכל על מחשבות, עומס בראש או פרשנות שלילית מזווית קצת פחות מאיימת. היא לא צוחקת על המשתמשת, אלא על המוח כשהוא פותח ישיבות, כותב תסריטים או מתנהג כאילו כל מחשבה היא נבואה. מתאימה למצבים של לופ מחשבתי, ספק, הצפה מנטלית.',
};

// Insert personalitySummary after the bio line for each companion
const companions = ['capy', 'bear', 'fox', 'forest', 'cat'];
for (const id of companions) {
  const bioPattern = new RegExp(
    "(id:'" + id + "'[\\s\\S]*?fitsIf:'[^']*',)"
  );
  const match = html.match(bioPattern);
  if (!match) {
    console.error('✗ Could not find fitsIf for', id);
    process.exit(1);
  }
  const needle = match[1];
  const replacement = needle + "\n    personalitySummary:'" + summaries[id].replace(/'/g, "\\'") + "',";
  html = html.replace(needle, replacement);
  console.log('✓ personalitySummary added to', id);
}

// ─── 2. Show personalitySummary in companion card (replace bio+fitsIf) ────────

const OLD_CARD_CONTENT = `    content.innerHTML = '<div style="display:flex;align-items:baseline;gap:6px">'
      + '<span class="jcc-name serif">' + c.name + '</span>'
      + '<span class="jcc-species">· ' + c.species + '</span>'
      + '</div>'
      + '<div class="jcc-tagline" style="color:' + c.accent + '">' + c.tagline + '</div>'
      + '<div class="jcc-bio">' + c.bio + '</div>'
      + '<div class="jcc-fits">מתאימה אם: ' + c.fitsIf + '</div>';`;

const NEW_CARD_CONTENT = `    content.innerHTML = '<div style="display:flex;align-items:baseline;gap:6px">'
      + '<span class="jcc-name serif">' + c.name + '</span>'
      + '<span class="jcc-species">· ' + c.species + '</span>'
      + '</div>'
      + '<div class="jcc-tagline" style="color:' + c.accent + '">' + c.tagline + '</div>'
      + '<div class="jcc-bio" style="font-size:11.5px;line-height:1.55">' + (c.personalitySummary || c.bio) + '</div>';`;

if (!html.includes(OLD_CARD_CONTENT)) {
  console.error('✗ Card content block not found');
  process.exit(1);
}
html = html.replace(OLD_CARD_CONTENT, NEW_CARD_CONTENT);
console.log('✓ Card content updated to show personalitySummary');

// ─── 3. Fix click: only the radio dot selects, not the whole card ─────────────

// Remove whole-card click + touchend handlers; give radio pointer-events + handler
const OLD_RADIO_BUILD = `    // Radio indicator
    var radio = document.createElement('div');
    radio.className = 'jcc-radio';
    radio.style.border = '1.5px solid rgba(45,42,38,0.25)';
    radio.style.pointerEvents = 'none';
    btn.appendChild(radio);

    // Click handler — attached directly to button element
    function doSelect() {
      selectedId = c.id;
      cs._pendingId = c.id;
      updateVisuals();
    }
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      doSelect();
    });
    btn.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      doSelect();
    }, {passive: false});`;

const NEW_RADIO_BUILD = `    // Radio indicator — this is the ONLY click target for selecting a companion
    var radioWrap = document.createElement('div');
    radioWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;'
      + 'padding:0 14px;flex-shrink:0;cursor:pointer;-webkit-tap-highlight-color:rgba(0,0,0,0.04);';
    var radio = document.createElement('div');
    radio.className = 'jcc-radio';
    radio.style.border = '1.5px solid rgba(45,42,38,0.25)';
    radio.style.pointerEvents = 'none';
    radioWrap.appendChild(radio);
    btn.appendChild(radioWrap);

    // Click handler — ONLY on the radio wrapper, not the whole card
    function doSelect() {
      selectedId = c.id;
      cs._pendingId = c.id;
      updateVisuals();
    }
    radioWrap.addEventListener('click', function(e) {
      e.stopPropagation();
      doSelect();
    });
    radioWrap.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      doSelect();
    }, {passive: false});
    // Card itself: no selection, just remove btn default click behavior
    btn.addEventListener('click', function(e) { e.stopPropagation(); });`;

if (!html.includes(OLD_RADIO_BUILD)) {
  console.error('✗ Radio build block not found');
  process.exit(1);
}
html = html.replace(OLD_RADIO_BUILD, NEW_RADIO_BUILD);
console.log('✓ Click handler moved to radio dot only');

// Also update the radio querySelector in updateVisuals to use the new structure
// (radio is now inside radioWrap, but .jcc-radio selector still works)

// ─── 4. Update CSS: jcc-radio no longer has pointer-events:none (that's on the div inside) ──
// And make the radioWrap a comfortable tap target height
const OLD_RADIO_CSS = `.jcc-radio {
  width:20px; height:20px; border-radius:999px;
  border:1.5px solid rgba(45,42,38,0.25); background:#FFFFFF;`;

const NEW_RADIO_CSS = `.jcc-radio {
  width:22px; height:22px; border-radius:999px;
  border:1.5px solid rgba(45,42,38,0.25); background:#FFFFFF;`;

if (!html.includes(OLD_RADIO_CSS)) {
  console.error('✗ jcc-radio CSS not found (non-critical)');
} else {
  html = html.replace(OLD_RADIO_CSS, NEW_RADIO_CSS);
  console.log('✓ Radio dot size increased to 22px for easier tapping');
}

// ─── 5. Write + verify ────────────────────────────────────────────────────────
fs.writeFileSync('body-soul-app.html', html, 'utf8');

const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || [];
let allJS = '';
scripts.forEach(function(s) {
  allJS += s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '') + '\n';
});
fs.writeFileSync('_tmp_check17.js', allJS, 'utf8');
const { execSync } = require('child_process');
try {
  execSync('node --check _tmp_check17.js', { stdio: 'pipe' });
  console.log('✓ Syntax OK');
} catch(e) {
  console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0,8).join('\n'));
}
try { fs.unlinkSync('_tmp_check17.js'); } catch(e) {}

// Verify personalitySummary present for all companions
console.log('\n--- Verification ---');
const checks = [
  { label: 'capy personalitySummary',   needle: "personalitySummary:'קפיברה היא" },
  { label: 'bear personalitySummary',   needle: "personalitySummary:'דובה היא" },
  { label: 'fox personalitySummary',    needle: "personalitySummary:'שועלה היא" },
  { label: 'forest personalitySummary', needle: "personalitySummary:'חפשושית היא" },
  { label: 'cat personalitySummary',    needle: "personalitySummary:'חתולה היא" },
  { label: 'card shows personalitySummary', needle: 'c.personalitySummary || c.bio' },
  { label: 'radio-only click handler',  needle: 'radioWrap.addEventListener' },
  { label: 'whole-card click removed',  needle: 'Click handler — ONLY on the radio wrapper' },
];
let ok = true;
checks.forEach(function(c) {
  var found = html.includes(c.needle);
  if (!found) ok = false;
  console.log((found ? '✓' : '✗') + ' ' + c.label);
});
console.log('\n' + (ok ? '✓ ALL CLEAR' : '✗ ISSUES FOUND'));
console.log('Size:', Buffer.byteLength(html), 'bytes');
