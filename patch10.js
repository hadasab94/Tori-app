// patch10.js — Fix companion selection click bug
// Root causes identified:
//   1. position:sticky CTA bar overlaps last cards, swallowing pointer events
//   2. Rebuilding innerHTML on every selection call restarts jFadeIn animation (opacity:0 flicker)
//   3. No dedicated touch listeners; onclick on nested inner divs could miss targets
// Fix: DOM-based renderCompanionSelectDOM() with addEventListener + no sticky CTA
const fs = require('fs');
let html = fs.readFileSync('body-soul-app.html', 'utf8');

// ─────────────────────────────────────────────────────
// 1. CSS fix: remove sticky CTA, reset animation for select screen
// ─────────────────────────────────────────────────────
const OLD_CTA_CSS = `.jcs-cta-bar {
  position:sticky; bottom:0; left:0; right:0;
  padding:12px 0 26px;
  background:linear-gradient(180deg, rgba(244,239,230,0) 0%, rgba(244,239,230,0.96) 30%, rgba(244,239,230,1) 100%);
  margin-top:16px;
}`;
const NEW_CTA_CSS = `.jcs-cta-bar {
  /* removed position:sticky — it was intercepting clicks on companion cards */
  padding:16px 0 30px;
  margin-top:8px;
}
.jcc-btn {
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(0,0,0,0.04);
  user-select: none;
  -webkit-user-select: none;
}`;

if (html.includes(OLD_CTA_CSS)) {
  html = html.replace(OLD_CTA_CSS, NEW_CTA_CSS);
  console.log('✓ CTA CSS fixed (sticky removed)');
} else {
  console.error('✗ OLD_CTA_CSS not found');
}

// Remove animation from select-screen direct children (animation caused opacity:0 during re-renders)
const OLD_ANIM = `#journey-inner > * { animation: jFadeIn 0.3s ease both; }`;
const NEW_ANIM = `#journey-inner > *.j-card { animation: jFadeIn 0.25s ease forwards; }
/* Select screen children: no animation so they are immediately interactive */
.jcs-header,.jcs-list,.jcs-cta-bar { animation: none !important; opacity: 1 !important; transform: none !important; }`;
if (html.includes(OLD_ANIM)) {
  html = html.replace(OLD_ANIM, NEW_ANIM);
  console.log('✓ Animation scoped to j-card only');
} else {
  console.error('✗ OLD_ANIM not found');
}

// ─────────────────────────────────────────────────────
// 2. Replace buildCompanionSelectHTML() with DOM approach
// ─────────────────────────────────────────────────────
// Find and replace the entire function block
const SELECT_START = '// ── Companion select screen HTML ──\nfunction buildCompanionSelectHTML()';
const SELECT_END_MARKER = '\n\n// ── Confirm modal HTML ──';

const startIdx = html.indexOf(SELECT_START);
const endIdx = html.indexOf(SELECT_END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  console.error('Cannot find buildCompanionSelectHTML block:', startIdx, endIdx);
  process.exit(1);
}

const newSelectBlock = `// ── Companion select screen — DOM approach (reliable on mobile) ──
function buildCompanionSelectHTML() {
  // stub — renderJourneyTab calls renderCompanionSelectDOM instead
  return '<div id="jcs-root" style="padding:20px 0"></div>';
}

function renderCompanionSelectDOM(inner) {
  if (!inner) inner = document.getElementById('journey-inner');
  if (!inner) return;

  // Wipe and disable animations during construction
  inner.innerHTML = '';

  var selectedId = cs._pendingId || null;

  // ── Header ──
  var hdr = document.createElement('div');
  hdr.className = 'jcs-header';
  hdr.innerHTML = '<div style="font-size:11.5px;letter-spacing:0.4px;color:var(--g-ink-3);margin-bottom:6px">רגע לפני שמתחילים</div>'
    + '<div class="jcs-title">מי תלווה אותך בדרך?</div>'
    + '<div class="jcs-sub">יצור מלווה שנע איתך, מגיב לפעולות הקטנות, ולא נעלב אם את לא מופיעה. אפשר להחליף בכל רגע.</div>';
  inner.appendChild(hdr);

  // ── Card list ──
  var list = document.createElement('div');
  list.className = 'jcs-list';
  list.id = 'jcs-card-list';

  // Update visual state of all cards + CTA
  function updateVisuals() {
    var allBtns = list.querySelectorAll('.jcc-btn');
    allBtns.forEach(function(btn) {
      var id = btn.getAttribute('data-id');
      var c = COMPANIONS[id];
      if (!c) return;
      var sel = (id === selectedId);
      btn.classList.toggle('selected', sel);
      btn.style.borderColor = sel ? c.accent : 'rgba(70,55,30,0.10)';
      btn.style.borderWidth = sel ? '2px' : '1.5px';
      btn.style.boxShadow = sel
        ? '0 1px 0 rgba(45,42,38,0.02),0 12px 28px -16px ' + c.accent + '88'
        : '0 1px 0 rgba(45,42,38,0.02),0 6px 16px -12px rgba(45,42,38,0.12)';
      var radio = btn.querySelector('.jcc-radio');
      if (radio) {
        radio.classList.toggle('on', sel);
        radio.style.border = sel ? '5px solid ' + c.accent : '1.5px solid rgba(45,42,38,0.25)';
      }
    });
    var ctaBtn = document.getElementById('jcs-cta-btn');
    if (ctaBtn) {
      var selComp = selectedId ? COMPANIONS[selectedId] : null;
      ctaBtn.disabled = !selComp;
      ctaBtn.className = selComp ? 'jcs-cta active' : 'jcs-cta inactive';
      ctaBtn.textContent = selComp
        ? 'בחרתי את ' + selComp.name
        : 'בחרי דמות כדי להמשיך';
    }
  }

  // Build each companion card
  Object.values(COMPANIONS).forEach(function(c) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'jcc-btn';
    btn.setAttribute('data-id', c.id);
    // Ensure pointer events reach the button
    btn.style.cssText = 'pointer-events:auto;cursor:pointer;touch-action:manipulation;'
      + 'border-color:rgba(70,55,30,0.10);border-width:1.5px;';

    // Portrait section
    var portrait = document.createElement('div');
    portrait.className = 'jcc-portrait';
    portrait.style.background = 'radial-gradient(circle at 50% 60%,#FFFFFF 0%,' + c.sceneTint + ' 70%)';
    portrait.style.pointerEvents = 'none';
    var img = document.createElement('img');
    img.src = c.img;
    img.alt = c.species;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.pointerEvents = 'none';
    portrait.appendChild(img);
    btn.appendChild(portrait);

    // Text content
    var content = document.createElement('div');
    content.className = 'jcc-content';
    content.style.pointerEvents = 'none';
    content.innerHTML = '<div style="display:flex;align-items:baseline;gap:6px">'
      + '<span class="jcc-name serif">' + c.name + '</span>'
      + '<span class="jcc-species">\xB7 ' + c.species + '</span>'
      + '</div>'
      + '<div class="jcc-tagline" style="color:' + c.accent + '">' + c.tagline + '</div>'
      + '<div class="jcc-bio">' + c.bio + '</div>'
      + '<div class="jcc-fits">מתאימה אם: ' + c.fitsIf + '</div>';
    btn.appendChild(content);

    // Radio indicator
    var radio = document.createElement('div');
    radio.className = 'jcc-radio';
    radio.style.border = '1.5px solid rgba(45,42,38,0.25)';
    radio.style.pointerEvents = 'none';
    btn.appendChild(radio);

    // Click handler — attached directly to button element
    function doSelect() {
      selectedId = c.id;
      cs._pendingId = c.id;
      updateVisuals();
    }
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      doSelect();
    });
    btn.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      doSelect();
    }, {passive: false});

    list.appendChild(btn);
  });

  inner.appendChild(list);

  // Footnote
  var note = document.createElement('div');
  note.style.cssText = 'font-size:12px;color:var(--g-ink-3);text-align:center;line-height:1.5;margin:8px 0 4px';
  note.textContent = 'אפשר להחליף בכל זמן. הן לא ייפגעו.';
  inner.appendChild(note);

  // CTA bar
  var ctaBar = document.createElement('div');
  ctaBar.className = 'jcs-cta-bar';
  var ctaBtn = document.createElement('button');
  ctaBtn.type = 'button';
  ctaBtn.id = 'jcs-cta-btn';
  ctaBtn.className = 'jcs-cta inactive';
  ctaBtn.disabled = true;
  ctaBtn.textContent = 'בחרי דמות כדי להמשיך';
  ctaBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!selectedId) return;
    confirmJourneyCompanion();
  });
  ctaBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    if (!selectedId) return;
    confirmJourneyCompanion();
  }, {passive: false});
  ctaBar.appendChild(ctaBtn);
  inner.appendChild(ctaBar);

  // Apply initial state if companion already selected
  if (selectedId) updateVisuals();
}

`;

html = html.slice(0, startIdx) + newSelectBlock + html.slice(endIdx);
console.log('✓ buildCompanionSelectHTML replaced with renderCompanionSelectDOM');

// ─────────────────────────────────────────────────────
// 3. Update renderJourneyTab to call renderCompanionSelectDOM
// ─────────────────────────────────────────────────────
const OLD_RENDER_TAB = `function renderJourneyTab() {
  var inner = document.getElementById('journey-inner');
  if (!inner) return;
  if (!cs.companionId) {
    inner.innerHTML = buildCompanionSelectHTML();
  } else {
    _journeyTrailDays = getJourneyTrail();
    inner.innerHTML = buildJourneyMainHTML();
  }
}`;
const NEW_RENDER_TAB = `function renderJourneyTab() {
  var inner = document.getElementById('journey-inner');
  if (!inner) return;
  if (!cs.companionId) {
    renderCompanionSelectDOM(inner); // DOM approach — no inline onclick, proper touch support
  } else {
    _journeyTrailDays = getJourneyTrail();
    inner.innerHTML = buildJourneyMainHTML();
  }
}`;

if (html.includes(OLD_RENDER_TAB)) {
  html = html.replace(OLD_RENDER_TAB, NEW_RENDER_TAB);
  console.log('✓ renderJourneyTab updated');
} else {
  console.error('✗ renderJourneyTab not found');
}

// ─────────────────────────────────────────────────────
// 4. Update selectJourneyCompanion (it's still defined but no longer needed by cards)
// ─────────────────────────────────────────────────────
const OLD_SEL_FN = `function selectJourneyCompanion(id) {
  cs._pendingId = id;
  renderJourneyTab(); // re-render select screen with new selection
}`;
if (html.includes(OLD_SEL_FN)) {
  html = html.replace(OLD_SEL_FN,
    `function selectJourneyCompanion(id) {
  // kept for compat — DOM cards now call doSelect() internally
  cs._pendingId = id;
}`);
  console.log('✓ selectJourneyCompanion cleaned up');
} else {
  console.log('~ selectJourneyCompanion not found (already updated or removed)');
}

// ─────────────────────────────────────────────────────
// 5. Write and verify
// ─────────────────────────────────────────────────────
fs.writeFileSync('body-soul-app.html', html, 'utf8');

// Syntax check
const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g)||[];
let allJS = '';
scripts.forEach(function(s){ allJS += s.replace(/<script[^>]*>/,'').replace(/<\/script>/,'')+'\n'; });
fs.writeFileSync('_tmp_check10.js', allJS, 'utf8');
const {execSync} = require('child_process');
try {
  execSync('node --check _tmp_check10.js', {stdio:'pipe'});
  console.log('✓ Syntax OK');
} catch(e) {
  console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0,5).join('\n'));
}
try { require('fs').unlinkSync('_tmp_check10.js'); } catch(e) {}

console.log('Done. Size:', Buffer.byteLength(html), 'bytes');
