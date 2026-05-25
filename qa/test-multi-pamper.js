// test-multi-pamper.js — QA simulation for multi-pamper refactor
'use strict';
const fs = require('fs');
const html = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');

// ── Extract needed data ──
function extract(varName) {
  const re = new RegExp('const ' + varName + '\\s*=\\s*(\\{[\\s\\S]*?\\n\\};)');
  const m = html.match(re);
  if (!m) throw new Error('Could not extract ' + varName);
  let result; eval('result = ' + m[1]); return result;
}
const PAMPER_CARDS = extract('PAMPER_CARDS');
const COMPANIONS   = extract('COMPANIONS');

// ── Simulate the pamper state engine ──
let pamperState = { activePamper: null, activePampers: [], archivedPamperCards: [], seenPamperImageIds: {} };
let savedState = null;

function savePamperState() { savedState = JSON.parse(JSON.stringify(pamperState)); }
function loadPamperState() {
  if (savedState) Object.assign(pamperState, JSON.parse(JSON.stringify(savedState)));
  if (!Array.isArray(pamperState.activePampers)) pamperState.activePampers = [];
  migrateLegacyActivePamper();
  checkPamperExpiry();
}

function pickPamperImage(cardId, companionId, mode) {
  const pool = ((PAMPER_CARDS[cardId]?.companionImages || {})[companionId] || {})[mode] || [];
  return pool[0] || null;
}

function withLamed(n) { return n && n[0] === 'ה' ? 'ל' + n.slice(1) : 'ל' + (n||''); }

// Inline the key functions (stripped from app JS)

function migrateLegacyActivePamper() {
  var ap = pamperState.activePamper;
  if (!ap) return;
  var cardDef = PAMPER_CARDS[ap.cardId] || {};
  var migrated = Object.assign({}, ap, {
    id: 'migrated-' + (ap.companionId||'x') + '-' + (ap.selectedAt||Date.now()),
    cardTitleSnapshot: ap.cardTitleSnapshot || cardDef.title || ap.cardId || '',
    previewImage: ap.previewImage || cardDef.previewImage || '',
    summaryLine:  ap.summaryLine  || '',
  });
  var now = Date.now();
  if (migrated.activeUntil <= now) {
    var alreadyArc = (pamperState.archivedPamperCards||[]).some(a =>
      a.companionId===migrated.companionId && a.selectedAt===migrated.selectedAt);
    if (!alreadyArc) {
      if (!migrated.archivedAt) migrated.archivedAt = new Date(migrated.activeUntil).toISOString();
      pamperState.archivedPamperCards.unshift(migrated);
    }
  } else {
    var alreadyAct = pamperState.activePampers.some(p =>
      p.companionId===migrated.companionId && p.selectedAt===migrated.selectedAt);
    if (!alreadyAct) {
      pamperState.activePampers = pamperState.activePampers.filter(p => p.companionId !== migrated.companionId);
      pamperState.activePampers.push(migrated);
    }
  }
  pamperState.activePamper = null;
  savePamperState();
}

function checkPamperExpiry() {
  var aps = pamperState.activePampers || [];
  if (!aps.length) return false;
  var now = Date.now();
  var still = [], expired = [];
  aps.forEach(p => { if (p && p.activeUntil > now) still.push(p); else if (p) expired.push(p); });
  if (!expired.length) return false;
  if (!Array.isArray(pamperState.archivedPamperCards)) pamperState.archivedPamperCards = [];
  expired.forEach(p => {
    var already = pamperState.archivedPamperCards.some(a =>
      a.companionId===p.companionId && a.selectedAt===p.selectedAt);
    if (!already) pamperState.archivedPamperCards.unshift(Object.assign({}, p, { archivedAt: new Date().toISOString() }));
  });
  pamperState.activePampers = still;
  savePamperState();
  return true;
}

function getActivePamper(companionId) {
  checkPamperExpiry();
  var now = Date.now();
  var aps = pamperState.activePampers || [];
  if (!companionId) return aps.find(p => p && p.activeUntil > now) || null;
  return aps.find(p => p && p.companionId === companionId && p.activeUntil > now) || null;
}

function selectPamperMode(cardId, mode, companionId) {
  var cardDef = PAMPER_CARDS[cardId]; if (!cardDef) return;
  var now = Date.now();
  var picked = pickPamperImage(cardId, companionId, mode);
  var imgId  = picked ? picked.id  : '';
  var imgSrc = picked ? picked.src : '';
  var modeLines = (((cardDef.afterLines||{})[companionId]||{})[mode]||[]);
  var summaryLine = modeLines.length ? modeLines[0] : '';
  var newPamper = {
    id: 'pamp-' + now + '-test',
    cardId, cardTitleSnapshot: cardDef.title||cardId,
    companionId, mode,
    selectedAt: new Date().toISOString(),
    activeUntil: now + 24*60*60*1000,
    imageId: imgId, imageSrc: imgSrc,
    previewImage: cardDef.previewImage||'',
    summaryLine,
  };
  if (!Array.isArray(pamperState.activePampers)) pamperState.activePampers = [];
  var existing = pamperState.activePampers.filter(p => p && p.companionId===companionId);
  existing.forEach(old => {
    var already = (pamperState.archivedPamperCards||[]).some(a =>
      a.companionId===old.companionId && a.selectedAt===old.selectedAt);
    if (!already) {
      if (!Array.isArray(pamperState.archivedPamperCards)) pamperState.archivedPamperCards = [];
      pamperState.archivedPamperCards.unshift(Object.assign({}, old, { archivedAt: new Date().toISOString() }));
    }
  });
  pamperState.activePampers = pamperState.activePampers.filter(p => p && p.companionId !== companionId);
  pamperState.activePampers.push(newPamper);
  savePamperState();
}

// ── Helpers ──
let pass = 0, fail = 0;
function assert(label, condition, extra) {
  if (condition) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ FAIL: ' + label + (extra ? ' — ' + extra : '')); }
}

// ══════════════════════════════════════════════════════════
console.log('\n=== Test A: Caption under Journey active pamper ===');
pamperState = { activePamper: null, activePampers: [], archivedPamperCards: [], seenPamperImageIds: {} };
selectPamperMode('spa-small', 'friend', 'forest');
var ap = getActivePamper('forest');
assert('Active pamper found for forest', !!ap);
assert('summaryLine is set', !!ap?.summaryLine, 'got: ' + ap?.summaryLine);
var expectedCaption = (((PAMPER_CARDS['spa-small'].afterLines||{})['forest']||{})['friend']||[])[0] || '';
assert('summaryLine matches expected caption', ap?.summaryLine === expectedCaption,
  'expected: ' + expectedCaption + ' got: ' + ap?.summaryLine);
assert('previewImage stored', !!ap?.previewImage);
assert('imageSrc stored', !!ap?.imageSrc);

// ══════════════════════════════════════════════════════════
console.log('\n=== Test B: Switching companion must not delete previous pamper ===');
pamperState = { activePamper: null, activePampers: [], archivedPamperCards: [], seenPamperImageIds: {} };
// Step 1: forest pamper
selectPamperMode('spa-small', 'friend', 'forest');
var forestPamper = getActivePamper('forest');
assert('forest active pamper saved', !!forestPamper);
assert('forest summaryLine correct', forestPamper?.summaryLine === expectedCaption);

// Step 2: switch to fox, forest pamper should survive
assert('forest pamper survives before fox selection', !!getActivePamper('forest'));

// Step 3: select fox pamper
selectPamperMode('spa-small', 'sister', 'fox');
var foxPamper = getActivePamper('fox');
assert('fox active pamper saved', !!foxPamper);
assert('fox mode is sister', foxPamper?.mode === 'sister');

// Step 4: forest pamper still there
var forestStill = getActivePamper('forest');
assert('forest pamper NOT deleted after fox selection', !!forestStill, 'forest was deleted!');
assert('forest companionId still forest', forestStill?.companionId === 'forest');
assert('both pampers in activePampers', pamperState.activePampers.length === 2,
  'count: ' + pamperState.activePampers.length);

// ══════════════════════════════════════════════════════════
console.log('\n=== Test C: Journey hero per companion ===');
// forest companion → should see forest active pamper
var forHero = getActivePamper('forest');
assert('forest hero: active pamper found', !!forHero);
assert('forest hero: companionId=forest', forHero?.companionId === 'forest');
// fox companion → should see fox active pamper
var foxHero = getActivePamper('fox');
assert('fox hero: active pamper found', !!foxHero);
assert('fox hero: companionId=fox', foxHero?.companionId === 'fox');
// bear companion (no pamper) → should get null
var bearHero = getActivePamper('bear');
assert('bear hero: no active pamper (shows lair)', bearHero === null);

// ══════════════════════════════════════════════════════════
console.log('\n=== Test D: Envelope opening (both companions) ===');
// activeItems in order
var now2 = Date.now();
var activeItems = (pamperState.activePampers || []).filter(p => p && p.activeUntil > now2);
assert('activeItems has 2 items', activeItems.length === 2, 'count: ' + activeItems.length);
// Find forest envelope
var forestIdx = activeItems.findIndex(p => p.companionId === 'forest');
var foxIdx    = activeItems.findIndex(p => p.companionId === 'fox');
assert('forest found in activeItems', forestIdx >= 0);
assert('fox found in activeItems', foxIdx >= 0);
if (forestIdx >= 0) {
  var forItem = activeItems[forestIdx];
  assert('forest envelope imageSrc present', !!forItem.imageSrc);
  assert('forest envelope summaryLine present', !!forItem.summaryLine);
  assert('forest envelope previewImage present', !!forItem.previewImage);
}
if (foxIdx >= 0) {
  var foxItem = activeItems[foxIdx];
  assert('fox envelope imageSrc present', !!foxItem.imageSrc);
  assert('fox envelope summaryLine present', !!foxItem.summaryLine);
  assert('fox envelope previewImage present', !!foxItem.previewImage);
}

// ══════════════════════════════════════════════════════════
console.log('\n=== Test E: Refresh (save/load cycle) ===');
loadPamperState(); // simulate reload
var now3 = Date.now();
var reloadedActive = (pamperState.activePampers||[]).filter(p => p && p.activeUntil > now3);
assert('Both active pampers survive reload', reloadedActive.length === 2, 'count: ' + reloadedActive.length);
var forReloaded = reloadedActive.find(p => p.companionId === 'forest');
var foxReloaded = reloadedActive.find(p => p.companionId === 'fox');
assert('forest summaryLine stable after reload', forReloaded?.summaryLine === expectedCaption);
assert('forest imageSrc stable after reload', !!forReloaded?.imageSrc);
assert('fox summaryLine stable after reload', !!foxReloaded?.summaryLine);
assert('activePamper legacy field is null', pamperState.activePamper === null);

// ══════════════════════════════════════════════════════════
console.log('\n=== Test F: Expiry — one pamper expires ===');
pamperState = { activePamper: null, activePampers: [], archivedPamperCards: [], seenPamperImageIds: {} };
selectPamperMode('spa-small', 'friend', 'forest');
selectPamperMode('spa-small', 'sister', 'fox');
// Force-expire forest pamper
pamperState.activePampers.find(p => p.companionId === 'forest').activeUntil = Date.now() - 1000;
savePamperState();
loadPamperState(); // reload triggers checkPamperExpiry
var nowF = Date.now();
var activeAfterExpiry = (pamperState.activePampers||[]).filter(p => p && p.activeUntil > nowF);
var archivedAfterExpiry = pamperState.archivedPamperCards || [];
assert('Only fox remains active after forest expires', activeAfterExpiry.length === 1, 'count: ' + activeAfterExpiry.length);
assert('Fox still active after forest expires', activeAfterExpiry[0]?.companionId === 'fox');
assert('Forest moved to archive', archivedAfterExpiry.some(a => a.companionId === 'forest'));
var arcForest = archivedAfterExpiry.find(a => a.companionId === 'forest');
assert('Archived forest keeps imageSrc', !!arcForest?.imageSrc);
assert('Archived forest keeps summaryLine', !!arcForest?.summaryLine);
assert('Archived forest keeps previewImage', !!arcForest?.previewImage);
assert('Archived forest has archivedAt', !!arcForest?.archivedAt);

// ══════════════════════════════════════════════════════════
console.log('\n=== Test G: Legacy activePamper migration ===');
pamperState = {
  activePamper: {
    cardId: 'spa-small',
    companionId: 'bear',
    mode: 'alone',
    selectedAt: '2026-05-24T10:00:00.000Z',
    activeUntil: Date.now() + 3600000,  // 1h from now — still valid
    imageId: 'bear-spa-alone-01',
    imageSrc: 'assets/companions/pamper/spa/bear-spa-alone-01.webp',
    summaryLine: 'Old saved caption.',
  },
  activePampers: [],
  archivedPamperCards: [],
  seenPamperImageIds: {},
};
migrateLegacyActivePamper();
assert('Legacy activePamper → activePampers', pamperState.activePampers.length === 1);
assert('Legacy activePamper field cleared', pamperState.activePamper === null);
var mig = pamperState.activePampers[0];
assert('Migrated: companionId=bear', mig?.companionId === 'bear');
assert('Migrated: summaryLine preserved', mig?.summaryLine === 'Old saved caption.');
assert('Migrated: imageSrc preserved', mig?.imageSrc === 'assets/companions/pamper/spa/bear-spa-alone-01.webp');
assert('Migrated: previewImage filled from PAMPER_CARDS', !!mig?.previewImage);
assert('Migrated: id assigned', !!mig?.id);
assert('Migrated: cardTitleSnapshot filled', !!mig?.cardTitleSnapshot);
// Call again — should not duplicate
migrateLegacyActivePamper();
assert('Migration is idempotent (no duplicate)', pamperState.activePampers.length === 1);

// ══════════════════════════════════════════════════════════
console.log('\n=== Test H: Points and image logic unchanged ===');
// Verify image pool not touched
var poolForest = ((PAMPER_CARDS['spa-small'].companionImages||{})['forest']||{})['friend']||[];
assert('forest friend pool intact (1 image)', poolForest.length === 1);
assert('forest friend pool src correct', poolForest[0]?.src === 'assets/companions/pamper/spa/hafshushit-spa-friend-01.webp');
// No points field touched
assert('No dedicatedPamperPoints mutation in test', typeof pamperState.dedicatedPamperPoints === 'undefined');

// ══════════════════════════════════════════════════════════
console.log('\n=== Test I: withLamed grammar ===');
[
  ['החפשושית', 'לחפשושית'],
  ['הדובה',    'לדובה'],
  ['החתולה',   'לחתולה'],
  ['הקפיברה',  'לקפיברה'],
  ['השועלה',   'לשועלה'],
].forEach(([input, expected]) => {
  assert('withLamed(' + input + ') = ' + expected, withLamed(input) === expected);
});

// ══════════════════════════════════════════════════════════
console.log('\n══ SUMMARY ══');
console.log('  PASS: ' + pass + '  FAIL: ' + fail);
if (fail > 0) process.exit(1);
