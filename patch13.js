// patch13.js — Strip all stone/garden/trail UI from journey tab
//
// What's removed from the journey tab:
//   buildTodayStoneHTML  – stone of the day card
//   buildStoneTrailHTML  – 7-day stone trail
//   buildNextStageHTML   – "next stage" locked card
//   getJourneyTrail      – was only needed for the trail
//   buildStoneSVG        – stone SVG renderer
//   buildTrailStoneSVG   – trail stone SVG renderer
//   _journeyTrailDays    – trail cache (no longer populated)
//   openDayDetail        – was for clicking trail stones
//   closeDayDetail       – same
//
// What stays:
//   renderCompanionSelectDOM   – companion selection (works fine)
//   buildCompanionTopCardHTML  – top header "המסע שלי"
//   buildCompanionHeroHTML     – companion scene card
//   buildCompanionActionsHTML  – 4 action chips
//   buildAlongTheDayHTML       – "מה עשינו היום"
//   buildPointsCardHTML        – connection points
//   buildHabitStrengthHTML     – habit strength bar
//   buildFactCardHTML          – "הידעת"
//   getJourneyMarks            – needed for marks (fixed in patch12)
//   getJourneyHabits           – needed for habit bar

const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ─────────────────────────────────────────────────────
// 1. Replace buildJourneyMainHTML — remove stone/trail/next-stage,
//    compute date label inline (no more getJourneyTrail dependency)
// ─────────────────────────────────────────────────────
const OLD_MAIN = `function buildJourneyMainHTML() {
  var c = COMPANIONS[cs.companionId];
  if (!c) return buildCompanionSelectHTML();
  var marks = getJourneyMarks();
  var compassion = gs.todayMood==='compassion';
  var mood = deriveCompanionMood();
  var points = gs.points || 0;
  var habits = getJourneyHabits();
  var trail = getJourneyTrail();
  var today = trail[trail.length-1];
  var todayDateLabel = today.dateLabel || '';

  var parts = [
    buildCompanionTopCardHTML(c, todayDateLabel),
    buildCompanionHeroHTML(c, marks, mood),
    buildCompanionActionsHTML(c),
    buildAlongTheDayHTML(marks, c),
    buildTodayStoneHTML(marks, compassion),
    buildStoneTrailHTML(trail),
    buildPointsCardHTML(points, marks, c),
    buildHabitStrengthHTML(habits),
    buildFactCardHTML(),
    buildNextStageHTML(),
  ];

  return parts.join('');
}`;

const NEW_MAIN = `function buildJourneyMainHTML() {
  var c = COMPANIONS[cs.companionId];
  if (!c) return ''; // renderJourneyTab shows companion select instead
  var marks = getJourneyMarks();
  var mood = deriveCompanionMood();
  var points = gs.points || 0;
  var habits = getJourneyHabits();
  // Date label computed directly — no trail dependency
  var todayDateLabel = new Date().toLocaleDateString('he-IL', {weekday:'long', month:'long', day:'numeric'});

  // Companion-only parts — no stones, no garden, no trail
  var parts = [
    buildCompanionTopCardHTML(c, todayDateLabel),
    buildCompanionHeroHTML(c, marks, mood),
    buildCompanionActionsHTML(c),
    buildAlongTheDayHTML(marks, c),
    buildPointsCardHTML(points, marks, c),
    buildHabitStrengthHTML(habits),
    buildFactCardHTML(),
  ];

  return parts.join('');
}`;

if (html.includes(OLD_MAIN)) {
  html = html.replace(OLD_MAIN, NEW_MAIN);
  console.log('✓ buildJourneyMainHTML updated (stones/trail/next-stage removed)');
} else {
  console.error('✗ OLD buildJourneyMainHTML not found');
  process.exit(1);
}

// ─────────────────────────────────────────────────────
// 2. Replace renderJourneyTab — remove _journeyTrailDays caching
// ─────────────────────────────────────────────────────
const OLD_RENDER_TAB = `function renderJourneyTab() {
  var inner = document.getElementById('journey-inner');
  if (!inner) return;
  if (!cs.companionId) {
    renderCompanionSelectDOM(inner); // DOM approach — no inline onclick, proper touch support
  } else {
    _journeyTrailDays = getJourneyTrail();
    inner.innerHTML = buildJourneyMainHTML();
  }
}`;

const NEW_RENDER_TAB = `function renderJourneyTab() {
  var inner = document.getElementById('journey-inner');
  if (!inner) return;
  if (!cs.companionId) {
    renderCompanionSelectDOM(inner);
  } else {
    inner.innerHTML = buildJourneyMainHTML();
  }
}`;

if (html.includes(OLD_RENDER_TAB)) {
  html = html.replace(OLD_RENDER_TAB, NEW_RENDER_TAB);
  console.log('✓ renderJourneyTab updated (no more trail caching)');
} else {
  console.error('✗ OLD renderJourneyTab not found');
  process.exit(1);
}

// ─────────────────────────────────────────────────────
// 3. Update renderGardenCards — keep renderJourneyTab() sync but remove _journeyTrailDays
// ─────────────────────────────────────────────────────
const OLD_GARDEN_CARDS_LINE = `  try { renderJourneyTab(); _journeyTrailDays=getJourneyTrail(); } catch(e){}`;
const NEW_GARDEN_CARDS_LINE = `  try { renderJourneyTab(); } catch(e){} // sync journey companion mood when tasks change`;

if (html.includes(OLD_GARDEN_CARDS_LINE)) {
  html = html.replace(OLD_GARDEN_CARDS_LINE, NEW_GARDEN_CARDS_LINE);
  console.log('✓ renderGardenCards: removed _journeyTrailDays from sync call');
} else {
  console.error('✗ renderGardenCards sync line not found');
}

// ─────────────────────────────────────────────────────
// 4. Stub out stone/trail functions — return '' so any stale calls are harmless
//    We replace the full function body rather than deleting, to avoid reference errors
// ─────────────────────────────────────────────────────

function stubFunction(name, fullOldBody, stubBody) {
  if (html.includes(fullOldBody)) {
    html = html.replace(fullOldBody, stubBody);
    console.log('✓ Stubbed: ' + name);
    return true;
  }
  console.log('~ ' + name + ' not found with exact match, trying partial...');
  const idx = html.indexOf('function ' + name);
  if (idx !== -1) {
    console.log('  Found at', idx, '— skipping (manual check needed)');
  }
  return false;
}

// Stub buildTodayStoneHTML
stubFunction('buildTodayStoneHTML',
`function buildTodayStoneHTML(marks, compassion) {
  var dotColor = compassion ? '#A89E96' : marks.length>=5 ? '#B59E80' : marks.length===0 ? '#BAB1A0' : '#B19B7D';
  var name = stoneNameFor(marks, compassion);
  var sentence = stoneSentenceFor(marks, compassion);
  var svg = buildStoneSVG(marks, compassion, 240, 258);
  var content = '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px">'
    +'<span style="display:inline-block;width:6px;height:6px;border-radius:999px;background:'+dotColor+'"></span>'
    +'<div class="j-eyebrow" style="margin:0">האבן של היום</div>'
    +'</div>'
    +'<div style="display:flex;justify-content:center;margin:4px 0 8px">'+svg+'</div>'
    +'<div class="serif" style="font-size:22px;font-weight:500;color:var(--g-ink);line-height:1.2;margin-bottom:8px;text-align:center">'+name+'</div>'
    +'<div style="font-size:13.5px;color:var(--g-ink-2);line-height:1.55;max-width:280px;margin:0 auto;text-align:center">'+sentence+'</div>';
  return buildMCard(content, 'background:linear-gradient(180deg,#FBF6EB 0%,#FFFFFF 65%);padding:22px 18px;text-align:center;position:relative');
}`,
`function buildTodayStoneHTML() { return ''; /* removed — companion model replaces stone model */}`
);

// Stub buildStoneTrailHTML
stubFunction('buildStoneTrailHTML',
`function buildStoneTrailHTML(trailDays) {
  var content = buildMCardHeader('הדרך מאחור', 'שבעת הימים האחרונים');
  content += '<div style="font-size:12.5px;color:var(--g-ink-3);line-height:1.5;margin-bottom:12px;margin-top:-4px">כל אבן היא יום. לחיצה תפתח את הפרטים.</div>';
  content += '<div class="j-trail-row">';
  trailDays.forEach(function(d,i){
    var size = d.isToday ? 64 : 52;
    var svg = buildTrailStoneSVG(d.marks, d.compassion, d.isToday, size);
    var labelClass = d.isToday ? 'j-trail-label today' : 'j-trail-label';
    var dateStr = d.dateLabel || '';
    content += '<button class="j-trail-stone-btn" onclick="openDayDetail('+i+')" aria-label="'+(d.shortLabel||'')+'">'
      +svg
      +'<div class="'+labelClass+'">'+d.shortLabel+'</div>'
      +'</button>';
  });
  content += '</div>';
  return buildMCard(content);
}`,
`function buildStoneTrailHTML() { return ''; /* removed — companion model replaces trail model */}`
);

// Stub buildNextStageHTML
stubFunction('buildNextStageHTML',
`function buildNextStageHTML() {
  var content = '<div style="display:flex;align-items:flex-start;gap:14px">'
    +'<div class="j-next-icon" style="background:rgba(186,177,160,0.22)">'
    +'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#8A857D" stroke-width="1.6"/><path d="M8 11 V8 a4 4 0 0 1 8 0 v3" stroke="#8A857D" stroke-width="1.6"/></svg>'
    +'</div>'
    +'<div style="flex:1">'
    +'<div class="serif" style="font-size:17px;font-weight:500;color:var(--g-ink);margin-bottom:4px">השלב הבא</div>'
    +'<div style="font-size:13px;color:var(--g-ink-2);line-height:1.55">השלב הבא ייפתח אחרי תקופה של התמדה מול עצמך. לא כדי להעמיס, אלא כדי להוסיף משהו שהוא מעבר לבסיס.</div>'
    +'</div></div>';
  return buildMCard(content, 'background:linear-gradient(180deg,rgba(255,255,255,0.55),rgba(245,239,224,0.55));border:1px dashed rgba(70,55,30,0.18);box-shadow:none');
}`,
`function buildNextStageHTML() { return ''; /* removed — not part of companion model */}`
);

// Stub getJourneyTrail — return empty array so any stale callers don't crash
stubFunction('getJourneyTrail',
`function getJourneyTrail() {
  var days = [];
  var today = new Date();
  for (var i=6; i>=0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate()-i);
    var isToday = i===0;
    var label = isToday ? 'היום' : HEBREW_DAYS[d.getDay()];
    if (isToday) {
      days.push({
        marks: getJourneyMarks(),
        compassion: gs.todayMood==='compassion',
        isToday: true,
        shortLabel: label,
        dateLabel: d.toLocaleDateString('he-IL',{weekday:'long',month:'long',day:'numeric'}),
      });
    } else {
      days.push({ marks:[], compassion:false, isToday:false, shortLabel:label });
    }
  }
  return days;
}`,
`function getJourneyTrail() { return []; /* removed — trail no longer shown in companion model */}`
);

// ─────────────────────────────────────────────────────
// 5. Stub buildStoneSVG and buildTrailStoneSVG (they reference STONE_PATH_D etc.)
// ─────────────────────────────────────────────────────
// Find and replace buildStoneSVG function
(function() {
  const start = html.indexOf('function buildStoneSVG(marks, compassion, w, h)');
  if (start === -1) { console.log('~ buildStoneSVG signature not found'); return; }
  const end = html.indexOf('\nfunction buildTrailStoneSVG', start);
  if (end === -1) { console.log('~ buildStoneSVG end not found'); return; }
  html = html.slice(0, start)
    + 'function buildStoneSVG() { return \'\'; /* removed — stones not used in companion model */}'
    + html.slice(end);
  console.log('✓ Stubbed: buildStoneSVG');
})();

(function() {
  const start = html.indexOf('function buildTrailStoneSVG(marks, compassion, isToday, size)');
  if (start === -1) { console.log('~ buildTrailStoneSVG signature not found'); return; }
  const end = html.indexOf('\n\n// ──', start);
  const end2 = html.indexOf('\nfunction ', start+50);
  const realEnd = (end !== -1 && end < end2) ? end : end2;
  if (realEnd === -1) { console.log('~ buildTrailStoneSVG end not found'); return; }
  html = html.slice(0, start)
    + 'function buildTrailStoneSVG() { return \'\'; /* removed — trail stones not used */}'
    + html.slice(realEnd);
  console.log('✓ Stubbed: buildTrailStoneSVG');
})();

// ─────────────────────────────────────────────────────
// 6. Stub openDayDetail / closeDayDetail — no trail = no day detail sheet
// ─────────────────────────────────────────────────────
(function() {
  const start = html.indexOf('function openDayDetail(');
  if (start === -1) { console.log('~ openDayDetail not found'); return; }
  const end = html.indexOf('\nfunction closeDayDetail', start);
  if (end === -1) { console.log('~ closeDayDetail boundary not found'); return; }
  html = html.slice(0, start)
    + 'function openDayDetail() { /* removed — trail no longer shown */ }'
    + html.slice(end);
  console.log('✓ Stubbed: openDayDetail');
})();

(function() {
  const start = html.indexOf('function closeDayDetail(');
  if (start === -1) { console.log('~ closeDayDetail not found'); return; }
  const end = html.indexOf('\n\n', start + 50);
  if (end === -1) { console.log('~ closeDayDetail end not found'); return; }
  html = html.slice(0, start)
    + 'function closeDayDetail() { /* removed — trail no longer shown */ }'
    + html.slice(end);
  console.log('✓ Stubbed: closeDayDetail');
})();

// ─────────────────────────────────────────────────────
// 7. Write + verify
// ─────────────────────────────────────────────────────
fs.writeFileSync('body-soul-app.html', html, 'utf8');

const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || [];
let allJS = '';
scripts.forEach(function(s) {
  allJS += s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '') + '\n';
});
fs.writeFileSync('_tmp_check13.js', allJS, 'utf8');

const { execSync } = require('child_process');
try {
  execSync('node --check _tmp_check13.js', { stdio: 'pipe' });
  console.log('✓ Syntax OK');
} catch (e) {
  console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0, 8).join('\n'));
}
try { fs.unlinkSync('_tmp_check13.js'); } catch (e) {}

// Verify: no stone/trail references remain in journey tab builder
const verifyFns = ['buildTodayStoneHTML','buildStoneTrailHTML','buildNextStageHTML'];
const mainFnStart = html.indexOf('function buildJourneyMainHTML');
const mainFnEnd = html.indexOf('\n}', mainFnStart) + 2;
const mainFnBody = html.slice(mainFnStart, mainFnEnd);
console.log('\n--- buildJourneyMainHTML verification ---');
verifyFns.forEach(function(fn) {
  const found = mainFnBody.includes(fn + '(');
  console.log(found ? '✗ STILL PRESENT: ' + fn : '✓ absent: ' + fn);
});

console.log('\nDone. Size:', Buffer.byteLength(html), 'bytes');
