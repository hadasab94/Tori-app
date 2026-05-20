// optimize-images.js — Convert companion images to WebP and resize for performance
// Keeps originals untouched. Creates WebP versions and updates body-soul-app.html.

const sharp = require('sharp');
const fs = require('fs');

// ─── Config ───────────────────────────────────────────────────────────────────
const AVATAR_SIZE   = 320;   // px — avatars shown at ~130px, 320 is 2.5× for crisp HiDPI
const HOME_MAX_W    = 640;   // px — home scenes: max width (height scales proportionally)
const AVATAR_Q      = 80;    // WebP quality for avatars
const HOME_Q        = 82;    // WebP quality for home scenes

const avatars = [
  { src: 'assets/companions/bear.png',        out: 'assets/companions/bear.webp',        label: 'דובה avatar' },
  { src: 'assets/companions/cat.png',         out: 'assets/companions/cat.webp',         label: 'חתולה avatar' },
  { src: 'assets/companions/forest.png',      out: 'assets/companions/forest.webp',      label: 'חפשושית avatar' },
  { src: 'assets/companions/capy.png',        out: 'assets/companions/capy.webp',        label: 'קפיברה avatar' },
  { src: 'assets/companions/fox.png',         out: 'assets/companions/fox.webp',         label: 'שועלה avatar' },
];

const homeScenes = [
  { src: 'assets/companions/bear-home.png',   out: 'assets/companions/bear-home.webp',   label: 'דובה scene' },
  { src: 'assets/companions/cat-home.png',    out: 'assets/companions/cat-home.webp',    label: 'חתולה scene' },
  { src: 'assets/companions/forest-home.png', out: 'assets/companions/forest-home.webp', label: 'חפשושית scene' },
  { src: 'assets/companions/capy-home.png',   out: 'assets/companions/capy-home.webp',   label: 'קפיברה scene' },
  { src: 'assets/companions/fox-home.png',    out: 'assets/companions/fox-home.webp',    label: 'שועלה scene' },
];

// ─── Process ──────────────────────────────────────────────────────────────────
const results = [];

async function processAll() {
  // Avatars — square resize, no upscale
  for (const a of avatars) {
    const meta = await sharp(a.src).metadata();
    const origKB = Math.round(fs.statSync(a.src).size / 1024);
    await sharp(a.src)
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: AVATAR_Q })
      .toFile(a.out);
    const newKB = Math.round(fs.statSync(a.out).size / 1024);
    results.push({
      label: a.label, src: a.src, out: a.out,
      origDim: meta.width + 'x' + meta.height, newDim: AVATAR_SIZE + 'x' + AVATAR_SIZE,
      origKB, newKB,
      saving: Math.round((1 - newKB / origKB) * 100) + '%'
    });
    console.log('✓ ' + a.label + ': ' + origKB + 'KB → ' + newKB + 'KB (' + results[results.length-1].saving + ')');
  }

  // Home scenes — resize width to HOME_MAX_W, maintain aspect ratio
  for (const h of homeScenes) {
    const meta = await sharp(h.src).metadata();
    const origKB = Math.round(fs.statSync(h.src).size / 1024);
    await sharp(h.src)
      .resize(HOME_MAX_W, null, { withoutEnlargement: true }) // null height = auto
      .webp({ quality: HOME_Q })
      .toFile(h.out);
    const newMeta = await sharp(h.out).metadata();
    const newKB = Math.round(fs.statSync(h.out).size / 1024);
    results.push({
      label: h.label, src: h.src, out: h.out,
      origDim: meta.width + 'x' + meta.height,
      newDim: newMeta.width + 'x' + newMeta.height,
      origKB, newKB,
      saving: Math.round((1 - newKB / origKB) * 100) + '%'
    });
    console.log('✓ ' + h.label + ': ' + origKB + 'KB → ' + newKB + 'KB (' + results[results.length-1].saving + ')');
  }

  // ─── Report ─────────────────────────────────────────────────────────────────
  console.log('\n=== Optimization Report ===');
  let totalOrig = 0, totalNew = 0;
  results.forEach(r => {
    totalOrig += r.origKB;
    totalNew  += r.newKB;
    console.log(r.label);
    console.log('  ' + r.src + ' (' + r.origDim + ', ' + r.origKB + 'KB) → ' + r.out + ' (' + r.newDim + ', ' + r.newKB + 'KB, -' + r.saving + ')');
  });
  console.log('\nTotal: ' + totalOrig + 'KB → ' + totalNew + 'KB (' + Math.round((1 - totalNew/totalOrig)*100) + '% saved)');

  // ─── Update body-soul-app.html ───────────────────────────────────────────────
  let html = fs.readFileSync('body-soul-app.html', 'utf8');

  // Update COMPANIONS: img & homeImg → .webp
  html = html.replace(/img:'assets\/companions\/(\w+)\.png'/g,        "img:'assets/companions/$1.webp'");
  html = html.replace(/homeImg:'assets\/companions\/(\w+-home)\.png'/g, "homeImg:'assets/companions/$1.webp'");
  console.log('\n✓ HTML img/homeImg references updated to .webp');

  // Fix home image CSS: cover → contain, and adjust object-position
  html = html.replace(
    `.j-home-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
  transition: filter 0.3s;
}`,
    `.j-home-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  display: block;
  transition: filter 0.3s;
}`
  );
  console.log('✓ CSS updated: object-fit cover → contain for home images');

  // Fix avatar CSS in selection cards: ensure contain (already is, but make explicit)
  // .jcc-portrait img uses height:130px, object-fit:contain — already correct

  // Syntax check
  fs.writeFileSync('body-soul-app.html', html, 'utf8');
  const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/g) || [];
  let allJS = '';
  scripts.forEach(s => allJS += s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '') + '\n');
  fs.writeFileSync('_tmp_checkOpt.js', allJS, 'utf8');
  const { execSync } = require('child_process');
  try {
    execSync('node --check _tmp_checkOpt.js', { stdio: 'pipe' });
    console.log('✓ Syntax OK');
  } catch(e) {
    console.error('✗ Syntax error:', e.stderr.toString().split('\n').slice(0,5).join('\n'));
  }
  try { fs.unlinkSync('_tmp_checkOpt.js'); } catch(e) {}

  // Verify WebP files exist
  console.log('\n=== Final WebP file check ===');
  [...avatars, ...homeScenes].forEach(f => {
    const exists = fs.existsSync(f.out);
    const kb = exists ? Math.round(fs.statSync(f.out).size / 1024) + 'KB' : 'MISSING';
    console.log((exists ? '✓' : '✗') + ' ' + f.out + ' — ' + kb);
  });

  // Verify HTML references
  const finalHTML = fs.readFileSync('body-soul-app.html', 'utf8');
  const pngRefs = (finalHTML.match(/assets\/companions\/[^'"]+\.png/g) || []);
  if (pngRefs.length > 0) {
    console.log('\n⚠ Remaining .png references in HTML:', pngRefs);
  } else {
    console.log('\n✓ No remaining .png companion references in HTML');
  }

  console.log('\nDone. HTML size:', Buffer.byteLength(finalHTML), 'bytes');
}

processAll().catch(e => { console.error(e); process.exit(1); });
