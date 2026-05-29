var fs = require('fs');
var content = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
var crlf = content.indexOf('\r\n') !== -1;
var NL = crlf ? '\r\n' : '\n';
console.log('line ending:', crlf ? 'CRLF' : 'LF');
console.log('file size:', content.length);

// ── 1. RENAME COMPASSION_DAY_LINES → COMPASSION_DAY_COMPANION_LINES ─────────
var before = content.split('COMPASSION_DAY_LINES').length - 1;
content = content.split('COMPASSION_DAY_LINES').join('COMPASSION_DAY_COMPANION_LINES');
var after = content.split('COMPASSION_DAY_COMPANION_LINES').length - 1;
console.log('renamed COMPASSION_DAY_LINES occurrences:', before, '→', after);

// ── 2. UPDATE FOX COMPASSION LINE ────────────────────────────────────────────
var foxOld = "  fox:        'ביום חמלה המהלך החכם הוא להקטין ציפיות, ולהשאיר אותך בדיוק בגודל שלך.',";
var foxNew = "  fox:        'ביום חמלה השועלה שלך שומרת על האש במקום בטוח. אין צורך לרוץ כשהיום מבקש להאט.',";
if (content.indexOf(foxOld) === -1) { console.error('fox line not found'); process.exit(1); }
content = content.replace(foxOld, foxNew);
console.log('fox line updated');

// ── 3. ADD COMPASSION_DAY_ICON + COMPASSION_JOURNEY_IMAGES CONSTANTS ─────────
var aliasAnchor = 'COMPASSION_DAY_COMPANION_LINES.forest = COMPASSION_DAY_COMPANION_LINES.hafshushit;' + NL;
if (content.indexOf(aliasAnchor) === -1) { console.error('forest alias anchor not found'); process.exit(1); }
var newConstants = NL
  + "var COMPASSION_DAY_ICON = './assets/compassion/compassion-flame-icon.webp';" + NL
  + 'var COMPASSION_JOURNEY_IMAGES = {' + NL
  + "  bear:       './assets/companions/compassion-journey/bear-compassion-journey.webp'," + NL
  + "  cat:        './assets/companions/compassion-journey/cat-compassion-journey.webp'," + NL
  + "  hafshushit: './assets/companions/compassion-journey/hafshushit-compassion-journey.webp'," + NL
  + "  capy:       './assets/companions/compassion-journey/capy-compassion-journey.webp'," + NL
  + "  fox:        './assets/companions/compassion-journey/fox-compassion-journey.webp'," + NL
  + '};' + NL
  + 'COMPASSION_JOURNEY_IMAGES.forest = COMPASSION_JOURNEY_IMAGES.hafshushit;' + NL;
content = content.replace(aliasAnchor, aliasAnchor + newConstants);
console.log('constants added');

// ── 4. STREAK PILL — replace ❄️ text with icon image ────────────────────────
// Find the pill.innerHTML inside updateStreakPillFrozenState (after pill.classList.add('frozen'))
var frozenClassIdx = content.indexOf("pill.classList.add('frozen')");
if (frozenClassIdx === -1) { console.error('frozen class not found'); process.exit(1); }
var pillOldStart = content.indexOf("pill.innerHTML = '", frozenClassIdx);
var pillOldEnd   = content.indexOf("';", pillOldStart + 10) + 2;
var pillOldStr   = content.slice(pillOldStart, pillOldEnd);
console.log('pill old str:', JSON.stringify(pillOldStr));
if (!pillOldStr || pillOldStr.length < 20) { console.error('pill innerHTML not found'); process.exit(1); }
var pillNewStr = "var _cdIconImg = (typeof COMPASSION_DAY_ICON !== 'undefined' && COMPASSION_DAY_ICON)" + NL
  + "      ? '<img src=\"' + COMPASSION_DAY_ICON + '\" style=\"width:20px;height:20px;vertical-align:middle;margin-left:3px\" alt=\"❄\">'" + NL
  + "      : '❄️ ';" + NL
  + "    pill.innerHTML = _cdIconImg + '<span id=\"hdr-streak\">' + streak + '</span>'" + NL
  + "      + ' <span class=\"streak-frozen-sub\">שמור</span>';";
content = content.slice(0, pillOldStart) + pillNewStr + content.slice(pillOldEnd);
console.log('streak pill updated');

// ── 5a. buildCompanionHeroHTML — CD chip mark ────────────────────────────────
var chipOld = "var chipMarks = compassion ? ['compassion'] : marks.slice(-3);";
if (content.indexOf(chipOld) === -1) { console.error('chipMarks line not found'); process.exit(1); }
content = content.replace(chipOld,
  "var chipMarks = compassion ? ['compassion'] : (cd && cd.active ? ['compassion'] : marks.slice(-3));");
console.log('chipMarks updated for CD');

// ── 5b. buildCompanionHeroHTML — CD image override ──────────────────────────
// Inject CD else-if before the lair else block
var lairElseOld = "  } else {" + NL
  + "    // Lair image — resolved from COMPANION_LAIRS defaultState; falls back to homeImg" + NL
  + "    var lairImg = getActiveLair(c.id);" + NL
  + "    imgSrc  = lairImg ? lairImg.src : (c.homeImg || c.img);" + NL
  + "    imgAlt  = lairImg ? lairImg.alt : (c.name + ' במאורה שלה');";
if (content.indexOf(lairElseOld) === -1) { console.error('lair else block not found'); process.exit(1); }
var lairElseNew = "  } else if (cd && cd.active) {" + NL
  + "    // Compassion Day — show companion CD journey image" + NL
  + "    imgSrc   = (typeof COMPASSION_JOURNEY_IMAGES !== 'undefined' && COMPASSION_JOURNEY_IMAGES[c.id]) || (c.homeImg || c.img);" + NL
  + "    imgAlt   = c.name + ' ביום חמלה';" + NL
  + "    pillText = 'יום חמלה';" + NL
  + "    dotColor = '#A593C0';" + NL
  + "  } else {" + NL
  + "    // Lair image — resolved from COMPANION_LAIRS defaultState; falls back to homeImg" + NL
  + "    var lairImg = getActiveLair(c.id);" + NL
  + "    imgSrc  = lairImg ? lairImg.src : (c.homeImg || c.img);" + NL
  + "    imgAlt  = lairImg ? lairImg.alt : (c.name + ' במאורה שלה');";
content = content.replace(lairElseOld, lairElseNew);
console.log('CD image override added');

// ── 5c. buildCompanionHeroHTML — CD line text override ──────────────────────
var lineOld = "    lineText = (JOURNEY_COMPANION_LINES[c.id] || {})[mood] || '';";
if (content.indexOf(lineOld) === -1) { console.error('lineText not found'); process.exit(1); }
var lineNew = "  } else if (cd && cd.active) {" + NL
  + "    lineText = (typeof COMPASSION_DAY_COMPANION_LINES !== 'undefined' && COMPASSION_DAY_COMPANION_LINES[c.id]) || '';" + NL
  + "  } else {" + NL
  + "    lineText = (JOURNEY_COMPANION_LINES[c.id] || {})[mood] || '';";
// The current code has:  } else {\n    lineText = ...  (inside if/else if/else)
// We need to replace just the inner lineText line and change its else to else-if + new else
// Actually the full structure is: if (_activePamper...) { ... } else { lineText = ... }
// We'll replace "    lineText = (JOURNEY_COMPANION_LINES..." with the CD branch
var lineOldBlock = "  } else {" + NL + "    lineText = (JOURNEY_COMPANION_LINES[c.id] || {})[mood] || '';" + NL + "  }";
if (content.indexOf(lineOldBlock) === -1) { console.error('lineText else block not found'); process.exit(1); }
var lineNewBlock = "  } else if (cd && cd.active) {" + NL
  + "    lineText = (typeof COMPASSION_DAY_COMPANION_LINES !== 'undefined' && COMPASSION_DAY_COMPANION_LINES[c.id]) || '';" + NL
  + "  } else {" + NL
  + "    lineText = (JOURNEY_COMPANION_LINES[c.id] || {})[mood] || '';" + NL
  + "  }";
content = content.replace(lineOldBlock, lineNewBlock);
console.log('CD lineText override added');

// ── 5d. bubbleHTML — add lilac CD note in ternary ───────────────────────────
var pamperTernaryOld = "    + (_activePamper" + NL
  + "        ? '<div style=\"font-size:11px;color:var(--g-ink-3);margin-top:6px\">המאורה מחכה בבית — היום יש לה ' + (_activePamper.cardTitleSnapshot || 'פינוק') + '.</div>'" + NL
  + "        : '')" + NL
  + "    + '</div>';";
if (content.indexOf(pamperTernaryOld) === -1) { console.error('pamper ternary not found'); process.exit(1); }
var pamperTernaryNew = "    + (_activePamper" + NL
  + "        ? '<div style=\"font-size:11px;color:var(--g-ink-3);margin-top:6px\">המאורה מחכה בבית — היום יש לה ' + (_activePamper.cardTitleSnapshot || 'פינוק') + '.</div>'" + NL
  + "        : (cd && cd.active ? '<div style=\"font-size:11px;color:#8B6CB0;margin-top:6px\">הרצף שלך נח היום. הוא שם, ומחכה.</div>' : ''))" + NL
  + "    + '</div>';";
content = content.replace(pamperTernaryOld, pamperTernaryNew);
console.log('CD lilac note added to bubbleHTML');

// ── 6. VERSION MARKER ────────────────────────────────────────────────────────
content = content.replace(
  /<!-- Tori version: [^>]+ -->/,
  '<!-- Tori version: compassion-day-visuals-2026-05-29 -->'
);
console.log('version marker bumped');

// ── WRITE ────────────────────────────────────────────────────────────────────
fs.writeFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', content, 'utf8');
console.log('written. bytes:', content.length);

// ── VERIFY ───────────────────────────────────────────────────────────────────
var v = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
console.log('\n── VERIFY ──');
console.log('COMPASSION_DAY_COMPANION_LINES:', v.indexOf('COMPASSION_DAY_COMPANION_LINES') !== -1);
console.log('COMPASSION_DAY_LINES (old) still present:', v.indexOf('var COMPASSION_DAY_LINES') !== -1);
console.log('COMPASSION_DAY_ICON constant:', v.indexOf("var COMPASSION_DAY_ICON = './assets/compassion/") !== -1);
console.log('COMPASSION_JOURNEY_IMAGES constant:', v.indexOf('var COMPASSION_JOURNEY_IMAGES') !== -1);
console.log('fox updated line:', v.indexOf('ביום חמלה השועלה שלך שומרת על האש') !== -1);
console.log('_cdIconImg in pill:', v.indexOf('_cdIconImg') !== -1);
console.log('CD chipMarks:', v.indexOf("cd && cd.active ? ['compassion']") !== -1);
console.log('CD image override else-if:', v.indexOf('} else if (cd && cd.active) {\r\n    // Compassion Day') !== -1);
console.log('CD lineText override:', v.indexOf('COMPASSION_DAY_COMPANION_LINES[c.id]) ||') !== -1);
console.log('CD lilac note:', v.indexOf('הרצף שלך נח היום') !== -1);
console.log('version marker:', v.match(/<!-- Tori version: [^>]+ -->/)[0]);
