// patch12.js — Fix getJourneyMarks() crashes + companion confirm flow
// Root causes:
//   1. getJourneyMarks() calls s.tasks.forEach() but s.tasks is an object {taskId:bool}, not array
//      → throws TypeError: s.tasks.forEach is not a function
//      → buildJourneyMainHTML() fails silently, companion select screen stays
//   2. s.exChosen is always {easy:null,hard:null} (truthy), so 'move' was always added to marks
//   3. doConfirmJourneyCompanion() calls renderJourneyTab() without try/catch
//      → error propagates, nothing is shown to user

const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ─────────────────────────────────────────────────────
// 1. Fix getJourneyMarks() — s.tasks is {id:bool} object, not array
// ─────────────────────────────────────────────────────
const OLD_MARKS = `function getJourneyMarks() {
  const marks = new Set();
  (s.tasks||[]).forEach(function(t){
    if (t.done && TASK_TO_MARK[t.id]) marks.add(TASK_TO_MARK[t.id]);
  });
  if ((s.water||0) >= 4) marks.add('water');
  if (s.exChosen) marks.add('move');
  if (gs.todayMood === 'compassion') marks.add('compassion');
  return Array.from(marks);
}`;

const NEW_MARKS = `function getJourneyMarks() {
  var marks = new Set();
  // s.tasks is {taskId: boolean} — not an array
  var tasksObj = s.tasks || {};
  Object.keys(tasksObj).forEach(function(taskId) {
    if (tasksObj[taskId] && TASK_TO_MARK[taskId]) marks.add(TASK_TO_MARK[taskId]);
  });
  if ((s.water||0) >= 4) marks.add('water');
  // s.exChosen is always an object {easy,hard} — check that one was actually chosen
  if (s.exChosen && (s.exChosen.easy || s.exChosen.hard)) marks.add('move');
  if (gs.todayMood === 'compassion') marks.add('compassion');
  return Array.from(marks);
}`;

if (html.includes(OLD_MARKS)) {
  html = html.replace(OLD_MARKS, NEW_MARKS);
  console.log('✓ getJourneyMarks() fixed (tasks object, exChosen guard)');
} else {
  console.error('✗ getJourneyMarks OLD pattern not found — searching for partial...');
  const partialIdx = html.indexOf('function getJourneyMarks()');
  if (partialIdx !== -1) {
    console.log('Found at pos:', partialIdx);
    console.log(html.slice(partialIdx, partialIdx + 300));
  }
  process.exit(1);
}

// ─────────────────────────────────────────────────────
// 2. Make doConfirmJourneyCompanion robust: try/catch around renderJourneyTab
//    Also add console.error so we catch future issues early
// ─────────────────────────────────────────────────────
const OLD_CONFIRM = `function doConfirmJourneyCompanion() {
  if (!cs._pendingId) return;
  cs.companionId = cs._pendingId;
  cs.selectedAt = new Date().toISOString();
  cs.switchCount = (cs.switchCount||0) + 1;
  cs._pendingId = null;
  saveCompanionState();
  cancelJourneyConfirm();
  renderJourneyTab();
}`;

const NEW_CONFIRM = `function doConfirmJourneyCompanion() {
  if (!cs._pendingId) return;
  cs.companionId = cs._pendingId;
  cs.selectedAt = new Date().toISOString();
  cs.switchCount = (cs.switchCount||0) + 1;
  cs._pendingId = null;
  saveCompanionState();
  cancelJourneyConfirm();
  try {
    renderJourneyTab();
  } catch(e) {
    console.error('[Tori] renderJourneyTab failed after companion confirm:', e);
    // Fallback: show a minimal companion screen so the user isn't stuck
    var inner = document.getElementById('journey-inner');
    if (inner) {
      var c = COMPANIONS[cs.companionId];
      inner.innerHTML = '<div style="padding:40px 20px;text-align:center;color:var(--g-ink-2)">'
        + '<div style="font-size:40px;margin-bottom:12px">' + (c ? '🐾' : '🌿') + '</div>'
        + '<div style="font-size:18px;font-weight:500;margin-bottom:8px">' + (c ? c.name + ' מצטרפת אלייך' : 'המסע מוכן') + '</div>'
        + '<div style="font-size:13px;line-height:1.6">רגע, טוענת את המסך שלך...</div>'
        + '</div>';
      // Retry once after a short delay
      setTimeout(function() {
        try { renderJourneyTab(); } catch(e2) { console.error('[Tori] retry failed:', e2); }
      }, 200);
    }
  }
}`;

if (html.includes(OLD_CONFIRM)) {
  html = html.replace(OLD_CONFIRM, NEW_CONFIRM);
  console.log('✓ doConfirmJourneyCompanion wrapped in try/catch with fallback');
} else {
  console.error('✗ OLD_CONFIRM not found');
  process.exit(1);
}

// ─────────────────────────────────────────────────────
// 3. Write + verify
// ─────────────────────────────────────────────────────
fs.writeFileSync('body-soul-app.html', html, 'utf8');

const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || [];
let allJS = '';
scripts.forEach(function(s) {
  allJS += s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '') + '\n';
});
fs.writeFileSync('_tmp_check12.js', allJS, 'utf8');

const { execSync } = require('child_process');
try {
  execSync('node --check _tmp_check12.js', { stdio: 'pipe' });
  console.log('✓ Syntax OK');
} catch (e) {
  console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0, 5).join('\n'));
}
try { fs.unlinkSync('_tmp_check12.js'); } catch (e) {}

console.log('Done. Size:', Buffer.byteLength(html), 'bytes');
