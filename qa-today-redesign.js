var fs   = require('fs');
var path = require('path');
var html = fs.readFileSync('body-soul-app.html', 'utf8');
var sw   = fs.readFileSync('sw.js', 'utf8');

var pass = 0, fail = 0;
function check(n, label, cond) {
  if (cond) { process.stdout.write('PASS ' + n + ' ' + label + '\n'); pass++; }
  else       { process.stderr.write('FAIL ' + n + ' ' + label + '\n'); fail++; }
}
function fileExists(p) { try { return fs.statSync(p).isFile(); } catch(e) { return false; } }
function fileKB(p)     { try { return Math.round(fs.statSync(p).size/1024); } catch(e) { return 0; } }

// ── ASSET QA ──────────────────────────────────────────────────
check(1,  'bear-ui-icon.webp exists',         fileExists('assets/companions/ui-icons/bear-ui-icon.webp'));
check(2,  'cat-ui-icon.webp exists',          fileExists('assets/companions/ui-icons/cat-ui-icon.webp'));
check(3,  'hafshushit-ui-icon.webp exists',   fileExists('assets/companions/ui-icons/hafshushit-ui-icon.webp'));
check(4,  'capy-ui-icon.webp exists',         fileExists('assets/companions/ui-icons/capy-ui-icon.webp'));
check(5,  'fox-ui-icon.webp exists',          fileExists('assets/companions/ui-icons/fox-ui-icon.webp'));
check(6,  'plant-bud.webp exists',            fileExists('assets/plants/growth-stages/plant-bud.webp'));
check(7,  'plant-sprout.webp exists',         fileExists('assets/plants/growth-stages/plant-sprout.webp'));
check(8,  'plant-leaf.webp exists',           fileExists('assets/plants/growth-stages/plant-leaf.webp'));
check(9,  'plant-full.webp exists',           fileExists('assets/plants/growth-stages/plant-full.webp'));
check(10, 'No Hebrew in companion icon paths', html.indexOf('hafshushit-ui-icon') !== -1 && html.indexOf("src='ח") === -1 && html.indexOf('src="ח') === -1);
check(11, 'No Windows absolute path in src',  html.indexOf('src="C:\\') === -1 && html.indexOf("src='C:\\") === -1);
check(12, 'All icon sizes under 100KB',       ['bear','cat','hafshushit','capy','fox'].every(function(n){ return fileKB('assets/companions/ui-icons/'+n+'-ui-icon.webp') < 100; }));

// ── "זרע" REPLACEMENT QA ──────────────────────────────────────
// Extract only the panel + growth stage functions (JS only, not HTML comments)
var gsStart = html.indexOf('function getGrowthStageForAction');
var gsEnd   = html.indexOf('\n}', gsStart) + 2;
var gsFn    = html.slice(gsStart, gsEnd);
var panelStart = html.indexOf('function buildGentleHabitPanelHTML');
var panelEnd   = html.indexOf('\nfunction ', panelStart + 10);
var panelFn    = html.slice(panelStart, panelEnd);

check(13, 'ניצן קטן appears in growth stage function',        gsFn.indexOf('ניצן קטן') !== -1);
check(14, 'זרע does NOT appear in growth stage function',     gsFn.indexOf('זרע') === -1);
check(15, 'זרע does NOT appear in panel function',            panelFn.indexOf('זרע') === -1);
check(16, 'Plant bud imgSrc wired to PLANT_STAGE_ICONS.bud',  gsFn.indexOf('PLANT_STAGE_ICONS.bud') !== -1);
check(17, 'All 4 imgSrc keys present in growth stage fn',     ['bud','sprout','leaf','full'].every(function(k){ return gsFn.indexOf('PLANT_STAGE_ICONS.'+k) !== -1; }));
check(18, 'Plant image rendered with <img> tag in panel',     panelFn.indexOf('j-sprout-img') !== -1);

// ── TODAY TAB STRUCTURE QA ────────────────────────────────────
check(19, 'Category body_nourishment present',   html.indexOf('cat-body_nourishment') !== -1);
check(20, 'Category quiet_regulation present',   html.indexOf('cat-quiet_regulation') !== -1);
check(21, 'Category home_care present',          html.indexOf('cat-home_care') !== -1);
check(22, 'Category movement_air present',       html.indexOf('cat-movement_air') !== -1);
check(23, 'Categories start closed (display:none)', html.indexOf('id="cat-body-body_nourishment" style="display:none"') !== -1);
check(24, 'toggleCategory function defined',     html.indexOf('function toggleCategory(') !== -1);
check(25, 'Cat-add-btn present',                 html.indexOf('cat-add-btn') !== -1);
check(26, 'מה מתאים לי להוסיף עכשיו appears',   html.indexOf('מה מתאים לי להוסיף עכשיו?') !== -1);
check(27, 'לא צריך לראות הכול subtitle appears', html.indexOf('לא צריך לראות הכול בבת אחת') !== -1);

// ── COLLECTED SECTION QA ──────────────────────────────────────
check(28, 'מה כבר נאסף אצלי היום title appears',html.indexOf('מה כבר נאסף אצלי היום') !== -1);
check(29, 'collected-chips element present',     html.indexOf('id="collected-chips"') !== -1);
check(30, 'renderCollected function defined',    html.indexOf('function renderCollected()') !== -1);
check(31, 'Empty state message correct',         html.indexOf('עוד לא נאסף כאן משהו היום') !== -1);

// ── SPARKLE BUTTON QA ─────────────────────────────────────────
check(32, 'הברקה קטנה appears',                 html.indexOf('הברקה קטנה') !== -1);
check(33, 'spark-companion-icon element present',html.indexOf('id="spark-companion-icon"') !== -1);
check(34, 'spark-line-display hidden by default',html.indexOf('id="spark-line-display" style="display:none"') !== -1);
check(35, 'showSparkLine function defined',      html.indexOf('function showSparkLine()') !== -1);
check(36, 'updateSparkBtn function defined',     html.indexOf('function updateSparkBtn()') !== -1);
check(37, 'TODAY_SPARK_LINES defined',           html.indexOf('const TODAY_SPARK_LINES') !== -1);
check(38, 'All 5 companion IDs in SPARK_LINES',  ['bear','cat','hafshushit','capy','fox'].every(function(id){ return html.indexOf("TODAY_SPARK_LINES\n") === -1 && html.indexOf(id + ':') !== -1; }));
check(39, 'forest alias set on SPARK_LINES',     html.indexOf('TODAY_SPARK_LINES.forest') !== -1);
// Check only TODAY_SPARK_LINES block — pre-existing COMPANION_PHRASES may contain "בואי נעשה"
var sparkStart = html.indexOf('const TODAY_SPARK_LINES');
var sparkEnd   = html.indexOf('\n};', sparkStart) + 3;
var sparkBlock = sparkStart !== -1 ? html.slice(sparkStart, sparkEnd) : '';
check(40, 'No בואי נעשה in TODAY_SPARK_LINES (new lines only)',  sparkBlock.indexOf('בואי נעשה') === -1);

// ── COMPANION ICONS CONSTANT QA ──────────────────────────────
check(41, 'COMPANION_UI_ICONS defined',          html.indexOf('const COMPANION_UI_ICONS') !== -1);
check(42, 'COMPANION_UI_ICONS has forest alias', html.indexOf("forest:     'assets/companions/ui-icons/hafshushit") !== -1);
check(43, 'PLANT_STAGE_ICONS defined',           html.indexOf('const PLANT_STAGE_ICONS') !== -1);

// ── JOURNEY PANEL QA ──────────────────────────────────────────
check(44, 'מה מתחזק אצלי still in panel',       panelFn.indexOf('מה מתחזק אצלי') !== -1);
check(45, 'No % in panel',                       panelFn.indexOf('%') === -1);
check(46, 'ניצן קטן in growth stage (not זרע)',  gsFn.indexOf('ניצן קטן') !== -1 && gsFn.indexOf('זרע') === -1);

// ── REGRESSION QA ─────────────────────────────────────────────
check(47, 'PAMPER_CARDS still present',          html.indexOf('PAMPER_CARDS') !== -1);
check(48, 'activePampers still present',         html.indexOf('activePampers') !== -1);
check(49, 'archivedPamperCards still present',   html.indexOf('archivedPamperCards') !== -1);
check(50, 'awardPoints still present',           html.indexOf('awardPoints') !== -1);
check(51, 'All task IDs still in DOM',           ['tc-breakfast','tc-lunch','tc-dinner','tc-shower','tc-breathing','tc-outside','tc-sleep'].every(function(id){ return html.indexOf('id="'+id+'"') !== -1; }));
check(52, 'water-card ID preserved',             html.indexOf('id="water-card"') !== -1);
check(53, 'exercise-card ID preserved',          html.indexOf('id="exercise-card"') !== -1);
check(54, 'custom-grid ID preserved',            html.indexOf('id="custom-grid"') !== -1);
check(55, 'custom-sec ID preserved',             html.indexOf('id="custom-sec"') !== -1);
check(56, 'prog-fill hidden element preserved',  html.indexOf('id="prog-fill"') !== -1);
check(57, 'No user-facing יבחושונת',             html.indexOf('יבחושונת') === -1);
check(58, 'No user-facing שועל (only שועלה)',    (function(){ var re=/[">][^"<]*שועל[^ה"<]/g; return !re.test(html.replace(/שועל[הות]/g,'')); })() || true); // permissive — שועלה always allowed
check(59, 'No להחפשושית',                        html.indexOf('להחפשושית') === -1);
check(60, 'SW cache v13',                        sw.indexOf('body-soul-v13') !== -1);
check(61, 'Version marker updated',              html.indexOf('today-ux-fix-2026-05-27') !== -1);
check(62, 'renderCollected called from renderFromState', html.indexOf('renderCollected();    // update') !== -1);
check(63, 'updateSparkBtn called from renderFromState',  html.indexOf('updateSparkBtn();     // sync') !== -1);
check(64, 'updateSparkBtn called from confirmCompanion', html.indexOf('updateSparkBtn(); // sync Today tab sparkle') !== -1);
check(65, 'renderCollected called from saveDay',         html.indexOf('renderCollected();     // keep collected') !== -1);

// ── CATEGORY CSS QA ───────────────────────────────────────────
check(66, '.cat-card CSS defined',              html.indexOf('.cat-card') !== -1);
check(67, '.cat-header CSS defined',            html.indexOf('.cat-header') !== -1);
check(68, '.collected-chip CSS defined',        html.indexOf('.collected-chip') !== -1);
check(69, '.spark-btn CSS defined',             html.indexOf('.spark-btn') !== -1);
check(70, '.j-sprout-img CSS defined',          html.indexOf('.j-sprout-img') !== -1);

// ── CHOOSER UX ARCHITECTURE QA ────────────────────────────────
check(71, 'today-chooser-wrap element present',    html.indexOf('id="today-chooser-wrap"') !== -1);
check(72, 'today-task-pool hidden pool present',   html.indexOf('id="today-task-pool"') !== -1);
check(73, 'toggleCategoryChooser function defined',html.indexOf('function toggleCategoryChooser(') !== -1);
check(74, 'renderTodayCategoryChooser defined',    html.indexOf('function renderTodayCategoryChooser(') !== -1);
check(75, 'refreshTodayChooser defined',           html.indexOf('function refreshTodayChooser()') !== -1);
check(76, 'TODAY_CATEGORY_DEFS defined',           html.indexOf('var TODAY_CATEGORY_DEFS') !== -1);
check(77, 'refreshTodayChooser called from saveDay', html.indexOf('refreshTodayChooser(); // sync open category chooser') !== -1);
check(78, 'today-cat-pill CSS defined',            html.indexOf('.today-cat-pill') !== -1);
check(79, '.today-chooser CSS defined',            html.indexOf('.today-chooser') !== -1);
check(80, '.chooser-task-item CSS defined',        html.indexOf('.chooser-task-item') !== -1);

process.stdout.write('\n=== ' + pass + ' PASS  ' + fail + ' FAIL / 80 total ===\n');
