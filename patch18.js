// patch18.js — Wire companion phrase banks to "תגידי לי משהו מצחיק ומרים"
//
// Problem: journeyFunnyLine() used 4 generic FUNNY_LINES_* pools (user tone/humor pref).
//          The 30-phrase companion banks existed only in companions.ts, never in the HTML.
//
// Fix:
//   1. Add COMPANION_PHRASES object to the HTML (30 phrases × 5 companions)
//   2. Add getNextCompanionPhrase(companionId) — shuffled queue + localStorage
//   3. Rewrite journeyFunnyLine() to use the selected companion's own phrases
//   4. Remove old generic FUNNY_LINES_* pools

const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ─── Phrase data (plain JS strings — patch script handles escaping when writing) ─
const PHRASE_DATA = {
  bear: [
    'בואי נתחיל במשהו קטן: מים. הגוף שלך לא ביקש ספא, רק שלא נשכח שהוא קיים.',
    'אכלת משהו היום? לא צריך סעודת מלכות, גם ביס קטן נחשב הצהרת כוונות.',
    'לפעמים הצעד הכי אמיץ הוא לשתות מים ולקרוא לזה ניהול משברים.',
    'בואי נעשה דבר אחד קטן. לא מהפכה, רק סימן קטן לגוף שאנחנו עדיין בצוות שלו.',
    'היום לא חייב להיות מושלם. הוא רק צריך לכלול רגע אחד שבו היית בצד של עצמך.',
    'שמיכה דמיונית על הכתפיים, ספל ביד, ועכשיו פעולה קטנה. זה כל הטקס.',
    'אם כל מה שעשית עכשיו זה לעצור ולנשום — מבחינתי זה כבר פרק בספר הצלחות קטנות.',
    'לא צריך לסדר את כל החיים. נתחיל בלא להתעלם מהגוף כאילו הוא הודעה מקבוצת ועד.',
    'בואי נאכיל אותך לפני שהמוח מתחיל לכתוב תסריטים בלי תקציב.',
    'שתית מים? יופי. עכשיו הגוף שלך פחות מרגיש שהוא עובד בהתנדבות.',
    'המשימה היום: דבר קטן אחד לטובתך. לא צריך קונפטי, אבל בלב אני זורקת.',
    'מותר לנוח גם אם לא סיימת הכול. הגוף לא עובד לפי חוזה קבלן.',
    'בואי נוריד הילוך. גם דובה עם ספל יודעת שלפעמים זה כל מה שצריך.',
    'היום אנחנו לא מוכיחות כלום לאף אחד. אנחנו רק דואגות שלא תיעלמי לעצמך.',
    'אם קשה להתחיל, נתחיל בקטן כל כך שאפילו ההתנגדות תתבלבל.',
    'ביס, לגימה, נשימה. שלושה דברים קטנים, אפס נאומים.',
    'לא כל יום צריך להרגיש כמו ניצחון. לפעמים מספיק שהוא לא יהיה נגדך.',
    'בואי נעשה פעולה אחת שתגרום למחר להגיד לנו תודה קטנה.',
    'הכוס חצי מלאה, אבל קודם בואי נמלא גם את הבקבוק שלך.',
    'אין צורך להיות גרסה משודרגת שלך היום. גרסה שתתה מים זה כבר שדרוג.',
    'אם הראש רועש, נתחיל מהגוף. הוא בדרך כלל פחות אוהב דיונים ארוכים.',
    'בואי נעשה משהו פשוט: לפתוח, להרים, לשתות, לסמן. בלי להפוך את זה לסדרה.',
    'העייפות שלך לא צריכה הוכחות. היא רק צריכה שנקשיב לה רגע.',
    'דבר קטן עכשיו עדיף על תוכנית ענקית שנשארת לשבת בפינה עם פרצוף.',
    'היום נבחר פעולה אחת חמה לעצמך. כן, גם לשטוף פנים נחשב.',
    'אם את מרגישה תקועה, בואי לא נזיז הר. נזיז כפית. כפית זה התחלה מכובדת.',
    'אני בעדך גם כשאת על מצב סוללה חלשה. במיוחד אז.',
    'בואי נעשה טיפול בסיסי ביצור האנושי: מים, אוכל, נשימה, פחות אשמה.',
    'היום לא בודקים כמה רחוק הגעת. בודקים האם עשית משהו קטן שלא ויתרת עליו.',
    'אני מביאה ספל, את מביאה צעד קטן. יש לנו תוכנית.',
  ],
  cat: [
    'המוח שלך פתח ישיבה בלי אישור. בואי נקשיב רגע, אבל לא ניתן לו לנהל את החברה.',
    'המחשבה הזאת נשמעת מאוד בטוחה בעצמה. חמוד מצידה, אבל נבדוק עובדות.',
    'לא כל מחשבה שמגיעה עם גלימה דרמטית היא נבואה.',
    'בואי נניח את המחשבה על השולחן. לא על הראש שלך, על השולחן.',
    'הראש שלך מנסה לפתור הכול בבת אחת. שאפתני. לא יעיל, אבל שאפתני.',
    'מחשבה מלחיצה נכנסה עם נעלי עקב ורעש. מותר לה לעבור, לא חייבים לתת לה חדר.',
    'היום לא חייב להיות קסום. מספיק שנמצא בו ניצוץ קטן שלא עשה רעש.',
    'בואי נבדוק: האם זו עובדה, תחושה, או המוח שלך כותב רומן?',
    'לפעמים הראש עושה זום אין מוגזם. בואי נלחץ רגע על זום אאוט.',
    'את לא צריכה להאמין לכל מחשבה. חלקן רק באו לעשות ביקור בלי לתאם.',
    'אם המוח שלך הביא תחזית קודרת, נזכור שהוא לא תמיד מדייק במזג אוויר פנימי.',
    'בואי נבחר מחשבה אחת פחות כבדה. לא צריך להחליף את כל הספרייה.',
    'העובדה שזה מרגיש גדול לא אומרת שזה חייב לנהל אותך.',
    'המחשבות עשו מסיבה. אנחנו לא חייבות להביא כיבוד.',
    'אפשר להרגיש לא בטוחה ועדיין לעשות צעד קטן. חתולות עושות את זה באלגנטיות.',
    'לא נילחם במחשבה. נזיז אותה קצת הצידה ונראה מה עוד יש בחדר.',
    'הסיפור שהראש מספר עכשיו הוא רק טיוטה. מותר לערוך.',
    'בואי ניתן למחשבה שם מצחיק. משהו פחות מאיים מ"האמת המוחלטת".',
    'זה לא סוף העולם. זה אולי סוף סצנה, וגם זה בעריכה.',
    'את לא חייבת להרגיש מוכנה כדי להתחיל. מוכנות היא לפעמים פרווה שמגיעה אחר כך.',
    'המוח אומר "הכול או כלום". אנחנו, באלגנטיות, בוחרות "משהו קטן".',
    'בואי לא ניתן למחשבה אחת לקבל כיסא מנהלת.',
    'אם הראש צועק, נענה לו בלחישה: שמעתי, תודה, עכשיו מים.',
    'מותר לא לדעת בדיוק מה עושים. גם ירח עובד בשלבים.',
    'היום לא צריך לפתור את כל העלילה. רק להפוך עמוד אחד.',
    'התחושה אמיתית. המסקנה שלה לא בהכרח מחזיקה תעודת זהות.',
    'בואי נעשה פעולה קטנה שתזכיר למוח שהוא לא לבד פה.',
    'המחשבה הזאת קיבלה יותר מדי תאורה. נעמעם קצת.',
    'לא כל ספק הוא סימן לעצור. לפעמים הוא רק חתול שעבר על המקלדת.',
    'בואי נבחר את האפשרות הכי עדינה וחכמה כרגע. לא מושלמת, חכמה.',
  ],
  forest: [
    'המשימה הזאת נראית גדולה רק כי היא עומדת קרוב למצלמה.',
    'בואי נעשה גרסת חפשושית: לא הכול, רק פינה קטנה של הדבר.',
    'אנחנו לא מטפסות על הר. אנחנו מזיזות חלוק קטן מהשביל ומרגישות חשובות.',
    'הדבר הזה התחפש למפלצת, אבל לדעתי זה רק כביסה עם יחסי ציבור.',
    'בואי נפתח את המשימה ונציץ פנימה. רק הצצה. בלי להתחייב לחתונה.',
    'צעד קטן עכשיו. קטן כמו עלה, אבל עלים יודעים להתחיל יער.',
    'אם אין כוח, נעשה פעולה בגודל אפונה. אפונה היא לגמרי תוכנית.',
    'בואי נעשה את החלק הראשון והכי פחות מרשים. הוא בדרך כלל פותח את הדלת.',
    'היום אנחנו לא מסדרות חיים. אנחנו מסדרות רגע אחד שלא יתגלגל מתחת לספה.',
    'המשימה עושה פרצוף. זה בסדר, גם פטריות עושות וזה לא עוצר את היער.',
    'בואי ניגע בזה לשתי דקות. אם זה נושך, אני ארים גבה.',
    'לא צריך לדעת את כל הדרך. מספיק למצוא את האבן הראשונה שלא מתנדנדת.',
    'הכול מרגיש הרבה? נבחר גרגר אחד מתוך הערימה ונקרא לזה התחלה.',
    'הימנעות היא יצור חכם, אבל אנחנו יותר חכמות ויש לנו צעיף.',
    'בואי נעשה פעולה כל כך קטנה שהפחד לא יספיק להתארגן.',
    'אפשר להתחיל בלי טקס. למרות שאני בעד טקסים קטנים עם עלים.',
    'המשימה לא חייבת להיות חמודה כדי שנתקדם בה. גם בוץ הוא חלק מהשביל.',
    'בואי נעשה חמש נשימות ואז פעולה אחת בגודל פטרייה.',
    'אם היום כבד, נלבש אותו כמו תיק צד ונלך צעד אחד.',
    'לא הכול צריך להיפתר. לפעמים מספיק שמשהו אחד יזוז מילימטר.',
    'המשימה אומרת "אני ענקית". אנחנו אומרות "תוכיחי" ומתחילות בפינה.',
    'בואי ניקח את הדבר הכי קטן שאפשר לעשות בלי להרגיש שאנחנו מנהלות ממלכה.',
    'גם להתחיל ואז לעצור זה מידע. מידע עם נעליים קטנות.',
    'היום נבחר פעולה שלא עושה רעש, אבל יודעת לפתוח שביל.',
    'אם אין מוטיבציה, נשתמש בסקרנות. היא יותר קטנה ויותר ערמומית.',
    'בואי נעשה משהו אחד לפני שהמוח יביא מצגת עם גרפים.',
    'הדבר הזה נראה מסובך, אבל בטח יש לו קצה. בואי נמצא את הקצה.',
    'אני מציעה תוכנית יערית: מעט מאוד, בעדינות, אבל באמת.',
    'אם הצלחת רק להתחיל — זה לא "רק". זה השער.',
    'בואי נקטין את היום לגודל שאפשר להחזיק ביד.',
  ],
  capy: [
    'נעשה דבר אחד. לא צריך לקרוא לתקשורת.',
    'מים, נשימה, פעולה קטנה. תוכנית עסקית סבירה לגוף אנושי.',
    'היום מתקדם לאט. בסדר. גם קפיברה לא רצה ועדיין כולם מתרשמים.',
    'לא נפתור הכול עכשיו. זה נשמע מעייף, ואני רק הגעתי עם ספל.',
    'בואי נבחר את הדבר הכי קטן שלא יתווכח איתנו יותר מדי.',
    'אם הכול מרגיש דחוף, נתחיל במה שבאמת נמצא מולנו. שאר הדברים יחכו, הם לא משלמים שכירות.',
    'אפשר לעשות מעט. מעט זה עדיין יותר מכלום, וזה כבר חשוד לטובה.',
    'היום לא צריך להוכיח יכולת. רק להופיע לרגע אחד.',
    'נשימה אחת. אחר כך עוד אחת. אני יודעת, קונספט מהפכני.',
    'בואי נניח את הלחץ רגע בצד. הוא ממילא לא עוזר לסחוב שקיות.',
    'משימה אחת. ספל אחד. בלי מוזיקת רקע דרמטית.',
    'לא חייבים לרוץ. אפשר להתקדם בקצב של יצור שיודע לשמור אנרגיה.',
    'הכול הרבה? נוריד ליחידה אחת. החיים אוהבים להגזים באריזה.',
    'בואי נעשה את הדבר הבא ולא את כל הרשימה שצועקת מהמרפסת.',
    'הגוף ביקש הפסקה. בקשה לגיטימית, אפילו בלי טופס.',
    'אם אין כוח, נעשה גרסת מינימום. מינימום הוא בן דוד מכובד של התמדה.',
    'היום לא מושלם. צוין. ממשיכים בעדינות.',
    'בואי לא נבהל מזה שנבהלנו. זה רק מוסיף רעש למערכת.',
    'משימה קטנה עכשיו. אחר כך נחליט אם אנחנו גאונות או רק סבירות מאוד.',
    'יש ימים שבהם "עשיתי משהו" זה משפט מפואר.',
    'הכול מרגיש תקוע? נזיז דבר אחד. לא את היבשת.',
    'אני בעד פעולה קטנה עם פרצוף רגוע. זה מותג חזק.',
    'בואי נבחר משהו שלא דורש אישיות חדשה.',
    'לא חייבים להרגיש השראה. אפשר גם להרגיש פיג׳מה ולעשות פעולה.',
    'אם היום מבולגן, נבחר פינה אחת שלא תהיה.',
    'נשמור על פשטות. פשטות היא לפעמים חוכמה עם פחות איפור.',
    'המשימה מחכה. נחמד מצידה. ניגש אליה בקצב שלא מעליב את מערכת העצבים.',
    'היום נעשה פחות רעש ויותר דבר קטן.',
    'לא צריך כוח גדול. צריך רגע אחד שבו לא מתווכחים עם המציאות.',
    'בואי נעשה פעולה קטנה ונמשיך כאילו זה היה ברור.',
  ],
  fox: [
    'משימת 30 שניות. לא כי אנחנו גיבורות-על, כי אנחנו חכמות וחוסכות אנרגיה.',
    'בואי נעשה צעד קטן ואז נתנהג כאילו זה היה חלק מתוכנית מבריקה.',
    'לא צריך מוטיבציה ענקית. צריך רק לפתוח חריץ בדלת ולהכניס רגל.',
    'היום נעשה מהלך קטן. שקט, חכם, בלי להודיע לפחד.',
    'בואי נעקוף את ההתנגדות מהצד. היא מצפה שנגיע מהכניסה הראשית.',
    'המשימה נראית קשוחה? יופי. נתחיל מהמקום שהיא שכחה לנעול.',
    'שתי דקות. זה הכול. אם נרצה להמשיך — נעמיד פנים שזה היה הרעיון שלנו מההתחלה.',
    'בואי נבחר ניצחון קטן שאפשר לסמן בלי דרמה.',
    'את לא צריכה להרגיש מוכנה. את צריכה להתחיל מספיק קטן כדי לא להבהיל את המערכת.',
    'היום אנחנו לא דוחפות בכוח. אנחנו מתחכמות באלגנטיות.',
    'בואי נעשה את הגרסה הקצרה. גרסאות קצרות הן לפעמים קסם עם נעליים.',
    'מוכנה למהלך קטן? לא גדול. קטן כזה שההתנגדות תגיד "רגע, מה קרה פה?"',
    'הטריק הוא לא לנצח את היום. הטריק הוא לסמן דבר אחד לפני שהוא שם לב.',
    'בואי נתחיל עכשיו, לפני שהמוח יבקש עוד ישיבת הכנה.',
    'לא צריך להיות בשיא. צריך להיות מספיק כאן כדי לעשות פעולה אחת.',
    'היום נשתמש בשיטת השועלה: פחות כוח, יותר תזמון.',
    'משימה אחת קטנה, ואז חיוך קטן של "כן, אני יודעת מה עשיתי".',
    'אם אין חשק, נלך על תחכום. חשק הוא נחמד, אבל לא תמיד מגיע בזמן.',
    'בואי נפתח את הדבר, נעשה פעולה אחת, ונצא כאילו אנחנו מאוד עסוקות.',
    'ההתנגדות הביאה טיעונים. יפה לה. אנחנו מביאות פעולה קטנה.',
    'בואי נבנה מומנטום בגודל כף יד. לא צריך מנוע טורבו.',
    'הצעד הראשון לא צריך להרשים. הוא רק צריך להופיע.',
    'היום נעשה משהו קטן שיגרום לך להגיד בערב: אה, נכון, לא ויתרתי.',
    'אם המשימה כבדה, נגנוב ממנה חתיכה קטנה ונלך.',
    'בואי נעשה את זה לפני שהספק מתאפר ומתחיל לנאום.',
    'החוכמה היא לא לעשות הכול. החוכמה היא להתחיל במקום שלא מפחיד מדי.',
    'את יכולה להתקדם גם עם חצי כוח. שועלות לא מבזבזות אנרגיה לחינם.',
    'בואי נסמן פעולה אחת. סימון קטן, סיפוק גדול באופן לא פרופורציונלי.',
    'היום לא צריך אומץ ענק. צריך רגע קטן של "יאללה, ננסה".',
    'בואי נעשה מהלך קטן וחכם. כזה שלא נראה דרמטי, אבל משנה את הכיוון.',
  ],
};

// ─── Build COMPANION_PHRASES JS block — escape all single quotes ─────────────
function escapeForSingleQuoteString(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

let phrasesBlock = '// ===== COMPANION PHRASE BANKS =====\n';
phrasesBlock += '// 30 phrases per companion. Source of truth for journeyFunnyLine().\n';
phrasesBlock += 'const COMPANION_PHRASES = {\n';
for (const [id, list] of Object.entries(PHRASE_DATA)) {
  phrasesBlock += `  ${id}: [\n`;
  for (const phrase of list) {
    phrasesBlock += `    '${escapeForSingleQuoteString(phrase)}',\n`;
  }
  phrasesBlock += '  ],\n';
}
phrasesBlock += '};\n';

// ─── getNextCompanionPhrase() — shuffled queue + localStorage ─────────────────
const GET_PHRASE_FN = `
// ===== COMPANION PHRASE QUEUE =====
// Shuffled queue per companion — persisted in localStorage.
// All 30 phrases cycle before any repeats. Never same phrase twice in a row.
var _phraseQueues = {};
function _pqKey(id) { return 'tori_pq_' + id; }
function _loadPQ(id) {
  if (_phraseQueues[id]) return _phraseQueues[id];
  try {
    var raw = localStorage.getItem(_pqKey(id));
    if (raw) {
      var p = JSON.parse(raw);
      if (Array.isArray(p.queue) && typeof p.pos === 'number') {
        _phraseQueues[id] = p; return p;
      }
    }
  } catch(e) {}
  return null;
}
function _savePQ(id, s) {
  _phraseQueues[id] = s;
  try { localStorage.setItem(_pqKey(id), JSON.stringify(s)); } catch(e) {}
}
function _shuffleIdx(n) {
  var a = []; for (var i = 0; i < n; i++) a.push(i);
  for (var j = a.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var t = a[j]; a[j] = a[k]; a[k] = t;
  }
  return a;
}
function _freshQueue(phrases, lastPhrase) {
  var q = _shuffleIdx(phrases.length);
  // Avoid repeating last phrase at position 0 after reshuffle
  if (lastPhrase && phrases.length > 1 && phrases[q[0]] === lastPhrase) {
    var sw = Math.floor(Math.random() * (q.length - 1)) + 1;
    var tmp = q[0]; q[0] = q[sw]; q[sw] = tmp;
  }
  return q;
}
/**
 * Returns the next phrase for the given companion id.
 * Uses a shuffled index queue — all 30 phrases shown before any repeat.
 * State is persisted to localStorage across page reloads.
 * Never returns a phrase from a different companion.
 */
function getNextCompanionPhrase(companionId) {
  var phrases = COMPANION_PHRASES[companionId];
  if (!phrases || phrases.length === 0) return '';
  var s = _loadPQ(companionId);
  if (!s || !Array.isArray(s.queue) || s.queue.length !== phrases.length) {
    s = { queue: _freshQueue(phrases, null), pos: 0, lastPhrase: '' };
  }
  if (s.pos >= s.queue.length) {
    s.queue = _freshQueue(phrases, s.lastPhrase);
    s.pos = 0;
  }
  var phrase = phrases[s.queue[s.pos++]];
  s.lastPhrase = phrase;
  _savePQ(companionId, s);
  return phrase;
}
`;

// ─── Rewrite journeyFunnyLine() (removes old generic pools) ──────────────────
const NEW_FUNNY_FN = `// ── Companion phrase button ──
// Uses the selected companion's own 30-phrase bank via getNextCompanionPhrase().
// Old generic FUNNY_LINES_* pools have been removed.
function journeyFunnyLine() {
  var resp = document.getElementById('j-action-response');
  if (!resp) return;
  var companionId = (typeof cs !== 'undefined') ? cs.companionId : null;
  if (!companionId || !COMPANION_PHRASES[companionId]) {
    showActionResponse('תגידי לי משהו מצחיק ומרים',
      'בחרי דמות מלווה כדי לקבל ממנה משפט אישי 🌿', resp);
    return;
  }
  var phrase = getNextCompanionPhrase(companionId);
  showActionResponse('תגידי לי משהו מצחיק ומרים', phrase, resp);
}`;

// Locate old funny block (from comment through end of function)
const FUNNY_BLOCK_START = html.indexOf('// ── Funny/uplifting lines (by tone/humor pref) ──');
const FUNNY_FN_END_MARKER = "  showActionResponse('תגידי לי משהו מצחיק ומרים', line, resp);\n}";
const FUNNY_FN_END_IDX = html.indexOf(FUNNY_FN_END_MARKER);

if (FUNNY_BLOCK_START === -1 || FUNNY_FN_END_IDX === -1) {
  console.error('✗ Could not locate journeyFunnyLine block', FUNNY_BLOCK_START, FUNNY_FN_END_IDX);
  process.exit(1);
}
html = html.slice(0, FUNNY_BLOCK_START)
  + NEW_FUNNY_FN
  + html.slice(FUNNY_FN_END_IDX + FUNNY_FN_END_MARKER.length);
console.log('✓ journeyFunnyLine() rewritten');

// ─── Insert COMPANION_PHRASES + getNextCompanionPhrase after COMPANIONS block ─
const COMPANIONS_CLOSE = html.indexOf('\n};\n\nconst COMPANION_LINES');
if (COMPANIONS_CLOSE === -1) {
  console.error('✗ COMPANIONS block end not found');
  process.exit(1);
}
const INSERT_AT = COMPANIONS_CLOSE + '\n};'.length;
const INSERT_CONTENT = '\n\n' + phrasesBlock + GET_PHRASE_FN;
html = html.slice(0, INSERT_AT) + INSERT_CONTENT + html.slice(INSERT_AT);
console.log('✓ COMPANION_PHRASES and getNextCompanionPhrase() inserted');

// ─── Write + syntax check ─────────────────────────────────────────────────────
fs.writeFileSync('body-soul-app.html', html, 'utf8');

const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || [];
let allJS = '';
scripts.forEach(s => allJS += s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '') + '\n');
fs.writeFileSync('_tmp_check18.js', allJS, 'utf8');
const { execSync } = require('child_process');
try {
  execSync('node --check _tmp_check18.js', { stdio: 'pipe' });
  console.log('✓ Syntax OK');
} catch(e) {
  console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0,8).join('\n'));
  process.exit(1);
}
try { fs.unlinkSync('_tmp_check18.js'); } catch(e) {}

// ─── Verification ─────────────────────────────────────────────────────────────
console.log('\n--- Verification ---');

// Count actual phrases per companion in HTML
const ids = ['bear','cat','forest','capy','fox'];
let allCountsOk = true;
ids.forEach(id => {
  const phrases = PHRASE_DATA[id];
  // Verify each specific first phrase is present (escaped form)
  const firstEscaped = escapeForSingleQuoteString(phrases[0]);
  const present = html.includes(firstEscaped);
  const countOk = phrases.length === 30;
  if (!present || !countOk) allCountsOk = false;
  console.log((present && countOk ? '✓' : '✗') + ' ' + id + ': 30 phrases, first phrase present');
});

const checks = [
  { label: 'COMPANION_PHRASES object in HTML',  needle: 'const COMPANION_PHRASES = {' },
  { label: 'getNextCompanionPhrase function',    needle: 'function getNextCompanionPhrase(companionId)' },
  { label: 'localStorage persistence',           needle: "localStorage.setItem(_pqKey(id)" },
  { label: 'shuffle logic present',              needle: 'function _shuffleIdx(' },
  { label: 'no-repeat on reshuffle',             needle: 'Avoid repeating last phrase' },
  { label: 'button calls journeyFunnyLine',      needle: 'onclick="journeyFunnyLine()"' },
  { label: 'new fn reads cs.companionId',        needle: 'cs.companionId' },
  { label: 'new fn calls getNextCompanionPhrase',needle: 'getNextCompanionPhrase(companionId)' },
  { label: 'FUNNY_LINES_DEFAULT removed',        needle: 'var FUNNY_LINES_DEFAULT', absent: true },
  { label: 'FUNNY_LINES_HUMOROUS removed',       needle: 'var FUNNY_LINES_HUMOROUS', absent: true },
  { label: 'FUNNY_LINES_DIRECT removed',         needle: 'var FUNNY_LINES_DIRECT',  absent: true },
  { label: 'FUNNY_LINES_GENTLE removed',         needle: 'var FUNNY_LINES_GENTLE',  absent: true },
  { label: 'יבחושונת absent',                    needle: 'יבחושונת', absent: true },
];

let ok = allCountsOk;
checks.forEach(c => {
  const found = html.includes(c.needle);
  const pass = c.absent ? !found : found;
  if (!pass) ok = false;
  console.log((pass ? '✓' : '✗') + ' ' + c.label);
});

console.log('\n' + (ok ? '✓ ALL CLEAR' : '✗ ISSUES FOUND'));
console.log('File size:', Buffer.byteLength(html), 'bytes');
