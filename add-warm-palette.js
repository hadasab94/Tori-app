var fs = require('fs');
var content = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
var NL = '\r\n';
console.log('size:', content.length);

function rep(old, nw, label) {
  if (content.indexOf(old) === -1) { console.error('NOT FOUND: ' + label); process.exit(1); }
  content = content.replace(old, nw);
  console.log('OK:', label);
}

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE
// Warm cream page bg:     #FFF8EA
// Softer card bg:         #FFFDF7
// Beige border:           rgba(210,190,150,0.45)
// Muted beige border:     rgba(185,158,100,0.35)
// Warm dark text:         #4F4638
// Muted warm text:        #7A6E5C
// Warm italic text:       #5A4830
// Accent muted lavender:  #C8B9E8 bg / #3F3558 text
// Note unsel bg:          #FFF3C4  border: rgba(205,180,80,0.30)
// Note done bg:           #FFE79E  border: rgba(185,140,30,0.38)
// Note done text:         #4A3818
// Pin:                    #D8A7A1 (softer dusty rose)
// Collected label:        #7A5A2E
// Frozen icy:             #EEF7FF→#E4F2FF  border: rgba(88,160,220,0.38)  text: #2E607A
// ─────────────────────────────────────────────────────────────────────────────

// 1. VIEW BACKGROUND — add warm bg to CD active view
// Find the today-compassion-active multi-selector display:none block
var tcaOld = '#view-today.today-compassion-active > .companion-feedback,' + NL
  + '#view-today.today-compassion-active > .spark-row,' + NL
  + '#view-today.today-compassion-active > .celebration,' + NL
  + '#view-today.today-compassion-active > .sec,' + NL
  + '#view-today.today-compassion-active > .task-grid {' + NL
  + '  display: none !important;' + NL
  + '}';
var tcaNew = '#view-today.today-compassion-active { background: #FFF8EA; }' + NL
  + tcaOld;
rep(tcaOld, tcaNew, 'view-today CD background');

// 2. COMPASSION-DAY-HEADER
rep(
  '.compassion-day-header {' + NL + "  font-family: 'Frank Ruhl Libre', serif;" + NL + '  font-size: 26px; font-weight: 500;' + NL + '  color: #4A2C7A; margin-bottom: 4px;' + NL + '}',
  '.compassion-day-header {' + NL + "  font-family: 'Frank Ruhl Libre', serif;" + NL + '  font-size: 26px; font-weight: 500;' + NL + '  color: #4F4638; margin-bottom: 4px;' + NL + '}',
  'compassion-day-header color'
);

// 3. COMPASSION-DAY-SUB
rep(
  '.compassion-day-sub {' + NL + '  font-size: 13px; color: #8A7AAA;' + NL + '  margin-bottom: 16px; line-height: 1.5;' + NL + '}',
  '.compassion-day-sub {' + NL + '  font-size: 13px; color: #7A6E5C;' + NL + '  margin-bottom: 16px; line-height: 1.5;' + NL + '}',
  'compassion-day-sub color'
);

// 4. CD-COMPANION-ROW
rep(
  '.cd-companion-row {' + NL + '  display: flex; align-items: flex-start; gap: 10px;' + NL + '  background: #F5EEFF; border: 1px solid rgba(107,76,154,0.18);' + NL + '  border-radius: 14px; padding: 12px 14px;' + NL + '  margin-bottom: 12px;' + NL + '}',
  '.cd-companion-row {' + NL + '  display: flex; align-items: flex-start; gap: 10px;' + NL + '  background: #FFFDF7; border: 1px solid rgba(210,190,150,0.50);' + NL + '  border-radius: 14px; padding: 12px 14px;' + NL + '  margin-bottom: 12px;' + NL + '}',
  'cd-companion-row palette'
);

// 5. CD-COMPANION-LINE
rep(
  '.cd-companion-line {' + NL + '  font-size: 13px; color: #5A3A8A;' + NL + '  line-height: 1.65; font-style: italic;' + NL + '}',
  '.cd-companion-line {' + NL + '  font-size: 13px; color: #5A4830;' + NL + '  line-height: 1.65; font-style: italic;' + NL + '}',
  'cd-companion-line color'
);

// 6. CD-WINS-TITLE
rep(
  '.cd-wins-title {' + NL + '  font-size: 15px; font-weight: 700;' + NL + '  color: #4A2C7A; margin-bottom: 12px;' + NL + '}',
  '.cd-wins-title {' + NL + '  font-size: 15px; font-weight: 700;' + NL + '  color: #4F4638; margin-bottom: 12px;' + NL + '}',
  'cd-wins-title color'
);

// 7. COMPASSION-WIN-CARD — update bg, border (keep warm but adjust saturation)
rep(
  '.compassion-win-card {' + NL
  + '  position: relative;' + NL
  + '  display: flex; flex-direction: column;' + NL
  + '  align-items: center; justify-content: center;' + NL
  + '  text-align: center;' + NL
  + '  background: #FEF9E8;' + NL
  + '  border: 1px solid rgba(185,158,100,0.22);' + NL
  + '  border-radius: 20px;' + NL
  + '  padding: 26px 12px 12px;' + NL
  + '  font-size: 13px; color: #5C4830;' + NL
  + '  font-family: inherit; cursor: pointer;' + NL
  + '  line-height: 1.55;' + NL
  + '  box-shadow: 0 2px 6px rgba(140,100,40,0.09), 0 0 0 0.5px rgba(185,158,100,0.10);' + NL
  + '  transition: background 0.14s, box-shadow 0.14s, transform 0.1s;' + NL
  + '  touch-action: manipulation; min-height: 76px;' + NL
  + '}',

  '.compassion-win-card {' + NL
  + '  position: relative;' + NL
  + '  display: flex; flex-direction: column;' + NL
  + '  align-items: center; justify-content: center;' + NL
  + '  text-align: center;' + NL
  + '  background: #FFF3C4;' + NL
  + '  border: 1px solid rgba(205,178,70,0.28);' + NL
  + '  border-radius: 20px;' + NL
  + '  padding: 26px 12px 12px;' + NL
  + '  font-size: 13px; color: #4F4638;' + NL
  + '  font-family: inherit; cursor: pointer;' + NL
  + '  line-height: 1.55;' + NL
  + '  box-shadow: 0 2px 6px rgba(140,110,20,0.09), 0 0 0 0.5px rgba(205,178,70,0.12);' + NL
  + '  transition: background 0.14s, box-shadow 0.14s, transform 0.1s;' + NL
  + '  touch-action: manipulation; min-height: 76px;' + NL
  + '}',
  'compassion-win-card bg/border/text'
);

// 8. PIN — softer dusty rose
rep(
  '.compassion-win-card::before {' + NL
  + '  content: "";' + NL
  + '  position: absolute;' + NL
  + '  top: 9px; left: 50%;' + NL
  + '  transform: translateX(-50%);' + NL
  + '  width: 11px; height: 11px;' + NL
  + '  border-radius: 50%;' + NL
  + '  background: #CC8CA0;' + NL
  + '  box-shadow: 0 1px 3px rgba(140,60,80,0.28), inset 0 1px 1px rgba(255,255,255,0.40);' + NL
  + '}',

  '.compassion-win-card::before {' + NL
  + '  content: "";' + NL
  + '  position: absolute;' + NL
  + '  top: 9px; left: 50%;' + NL
  + '  transform: translateX(-50%);' + NL
  + '  width: 11px; height: 11px;' + NL
  + '  border-radius: 50%;' + NL
  + '  background: #D8A7A1;' + NL
  + '  box-shadow: 0 1px 3px rgba(160,80,80,0.22), inset 0 1px 1px rgba(255,255,255,0.45);' + NL
  + '}',
  'pin color softer'
);

// 9. WIN CARD DONE
rep(
  '.compassion-win-card.done {' + NL
  + '  background: #FDF0C0;' + NL
  + '  border-color: rgba(185,148,60,0.30);' + NL
  + '  color: #4A3818;' + NL
  + '  box-shadow: 0 2px 8px rgba(140,100,20,0.13), 0 0 0 0.5px rgba(185,148,60,0.14);' + NL
  + '}',

  '.compassion-win-card.done {' + NL
  + '  background: #FFE79E;' + NL
  + '  border-color: rgba(185,140,30,0.38);' + NL
  + '  color: #4A3818;' + NL
  + '  box-shadow: 0 2px 8px rgba(140,100,10,0.12), 0 0 0 0.5px rgba(185,140,30,0.16);' + NL
  + '}',
  'win-card done bg'
);

// 10. CD-WIN-COLLECTED
rep(
  '.cd-win-collected {' + NL + '  font-size: 11px; color: #8A6025; font-weight: 600;' + NL + '  margin-top: 6px; opacity: 0.90;' + NL + '}',
  '.cd-win-collected {' + NL + '  font-size: 11px; color: #7A5A2E; font-weight: 600;' + NL + '  margin-top: 6px; opacity: 0.90;' + NL + '}',
  'cd-win-collected color'
);

// 11. COMPASSION-MORE-BTN
rep(
  '.compassion-more-btn {' + NL
  + '  width: 100%; padding: 11px 16px;' + NL
  + '  border-radius: 999px;' + NL
  + '  border: 1.5px solid rgba(107,76,154,0.30);' + NL
  + '  background: #F5EEFF; color: #6B4C9A;' + NL
  + '  font-family: inherit; font-size: 13px;' + NL
  + '  cursor: pointer; margin-bottom: 10px;' + NL
  + '  touch-action: manipulation;' + NL
  + '}',

  '.compassion-more-btn {' + NL
  + '  width: 100%; padding: 11px 16px;' + NL
  + '  border-radius: 999px;' + NL
  + '  border: 1.5px solid rgba(185,158,100,0.38);' + NL
  + '  background: #FFF8EA; color: #5A4830;' + NL
  + '  font-family: inherit; font-size: 13px;' + NL
  + '  cursor: pointer; margin-bottom: 10px;' + NL
  + '  touch-action: manipulation;' + NL
  + '}',
  'compassion-more-btn palette'
);

// 12. COMPASSION-ADD-BTN
rep(
  '.compassion-add-btn {' + NL
  + '  width: 100%; padding: 11px 16px;' + NL
  + '  border-radius: 999px; border: none;' + NL
  + '  background: #6B4C9A; color: #FFFFFF;' + NL
  + '  font-family: inherit; font-size: 13px; font-weight: 600;' + NL
  + '  cursor: pointer; margin-bottom: 6px;' + NL
  + '  touch-action: manipulation;' + NL
  + '}',

  '.compassion-add-btn {' + NL
  + '  width: 100%; padding: 11px 16px;' + NL
  + '  border-radius: 999px; border: 1px solid rgba(185,158,100,0.30);' + NL
  + '  background: #C8B9E8; color: #3F3558;' + NL
  + '  font-family: inherit; font-size: 13px; font-weight: 600;' + NL
  + '  cursor: pointer; margin-bottom: 6px;' + NL
  + '  touch-action: manipulation;' + NL
  + '}',
  'compassion-add-btn palette'
);

// 13. CD-CUSTOM-HELPER + CD-CUSTOM-INPUT-AREA (combined block)
rep(
  '.cd-custom-helper { font-size: 11.5px; color: #9A8ABB; text-align: center; margin-bottom: 20px; }' + NL
  + '.cd-custom-input-area {' + NL + '  background: #F5EEFF; border-radius: 14px;' + NL + '  padding: 12px; margin-bottom: 10px;' + NL + '}',

  '.cd-custom-helper { font-size: 11.5px; color: #7A6E5C; text-align: center; margin-bottom: 20px; }' + NL
  + '.cd-custom-input-area {' + NL + '  background: #FFFDF7; border-radius: 14px;' + NL + '  padding: 12px; margin-bottom: 10px;' + NL + '}',
  'cd-custom-helper + input-area'
);

// 14. CD-CUSTOM-INPUT
rep(
  '.cd-custom-input {' + NL
  + '  width: 100%; padding: 10px 12px;' + NL
  + '  border: 1.5px solid rgba(107,76,154,0.30);' + NL
  + '  border-radius: 10px; font-size: 14px;' + NL
  + '  font-family: inherit; color: #3A1A6A;' + NL
  + '  background: #FFFFFF; direction: rtl;' + NL
  + '  box-sizing: border-box; margin-bottom: 8px;' + NL
  + '}',

  '.cd-custom-input {' + NL
  + '  width: 100%; padding: 10px 12px;' + NL
  + '  border: 1.5px solid rgba(185,158,100,0.35);' + NL
  + '  border-radius: 10px; font-size: 14px;' + NL
  + '  font-family: inherit; color: #4F4638;' + NL
  + '  background: #FFFEF8; direction: rtl;' + NL
  + '  box-sizing: border-box; margin-bottom: 8px;' + NL
  + '}',
  'cd-custom-input border/color'
);

// 15. CD-CUSTOM-SAVE
rep(
  '.cd-custom-save {' + NL
  + '  flex: 1; padding: 10px; border-radius: 999px;' + NL
  + '  border: none; background: #6B4C9A; color: white;' + NL
  + '  font-family: inherit; font-size: 13px; font-weight: 600;' + NL
  + '  cursor: pointer;' + NL
  + '}',

  '.cd-custom-save {' + NL
  + '  flex: 1; padding: 10px; border-radius: 999px;' + NL
  + '  border: none; background: #C8B9E8; color: #3F3558;' + NL
  + '  font-family: inherit; font-size: 13px; font-weight: 600;' + NL
  + '  cursor: pointer;' + NL
  + '}',
  'cd-custom-save'
);

// 16. CD-CUSTOM-CANCEL
rep(
  '.cd-custom-cancel {' + NL
  + '  flex: 1; padding: 10px; border-radius: 999px;' + NL
  + '  border: 1px solid rgba(107,76,154,0.20);' + NL
  + '  background: white; color: #6B4C9A;' + NL
  + '  font-family: inherit; font-size: 13px;' + NL
  + '  cursor: pointer;' + NL
  + '}',

  '.cd-custom-cancel {' + NL
  + '  flex: 1; padding: 10px; border-radius: 999px;' + NL
  + '  border: 1px solid rgba(185,158,100,0.30);' + NL
  + '  background: #FFF8EA; color: #5A4830;' + NL
  + '  font-family: inherit; font-size: 13px;' + NL
  + '  cursor: pointer;' + NL
  + '}',
  'cd-custom-cancel'
);

// 17. COMPASSION-EXIT-BTN
rep(
  '.compassion-exit-btn {' + NL
  + '  width: 100%; padding: 9px 16px;' + NL
  + '  border-radius: 999px;' + NL
  + '  border: 1px solid rgba(107,76,154,0.20);' + NL
  + '  background: transparent; color: #9A8ABB;' + NL
  + '  font-family: inherit; font-size: 12.5px;' + NL
  + '  cursor: pointer; margin-top: 8px;' + NL
  + '  touch-action: manipulation;' + NL
  + '}',

  '.compassion-exit-btn {' + NL
  + '  width: 100%; padding: 9px 16px;' + NL
  + '  border-radius: 999px;' + NL
  + '  border: 1px solid rgba(185,158,100,0.28);' + NL
  + '  background: transparent; color: #7A6E5C;' + NL
  + '  font-family: inherit; font-size: 12.5px;' + NL
  + '  cursor: pointer; margin-top: 8px;' + NL
  + '  touch-action: manipulation;' + NL
  + '}',
  'compassion-exit-btn'
);

// 18. CD-CONFIRM-AREA
rep(
  '.cd-confirm-area {' + NL + '  background: #FBF8FF; border: 1px solid rgba(107,76,154,0.18);' + NL + '  border-radius: 16px; padding: 16px; margin-top: 8px;' + NL + '}',
  '.cd-confirm-area {' + NL + '  background: #FFFDF7; border: 1px solid rgba(210,190,150,0.48);' + NL + '  border-radius: 16px; padding: 16px; margin-top: 8px;' + NL + '}',
  'cd-confirm-area'
);

// 19. CD-CONFIRM-TITLE
rep(
  '.cd-confirm-title {' + NL + '  font-size: 14px; font-weight: 700;' + NL + '  color: #4A2C7A; margin-bottom: 6px;' + NL + '}',
  '.cd-confirm-title {' + NL + '  font-size: 14px; font-weight: 700;' + NL + '  color: #4F4638; margin-bottom: 6px;' + NL + '}',
  'cd-confirm-title'
);

// 20. CD-CONFIRM-BODY
rep(
  '.cd-confirm-body {' + NL + '  font-size: 12.5px; color: #7A6A9A;' + NL + '  line-height: 1.6; margin-bottom: 14px;' + NL + '}',
  '.cd-confirm-body {' + NL + '  font-size: 12.5px; color: #7A6E5C;' + NL + '  line-height: 1.6; margin-bottom: 14px;' + NL + '}',
  'cd-confirm-body'
);

// 21. CD-CONFIRM-BTNS + CD-CONFIRM-YES (combined block)
rep(
  '.cd-confirm-btns { display: flex; flex-direction: column; gap: 8px; }' + NL
  + '.cd-confirm-yes {' + NL
  + '  width: 100%; padding: 11px; border-radius: 999px;' + NL
  + '  border: 1px solid rgba(107,76,154,0.25);' + NL
  + '  background: #F5EEFF; color: #6B4C9A;' + NL
  + '  font-family: inherit; font-size: 13px;' + NL
  + '  cursor: pointer;' + NL
  + '}',

  '.cd-confirm-btns { display: flex; flex-direction: column; gap: 8px; }' + NL
  + '.cd-confirm-yes {' + NL
  + '  width: 100%; padding: 11px; border-radius: 999px;' + NL
  + '  border: 1px solid rgba(185,158,100,0.32);' + NL
  + '  background: #FFF8EA; color: #5A4830;' + NL
  + '  font-family: inherit; font-size: 13px;' + NL
  + '  cursor: pointer;' + NL
  + '}',
  'cd-confirm-yes'
);

// 22. CD-CONFIRM-NO
rep(
  '.cd-confirm-no {' + NL
  + '  width: 100%; padding: 11px; border-radius: 999px;' + NL
  + '  border: none; background: #6B4C9A; color: white;' + NL
  + '  font-family: inherit; font-size: 13px; font-weight: 600;' + NL
  + '  cursor: pointer;' + NL
  + '}',

  '.cd-confirm-no {' + NL
  + '  width: 100%; padding: 11px; border-radius: 999px;' + NL
  + '  border: none; background: #C8B9E8; color: #3F3558;' + NL
  + '  font-family: inherit; font-size: 13px; font-weight: 600;' + NL
  + '  cursor: pointer;' + NL
  + '}',
  'cd-confirm-no'
);

// 23. FROZEN STREAK PILL — keep icy blue, drop the lavender tint
rep(
  '.streak-pill.frozen { background: linear-gradient(135deg,#EEF5FF 0%,#F0EEFF 100%); border-color: rgba(100,140,220,0.40); color: #3A5A9A; }',
  '.streak-pill.frozen { background: linear-gradient(135deg,#EEF7FF 0%,#E4F2FF 100%); border-color: rgba(88,160,220,0.38); color: #2E607A; }',
  'frozen streak pill'
);

// 24. COMP-MODAL-CONFIRM (activation modal primary btn)
rep(
  '.comp-modal-confirm { background: #9B72CF; color: white; border: none; border-radius: 12px; padding: 11px 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; width: 100%; margin-bottom: 8px; }',
  '.comp-modal-confirm { background: #B8A7D8; color: #3F3558; border: none; border-radius: 12px; padding: 11px 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; width: 100%; margin-bottom: 8px; }',
  'comp-modal-confirm btn'
);

// ── VERSION ──────────────────────────────────────────────────────────────────
content = content.replace(/<!-- Tori version: [^>]+ -->/, '<!-- Tori version: warm-palette-2026-05-29 -->');
console.log('version bumped');

fs.writeFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', content, 'utf8');
console.log('written. bytes:', content.length);

// ── VERIFY ───────────────────────────────────────────────────────────────────
var v = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
console.log('\n── VERIFY ──');
console.log('view CD bg #FFF8EA:', v.indexOf('background: #FFF8EA') !== -1);
console.log('header warm text:', v.indexOf('color: #4F4638') !== -1);
console.log('sub warm text:', v.indexOf('color: #7A6E5C') !== -1);
console.log('companion row warm bg:', v.indexOf('background: #FFFDF7') !== -1);
console.log('note unsel #FFF3C4:', v.indexOf('background: #FFF3C4') !== -1);
console.log('note done #FFE79E:', v.indexOf('background: #FFE79E') !== -1);
console.log('pin #D8A7A1:', v.indexOf('background: #D8A7A1') !== -1);
console.log('collected #7A5A2E:', v.indexOf('color: #7A5A2E') !== -1);
console.log('more-btn warm:', v.indexOf('background: #FFF8EA') !== -1);
console.log('add-btn lavender #C8B9E8:', v.indexOf('background: #C8B9E8') !== -1);
console.log('frozen icy only:', v.indexOf('#EEF7FF') !== -1);
console.log('no old lavender #F5EEFF:', v.indexOf('#F5EEFF') === -1);
console.log('no old purple #6B4C9A bg:', v.indexOf('background: #6B4C9A') === -1);
console.log('no old #F0EEFF in frozen:', v.indexOf('#F0EEFF') === -1);
console.log('COMPASSION_DAY_WINS untouched:', v.indexOf('var COMPASSION_DAY_WINS') !== -1);
console.log('tapCompassionWin untouched:', v.indexOf('function tapCompassionWin') !== -1);
console.log('version:', v.match(/<!-- Tori version: [^>]+ -->/)[0]);
