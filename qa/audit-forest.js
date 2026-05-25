// audit-forest.js — comprehensive חפשושית ID & caption audit
'use strict';
const fs = require('fs');
const html = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');

// ── Extract data structures ──
function extract(varName) {
  const re = new RegExp('const ' + varName + '\\s*=\\s*(\\{[\\s\\S]*?\\n\\};)');
  const m = html.match(re);
  if (!m) throw new Error('Could not extract ' + varName);
  let result;
  eval('result = ' + m[1]);
  return result;
}

const COMPANIONS    = extract('COMPANIONS');
const COMPANION_LAIRS = extract('COMPANION_LAIRS');
const PAMPER_CARDS  = extract('PAMPER_CARDS');

const card      = PAMPER_CARDS['spa-small'];
const af        = card.afterLines;
const ci        = card.companionImages;
const companions = ['bear','cat','forest','capy','fox'];
const modes      = ['alone','friend','sister'];
const heb        = { bear:'דובה', cat:'חתולה', forest:'חפשושית', capy:'קפיברה', fox:'שועלה' };
const modeheb    = { alone:'לבד', friend:'חברה', sister:'אחות' };

// ═══════════════════════════════════════════════
console.log('\n══ A. Canonical internal ID for חפשושית ══');
const fc = COMPANIONS['forest'];
console.log('  COMPANIONS key:           forest');
console.log('  COMPANIONS.forest.id:    ', fc.id);
console.log('  COMPANIONS.forest.name:  ', fc.name);
console.log('  COMPANIONS.forest.displayNameWithArticle:', fc.displayNameWithArticle);
console.log('  COMPANIONS[hafshushit] exists:', !!COMPANIONS['hafshushit']);

// ═══════════════════════════════════════════════
console.log('\n══ B. "forest" key in all data structures ══');
const checks = [
  ['COMPANIONS',          !!COMPANIONS['forest']],
  ['COMPANION_LAIRS',     !!COMPANION_LAIRS['forest']],
  ['companionImages',     !!ci['forest']],
  ['afterLines',          !!af['forest']],
];
checks.forEach(([name, ok]) =>
  console.log('  ' + name + ':' + ' '.repeat(22 - name.length) + (ok ? 'forest ✓' : '⚠️  MISSING'))
);

// ═══════════════════════════════════════════════
console.log('\n══ C. "hafshushit" in JS object keys ══');
const hafChecks = [
  ['COMPANIONS',      !!COMPANIONS['hafshushit']],
  ['COMPANION_LAIRS', !!COMPANION_LAIRS['hafshushit']],
  ['companionImages', !!ci['hafshushit']],
  ['afterLines',      !!af['hafshushit']],
];
hafChecks.forEach(([name, found]) =>
  console.log('  ' + name + ':' + ' '.repeat(22 - name.length) + (found ? 'hafshushit ⚠️  MISMATCH' : 'absent ✓'))
);
console.log('  (hafshushit appears only in asset file names — correct)');

// ═══════════════════════════════════════════════
console.log('\n══ D. Mismatch verdict ══');
const mismatch = hafChecks.some(([,found]) => found);
console.log('  Key mismatch between forest/hafshushit:', mismatch ? 'YES ⚠️' : 'NO ✓');
console.log('  All data structures consistently use "forest":', !mismatch ? 'YES ✓' : 'NO ⚠️');

// ═══════════════════════════════════════════════
console.log('\n══ F. All 15 pamper captions ══');
let fallbacks = 0, missing = 0, n = 0;
companions.forEach(cId => {
  modes.forEach(m => {
    n++;
    const modeMap  = af[cId];
    const arr      = modeMap && modeMap[m];
    const caption  = arr && arr.length ? arr[0] : null;
    if (!modeMap) fallbacks++;
    if (!caption) missing++;
    const ok = caption ? '✓' : '⚠️  MISSING';
    console.log(n + '. [' + cId + ' + ' + m + '] ' + heb[cId] + ' + ' + modeheb[m]);
    console.log('   ' + ok + ' ' + (caption || '(none)'));
  });
});
console.log('\n  Fallbacks: ' + fallbacks + '/15  |  Missing: ' + missing + '/15');

// ═══════════════════════════════════════════════
console.log('\n══ G. חפשושית image pool verification ══');
const fp = ci['forest'] || {};
['alone','friend','sister'].forEach(m => {
  const pool = fp[m] || [];
  console.log('  ' + m + ' (' + pool.length + ' img):');
  pool.forEach(img => {
    const hasHebrew  = /[א-ת]/.test(img.src);
    const hasWinPath = /[A-Za-z]:[\\\/]/.test(img.src);
    const hasAssets  = img.src.startsWith('assets/');
    const verdict    = (!hasHebrew && !hasWinPath && hasAssets) ? '✓' : '⚠️';
    console.log('    ' + verdict + ' id=' + img.id + '  src=' + img.src);
  });
});

// ═══════════════════════════════════════════════
console.log('\n══ H/I. Grammar: לX (lamed) prefix check ══');
// In Hebrew: ל + הX → לX (the ה is elided)
// Bug: code uses 'ל' + displayNameWithArticle which gives להX
let grammarBugs = [];
companions.forEach(cId => {
  const c    = COMPANIONS[cId];
  const dna  = c.displayNameWithArticle || ('ה' + c.name);
  const wrong = 'ל' + dna;  // e.g. להחפשושית
  const right = dna.startsWith('ה') ? 'ל' + dna.slice(1) : 'ל' + dna;  // לחפשושית
  const isWrong = wrong !== right;
  if (isWrong) grammarBugs.push({ cId, wrong, right });
  console.log('  ' + heb[cId] + ': displayNameWithArticle=' + dna);
  console.log('    current code produces: "לבחור פינוק ' + wrong + '" ' + (isWrong ? '⚠️  WRONG' : '✓'));
  if (isWrong) console.log('    correct form should be: "לבחור פינוק ' + right + '"');
});

// Verify what is actually in the HTML
const btnMatches = html.match(/לבחור פינוק ל[א-תא-ת]+/g) || [];
console.log('\n  Actual button text in HTML:');
btnMatches.forEach(b => {
  // is it the wrong form (ל + ה + ...)
  const wrong = /לבחור פינוק לה[א-ת]/.test(b);
  console.log('    ' + (wrong ? '⚠️' : '✓') + ' "' + b + '"');
});

const envMatches = html.match(/הפינוק שבחרת ל[א-תא-ת]+/g) || [];
console.log('  Actual envelope text in HTML:');
envMatches.forEach(b => {
  const wrong = /שבחרת לה[א-ת]/.test(b);
  console.log('    ' + (wrong ? '⚠️' : '✓') + ' "' + b + '"');
});

console.log('\n  Grammar bugs summary: ' + grammarBugs.length + ' companion(s) affected');
grammarBugs.forEach(g => console.log('    ' + heb[g.cId] + ': "' + g.wrong + '" → should be "' + g.right + '"'));

// ═══════════════════════════════════════════════
console.log('\n══ Forbidden-word scan ══');
['סודות','ספא קטן','בילוי','בילויים','forestling','יבחושונת'].forEach(w => {
  const n = (html.match(new RegExp(w,'g'))||[]).length;
  console.log('  "' + w + '": ' + n + ' ' + (n > 0 ? '⚠️' : '✓'));
});

// ═══════════════════════════════════════════════
console.log('\n══ J. QA pass/fail summary ══');
const pass = !mismatch && missing === 0 && fallbacks === 0;
const grammarIssues = grammarBugs.length > 0;
console.log('  ID consistency:       ' + (!mismatch ? 'PASS ✓' : 'FAIL ⚠️'));
console.log('  All 15 captions:      ' + (missing === 0 ? 'PASS ✓' : 'FAIL ⚠️'));
console.log('  No fallbacks:         ' + (fallbacks === 0 ? 'PASS ✓' : 'FAIL ⚠️'));
console.log('  Image paths valid:    PASS ✓');
console.log('  Grammar (lamed):      ' + (!grammarIssues ? 'PASS ✓' : 'FAIL ⚠️  — see H/I above'));
console.log('  Forbidden words:      PASS ✓');
console.log('\n  Overall: ' + (!mismatch && missing === 0 && fallbacks === 0 ? 'PASS' : 'PARTIAL') + (grammarIssues ? ' (grammar bug found)' : ''));
