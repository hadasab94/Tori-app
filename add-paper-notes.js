var fs = require('fs');
var content = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
var NL = '\r\n'; // confirmed CRLF
console.log('size:', content.length);

// ── REPLACE CD WINS CSS BLOCK — warm paper note style ────────────────────────
var cssOld = '.cd-wins-title {' + NL
  + '  font-size: 15px; font-weight: 700;' + NL
  + '  color: #4A2C7A; margin-bottom: 12px;' + NL
  + '}' + NL
  + '.cd-wins-grid {' + NL
  + '  display: grid;' + NL
  + '  grid-template-columns: repeat(2, 1fr);' + NL
  + '  gap: 9px;' + NL
  + '  margin-bottom: 14px;' + NL
  + '}' + NL
  + '.compassion-win-card {' + NL
  + '  display: flex; flex-direction: column;' + NL
  + '  align-items: center; justify-content: center;' + NL
  + '  text-align: center;' + NL
  + '  background: #F2ECFF;' + NL
  + '  border: 1px solid rgba(140,110,200,0.14);' + NL
  + '  border-radius: 20px; padding: 14px 12px 10px;' + NL
  + '  font-size: 13px; color: #5A3A8A;' + NL
  + '  font-family: inherit; cursor: pointer;' + NL
  + '  line-height: 1.55;' + NL
  + '  transition: background 0.14s, border-color 0.14s, transform 0.1s;' + NL
  + '  touch-action: manipulation; min-height: 72px;' + NL
  + '}' + NL
  + '.compassion-win-card:active { transform: scale(0.96); }' + NL
  + '.compassion-win-card.done {' + NL
  + '  background: #D8CCFF;' + NL
  + '  border-color: rgba(107,76,154,0.28);' + NL
  + '  color: #3A1A6A;' + NL
  + '}' + NL
  + '.cd-win-text { font-size: 13px; line-height: 1.55; }' + NL
  + '.cd-win-collected {' + NL
  + '  font-size: 11px; color: #6B4C9A; font-weight: 600;' + NL
  + '  margin-top: 6px; opacity: 0.88;' + NL
  + '}';

if (content.indexOf(cssOld) === -1) { console.error('CSS anchor not found'); process.exit(1); }

// Warm paper note palette:
//   Unselected: #FEF9E8 (vanilla cream), border rgba(185,158,100,0.18)
//   Selected:   #FDF0C0 (soft golden cream), border rgba(185,148,60,0.26)
//   Pin:        #CC8CA0 (dusty rose), subtle inner highlight + drop shadow
//   Text unsel: #5C4830 (warm dark brown)
//   Text done:  #4A3818 (deeper warm brown)
//   Collected:  #8A6025 (warm muted amber-brown)
var cssNew = '.cd-wins-title {' + NL
  + '  font-size: 15px; font-weight: 700;' + NL
  + '  color: #4A2C7A; margin-bottom: 12px;' + NL
  + '}' + NL
  + '.cd-wins-grid {' + NL
  + '  display: grid;' + NL
  + '  grid-template-columns: repeat(2, 1fr);' + NL
  + '  gap: 10px;' + NL
  + '  margin-bottom: 14px;' + NL
  + '}' + NL
  + '.compassion-win-card {' + NL
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
  + '}' + NL
  + '.compassion-win-card::before {' + NL
  + '  content: "";' + NL
  + '  position: absolute;' + NL
  + '  top: 9px; left: 50%;' + NL
  + '  transform: translateX(-50%);' + NL
  + '  width: 11px; height: 11px;' + NL
  + '  border-radius: 50%;' + NL
  + '  background: #CC8CA0;' + NL
  + '  box-shadow: 0 1px 3px rgba(140,60,80,0.28), inset 0 1px 1px rgba(255,255,255,0.40);' + NL
  + '}' + NL
  + '.compassion-win-card:active { transform: scale(0.96); }' + NL
  + '.compassion-win-card.done {' + NL
  + '  background: #FDF0C0;' + NL
  + '  border-color: rgba(185,148,60,0.30);' + NL
  + '  color: #4A3818;' + NL
  + '  box-shadow: 0 2px 8px rgba(140,100,20,0.13), 0 0 0 0.5px rgba(185,148,60,0.14);' + NL
  + '}' + NL
  + '.cd-win-text { font-size: 13px; line-height: 1.55; }' + NL
  + '.cd-win-collected {' + NL
  + '  font-size: 11px; color: #8A6025; font-weight: 600;' + NL
  + '  margin-top: 6px; opacity: 0.90;' + NL
  + '}';

content = content.replace(cssOld, cssNew);
console.log('CSS replaced');

// ── BUMP VERSION ─────────────────────────────────────────────────────────────
content = content.replace(
  /<!-- Tori version: [^>]+ -->/,
  '<!-- Tori version: paper-notes-2026-05-29 -->'
);
console.log('version bumped');

fs.writeFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', content, 'utf8');
console.log('written. bytes:', content.length);

// ── VERIFY ───────────────────────────────────────────────────────────────────
var v = fs.readFileSync('C:/Users/Guy/.claude/projects/complex/body-soul-app.html', 'utf8');
console.log('\n── VERIFY ──');
console.log('position:relative on card:', v.indexOf('position: relative;') !== -1);
console.log('::before pin rule:', v.indexOf('.compassion-win-card::before {') !== -1);
console.log('warm unsel bg #FEF9E8:', v.indexOf('background: #FEF9E8;') !== -1);
console.log('done bg #FDF0C0:', v.indexOf('background: #FDF0C0;') !== -1);
console.log('pin color #CC8CA0:', v.indexOf('background: #CC8CA0;') !== -1);
console.log('collected color warm:', v.indexOf('color: #8A6025;') !== -1);
console.log('no old lilac bg #F2ECFF:', v.indexOf('#F2ECFF') === -1);
console.log('no old done #D8CCFF:', v.indexOf('#D8CCFF') === -1);
console.log('COMPASSION_DAY_WINS untouched:', v.indexOf('var COMPASSION_DAY_WINS') !== -1);
console.log('tapCompassionWin untouched:', v.indexOf('function tapCompassionWin') !== -1);
console.log('cd-win-collected div present:', v.indexOf('<div class=\"cd-win-collected\">') !== -1);
console.log('version marker:', v.match(/<!-- Tori version: [^>]+ -->/)[0]);
