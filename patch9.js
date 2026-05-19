// patch9.js — Complete journey tab replacement: stone trail + companion PNG scene
const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ═══════════════════════════════════════════════════════════
// 1. Google Fonts
// ═══════════════════════════════════════════════════════════
html = html.replace(
  '<meta charset="UTF-8">',
  '<meta charset="UTF-8">\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&family=Assistant:wght@400;500;600;700&display=swap" rel="stylesheet">'
);

// ═══════════════════════════════════════════════════════════
// 2. CSS — new variables + journey styles
// ═══════════════════════════════════════════════════════════
const newCSS = `
/* ===== JOURNEY TAB v2 — Stone + Companion ===== */
#view-journey {
  padding: 0 !important;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
#journey-inner {
  padding: 56px 14px 110px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100%;
}
/* Card primitive */
.j-card {
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 1px 0 rgba(45,42,38,0.02), 0 6px 20px -10px rgba(45,42,38,0.10);
  padding: 18px 18px 20px;
}
.j-eyebrow {
  font-size: 11.5px;
  letter-spacing: 0.4px;
  color: var(--g-ink-3);
  margin-bottom: 4px;
}
.j-h2 {
  font-family: 'Frank Ruhl Libre', serif;
  font-size: 19px;
  font-weight: 500;
  color: var(--g-ink);
  line-height: 1.2;
  margin: 0 0 10px;
}
.serif { font-family: 'Frank Ruhl Libre', serif; }

/* Companion select screen */
.jcs-header { padding: 20px 0 0; }
.jcs-title { font-family:'Frank Ruhl Libre',serif; font-size:28px; font-weight:500; color:var(--g-ink); line-height:1.15; margin-bottom:8px; }
.jcs-sub { font-size:14px; color:var(--g-ink-2); line-height:1.55; }
.jcs-list { display:flex; flex-direction:column; gap:12px; padding:16px 0 0; }
.jcc-btn {
  display:flex; align-items:stretch; gap:0; padding:0; width:100%;
  background:#FFFFFF; border:1.5px solid rgba(70,55,30,0.10);
  border-radius:22px; cursor:pointer; text-align:right;
  overflow:hidden; transition:border 180ms, box-shadow 180ms;
  box-shadow:0 1px 0 rgba(45,42,38,0.02), 0 6px 16px -12px rgba(45,42,38,0.12);
  position:relative;
}
.jcc-btn.selected {
  border-width:2px;
  box-shadow:0 1px 0 rgba(45,42,38,0.02), 0 12px 28px -16px rgba(0,0,0,0.18);
}
.jcc-portrait {
  width:116px; flex-shrink:0;
  display:flex; align-items:flex-end; justify-content:center;
  position:relative; overflow:hidden;
}
.jcc-portrait img {
  height:130px; object-fit:contain; mix-blend-mode:multiply; margin-bottom:-8px;
}
.jcc-content { flex:1; padding:14px 16px 14px 14px; display:flex; flex-direction:column; gap:5px; text-align:right; }
.jcc-name { font-family:'Frank Ruhl Libre',serif; font-size:19px; font-weight:500; color:var(--g-ink); line-height:1.1; }
.jcc-species { font-size:11.5px; color:var(--g-ink-3); }
.jcc-tagline { font-size:12px; font-weight:500; }
.jcc-bio { font-size:12.5px; color:var(--g-ink-2); line-height:1.5; }
.jcc-fits { font-size:11.5px; color:var(--g-ink-3); line-height:1.5; padding-top:5px; margin-top:3px; border-top:1px solid rgba(70,55,30,0.08); }
.jcc-radio {
  width:20px; height:20px; border-radius:999px;
  border:1.5px solid rgba(45,42,38,0.25); background:#FFFFFF;
  position:absolute; top:14px; right:14px;
  transition:all 180ms; pointer-events:none; flex-shrink:0;
}
.jcc-radio.on { border-width:5px; }

/* CTA bar */
.jcs-cta-bar {
  position:sticky; bottom:0; left:0; right:0;
  padding:12px 0 26px;
  background:linear-gradient(180deg, rgba(244,239,230,0) 0%, rgba(244,239,230,0.96) 30%, rgba(244,239,230,1) 100%);
  margin-top:16px;
}
.jcs-cta {
  width:100%; padding:14px 18px; border-radius:999px; border:none; cursor:pointer;
  font-family:'Assistant',sans-serif; font-size:14.5px; font-weight:600;
  transition:background 200ms, color 200ms;
}
.jcs-cta.inactive { background:rgba(45,42,38,0.20); color:rgba(255,255,255,0.7); cursor:default; }
.jcs-cta.active { background:#2D2A26; color:#FBF6EC; }

/* Confirm modal */
.j-confirm-overlay {
  position:fixed; inset:0; z-index:200;
  background:rgba(45,42,38,0.40); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
  display:flex; align-items:center; justify-content:center; padding:18px;
}
.j-confirm-box {
  background:#FFFFFF; border-radius:26px; width:100%; max-width:340px;
  box-shadow:0 30px 80px -20px rgba(45,42,38,0.45);
  padding:20px 22px 22px; text-align:center; position:relative; overflow:hidden;
}
.j-confirm-portrait {
  width:200px; height:200px; margin:0 auto 14px; position:relative;
  border-radius:999px; overflow:hidden;
}
.j-confirm-portrait img {
  position:absolute; left:50%; bottom:-4%; transform:translateX(-50%);
  height:100%; object-fit:contain; mix-blend-mode:multiply;
}

/* Companion scene */
.j-scene-wrap {
  position:relative; border-radius:999px; overflow:hidden;
  margin:0 auto;
}
.j-scene-wrap img.companion-png {
  position:absolute; left:50%; bottom:-4%; transform:translateX(-50%);
  height:94%; object-fit:contain; mix-blend-mode:multiply;
}
.j-scene-cave-overlay {
  position:absolute; top:0; left:0; right:0; height:55%;
  border-radius:inherit; pointer-events:none; z-index:1;
  background:linear-gradient(180deg, rgba(60,40,70,0.22) 0%, rgba(60,40,70,0.05) 70%, transparent 100%);
}
.j-scene-moon { position:absolute; top:12%; right:14%; z-index:2; }
.j-scene-item { position:absolute; transform:translate(-50%,-50%); z-index:3;
  filter:drop-shadow(0 2px 6px rgba(70,55,30,0.10)); pointer-events:none; }
.j-scene-pill {
  position:absolute; top:14px; left:14px; z-index:4;
  padding:5px 11px 5px 9px; border-radius:999px;
  background:rgba(255,255,255,0.78); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  border:0.5px solid rgba(70,55,30,0.10);
  display:flex; align-items:center; gap:6px; font-size:11px; color:var(--g-ink-2);
}
.j-scene-dot { width:7px; height:7px; border-radius:999px; flex-shrink:0; }

/* Speech bubble */
.j-bubble {
  background:#FFFFFF; border-radius:18px; padding:14px 18px; position:relative;
  box-shadow:0 1px 0 rgba(45,42,38,0.02), 0 6px 20px -10px rgba(45,42,38,0.10);
  max-width:340px; margin:0 auto;
}
.j-bubble::before {
  content:''; position:absolute; top:-7px; left:50%; transform:translateX(-50%) rotate(45deg);
  width:14px; height:14px; background:#FFFFFF;
  box-shadow:-2px -2px 6px -3px rgba(45,42,38,0.06);
}
.j-bubble-who { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
.j-bubble-dot { width:18px; height:18px; border-radius:999px; }
.j-bubble-name { font-size:11.5px; letter-spacing:0.4px; color:var(--g-ink-3); }
.j-bubble-text { font-size:14px; line-height:1.55; color:var(--g-ink-2); }

/* Trail card */
.j-trail-row {
  display:flex; align-items:flex-end; justify-content:space-between;
  gap:4px; position:relative; padding:0 4px 6px;
}
.j-trail-row::after {
  content:''; position:absolute; top:36px; right:22px; left:22px;
  height:1px; border-top:1px dashed rgba(70,55,30,0.18); z-index:0;
}
.j-trail-stone-btn {
  border:none; background:transparent; padding:0; cursor:pointer;
  display:flex; flex-direction:column; align-items:center; gap:4px;
  position:relative; z-index:1; min-width:44px; min-height:44px;
}
.j-trail-label { font-size:10.5px; font-weight:500; color:var(--g-ink-3); }
.j-trail-label.today { color:var(--g-ink); font-weight:600; }

/* Habit bar */
.j-habit-row { display:flex; flex-direction:column; gap:14px; margin-top:4px; }
.j-habit-item + .j-habit-item { }
.j-habit-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.j-habit-name { font-size:13.5px; color:var(--g-ink); font-weight:500; }
.j-habit-pct { font-size:12px; color:var(--g-ink-3); }
.j-habit-track { height:6px; border-radius:999px; background:rgba(110,80,40,0.08); overflow:hidden; }
.j-habit-fill { height:100%; background:linear-gradient(90deg,#C9BDA5,#8B7558); border-radius:999px; }
.j-habit-sublabel { font-size:12px; color:var(--g-ink-3); margin-top:5px; line-height:1.4; }

/* Points chip */
.j-pts-badge { font-size:12px; padding:4px 10px; border-radius:999px; font-weight:500; }

/* Unlock row */
.j-unlock-row { display:flex; align-items:center; gap:12px; padding:8px 4px; }
.j-unlock-icon { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.j-unlock-bar-wrap { margin-top:4px; height:4px; background:rgba(70,55,30,0.08); border-radius:999px; overflow:hidden; }
.j-unlock-bar-fill { height:100%; background:rgba(70,55,30,0.35); border-radius:999px; }

/* Next stage */
.j-next-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

/* Day detail sheet */
.j-sheet-overlay {
  position:fixed; inset:0; z-index:100;
  background:rgba(45,42,38,0.32); backdrop-filter:blur(2px); -webkit-backdrop-filter:blur(2px);
  display:flex; align-items:flex-end;
}
.j-sheet-box {
  width:100%; background:#FFFFFF;
  border-top-left-radius:28px; border-top-right-radius:28px;
  padding:12px 22px 38px;
  box-shadow:0 -24px 60px -20px rgba(45,42,38,0.18);
}

/* Along-day icons */
.j-along-item { display:flex; align-items:center; gap:12px; padding:8px 4px; }
.j-along-icon { width:28px; height:28px; border-radius:999px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

@keyframes jFadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
#journey-inner > * { animation: jFadeIn 0.3s ease both; }
@keyframes jFloat { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-5px)} }
.j-scene-item { animation:jFloat 3.5s ease-in-out infinite; }
.j-scene-item:nth-child(2) { animation-delay:0.8s; }
.j-scene-item:nth-child(3) { animation-delay:1.6s; }
`;

// Insert CSS before closing </style>
const styleClose = html.lastIndexOf('</style>');
html = html.slice(0, styleClose) + newCSS + html.slice(styleClose);

// ═══════════════════════════════════════════════════════════
// 3. Replace view-journey HTML
// ═══════════════════════════════════════════════════════════
const OLD_JOURNEY_START = '<!-- JOURNEY VIEW -->';
const OLD_JOURNEY_END = '\n\n<!-- BOT VIEW -->';
const newJourneyHTML = `<!-- JOURNEY VIEW -->
<div class="view" id="view-journey">
  <!-- New stone + companion journey (rendered by JS) -->
  <div id="journey-inner"></div>

  <!-- Day detail sheet (rendered by JS, appended to body) -->

  <!-- Legacy hidden layer — keeps all old element IDs so existing JS doesn't throw -->
  <div style="display:none" aria-hidden="true">
    <div id="g-companion-overlay"></div>
    <div id="g-companion-confirm"><div class="cp-confirm-box"><div class="cp-confirm-avatar"></div><div class="cp-confirm-title"></div><div class="cp-confirm-sub"></div><div class="cp-confirm-btns"><button onclick="cancelCompanionConfirm()">x</button><button onclick="confirmCompanion()">ok</button></div></div></div>
    <div id="g-companion-section"></div>
    <div id="g-top-eyebrow"></div><div id="g-top-title"></div><div id="g-top-sub"></div>
    <div id="g-mood-notice"></div>
    <div id="g-garden-wrap"></div>
    <div id="g-pts-today">0</div><div id="g-pts-total-inline">0</div>
    <div id="g-today-chips"></div><div id="g-streak-label"></div>
    <div id="g-flower-preview"></div><div id="g-roots-list"></div>
    <div id="g-fact-text"></div><div id="g-journal-list"></div>
    <div id="g-growth-content"></div><div id="growth-content"></div><div id="g-growth-card"></div>
    <div id="j-streak">0</div><div id="j-msg"></div>
    <div id="journey-path-msg"></div><div id="daily-path-wrap"></div>
    <div id="points-total">0</div><div id="next-unlock-wrap"></div><div id="unlock-items"></div>
    <div id="today-journey-desc"></div><div id="today-dot-big"></div>
    <svg id="journey-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 370" width="0" height="0">
      <path id="path-bg" d="" fill="none"/><path id="path-done" d="" fill="none" id="path-progress"/>
      <g id="milestone-nodes"></g><g id="journey-avatar"><circle id="av-glow" cx="160" cy="345" r="18"/><circle id="av-bg" cx="160" cy="345" r="14"/><ellipse id="av-hair" cx="160" cy="339" rx="9" ry="10"/><circle id="av-face" cx="160" cy="347" r="9"/></g>
    </svg>
    <div id="milestones-row"><div class="m-track"><div class="m-fill" id="m-fill" style="width:0%"></div></div></div>
    <div id="stat-streak">0</div><div id="stat-best">0</div>
    <div id="achiev-grid"></div>
    <div id="g-picker-pts">0</div><div id="g-picker-grid"></div>
    <div id="g-wild-icon"></div><div id="g-wild-name"></div><div id="g-wild-line"></div>
    <div id="g-picker-backdrop"></div><div id="g-picker-sheet"></div><div id="g-wild-modal"></div>
  </div>
</div>

`;

const journeyStart = html.indexOf(OLD_JOURNEY_START);
const journeyEnd = html.indexOf(OLD_JOURNEY_END);
if (journeyStart === -1 || journeyEnd === -1) {
  console.error('Could not find journey view markers!');
  process.exit(1);
}
html = html.slice(0, journeyStart) + newJourneyHTML + html.slice(journeyEnd + 2);

// ═══════════════════════════════════════════════════════════
// 4. Update COMPANIONS constant — add img + full data
// ═══════════════════════════════════════════════════════════
const OLD_COMPANIONS = `const COMPANIONS = {
  capy: {
    id:'capy', name:'מילי', species:'קפיברה',
    tagline:'הכי רגועה, באופן עקבי',
    bio:'מילי לא ממהרת לשום מקום. היא פה.',
    fitsIf:'אם את אוהבת קצב יציב ובלי דרמה',
    accent:'#D9A48A', accentSoft:'rgba(217,164,138,0.18)', sceneTint:'#FBF3EB',
  },
  bear: {
    id:'bear', name:'דובי', species:'דובה',
    tagline:'אלופת מצב מאורה',
    bio:'דובי שומרת מקום בלי לחץ.',
    fitsIf:'אם את אוהבת שקט ומרחב שמוגן',
    accent:'#B9A0BD', accentSoft:'rgba(185,160,189,0.18)', sceneTint:'#F4ECF4',
  },
  fox: {
    id:'fox', name:'רימי', species:'שועל',
    tagline:'מתעוררת קלות, סקרנית בנימוס',
    bio:'רימי תמיד מוכנה להתחיל.',
    fitsIf:'אם את אוהבת רוטינות בוקר ופתיחות',
    accent:'#A8956A', accentSoft:'rgba(168,149,106,0.18)', sceneTint:'#F5EFE0',
  },
  forest: {
    id:'forest', name:'יער', species:'יבחושונת',
    tagline:'הכי קרובה לאדמה',
    bio:'יער חייה של תנועה ושורשים.',
    fitsIf:'אם את אוהבת לנוע ולהרגיש את הגוף',
    accent:'#8FA679', accentSoft:'rgba(143,166,121,0.18)', sceneTint:'#EFF1E5',
  },
  cat: {
    id:'cat', name:'לונה', species:'חתולה',`;

const newCompanionConst = `const COMPANIONS = {
  capy: {
    id:'capy', name:'מילי', species:'קפיברה',
    img:'assets/companions/capy.png',
    tagline:'הכי רגועה, באופן עקבי',
    bio:'מילי לא ממהרת לשום מקום. היא מחכה בלי לדחוק.',
    fitsIf:'קצב יציב ובלי דרמה',
    accent:'#D9A48A', accentSoft:'rgba(217,164,138,0.18)', sceneTint:'#FBF3EB',
  },
  bear: {
    id:'bear', name:'דובי', species:'דובה',
    img:'assets/companions/bear.png',
    tagline:'אלופת מצב מאורה',
    bio:'דובי שומרת מקום בלי לחץ. יש שם שמיכה.',
    fitsIf:'שקט ומרחב שמוגן',
    accent:'#B9A0BD', accentSoft:'rgba(185,160,189,0.18)', sceneTint:'#F4ECF4',
  },
  fox: {
    id:'fox', name:'רימי', species:'שועל',
    img:'assets/companions/fox.png',
    tagline:'מתעוררת קלות, סקרנית בנימוס',
    bio:'רימי תמיד מוכנה להתחיל. אוזניים פתוחות.',
    fitsIf:'רוטינות בוקר ופתיחות',
    accent:'#A8956A', accentSoft:'rgba(168,149,106,0.18)', sceneTint:'#F5EFE0',
  },
  forest: {
    id:'forest', name:'יער', species:'יבחושונת',
    img:'assets/companions/forest.png',
    tagline:'הכי קרובה לאדמה',
    bio:'יער חייה של תנועה ושורשים. הולכת בקצב שלך.',
    fitsIf:'לנוע ולהרגיש את הגוף',
    accent:'#8FA679', accentSoft:'rgba(143,166,121,0.18)', sceneTint:'#EFF1E5',
  },
  cat: {
    id:'cat', name:'לונה', species:'חתולה',
    img:'assets/companions/cat.png',`;

if (html.includes(OLD_COMPANIONS)) {
  html = html.replace(OLD_COMPANIONS, newCompanionConst);
  console.log('✓ COMPANIONS updated');
} else {
  console.error('✗ COMPANIONS not found');
}

// ═══════════════════════════════════════════════════════════
// 5. Add all new JS — stone system + journey rendering
//    Insert before closing </script> at end of file
// ═══════════════════════════════════════════════════════════
const lastScriptClose = html.lastIndexOf('</script>');

const newJS = `

// ═══════════════════════════════════════════════════════════
// JOURNEY TAB v2 — Stone trail + Companion PNG scene
// ═══════════════════════════════════════════════════════════

// ── Task → Mark mapping ──
const TASK_TO_MARK = {
  breakfast:'food', lunch:'food', dinner:'food',
  shower:'hygiene', breathing:'breath', outside:'move', sleep:'rest',
};

// Derive marks from today's state
function getJourneyMarks() {
  const marks = new Set();
  (s.tasks||[]).forEach(function(t){
    if (t.done && TASK_TO_MARK[t.id]) marks.add(TASK_TO_MARK[t.id]);
  });
  if ((s.water||0) >= 4) marks.add('water');
  if (s.exChosen) marks.add('move');
  if (gs.todayMood === 'compassion') marks.add('compassion');
  return Array.from(marks);
}

// ── Companion mood ──
function deriveCompanionMood() {
  if (gs.todayMood === 'compassion') return 'cave';
  var marks = getJourneyMarks();
  if (marks.length === 0) return 'waiting';
  if (marks.length >= 5) return 'good';
  return 'active';
}

// ── Stone tone ──
var STONE_TONES = {
  full:       {light:'#F3E7CE',deep:'#D5BF9A',edge:'#B59E80',shadow:'rgba(120,95,55,0.18)'},
  partial:    {light:'#EFE3CB',deep:'#D2BD99',edge:'#B19B7D',shadow:'rgba(120,95,55,0.16)'},
  light:      {light:'#EFEAE0',deep:'#D5CDBD',edge:'#B2AC9D',shadow:'rgba(90,80,60,0.14)'},
  compassion: {light:'#E8E2DC',deep:'#C7BDB6',edge:'#A89E96',shadow:'rgba(90,80,80,0.14)'},
  empty:      {light:'#F1ECE3',deep:'#DBD3C4',edge:'#BAB1A0',shadow:'rgba(80,75,60,0.10)'},
};
function stoneToneKey(marks, compassion) {
  if (compassion) return 'compassion';
  var n = (marks||[]).length;
  if (n === 0) return 'empty';
  if (n === 1) return 'light';
  if (n >= 5) return 'full';
  return 'partial';
}

var _stoneUid = 0;

// ── Carve paths ──
var CARVE_PATHS = {
  water:     '<path d="M 0 -9 C 6 -4 6 4 0 8 C -6 4 -6 -4 0 -9 Z"/>',
  food:      '<path d="M -9 -2 L 9 -2"/><path d="M -9 -2 C -9 5 9 5 9 -2"/>',
  move:      '<path d="M -8 2 C -8 -3 -2 -5 -2 0 C -2 4 -5 5 -8 2 Z"/><path d="M 2 -2 C 2 -7 8 -9 8 -4 C 8 0 5 1 2 -2 Z"/>',
  breath:    '<path d="M -5 3 A 5 5 0 0 1 5 3"/><path d="M -8 3 A 8 8 0 0 1 8 3"/><path d="M -10 3 A 10 10 0 0 1 10 3"/>',
  rest:      '<path d="M 4 -7 A 7 7 0 1 0 4 7 A 5.2 5.2 0 1 1 4 -7 Z"/>',
  hygiene:   '<path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z"/>',
  compassion:'<path d="M -9 3 L 9 3"/><circle cx="0" cy="-1" r="3.2" fill="none"/>',
};
var SLOTS_LARGE = {
  water:      {x:-36,y:-58}, food:{x:32,y:-48}, breath:{x:-52,y:-2},
  move:       {x:10,y:10},   hygiene:{x:56,y:18}, rest:{x:-28,y:52},
  compassion: {x:34,y:62},
};
var STONE_PATH_D = 'M -10 -115 C 40 -120, 88 -98, 100 -55 C 110 -10, 108 35, 92 70 C 75 105, 35 118, -15 115 C -65 112, -100 88, -110 50 C -118 8, -112 -45, -88 -82 C -68 -110, -45 -118, -10 -115 Z';
var SMALL_STONE_PATH_D = 'M -2 -42 C 18 -44, 38 -35, 42 -12 C 46 12, 40 32, 22 40 C 0 46, -25 42, -38 28 C -48 12, -48 -10, -36 -28 C -25 -42, -15 -44, -2 -42 Z';

// Build large stone SVG
function buildStoneSVG(marks, compassion, w, h) {
  var id = 'st' + (++_stoneUid);
  var toneKey = stoneToneKey(marks, compassion);
  var t = STONE_TONES[toneKey];
  var markSet = new Set(marks||[]);
  w = w||240; h = h||258;

  var carvings = '';
  Object.keys(SLOTS_LARGE).forEach(function(k) {
    if (!markSet.has(k)) return;
    var slot = SLOTS_LARGE[k];
    carvings += '<g transform="translate('+slot.x+' '+slot.y+')">'+(CARVE_PATHS[k]||'')+'</g>';
  });

  var emptyDots = '';
  if (markSet.size === 0) {
    Object.keys(SLOTS_LARGE).forEach(function(k){
      var slot=SLOTS_LARGE[k];
      emptyDots += '<circle cx="'+slot.x+'" cy="'+slot.y+'" r="1.2"/>';
    });
  }

  var compassionMark = compassion
    ? '<g stroke="rgba(70,55,30,0.45)" stroke-width="1.2" stroke-linecap="round" fill="none"><path d="M -40 18 L 40 18"/><circle cx="0" cy="6" r="6" fill="none"/></g>'
    : '';

  return '<svg viewBox="-130 -140 260 280" width="'+w+'" height="'+h+'" style="display:block">'
    +'<defs>'
    +'<linearGradient id="sg'+id+'" x1="0.2" y1="0" x2="0.8" y2="1">'
    +'<stop offset="0" stop-color="'+t.light+'"/><stop offset="0.55" stop-color="'+t.light+'"/><stop offset="1" stop-color="'+t.deep+'"/>'
    +'</linearGradient>'
    +'<radialGradient id="sh'+id+'" cx="0.3" cy="0.25" r="0.5">'
    +'<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>'
    +'</radialGradient>'
    +'<pattern id="sp'+id+'" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">'
    +'<circle cx="3" cy="4" r="0.5" fill="'+t.edge+'" opacity="0.35"/>'
    +'<circle cx="10" cy="9" r="0.4" fill="'+t.edge+'" opacity="0.28"/>'
    +'<circle cx="7" cy="2" r="0.3" fill="'+t.edge+'" opacity="0.20"/>'
    +'<circle cx="2" cy="11" r="0.35" fill="'+t.edge+'" opacity="0.25"/>'
    +'</pattern>'
    +'<clipPath id="sc'+id+'"><path d="'+STONE_PATH_D+'"/></clipPath>'
    +'</defs>'
    +'<ellipse cx="-4" cy="120" rx="100" ry="10" fill="'+t.shadow+'"/>'
    +'<path d="'+STONE_PATH_D+'" fill="url(#sg'+id+')"/>'
    +'<g clip-path="url(#sc'+id+')"><rect x="-130" y="-140" width="260" height="280" fill="url(#sp'+id+')"/></g>'
    +'<path d="'+STONE_PATH_D+'" fill="none" stroke="'+t.edge+'" stroke-opacity="0.4" stroke-width="0.8"/>'
    +'<path d="'+STONE_PATH_D+'" fill="url(#sh'+id+')"/>'
    +'<g stroke="rgba(70,55,30,0.6)" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round">'+carvings+'</g>'
    +'<g fill="rgba(70,55,30,0.13)">'+emptyDots+'</g>'
    +compassionMark
    +'</svg>';
}

// Build small trail stone SVG
function buildTrailStoneSVG(marks, compassion, isToday, size) {
  var id = 'ts' + (++_stoneUid);
  var toneKey = stoneToneKey(marks, compassion);
  var t = STONE_TONES[toneKey];
  var markSet = new Set(marks||[]);
  size = size || 52;
  var positions = [{x:-10,y:-10},{x:10,y:-10},{x:-10,y:10},{x:10,y:10}];
  var markArr = Array.from(markSet).slice(0,4);

  var carvings = '';
  markArr.forEach(function(k,i){
    var p = markArr.length<=1 ? {x:0,y:0} : (positions[i]||{x:0,y:0});
    var sc = markArr.length<=1 ? 0.55 : 0.42;
    carvings += '<g transform="translate('+p.x+' '+p.y+') scale('+sc+')">'+(CARVE_PATHS[k]||'')+'</g>';
  });

  var compassionMark = (compassion && markSet.size===0)
    ? '<g stroke="rgba(70,55,30,0.6)" stroke-width="1.0" fill="none" stroke-linecap="round"><path d="M -16 4 L 16 4"/><circle cx="0" cy="-3" r="3"/></g>'
    : '';
  var activeDash = isToday
    ? '<circle r="50" fill="none" stroke="#2D2A26" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="2 3"/>'
    : '';

  return '<svg viewBox="-52 -52 104 104" width="'+size+'" height="'+size+'" style="display:block">'
    +'<defs><linearGradient id="'+id+'" x1="0.2" y1="0" x2="0.8" y2="1">'
    +'<stop offset="0" stop-color="'+t.light+'"/><stop offset="1" stop-color="'+t.deep+'"/>'
    +'</linearGradient></defs>'
    +activeDash
    +'<path d="'+SMALL_STONE_PATH_D+'" fill="url(#'+id+')" stroke="'+t.edge+'" stroke-opacity="0.4" stroke-width="0.6"/>'
    +'<g stroke="rgba(70,55,30,0.6)" stroke-width="1.0" fill="none" stroke-linecap="round" stroke-linejoin="round">'+carvings+'</g>'
    +compassionMark
    +'</svg>';
}

// ── Stone naming ──
function stoneNameFor(marks, compassion) {
  var m = new Set(marks||[]);
  var count = m.size;
  if (compassion) return 'אבן עצירה לגיטימית';
  if (count===0) return 'אבן בהמתנה';
  if (count===1){
    if (m.has('water'))    return 'אבן השלוק היחיד';
    if (m.has('food'))     return 'אבן הביס הקטן';
    if (m.has('rest'))     return 'אבן מצב שמיכה';
    if (m.has('breath'))   return 'אבן נשימה אחת';
    if (m.has('move'))     return 'אבן זזתי קצת';
    if (m.has('hygiene'))  return 'אבן שטיפה זריזה';
    return 'אבן סימן אחד';
  }
  if (count===2){
    if (m.has('water')&&m.has('food'))   return 'אבן שלוק וביס';
    if (m.has('rest')&&m.has('breath'))  return 'אבן מסלול רגוע';
    if (m.has('move')&&m.has('water'))   return 'אבן זזתי, שתיתי';
    return 'אבן שני סימנים';
  }
  if (count===3) return 'אבן עשיתי משהו';
  if (count===4) return 'אבן הגוף קיבל עדכון';
  if (count===5) return 'אבן יום שהשאיר סימן';
  if (count===6) return 'אבן יום שהחזיק';
  return 'אבן הדרך נבנית';
}

function stoneSentenceFor(marks, compassion) {
  if (compassion) return 'עצרת בכוונה. זה לא פיגור — זו החלטה.';
  var count = (marks||[]).length;
  if (count===0) return 'היום עוד מתחיל. אבן אחת מספיקת כדי לסמן שהיית פה.';
  if (count===1) return 'סימן אחד הוא לא יום ריק. הגוף קלט שאת בצוות.';
  if (count===2) return 'שני סימנים על האבן. לא יום לפוסטר מוטיבציה — יום של דברים שעבדו.';
  if (count<=4) return 'כמה סימנים קטנים, וזה כבר יותר מכלום עם יחסי ציבור.';
  return 'יום שהותיר סימן ברור. הדרך לא רצה לשום מקום, היא רק נבנית.';
}

// ── Action labels ──
var JOURNEY_ACTION_LABELS = {
  water:'מים', food:'אוכל', rest:'מנוחה',
  move:'תנועה', breath:'נשימה',
  hygiene:'היגיינה', compassion:'חמלה',
};

// ── Companion lines ──
var JOURNEY_COMPANION_LINES = {
  capy: {
    waiting:'אני כאן. שלוק קטן יספיק כדי להתחיל.',
    active:'נכנס שלוק. יש תיעוד. נמשיך כאילו זה היה קל.',
    good:'יום עם תזוזה. לא נוצץ — בנוי.',
    cave:'מצב מאורה הופעל. זו לא עצירה, זו אסטרטגיה.',
  },
  bear: {
    waiting:'יש פה שמיכה כשתצטרכי. בלי לחץ.',
    active:'הגוף קיבל עדכון קטן. יפה ושימושי.',
    good:'יום נדיר של תזוזה רחבה. נשמור על השמיכה.',
    cave:'מצב מאורה. אני שומרת לך מקום עד שתחזרי.',
  },
  fox: {
    waiting:'אוזניים פתוחות. פעולה אחת ואני שם.',
    active:'התחלה יפה. שתי אצבעות על הדופק.',
    good:'יום עם נוכחות. בלי הצגות.',
    cave:'גם ימי עוצמה-נמוכה הם חלק מהיום.',
  },
  forest: {
    waiting:'הולכת בקצב שלך. נחכה לתזוזה.',
    active:'תזוזה קטנה — הגוף קלט שאת בצוות.',
    good:'הלכנו קצת היום. הדרך נבנית בצעדים.',
    cave:'מצב מאורה. השורשים עובדים גם בלי תזוזה.',
  },
  cat: {
    waiting:'הערב עוד צעיר. הכל אפשרי באטיות.',
    active:'נרשם. נמשיך באור עמום.',
    good:'יום עם קצב. נשארנו עם הראש שקט.',
    cave:'מצב מאורה — אור עמום פעיל. בסדר גמור.',
  },
};

// ── Floating item SVGs ──
function buildFloatingSVG(kind, size) {
  size = size||32;
  var svgs = {
    water: '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none">'
      +'<defs><linearGradient id="fw'+size+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDE3EE"/><stop offset="1" stop-color="#93B3C4"/></linearGradient></defs>'
      +'<path d="M12 3 C 16 8 18 11 18 15 a6 6 0 0 1 -12 0 c0 -4 2 -7 6 -12 Z" fill="url(#fw'+size+')" stroke="#7C9DAE" stroke-width="0.7"/>'
      +'<ellipse cx="10" cy="11" rx="1.6" ry="2.4" fill="rgba(255,255,255,0.55)"/>'
      +'</svg>',
    food: '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none">'
      +'<defs><linearGradient id="ff'+size+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4D6B5"/><stop offset="1" stop-color="#D9A48A"/></linearGradient></defs>'
      +'<path d="M3 11 L21 11 C 21 16, 17 20, 12 20 C 7 20, 3 16, 3 11 Z" fill="url(#ff'+size+')" stroke="#A88067" stroke-width="0.7"/>'
      +'<ellipse cx="12" cy="11" rx="9" ry="1.4" fill="#FFFFFF" fill-opacity="0.5"/>'
      +'<path d="M9 6 q1 -2 0 -4 M12 6 q1.5 -2 0 -4 M15 6 q1 -2 0 -4" stroke="#B59575" stroke-width="0.9" stroke-linecap="round" fill="none" opacity="0.7"/>'
      +'</svg>',
    breath: '<svg width="'+(size+4)+'" height="'+(size+4)+'" viewBox="0 0 28 28" fill="none">'
      +'<circle cx="14" cy="14" r="11" stroke="#A8B7C2" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.6"/>'
      +'<circle cx="14" cy="14" r="7" stroke="#A8B7C2" stroke-width="0.9"/>'
      +'<circle cx="14" cy="14" r="3" fill="#CDE3EE"/>'
      +'</svg>',
    move: '<svg width="'+(size+6)+'" height="'+(size-6)+'" viewBox="0 0 34 18" fill="none">'
      +'<path d="M2 14 Q 10 4 18 10 T 32 6" stroke="#8FA679" stroke-width="1.5" stroke-linecap="round" fill="none"/>'
      +'<circle cx="2" cy="14" r="1.4" fill="#8FA679"/>'
      +'<circle cx="32" cy="6" r="1.4" fill="#8FA679"/>'
      +'</svg>',
    rest: '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none">'
      +'<path d="M16 4 A 9 9 0 1 0 16 20 A 7 7 0 1 1 16 4 Z" fill="#E8DCEB" stroke="#A593C0" stroke-width="0.8"/>'
      +'<circle cx="9" cy="6" r="0.8" fill="#A593C0" opacity="0.7"/>'
      +'<circle cx="6" cy="11" r="0.6" fill="#A593C0" opacity="0.6"/>'
      +'</svg>',
    hygiene: '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none">'
      +'<path d="M12 3 L13.5 9.5 L20 11 L13.5 12.5 L12 19 L10.5 12.5 L4 11 L10.5 9.5 Z" fill="#F1E4C9" stroke="#B5A07A" stroke-width="0.7"/>'
      +'<circle cx="12" cy="11" r="1.2" fill="#FFFFFF" opacity="0.7"/>'
      +'</svg>',
    compassion: '<svg width="'+(size+6)+'" height="'+(size+6)+'" viewBox="0 0 30 30" fill="none">'
      +'<circle cx="15" cy="15" r="13" fill="#F4ECF4" stroke="#C8B8DC" stroke-width="0.8"/>'
      +'<path d="M15 9 C 12 9, 10.5 11.5, 12.5 14 L 15 17 L 17.5 14 C 19.5 11.5, 18 9, 15 9 Z" fill="#C8B8DC"/>'
      +'</svg>',
  };
  return svgs[kind] || svgs.water;
}

// ── 7-day trail data ──
var HEBREW_DAYS = ['ש','א','ב','ג','ד','ה','ו'];
function getJourneyTrail() {
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
}

// ── Habit strength data ──
function getJourneyHabits() {
  var marks = new Set(getJourneyMarks());
  var allKinds = ['water','food','move','breath','rest','hygiene'];
  var result = [];
  allKinds.forEach(function(k){ if(marks.has(k)) result.push({kind:k, pct:100}); });
  if (result.length===0) {
    // show compassion if that's the mark
    if (marks.has('compassion')) result.push({kind:'compassion', pct:100});
  }
  return result;
}

function pctLabel(pct) {
  if (pct<=15)  return 'התחלה';
  if (pct<=35)  return 'הדרך מתחילה לקבל צורה';
  if (pct<=55)  return 'הגוף מתחיל לזהות את הקצב';
  if (pct<=75)  return 'זה כבר קורה יותר מפעם אחת';
  if (pct<=90)  return 'ההרגל מתחיל להיכנס לשגרה';
  return 'זה כבר חלק מהדרך שלך';
}

// ── Along-the-day icon colors ──
var ALONG_COLORS = {
  water:'#BDD7E8', food:'#F2C7A9', rest:'#C8B8DC',
  move:'#9DB89C', breath:'#B5C2C9', hygiene:'#F4DFA6', compassion:'#E6BFC3',
};
var ALONG_SUBLABELS = {
  water:'שלוק שנרשם.',
  food:'ביס קטן, עבודה חשובה.',
  rest:'מנוחה עם כוונה.',
  move:'תזוזה קלה — לא כל יום צריךה ריצה.',
  breath:'נשימה אחת מספיקת כדי לחזור.',
  hygiene:'דבר קטן, הרגשה גדולה.',
  compassion:'יום חמלה. עצירה לגיטימית.',
};

// Carve icon SVG inline (small, for chips)
function buildCarveIconSVG(kind, size, color) {
  size = size||16; color = color||'rgba(70,55,30,0.7)';
  return '<svg viewBox="-12 -12 24 24" width="'+size+'" height="'+size+'" style="display:block;flex-shrink:0">'
    +'<g stroke="'+color+'" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round">'
    +(CARVE_PATHS[kind]||'')
    +'</g></svg>';
}

// ── Unlocks data ──
var JOURNEY_UNLOCKS = [
  {at:80,  label:'מרקם אבן חדש',          tone:'#D5BF9A'},
  {at:150, label:'חריטות נוספות',tone:'#B5C2C9'},
  {at:250, label:'רקע ערב',                                    tone:'#A89E96'},
  {at:400, label:'מסגרת לאבן',                  tone:'#B59E80'},
  {at:600, label:'שמות אבן חדשים',tone:'#9DB89C'},
  {at:900, label:'השלב הבא',                              tone:'#7E9C7B'},
];

// ── HTML builders ──

function buildMCard(content, extraStyle) {
  return '<div class="j-card" style="'+(extraStyle||'')+'">'+content+'</div>';
}
function buildMCardHeader(eyebrow, title) {
  return '<div class="j-eyebrow">'+eyebrow+'</div>'
    +'<div class="j-h2 serif">'+title+'</div>';
}

function buildCompanionTopCardHTML(c, today) {
  return '<div style="padding:4px 4px 0">'
    +'<div style="font-size:12px;color:var(--g-ink-3);margin-bottom:6px;letter-spacing:0.3px">'+today+' · '+c.name+' איתך</div>'
    +'<div class="serif" style="font-size:30px;line-height:1.1;font-weight:500;color:var(--g-ink);margin-bottom:8px">המסע של היום</div>'
    +'<div style="font-size:14.5px;line-height:1.55;color:var(--g-ink-2);max-width:320px">אנחנו פשוט עוברים את היום עם נוכחות אחת קטנה לידנו.</div>'
    +'</div>';
}

function buildCompanionHeroHTML(c, marks, mood) {
  var sceneSize = 250;
  var compassion = (mood==='cave');
  var tint = compassion ? '#F0E6EE'
    : mood==='waiting' ? '#F6F0E5'
    : mood==='good' ? '#FBF1DC'
    : c.sceneTint;

  // Floating items: last 3 marks at fixed positions
  var itemPositions = [{x:'12%',y:'40%'},{x:'88%',y:'32%'},{x:'78%',y:'76%'}];
  var visibleItems = compassion
    ? [{kind:'compassion',x:'50%',y:'14%'}]
    : marks.slice(-3).map(function(k,i){ return {kind:k,x:itemPositions[i].x,y:itemPositions[i].y}; });

  var dotColor = mood==='cave' ? '#A593C0' : mood==='good' ? '#967A4E' : mood==='waiting' ? '#B49B7A' : c.accent;
  var pillText = mood==='cave' ? 'מצב מאורה'
    : mood==='good' ? 'במצב טוב'
    : mood==='waiting' ? 'ממתינה' : 'איתך היום';

  var floatItemsHTML = visibleItems.map(function(it){
    return '<div class="j-scene-item" style="left:'+it.x+';top:'+it.y+'">'+buildFloatingSVG(it.kind,36)+'</div>';
  }).join('');

  var caveOverlay = compassion
    ? '<div class="j-scene-cave-overlay"></div>'
    : '';
  var moonSVG = compassion
    ? '<div class="j-scene-moon"><svg width="34" height="34" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="11" fill="rgba(255,250,235,0.85)"/><circle cx="11" cy="13" r="8.5" fill="#F0E6EE"/><circle cx="22" cy="9" r="0.8" fill="rgba(255,250,235,0.7)"/><circle cx="25" cy="16" r="0.6" fill="rgba(255,250,235,0.55)"/></svg></div>'
    : '';

  var imgFilter = compassion ? 'brightness(0.94) saturate(0.9)' : 'none';

  var sceneHTML = '<div class="j-scene-wrap" style="width:'+sceneSize+'px;height:'+sceneSize+'px;'
    +'background:radial-gradient(circle at 50% 35%, #FFFFFF 0%, '+tint+' 60%, '+tint+' 100%);'
    +'box-shadow:inset 0 -20px 40px -20px '+c.accent+'33;">'
    +caveOverlay+moonSVG
    +'<img src="'+c.img+'" alt="'+c.name+' · '+c.species+'" loading="lazy" decoding="async"'
    +' style="position:absolute;left:50%;bottom:'+(compassion?'-2%':'-4%')+';transform:translateX(-50%);'
    +'height:94%;object-fit:contain;mix-blend-mode:multiply;filter:'+imgFilter+'">'
    +floatItemsHTML
    +'<div class="j-scene-pill">'
    +'<span class="j-scene-dot" style="background:'+dotColor+'"></span>'
    +pillText+'</div>'
    +'</div>';

  // Speech bubble
  var lineText = (JOURNEY_COMPANION_LINES[c.id]||{})[mood] || '';
  var bubbleHTML = '<div class="j-bubble">'
    +'<div class="j-bubble-who">'
    +'<div class="j-bubble-dot" style="background:'+c.accentSoft+';border:1px solid '+c.accent+'"></div>'
    +'<span class="j-bubble-name">'+c.name+' · '+c.species+'</span>'
    +'</div>'
    +'<div class="j-bubble-text">'+lineText+'</div>'
    +'</div>';

  return buildMCard(
    '<div style="display:flex;flex-direction:column;align-items:center;gap:14px">'
    +sceneHTML+bubbleHTML+'</div>',
    'padding:20px 18px 22px'
  );
}

function buildAlongTheDayHTML(marks, c) {
  var content = buildMCardHeader('איתך · '+c.name, 'מה עשינו היום');
  if (marks.length===0) {
    content += '<div style="font-size:13px;color:var(--g-ink-3);line-height:1.55">היום עוד מתחיל. סימן אחד מספיק כדי להתחיל לסמן.</div>';
  } else {
    content += '<div style="display:flex;flex-direction:column;gap:0">';
    marks.forEach(function(k){
      var label = JOURNEY_ACTION_LABELS[k]||k;
      var sub = ALONG_SUBLABELS[k]||'';
      var color = ALONG_COLORS[k]||'#E0D5C5';
      content += '<div class="j-along-item">'
        +'<div class="j-along-icon" style="background:'+color+'">'+buildCarveIconSVG(k,14,'rgba(45,42,38,0.7)')+'</div>'
        +'<div style="flex:1"><div style="font-size:13.5px;color:var(--g-ink);font-weight:500">'+label+'</div>'
        +'<div style="font-size:11.5px;color:var(--g-ink-3)">'+sub+'</div></div>'
        +'</div>';
    });
    content += '</div>';
  }
  return buildMCard(content);
}

function buildStoneTrailHTML(trailDays) {
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
}

function buildPointsCardHTML(points, marks, c) {
  var todayPoints = (marks.length * 3 + 2);
  var content = '<div style="display:flex;align-items:baseline;justify-content:space-between">'
    +'<div>'
    +'<div class="j-eyebrow">נקודות חיבור</div>'
    +'<div style="display:flex;align-items:baseline;gap:6px;margin-top:4px">'
    +'<span class="serif" style="font-size:36px;font-weight:500;color:var(--g-ink);line-height:1">'+points+'</span>'
    +'<span style="font-size:13px;color:var(--g-ink-3)">נקודות</span>'
    +'</div></div>'
    +'<span class="j-pts-badge" style="color:'+c.accent+';background:'+c.accentSoft+'88">+'
    +todayPoints+' היום</span>'
    +'</div>'
    +'<div style="font-size:13px;color:var(--g-ink-2);line-height:1.55;margin-top:10px">'
    +'נקודות חיבור לא מודדות כמה את שווה. הן רק סופרות רגעים שעשית בהם משהו בשבילך.'
    +'</div>';
  return buildMCard(content);
}

function buildHabitStrengthHTML(habits) {
  if (!habits || habits.length===0) return '';
  var content = buildMCardHeader('התמדה מול עצמך', 'חוזק ההרגל');
  content += '<div class="j-habit-row">';
  habits.forEach(function(h){
    var label = JOURNEY_ACTION_LABELS[h.kind]||h.kind;
    content += '<div>'
      +'<div class="j-habit-head">'
      +'<div style="display:flex;align-items:center;gap:8px">'+buildCarveIconSVG(h.kind,16)+'<span class="j-habit-name">'+label+'</span></div>'
      +'<span class="j-habit-pct">'+h.pct+'%</span>'
      +'</div>'
      +'<div class="j-habit-track"><div class="j-habit-fill" style="width:'+h.pct+'%"></div></div>'
      +'<div class="j-habit-sublabel">'+pctLabel(h.pct)+'</div>'
      +'</div>';
  });
  content += '</div>';
  return buildMCard(content);
}

function buildFactCardHTML() {
  var fact = typeof getTodayFact==='function' ? getTodayFact() : (gs.todayFact || '');
  if (!fact) return '';
  var content = buildMCardHeader('הידעת', 'עובדה קצרה להיום');
  content += '<div style="font-size:14px;color:var(--g-ink-2);line-height:1.6">'+fact+'</div>';
  return buildMCard(content, 'background:linear-gradient(180deg,#FBF6EB,#F4ECDA)');
}

function buildNextStageHTML() {
  var content = '<div style="display:flex;align-items:flex-start;gap:14px">'
    +'<div class="j-next-icon" style="background:rgba(186,177,160,0.22)">'
    +'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#8A857D" stroke-width="1.6"/><path d="M8 11 V8 a4 4 0 0 1 8 0 v3" stroke="#8A857D" stroke-width="1.6"/></svg>'
    +'</div>'
    +'<div style="flex:1">'
    +'<div class="serif" style="font-size:17px;font-weight:500;color:var(--g-ink);margin-bottom:4px">השלב הבא</div>'
    +'<div style="font-size:13px;color:var(--g-ink-2);line-height:1.55">השלב הבא ייפתח אחרי תקופה של התמדה מול עצמך. לא כדי להעמיס, אלא כדי להוסיף משהו שהוא מעבר לבסיס.</div>'
    +'</div></div>';
  return buildMCard(content, 'background:linear-gradient(180deg,rgba(255,255,255,0.55),rgba(245,239,224,0.55));border:1px dashed rgba(70,55,30,0.18);box-shadow:none');
}

// ── Today stone card HTML ──
function buildTodayStoneHTML(marks, compassion) {
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
}

// ── Companion select screen HTML ──
function buildCompanionSelectHTML() {
  var pending = cs._pendingId;
  var cards = Object.values(COMPANIONS).map(function(c){
    var selected = pending===c.id;
    var accentBorder = selected ? 'border-color:'+c.accent+';border-width:2px' : '';
    var shadowStyle = selected ? 'box-shadow:0 1px 0 rgba(45,42,38,0.02),0 12px 28px -16px '+c.accent+'88' : '';
    var radioBorder = selected ? 'border:5px solid '+c.accent : 'border:1.5px solid rgba(45,42,38,0.25)';
    return '<button class="jcc-btn'+(selected?' selected':'')+'" '
      +'style="'+accentBorder+';'+shadowStyle+'" '
      +'onclick="selectJourneyCompanion(this.dataset.id)" data-id="'+c.id+'">'
      +'<div class="jcc-portrait" style="background:radial-gradient(circle at 50% 60%,#FFFFFF 0%,'+c.sceneTint+' 70%)">'
      +'<img src="'+c.img+'" alt="'+c.species+'" loading="lazy" decoding="async">'
      +'</div>'
      +'<div class="jcc-content">'
      +'<div style="display:flex;align-items:baseline;gap:6px">'
      +'<span class="jcc-name serif">'+c.name+'</span>'
      +'<span class="jcc-species">· '+c.species+'</span>'
      +'</div>'
      +'<div class="jcc-tagline" style="color:'+c.accent+'">'+c.tagline+'</div>'
      +'<div class="jcc-bio">'+c.bio+'</div>'
      +'<div class="jcc-fits">מתאימה אם: '+c.fitsIf+'</div>'
      +'</div>'
      +'<div class="jcc-radio'+(selected?' on':'')+'" style="'+radioBorder+'"></div>'
      +'</button>';
  }).join('');

  var ctaText = pending
    ? ('בחרתי את '+(COMPANIONS[pending]?COMPANIONS[pending].name:''))
    : 'בחרי דמות כדי להמשיך';
  var ctaClass = pending ? 'jcs-cta active' : 'jcs-cta inactive';

  return '<div class="jcs-header">'
    +'<div style="font-size:11.5px;letter-spacing:0.4px;color:var(--g-ink-3);margin-bottom:6px">רגע לפני שמתחילים</div>'
    +'<div class="jcs-title">מי תלווה אותך בדרך?</div>'
    +'<div class="jcs-sub">יצור מלווה שנע איתך, מגיב לפעולות הקטנות, ולא נעלב אם את לא מופיעה. אפשר להחליף בכל רגע.</div>'
    +'</div>'
    +'<div class="jcs-list">'+cards+'</div>'
    +'<div style="font-size:12px;color:var(--g-ink-3);text-align:center;line-height:1.5;margin:8px 0">אפשר להחליף בכל זמן. הן לא ייפגעו.</div>'
    +'<div class="jcs-cta-bar">'
    +'<button class="'+ctaClass+'" onclick="confirmJourneyCompanion()" '+(pending?'':'disabled')+'>'+ctaText+'</button>'
    +'</div>';
}

// ── Confirm modal HTML ──
function buildConfirmModalHTML(c) {
  return '<div class="j-confirm-overlay" id="j-confirm-overlay" onclick="cancelJourneyConfirm()">'
    +'<div class="j-confirm-box" onclick="event.stopPropagation()">'
    +'<div class="j-confirm-portrait" style="background:radial-gradient(circle at 50% 35%,#FFFFFF 0%,'+c.sceneTint+' 65%);box-shadow:inset 0 -16px 30px -16px '+c.accent+'40">'
    +'<img src="'+c.img+'" alt="'+c.species+'" loading="lazy" decoding="async">'
    +'</div>'
    +'<div class="serif" style="font-size:23px;font-weight:500;color:var(--g-ink);line-height:1.15;margin-bottom:4px">'
    +'לתת ל'+c.name+' להצטרף?</div>'
    +'<div style="font-size:13.5px;color:var(--g-ink-2);line-height:1.55;margin-bottom:18px;max-width:280px;margin-inline:auto">'+c.tagline+'. את תוכלי להחליף בכל זמן.</div>'
    +'<div style="display:flex;gap:8px">'
    +'<button onclick="cancelJourneyConfirm()" style="flex:1;padding:12px 16px;border-radius:999px;background:#F7F3EC;border:1px solid rgba(70,55,30,0.10);font-size:13.5px;color:var(--g-ink-2);cursor:pointer;font-weight:500;font-family:inherit">עוד רגע</button>'
    +'<button onclick="doConfirmJourneyCompanion()" style="flex:1.3;padding:12px 16px;border-radius:999px;background:'+c.accent+';border:none;font-size:13.5px;color:#FFFFFF;cursor:pointer;font-weight:600;box-shadow:0 4px 14px -4px '+c.accent+'88;font-family:inherit">נצא לדרך</button>'
    +'</div>'
    +'</div></div>';
}

// ── Main journey content HTML ──
function buildJourneyMainHTML() {
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
    buildAlongTheDayHTML(marks, c),
    buildTodayStoneHTML(marks, compassion),
    buildStoneTrailHTML(trail),
    buildPointsCardHTML(points, marks, c),
    buildHabitStrengthHTML(habits),
    buildFactCardHTML(),
    buildNextStageHTML(),
  ];

  return parts.join('');
}

// ── Main entry point ──
function renderJourneyTab() {
  var inner = document.getElementById('journey-inner');
  if (!inner) return;
  if (!cs.companionId) {
    inner.innerHTML = buildCompanionSelectHTML();
  } else {
    inner.innerHTML = buildJourneyMainHTML();
  }
}

// ── Companion select actions ──
function selectJourneyCompanion(id) {
  cs._pendingId = id;
  renderJourneyTab(); // re-render select screen with new selection
}

function confirmJourneyCompanion() {
  if (!cs._pendingId) return;
  var c = COMPANIONS[cs._pendingId];
  if (!c) return;
  // Show confirm modal
  var modal = document.createElement('div');
  modal.id = 'j-confirm-overlay';
  modal.innerHTML = buildConfirmModalHTML(c);
  document.body.appendChild(modal.firstElementChild || modal);
  // Actually just append the overlay div
  var overlay = document.createElement('div');
  overlay.innerHTML = buildConfirmModalHTML(c);
  document.body.appendChild(overlay.firstElementChild);
}

function cancelJourneyConfirm() {
  var overlay = document.getElementById('j-confirm-overlay');
  if (overlay) overlay.remove();
}

function doConfirmJourneyCompanion() {
  if (!cs._pendingId) return;
  cs.companionId = cs._pendingId;
  cs.selectedAt = new Date().toISOString();
  cs.switchCount = (cs.switchCount||0) + 1;
  cs._pendingId = null;
  saveCompanionState();
  cancelJourneyConfirm();
  renderJourneyTab();
}

// ── Day detail sheet ──
var _journeyTrailDays = [];
function openDayDetail(idx) {
  var day = _journeyTrailDays[idx];
  if (!day) return;
  var marks = day.marks||[];
  var compassion = day.compassion||false;
  var name = stoneNameFor(marks, compassion);
  var sentence = stoneSentenceFor(marks, compassion);
  var svg = buildStoneSVG(marks, compassion, 186, 200);

  var chipsHTML = marks.length===0
    ? '<span style="font-size:13px;color:var(--g-ink-3)">היום נשמר ניטרלי.</span>'
    : marks.map(function(k){
        return '<div style="display:flex;align-items:center;gap:6px;padding:5px 11px 5px 9px;background:#F7F3EC;border:1px solid rgba(70,55,30,0.10);border-radius:999px;font-size:12.5px;color:var(--g-ink-2)">'
          +buildCarveIconSVG(k,14)+'<span>'+(JOURNEY_ACTION_LABELS[k]||k)+'</span></div>';
      }).join('');

  var html = '<div style="position:fixed;inset:0;z-index:100;background:rgba(45,42,38,0.32);backdrop-filter:blur(2px);display:flex;align-items:flex-end" onclick="closeDayDetail()">'
    +'<div onclick="event.stopPropagation()" style="width:100%;background:#FFFFFF;border-top-left-radius:28px;border-top-right-radius:28px;padding:12px 22px 38px;box-shadow:0 -24px 60px -20px rgba(45,42,38,0.18)">'
    +'<div style="display:flex;justify-content:center;margin-bottom:6px"><div style="width:36px;height:4px;border-radius:999px;background:rgba(110,80,40,0.18)"></div></div>'
    +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">'
    +'<div><div class="j-eyebrow">'+(day.dateLabel||day.shortLabel||'')+'</div>'
    +'<div class="serif" style="font-size:22px;font-weight:500;color:var(--g-ink);line-height:1.15;margin-top:4px">'+name+'</div>'
    +'</div>'
    +'<button onclick="closeDayDetail()" style="border:none;background:#F7F3EC;width:32px;height:32px;border-radius:999px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3 L11 11 M11 3 L3 11" stroke="#57534D" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +'</button></div>'
    +'<div style="display:flex;justify-content:center;margin:12px 0 14px">'+svg+'</div>'
    +'<div style="font-size:11.5px;color:var(--g-ink-3);margin-bottom:4px">סימנים שנחרטו</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">'+chipsHTML+'</div>'
    +'<div style="font-size:11.5px;color:var(--g-ink-3);margin-bottom:4px">משפט תורי</div>'
    +'<div style="font-size:13.5px;color:var(--g-ink-2);line-height:1.55;font-style:italic">'+sentence+'</div>'
    +'</div></div>';

  var overlay = document.createElement('div');
  overlay.id = 'j-day-detail-overlay';
  overlay.innerHTML = html;
  document.body.appendChild(overlay.firstElementChild);
}
function closeDayDetail() {
  var el = document.getElementById('j-day-detail-overlay');
  if (el) el.remove();
  var el2 = document.querySelector('[onclick="closeDayDetail()"]');
  // fallback: remove overlay directly
  document.querySelectorAll('[id="j-day-detail-overlay"]').forEach(function(e){ e.remove(); });
}

// Override checkAndShowCompanion
async function checkAndShowCompanion() {
  await loadCompanionState();
  cs._pendingId = cs._pendingId || cs.companionId;
  renderJourneyTab();
  // cache trail for day detail
  _journeyTrailDays = getJourneyTrail();
}
`;

html = html.slice(0, lastScriptClose) + newJS + html.slice(lastScriptClose);

// ═══════════════════════════════════════════════════════════
// 6. Update renderGardenCards to call renderJourneyTab
// ═══════════════════════════════════════════════════════════
const OLD_RENDER_GARDEN = `function renderGardenCards() {
  if(cs.companionId) renderCompanionSection();
  renderGardenTopCard();`;
const NEW_RENDER_GARDEN = `function renderGardenCards() {
  // Refresh new journey tab when tasks change
  try { renderJourneyTab(); _journeyTrailDays=getJourneyTrail(); } catch(e){}
  if(cs.companionId) renderCompanionSection();
  renderGardenTopCard();`;

if (html.includes(OLD_RENDER_GARDEN)) {
  html = html.replace(OLD_RENDER_GARDEN, NEW_RENDER_GARDEN);
  console.log('✓ renderGardenCards updated');
} else {
  console.error('✗ renderGardenCards not found');
}

// ═══════════════════════════════════════════════════════════
// 7. Update switchView to call renderJourneyTab on journey
// ═══════════════════════════════════════════════════════════
const OLD_SWITCH = `  if (v==='journey') { checkAndShowCompanion(); renderJourneyPath(); }`;
const NEW_SWITCH = `  if (v==='journey') { checkAndShowCompanion(); try{renderJourneyPath();}catch(e){} }`;

if (html.includes(OLD_SWITCH)) {
  html = html.replace(OLD_SWITCH, NEW_SWITCH);
  console.log('✓ switchView updated');
} else {
  // Try simpler match
  const OLD_SWITCH2 = `if (v==='journey') { checkAndShowCompanion();`;
  if (html.includes(OLD_SWITCH2)) {
    console.log('✓ switchView already ok');
  } else {
    console.error('✗ switchView not found');
  }
}

// Write output
fs.writeFileSync('body-soul-app.html', html, 'utf8');
console.log('Done. Size: ' + html.length + ' bytes (' + Math.round(html.length/1024) + ' KB)');
