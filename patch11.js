// patch11.js — Companion action buttons below the companion scene
// Adds: 4 friendly action chips (food picker, funny line, what I did, compassion day)
// Removes: no old buttons to remove (these are new additions to journey tab)
const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ═══════════════════════════════════════════════════════════
// 1. CSS — action buttons card
// ═══════════════════════════════════════════════════════════
const NEW_CSS = `
/* ===== COMPANION ACTION BUTTONS ===== */
.j-actions-card {
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 1px 0 rgba(45,42,38,0.02), 0 6px 20px -10px rgba(45,42,38,0.10);
  padding: 18px 18px 20px;
}
.j-actions-title {
  font-size: 13px;
  color: var(--g-ink-3);
  letter-spacing: 0.3px;
  margin-bottom: 14px;
  font-weight: 500;
}
.j-actions-chips {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.j-action-chip {
  width: 100%;
  text-align: right;
  background: #F7F3EC;
  border: 1px solid rgba(70,55,30,0.10);
  border-radius: 14px;
  padding: 13px 16px;
  font-family: 'Assistant', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--g-ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.15s, transform 0.12s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(0,0,0,0.04);
  user-select: none;
}
.j-action-chip:active {
  background: #EDE7DC;
  transform: scale(0.98);
}
.j-action-chip .j-chip-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.j-action-chip.compassion-chip {
  background: rgba(155,114,207,0.08);
  border-color: rgba(155,114,207,0.20);
  color: #6B4C9A;
}
.j-action-chip.compassion-chip:active {
  background: rgba(155,114,207,0.15);
}

/* Response bubble */
.j-action-response {
  margin-top: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #FDFAF4 0%, #F9F4EC 100%);
  border-radius: 14px;
  border: 1px solid rgba(70,55,30,0.08);
  font-size: 14px;
  color: var(--g-ink-2);
  line-height: 1.6;
  display: none;
}
.j-action-response.visible {
  display: block;
  animation: jFadeIn 0.2s ease forwards;
}
.j-action-response-label {
  font-size: 11px;
  color: var(--g-ink-3);
  letter-spacing: 0.4px;
  margin-bottom: 5px;
  font-weight: 500;
}

/* Compassion explain modal — journey variant */
.j-comp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45,42,38,0.38);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.j-comp-box {
  background: #FFFFFF;
  border-radius: 22px;
  padding: 24px 22px 22px;
  max-width: 340px;
  width: 100%;
  box-shadow: 0 30px 80px -20px rgba(45,42,38,0.40);
}
.j-comp-title {
  font-family: 'Frank Ruhl Libre', serif;
  font-size: 21px;
  font-weight: 500;
  color: var(--g-ink);
  margin-bottom: 10px;
  line-height: 1.25;
}
.j-comp-body {
  font-size: 13.5px;
  color: var(--g-ink-2);
  line-height: 1.65;
  margin-bottom: 20px;
}
.j-comp-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.j-comp-confirm {
  width: 100%;
  padding: 13px 18px;
  border-radius: 999px;
  border: none;
  background: #6B4C9A;
  color: #FFFFFF;
  font-family: 'Assistant', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
}
.j-comp-cancel {
  width: 100%;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(70,55,30,0.12);
  background: #F7F3EC;
  color: var(--g-ink-2);
  font-family: 'Assistant', sans-serif;
  font-size: 14px;
  cursor: pointer;
  touch-action: manipulation;
}
`;

const styleClose = html.lastIndexOf('</style>');
html = html.slice(0, styleClose) + NEW_CSS + html.slice(styleClose);
console.log('✓ CSS added');

// ═══════════════════════════════════════════════════════════
// 2. JS — action functions + HTML builder
// ═══════════════════════════════════════════════════════════
const lastScriptClose = html.lastIndexOf('</script>');

const newJS = `

// ═══════════════════════════════════════════════════════════
// COMPANION ACTION BUTTONS
// ═══════════════════════════════════════════════════════════

// ── Food messages ──
var FOOD_TEMPLATES_SPECIFIC = [
  function(f){ return 'אני מצביעה על ' + f + '. לא חגיגה קולינרית, אבל בהחלט החלטה עם עמוד שדרה.'; },
  function(f){ return f + ' נשמע כמו משהו שאפשר לסגור איתו פינה בלי לפתוח פרויקט.'; },
  function(f){ return f + '. מינימום החלטות, מקסימום "הכנסתי משהו לגוף".'; },
  function(f){ return 'קלאסיקה של אנשים שאין להם כוח להתחיל משא ומתן עם המטבח: ' + f + '.'; },
  function(f){ return f + '. לא מסעדת שף, אבל הגוף יבין את הרמז.'; },
  function(f){ return 'יש לי הצבעה ברורה: ' + f + '. קל, זמין, ולא דורש נאום פתיחה.'; },
  function(f){ return f + '. קצר, ישיר, ואפשר לאכול אותו בלי להסביר לאף אחד.'; },
];
var FOOD_MSG_NO_FOODS = 'עוד לא סיפרת לי מה עובד לך כשאין כוח לבחור. בינתיים נלך על כלל הזהב: משהו קטן, זמין, שלא דורש ועדת תכנון.';

function journeyPickFood() {
  var resp = document.getElementById('j-action-response');
  if (!resp) return;
  var foods = (typeof bp !== 'undefined' && bp.quickFoods && bp.quickFoods.length)
    ? bp.quickFoods
    : [];
  var text;
  if (foods.length > 0) {
    var food = foods[Math.floor(Math.random() * foods.length)];
    var tmpl = FOOD_TEMPLATES_SPECIFIC[Math.floor(Math.random() * FOOD_TEMPLATES_SPECIFIC.length)];
    text = tmpl(food);
  } else {
    text = FOOD_MSG_NO_FOODS;
  }
  showActionResponse('תבחרי לי משהו קטן לאכול', text, resp);
}

// ── Funny/uplifting lines (by tone/humor pref) ──
var FUNNY_LINES_DEFAULT = [
  'היום לא חייב להיות מופתי. מספיק שהוא יכיל אותך, מים, ומשהו שאפשר ללעוס.',
  'הגוף ביקש תחזוקה בסיסית. לא הפקת ענק. נתחיל ממה שיש.',
  'שלוק מים אחד לא מסדר את החיים, אבל הוא כן עושה רושם סביר על המערכת.',
  'יש ימים שבהם עצם זה שפתחת את האפליקציה כבר ראוי לציון. לא נקים טקס, אבל נרשום.',
  'לא כל דבר קטן צריך להרגיש משמעותי כדי להיות משמעותי.',
  'היום לא צריך להיות מסודר. מספיק שתהיה בו נקודה אחת שעבדה.',
  'ביס קטן זו לא תוכנית חיים, אבל זו התחלה לא רעה.',
  'הגוף אוהב מחוות. הוא קצת כמו דודה — רק בלי לשאול מתי תבואי.',
  'מים + ביס + אוויר. לא שלילי. אפשר לעבוד עם זה.',
  'יש לנו יום. לא חייב להיות יום גדול. מספיק שיהיה יום.',
];
var FUNNY_LINES_DIRECT = [
  'בוא נדבר ישר: גוף שקיבל מים היום כבר לא בגדר "כלום". זה נרשם.',
  'היום לא חייב לעבוד. הוא רק צריך לכלול לפחות אחד מהדברים שהגוף מבקש.',
  'מינימום היומי: שלוק מים, ביס אחד, נשימה עמוקה. יאללה, שבוע של הצלחה.',
  'אם הגעת לפה — כבר יש בסיס. מכאן אפשר להוסיף עוד דבר קטן.',
  'גוף שמרגיש מזוהה — פועל אחרת. אפילו מחווה קטנה שולחת הודעה למערכת.',
];
var FUNNY_LINES_HUMOROUS = [
  'המצב? לא אסון. הפתרון? גם לא גדול. שלוק מים, ביס אחד, ואחרי זה נחליט.',
  'שמעתי שיש ימים שהמיטה מנצחת. אני לא כאן לפסוק, אבל אני כן כאן לעזור לגוף לקבל קצת תשומת לב.',
  'גוף שמקבל מים הוא גוף שמרגיש שמישהו שם לב. אני שמה לב. נמשיך.',
  'יש ימים שהדבר הכי מאורגן שקרה בהם הוא שפתחת את הטלפון. אז הנה: שלב שני.',
  'לא כל יום הוא יום ייצוג. חלק מהימים הם סתם ימים — ועדיין הם ימים.',
  'ידיעה שימושית: גוף שמקבל אכילה וחמצן ממשיך לפעול. נמשיך לעדכן.',
  'הפלא היומי: מים. לא ויטמינים, לא פילוסופיה. סתם מים.',
];
var FUNNY_LINES_GENTLE = [
  'את עושה מה שאת יכולה. ואם קשה לדעת מה זה — מתחילים ממשהו קטן וקרוב.',
  'יש רגעים שמספיק פשוט להיות. ואם בא לך להוסיף מים לרגע הזה — בואי.',
  'לא דורשת. רק מזכירה שאת פה, ושיש קטנות שיכולות לעזור לגוף להרגיש אותך.',
  'כל מחווה קטנה לגוף שלך — משהו שאמרת לו: שמתי לב שאת פה. זה מספיק.',
  'רגע שקט. נשימה. ואז נראה מה אפשר להוסיף — בלי לחץ.',
];

var _funnyLineIdx = 0;
function journeyFunnyLine() {
  var resp = document.getElementById('j-action-response');
  if (!resp) return;
  var humor = (typeof bp !== 'undefined') ? (bp.humor||'') : '';
  var tone  = (typeof bp !== 'undefined') ? (bp.tone||'')  : '';
  var pool;
  if (humor.includes('גבוה') || humor.includes('אוהבת לצחוק')) {
    pool = FUNNY_LINES_HUMOROUS;
  } else if (tone.includes('ישיר') || tone.includes('ממש מינימלי')) {
    pool = FUNNY_LINES_DIRECT;
  } else if (tone.includes('עדין') || tone.includes('רגוע')) {
    pool = FUNNY_LINES_GENTLE;
  } else {
    pool = FUNNY_LINES_DEFAULT;
  }
  var line = pool[_funnyLineIdx % pool.length];
  _funnyLineIdx++;
  showActionResponse('תגידי לי משהו מצחיק ומרים', line, resp);
}

// ── What I did today ──
var DONE_MSGS_SOME = [
  function(list){ return 'רגע, לפני שנזלזל ביום הזה: כבר סימנת ' + list + '. יש כאן חומר לעבוד איתו.'; },
  function(list){ return 'כבר יש פה כמה סימנים: ' + list + '. לא כל היום, אבל בהחלט לא כלום.'; },
  function(list){ return 'היום כבר עשה כמה צעדים בכיוון שלך. הנה מה שנרשם: ' + list + '.'; },
  function(list){ return 'המערכת מדווחת: לא אפס. סימנת: ' + list + '. זה נרשם ונספר.'; },
  function(list){ return 'יש לנו: ' + list + '. לא ריק. ממשיכים מכאן.'; },
];
var DONE_MSGS_NONE = [
  'עוד לא נרשם משהו היום. זה לא אומר כלום עלייך, חוץ מזה שאפשר להתחיל ממשהו קטן.',
  'כרגע הלוח נקי. לא נורא. גם יום שמתחיל מאוחר עדיין יכול לקבל סימן.',
  'עוד אין סימונים, אבל הדלת פתוחה. אפשר להתחיל ממשהו קטן, בלי לעשות מזה אירוע.',
];

function journeyWhatDoneToday() {
  var resp = document.getElementById('j-action-response');
  if (!resp) return;
  var marks = getJourneyMarks ? getJourneyMarks() : [];
  var compassion = (typeof gs !== 'undefined') && gs.todayMood === 'compassion';
  if (compassion) marks = marks.filter(function(m){ return m !== 'compassion'; });

  var labelMap = {
    water:'מים', food:'אוכל', rest:'מנוחה',
    move:'תנועה', breath:'נשימה', hygiene:'היגיינה',
  };
  var done = marks.map(function(k){ return labelMap[k]||k; });

  var text;
  if (done.length > 0) {
    var list = done.join(', ');
    var tmpl = DONE_MSGS_SOME[Math.floor(Math.random() * DONE_MSGS_SOME.length)];
    text = tmpl(list);
    if (compassion) text += ' ויום חמלה בנוסף.';
  } else if (compassion) {
    text = 'היום הפעלת יום חמלה. זו החלטה, לא השמטה. הדלת פתוחה למחווה קטנה אם תבא לך.';
  } else {
    text = DONE_MSGS_NONE[Math.floor(Math.random() * DONE_MSGS_NONE.length)];
  }
  showActionResponse('תזכירי לי מה כבר עשיתי היום', text, resp);
}

// ── Compassion day explain modal ──
function journeyCompassionInfo() {
  // Remove any existing modal
  var existing = document.getElementById('j-comp-explain-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'j-comp-overlay';
  overlay.id = 'j-comp-explain-overlay';

  var already = (typeof cd !== 'undefined') && cd.active;

  overlay.innerHTML = '<div class="j-comp-box">'
    + '<div class="j-comp-title">' + (already ? 'יום חמלה פעיל' : 'יום חמלה') + '</div>'
    + '<div class="j-comp-body">'
    + (already
      ? 'יום חמלה כבר פעיל היום. הסטרייק שמור. את יכולה לבטל אותו דרך הכפתור בראש המסך.'
      : 'יום חמלה הוא מצב בסיסי יותר ליום עמוס או קשה. לא מבטלים את היום — פשוט מורידים את הרף למשהו שאפשר לעמוד בו: מים, משהו קטן לאכול, ועוד פעולה אחת שתעזור לגוף להבין שאת עדיין איתו.<br><br>הסטרייק מוקפא — הוא לא נשבר ולא עולה. אפשר להפעיל עד שבוע ברצף.')
    + '</div>'
    + '<div class="j-comp-btns">'
    + (already
      ? '<button class="j-comp-cancel" onclick="closeJourneyCompModal()">סגרי</button>'
      : '<button class="j-comp-confirm" onclick="activateCompassionFromJourney()">להפעיל יום חמלה</button>'
        + '<button class="j-comp-cancel" onclick="closeJourneyCompModal()">לא עכשיו</button>')
    + '</div>'
    + '</div>';

  // Close on overlay click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeJourneyCompModal();
  });
  document.body.appendChild(overlay);
}

function closeJourneyCompModal() {
  var el = document.getElementById('j-comp-explain-overlay');
  if (el) el.remove();
}

function activateCompassionFromJourney() {
  closeJourneyCompModal();
  activateCompassionDay(); // existing function
  setTimeout(function(){ renderJourneyTab(); }, 150);
}

// ── Shared: show response bubble ──
function showActionResponse(label, text, respEl) {
  if (!respEl) respEl = document.getElementById('j-action-response');
  if (!respEl) return;
  respEl.classList.remove('visible');
  void respEl.offsetWidth; // trigger reflow for animation restart
  respEl.innerHTML = '<div class="j-action-response-label">' + label + '</div>'
    + '<div>' + text + '</div>';
  respEl.classList.add('visible');
  // Scroll response into view
  setTimeout(function(){
    respEl.scrollIntoView({behavior:'smooth', block:'nearest'});
  }, 80);
}

// ── Build the actions card HTML ──
function buildCompanionActionsHTML(c) {
  var accent = c ? c.accent : '#8B7558';
  return '<div class="j-actions-card">'
    + '<div class="j-actions-title">צריכה ממני משהו קטן?</div>'
    + '<div class="j-actions-chips">'
    + '<button type="button" class="j-action-chip" onclick="journeyPickFood()">'
    + '<span class="j-chip-icon">🍽️</span>תבחרי לי משהו קטן לאכול</button>'
    + '<button type="button" class="j-action-chip" onclick="journeyFunnyLine()">'
    + '<span class="j-chip-icon">✨</span>תגידי לי משהו מצחיק ומרים</button>'
    + '<button type="button" class="j-action-chip" onclick="journeyWhatDoneToday()">'
    + '<span class="j-chip-icon">📋</span>תזכירי לי מה כבר עשיתי היום</button>'
    + '<button type="button" class="j-action-chip compassion-chip" onclick="journeyCompassionInfo()">'
    + '<span class="j-chip-icon">🫶</span>יום חמלה</button>'
    + '</div>'
    + '<div class="j-action-response" id="j-action-response"></div>'
    + '</div>';
}
`;

html = html.slice(0, lastScriptClose) + newJS + html.slice(lastScriptClose);
console.log('✓ JS added');

// ═══════════════════════════════════════════════════════════
// 3. Insert buildCompanionActionsHTML into buildJourneyMainHTML
// ═══════════════════════════════════════════════════════════
const OLD_PARTS = `  var parts = [
    buildCompanionTopCardHTML(c, todayDateLabel),
    buildCompanionHeroHTML(c, marks, mood),
    buildAlongTheDayHTML(marks, c),`;

const NEW_PARTS = `  var parts = [
    buildCompanionTopCardHTML(c, todayDateLabel),
    buildCompanionHeroHTML(c, marks, mood),
    buildCompanionActionsHTML(c),
    buildAlongTheDayHTML(marks, c),`;

if (html.includes(OLD_PARTS)) {
  html = html.replace(OLD_PARTS, NEW_PARTS);
  console.log('✓ Actions card inserted into buildJourneyMainHTML');
} else {
  console.error('✗ buildJourneyMainHTML parts block not found');
}

// ═══════════════════════════════════════════════════════════
// 4. Write + syntax check
// ═══════════════════════════════════════════════════════════
fs.writeFileSync('body-soul-app.html', html, 'utf8');

const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g)||[];
let allJS = '';
scripts.forEach(function(s){ allJS += s.replace(/<script[^>]*>/,'').replace(/<\/script>/,'')+'\n'; });
fs.writeFileSync('_tmp_check11.js', allJS, 'utf8');
const {execSync} = require('child_process');
try {
  execSync('node --check _tmp_check11.js', {stdio:'pipe'});
  console.log('✓ Syntax OK');
} catch(e) {
  console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0,5).join('\n'));
}
try { fs.unlinkSync('_tmp_check11.js'); } catch(e) {}

console.log('Done. Size:', Buffer.byteLength(html), 'bytes');
