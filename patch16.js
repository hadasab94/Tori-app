// patch16.js — Companion home illustrations
// Adds homeImg field to each companion and rewrites buildCompanionHeroHTML
// to show the full-scene illustration instead of the gradient+SVG circle.

const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ─── 1. Update COMPANIONS — add homeImg + fix names ────────────────────────
const OLD_COMPANIONS = `const COMPANIONS = {
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
    id:'forest', name:'יער', species:'חפשושית',
    img:'assets/companions/forest.png',
    tagline:'הכי קרובה לאדמה',
    bio:'יער חייה של תנועה ושורשים. הולכת בקצב שלך.',
    fitsIf:'לנוע ולהרגיש את הגוף',
    accent:'#8FA679', accentSoft:'rgba(143,166,121,0.18)', sceneTint:'#EFF1E5',
  },
  cat: {
    id:'cat', name:'לונה', species:'חתולה',
    img:'assets/companions/cat.png',
    tagline:'אינטואיטיבית, אדם של ערב',
    bio:'לונה מופיעה כשצריך אותה.',
    fitsIf:'אם את אוהבת ערב שקט ואור עמום',
    accent:'#8E89A8', accentSoft:'rgba(142,137,168,0.18)', sceneTint:'#EEEBF1',
  },
};`;

const NEW_COMPANIONS = `const COMPANIONS = {
  capy: {
    id:'capy', name:'קפיברה', species:'קפיברה',
    img:'assets/companions/capy.png',
    homeImg:'assets/companions/capy-home.png',
    tagline:'הכי רגועה, באופן עקבי',
    bio:'לא ממהרת לשום מקום. מחכה בלי לדחוק.',
    fitsIf:'קצב יציב ובלי דרמה',
    accent:'#D9A48A', accentSoft:'rgba(217,164,138,0.18)', sceneTint:'#FBF3EB',
  },
  bear: {
    id:'bear', name:'דובה', species:'דובה',
    img:'assets/companions/bear.png',
    homeImg:'assets/companions/bear-home.png',
    tagline:'אלופת מצב מאורה',
    bio:'שומרת מקום בלי לחץ. יש שם שמיכה.',
    fitsIf:'שקט ומרחב שמוגן',
    accent:'#B9A0BD', accentSoft:'rgba(185,160,189,0.18)', sceneTint:'#F4ECF4',
  },
  fox: {
    id:'fox', name:'שועלה', species:'שועלה',
    img:'assets/companions/fox.png',
    homeImg:'assets/companions/fox-home.png',
    tagline:'מתעוררת קלות, סקרנית בנימוס',
    bio:'תמיד מוכנה להתחיל. אוזניים פתוחות.',
    fitsIf:'רוטינות בוקר ופתיחות',
    accent:'#A8956A', accentSoft:'rgba(168,149,106,0.18)', sceneTint:'#F5EFE0',
  },
  forest: {
    id:'forest', name:'חפשושית', species:'חפשושית',
    img:'assets/companions/forest.png',
    homeImg:'assets/companions/forest-home.png',
    tagline:'הכי קרובה לאדמה',
    bio:'חייה של תנועה ושורשים. הולכת בקצב שלך.',
    fitsIf:'לנוע ולהרגיש את הגוף',
    accent:'#8FA679', accentSoft:'rgba(143,166,121,0.18)', sceneTint:'#EFF1E5',
  },
  cat: {
    id:'cat', name:'חתולה', species:'חתולה',
    img:'assets/companions/cat.png',
    homeImg:'assets/companions/cat-home.png',
    tagline:'אינטואיטיבית, אדם של ערב',
    bio:'מופיעה כשצריך אותה.',
    fitsIf:'ערב שקט ואור עמום',
    accent:'#8E89A8', accentSoft:'rgba(142,137,168,0.18)', sceneTint:'#EEEBF1',
  },
};`;

if (!html.includes(OLD_COMPANIONS)) {
  console.error('✗ COMPANIONS block not found');
  process.exit(1);
}
html = html.replace(OLD_COMPANIONS, NEW_COMPANIONS);
console.log('✓ COMPANIONS updated (homeImg added, names fixed)');

// ─── 2. CSS for the home illustration card ─────────────────────────────────
const NEW_CSS = `
/* ===== COMPANION HOME ILLUSTRATION ===== */
.j-home-img-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #F0EBE0;
  aspect-ratio: 3 / 4;
  max-height: 340px;
}
.j-home-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
  transition: filter 0.3s;
}
.j-home-img-wrap.cave img {
  filter: brightness(0.78) saturate(0.65);
}
.j-home-pill {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px 5px 9px;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: var(--g-ink-2);
  font-family: 'Assistant', sans-serif;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.j-home-pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  flex-shrink: 0;
}
.j-home-marks {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.j-home-mark-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  background: rgba(255,255,255,0.80);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 999px;
  font-size: 11.5px;
  font-family: 'Assistant', sans-serif;
  color: var(--g-ink-2);
  box-shadow: 0 1px 4px rgba(0,0,0,0.09);
}
`;

const styleClose = html.lastIndexOf('</style>');
html = html.slice(0, styleClose) + NEW_CSS + html.slice(styleClose);
console.log('✓ CSS added');

// ─── 3. Rewrite buildCompanionHeroHTML ─────────────────────────────────────
const OLD_HERO_START = 'function buildCompanionHeroHTML(c, marks, mood) {';
const OLD_HERO_END = '  return buildMCard(\n    \'<div style="display:flex;flex-direction:column;align-items:center;gap:14px">\'\n    +sceneHTML+bubbleHTML+\'</div>\',\n    \'padding:20px 18px 22px\'\n  );\n}';

const heroStart = html.indexOf(OLD_HERO_START);
const heroEnd = html.indexOf(OLD_HERO_END);

if (heroStart === -1 || heroEnd === -1) {
  console.error('✗ buildCompanionHeroHTML boundaries not found', heroStart, heroEnd);
  process.exit(1);
}

const NEW_HERO = `function buildCompanionHeroHTML(c, marks, mood) {
  var compassion = (mood === 'cave');
  var dotColor = compassion ? '#A593C0' : mood==='good' ? '#967A4E' : mood==='waiting' ? '#B49B7A' : c.accent;
  var pillText  = compassion ? 'מצב מאורה' : mood==='good' ? 'במצב טוב' : mood==='waiting' ? 'ממתינה' : 'איתך היום';

  // Mark chips — show last 3 completed marks as floating pills
  var labelMap = {
    water:'💧 מים', food:'🍽 אוכל', rest:'😴 מנוחה',
    move:'🏃 תנועה', breath:'🌬 נשימה', hygiene:'🚿 היגיינה', compassion:'🫶 חמלה'
  };
  var chipMarks = compassion ? ['compassion'] : marks.slice(-3);
  var marksHTML = chipMarks.map(function(k) {
    return '<div class="j-home-mark-chip">' + (labelMap[k] || k) + '</div>';
  }).join('');

  // Full-scene illustration
  var imgSrc = c.homeImg || c.img;
  var homeHTML = '<div class="j-home-img-wrap' + (compassion ? ' cave' : '') + '">'
    + '<img src="' + imgSrc + '" alt="' + c.name + '" loading="lazy" decoding="async">'
    + (marksHTML ? '<div class="j-home-marks">' + marksHTML + '</div>' : '')
    + '<div class="j-home-pill">'
    + '<span class="j-home-pill-dot" style="background:' + dotColor + '"></span>'
    + pillText
    + '</div>'
    + '</div>';

  // Speech bubble
  var lineText = (JOURNEY_COMPANION_LINES[c.id] || {})[mood] || '';
  var bubbleHTML = '<div class="j-bubble" style="margin:0">'
    + '<div class="j-bubble-who">'
    + '<div class="j-bubble-dot" style="background:' + c.accentSoft + ';border:1px solid ' + c.accent + '"></div>'
    + '<span class="j-bubble-name">' + c.name + '</span>'
    + '</div>'
    + '<div class="j-bubble-text">' + lineText + '</div>'
    + '</div>';

  return buildMCard(homeHTML + bubbleHTML, 'padding:0;overflow:hidden');
}`;

html = html.slice(0, heroStart) + NEW_HERO + html.slice(heroEnd + OLD_HERO_END.length);
console.log('✓ buildCompanionHeroHTML rewritten');

// ─── 4. Write + verify ─────────────────────────────────────────────────────
fs.writeFileSync('body-soul-app.html', html, 'utf8');

const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || [];
let allJS = '';
scripts.forEach(function(s) {
  allJS += s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '') + '\n';
});
fs.writeFileSync('_tmp_check16.js', allJS, 'utf8');
const { execSync } = require('child_process');
try {
  execSync('node --check _tmp_check16.js', { stdio: 'pipe' });
  console.log('✓ Syntax OK');
} catch(e) {
  console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0,5).join('\n'));
}
try { fs.unlinkSync('_tmp_check16.js'); } catch(e) {}

const checks = [
  { label: 'bear homeImg',        needle: "homeImg:'assets/companions/bear-home.png'" },
  { label: 'cat homeImg',         needle: "homeImg:'assets/companions/cat-home.png'" },
  { label: 'fox homeImg',         needle: "homeImg:'assets/companions/fox-home.png'" },
  { label: 'forest homeImg',      needle: "homeImg:'assets/companions/forest-home.png'" },
  { label: 'capy homeImg',        needle: "homeImg:'assets/companions/capy-home.png'" },
  { label: 'j-home-img-wrap CSS', needle: '.j-home-img-wrap' },
  { label: 'new hero function',   needle: 'j-home-img-wrap' },
  { label: 'old j-scene-wrap gone', needle: 'j-scene-wrap', absent: true },
];
console.log('\n--- Verification ---');
let ok = true;
checks.forEach(function(c) {
  var found = html.includes(c.needle);
  var pass = c.absent ? !found : found;
  if (!pass) ok = false;
  console.log((pass ? '✓' : '✗') + ' ' + c.label);
});
console.log('\n' + (ok ? '✓ ALL CLEAR' : '✗ ISSUES FOUND'));
console.log('Size:', Buffer.byteLength(html), 'bytes');
