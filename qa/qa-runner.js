#!/usr/bin/env node
// qa/qa-runner.js
// Permanent QA runner for the תורי app.
//
// Usage:
//   node qa/qa-runner.js [--local] [--suite QA1] [--headed]
//
//   --local    Test against localhost:7777 instead of live GitHub Pages
//   --suite    Run only one suite (e.g. --suite QA1 or --suite QA3)
//   --headed   Run in headed (visible browser) mode
//
// Outputs:
//   qa/QA_REPORT.md     — full test results
//   qa/REPAIR_PROMPT.md — ready-to-use repair prompt (only when tests fail)
//
// Rules:
//   ✗  Does NOT fix any bug
//   ✗  Does NOT commit or deploy anything

'use strict';
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

// ─── Parse CLI flags ────────────────────────────────────────────────
const args      = process.argv.slice(2);
const isLocal   = args.includes('--local');
const isHeaded  = args.includes('--headed');
const suiteArg  = (() => { const i = args.indexOf('--suite'); return i >= 0 ? args[i + 1] : null; })();

const CONFIG    = isLocal ? 'playwright.local.config.js' : 'playwright.config.js';
const BASE_URL  = isLocal ? 'http://localhost:7777/' : 'https://hadasab94.github.io/Tori-app/';
const ROOT      = path.resolve(__dirname, '..');
const QA_DIR    = __dirname;
const REPORT_MD = path.join(QA_DIR, 'QA_REPORT.md');
const REPAIR_MD = path.join(QA_DIR, 'REPAIR_PROMPT.md');

// ─── Suite metadata ─────────────────────────────────────────────────
const SUITES = [
  { id: 'QA1', name: 'Smoke — app loads, correct tabs',        grep: 'QA1:' },
  { id: 'QA2', name: 'Stale content — forbidden visible text', grep: 'QA2:' },
  { id: 'QA3', name: 'Companion selection — full flow',        grep: 'QA3:' },
  { id: 'QA4', name: 'Card structure — only radio selects',    grep: 'QA4:' },
  { id: 'QA5', name: 'Journey screen after selection',         grep: 'QA5:' },
  { id: 'QA6', name: 'Action buttons respond',                 grep: 'QA6:' },
  { id: 'QA7', name: 'Water drops',                            grep: 'QA7:' },
  { id: 'QA8', name: 'Compassion day',                         grep: 'QA8:' },
  { id: 'QA9', name: 'RTL & mobile layout',                   grep: 'QA9:' },
  { id: 'QA10', name: 'Pamper image repair — legacy migration', grep: 'QA10:' },
];

// ─── Helpers ────────────────────────────────────────────────────────
function now() { return new Date().toISOString().replace('T', ' ').slice(0, 19); }

function runPlaywright(grep, extraFlags = []) {
  const grepFlag = grep ? `--grep "${grep}"` : '';
  const headedFlag = isHeaded ? '--headed' : '';

  // Run with JSON reporter — on Windows stdout captures the JSON directly
  const cmd = [
    'npx playwright test',
    `--config=${CONFIG}`,
    `--reporter=json`,
    grepFlag,
    headedFlag,
    `qa/tori-qa.spec.js`,
    ...extraFlags,
  ].filter(Boolean).join(' ');

  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  const t0 = Date.now();
  try {
    stdout = execSync(cmd, {
      cwd: ROOT,
      timeout: 6 * 60 * 1000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err) {
    stdout = err.stdout || '';
    stderr = err.stderr || '';
    exitCode = err.status || 1;
  }
  const elapsed = Math.round((Date.now() - t0) / 1000);
  process.stdout.write(`  ✓ Playwright done in ${elapsed}s\n`);

  // With --reporter=json, Playwright writes JSON to stdout
  let jsonData = null;
  const jsonStart = stdout.indexOf('{');
  if (jsonStart >= 0) {
    try {
      jsonData = JSON.parse(stdout.slice(jsonStart));
      // Save for debugging
      fs.writeFileSync(path.join(QA_DIR, '_last-run-qa.json'), JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.warn('Could not parse Playwright JSON output:', e.message);
    }
  }

  // Also run with list reporter to get human-readable output (stderr)
  // The list reporter output goes to stderr in Playwright
  return { output: stderr || stdout, exitCode, jsonData };
}

function parseResults(jsonData, rawOutput) {
  const results = { passed: [], failed: [], skipped: [], total: 0, errors: [] };

  if (jsonData && jsonData.suites) {
    function walk(suites) {
      for (const suite of suites) {
        if (suite.suites) walk(suite.suites);
        for (const spec of (suite.specs || [])) {
          for (const test of (spec.tests || [])) {
            results.total++;
            // test.status is 'expected'/'unexpected' — use results[0].status for actual outcome
            const result0 = test.results && test.results[0];
            const status = (result0 && result0.status) || 'unknown';
            const title = spec.title;
            const error = (result0 && result0.error && result0.error.message) || '';
            const entry = { title, status, error };

            if (status === 'passed')  results.passed.push(entry);
            else if (status === 'skipped') results.skipped.push(entry);
            else {
              results.failed.push(entry);
              if (error) results.errors.push({ title, error });
            }
          }
        }
      }
    }
    walk(jsonData.suites);
  } else {
    // Fallback: parse raw output line counts
    const passMatch = rawOutput.match(/(\d+) passed/);
    const failMatch = rawOutput.match(/(\d+) failed/);
    if (passMatch) results.passed = Array(parseInt(passMatch[1])).fill({ title: '(from output)', status: 'passed', error: '' });
    if (failMatch) results.failed = Array(parseInt(failMatch[1])).fill({ title: '(from output)', status: 'failed', error: '' });
    results.total = results.passed.length + results.failed.length;
  }

  return results;
}

function suiteResults(suiteName, all) {
  // Test titles are like "QA1-A: ..." so match by suite prefix "QA1"
  return {
    passed:  all.passed.filter(t => t.title.startsWith(suiteName)),
    failed:  all.failed.filter(t => t.title.startsWith(suiteName)),
    skipped: all.skipped.filter(t => t.title.startsWith(suiteName)),
  };
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║           תורי QA Runner                            ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  console.log(`Target:  ${BASE_URL}`);
  console.log(`Config:  ${CONFIG}`);
  console.log(`Suite:   ${suiteArg || 'ALL'}`);
  console.log(`Headed:  ${isHeaded}`);
  console.log(`Time:    ${now()}\n`);

  // Determine which suites to run
  const suitesToRun = suiteArg
    ? SUITES.filter(s => s.id.toLowerCase() === suiteArg.toLowerCase())
    : SUITES;

  if (suitesToRun.length === 0) {
    console.error(`Unknown suite: ${suiteArg}`);
    process.exit(1);
  }

  console.log(`Running ${suitesToRun.length} suite(s)...\n`);

  // Run Playwright
  const grep = suitesToRun.length === 1 ? suitesToRun[0].grep : null;
  const { output, exitCode, jsonData } = runPlaywright(grep);
  const allResults = parseResults(jsonData, output);

  // ─── Build QA_REPORT.md ─────────────────────────────────────────
  const dateStr = now();
  const target = isLocal ? 'localhost:7777 (local)' : 'https://hadasab94.github.io/Tori-app/ (live)';

  let md = `# QA Report — תורי\n\n`;
  md += `**Date:** ${dateStr}\n`;
  md += `**Target:** ${target}\n`;
  md += `**Suites run:** ${suiteArg || 'ALL'}\n\n`;
  md += `---\n\n`;

  // Summary table
  md += `## Summary\n\n`;
  md += `| Suite | Tests | Passed | Failed | Skipped | Status |\n`;
  md += `|---|---|---|---|---|---|\n`;

  let totalPass = 0, totalFail = 0, totalSkip = 0;
  for (const suite of suitesToRun) {
    const sr = suiteResults(suite.id, allResults);
    const p = sr.passed.length;
    const f = sr.failed.length;
    const sk = sr.skipped.length;
    const t = p + f + sk;
    const status = f > 0 ? '❌ FAIL' : sk > 0 && p === 0 ? '⚠️ SKIP' : '✅ PASS';
    md += `| ${suite.id} | ${t} | ${p} | ${f} | ${sk} | ${status} |\n`;
    totalPass += p; totalFail += f; totalSkip += sk;
  }

  const grandTotal = totalPass + totalFail + totalSkip;
  const overallStatus = totalFail > 0 ? '❌ FAILURES FOUND' : '✅ ALL PASSED';
  md += `| **TOTAL** | **${grandTotal}** | **${totalPass}** | **${totalFail}** | **${totalSkip}** | **${overallStatus}** |\n`;
  md += `\n---\n\n`;

  // Per-suite detail
  md += `## Detail by Suite\n\n`;
  for (const suite of suitesToRun) {
    const sr = suiteResults(suite.id, allResults);
    const icon = sr.failed.length > 0 ? '❌' : '✅';
    md += `### ${icon} ${suite.id}: ${suite.name}\n\n`;

    for (const t of sr.passed)  md += `- ✅ ${t.title}\n`;
    for (const t of sr.skipped) md += `- ⚠️ ${t.title} *(skipped)*\n`;
    for (const t of sr.failed) {
      md += `- ❌ ${t.title}\n`;
      if (t.error) {
        const errLines = t.error.split('\n').slice(0, 5).join('\n        ');
        md += `        \`\`\`\n        ${errLines}\n        \`\`\`\n`;
      }
    }
    md += '\n';
  }

  md += `---\n\n`;
  md += `## How to Re-run\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Full QA against live site\n`;
  md += `node qa/qa-runner.js\n\n`;
  md += `# Full QA against local dev server\n`;
  md += `npx serve -l 7777 &\n`;
  md += `node qa/qa-runner.js --local\n\n`;
  md += `# Single suite\n`;
  md += `node qa/qa-runner.js --suite QA3\n\n`;
  md += `# Headed (visible browser)\n`;
  md += `node qa/qa-runner.js --headed\n`;
  md += `\`\`\`\n\n`;
  md += `*Generated by qa/qa-runner.js — does NOT fix or deploy anything.*\n`;

  fs.writeFileSync(REPORT_MD, md, 'utf8');
  console.log(`✅ QA_REPORT.md written → ${REPORT_MD}`);

  // ─── Build REPAIR_PROMPT.md (only when failures exist) ──────────
  if (totalFail > 0) {
    const failedSuites = suitesToRun.filter(s => suiteResults(s.id, allResults).failed.length > 0);
    const failedTests  = allResults.failed;

    let rp = `# REPAIR PROMPT — תורי QA Failures\n\n`;
    rp += `**Generated:** ${dateStr}\n`;
    rp += `**Target:** ${target}\n\n`;
    rp += `---\n\n`;
    rp += `## Context\n\n`;
    rp += `This is a repair prompt for the תורי app (\`body-soul-app.html\`).\n`;
    rp += `The permanent QA suite found **${totalFail} failing test(s)** across **${failedSuites.length} suite(s)**.\n\n`;
    rp += `**File to fix:** \`body-soul-app.html\` (single-file PWA, ~432KB, all CSS + JS + HTML inline)\n`;
    rp += `**QA spec:** \`qa/tori-qa.spec.js\`\n`;
    rp += `**Run command after fix:** \`node qa/qa-runner.js --local\`\n\n`;
    rp += `---\n\n`;
    rp += `## Failing Tests\n\n`;

    for (const t of failedTests) {
      rp += `### ❌ ${t.title}\n\n`;
      if (t.error) {
        rp += `**Error:**\n\`\`\`\n${t.error.slice(0, 600)}\n\`\`\`\n\n`;
      }
    }

    rp += `---\n\n`;
    rp += `## Repair Instructions\n\n`;
    rp += `1. Read \`body-soul-app.html\` — all code is in one file (HTML + CSS + JS)\n`;
    rp += `2. Fix only the failing tests listed above — do NOT change passing tests\n`;
    rp += `3. Do NOT add new tabs, features, or regressions\n`;
    rp += `4. Do NOT commit or deploy — the human will review and deploy manually\n`;
    rp += `5. After editing, run locally to verify:\n`;
    rp += `   \`\`\`bash\n`;
    rp += `   npx serve -l 7777 &\n`;
    rp += `   node qa/qa-runner.js --local\n`;
    rp += `   \`\`\`\n\n`;
    rp += `## Key App Facts\n\n`;
    rp += `- Single-file PWA: \`body-soul-app.html\`\n`;
    rp += `- Hebrew RTL app (\`dir="rtl"\`)\n`;
    rp += `- Auth bypass in tests: localStorage seeded with \`user:session\` before page load\n`;
    rp += `- Service workers blocked in Playwright: \`serviceWorkers: 'block'\`\n`;
    rp += `- \`cs\` is declared with \`let\` at script scope — NOT on \`window\`\n`;
    rp += `- Companion state localStorage key: \`tori_companion_v1.state\`\n`;
    rp += `- Compassion state localStorage key: \`compassion:state\`\n`;
    rp += `- Action response area: \`#j-action-response\`\n`;
    rp += `- Companion select guard: \`renderJourneyTab()\` checks \`#jcs-card-list\` existence\n`;
    rp += `  before deciding whether to rebuild DOM or just sync visuals\n`;
    rp += `- \`hitarea.onclick\` (property, not addEventListener) survives render cycles\n\n`;
    rp += `---\n\n`;
    rp += `*This file was auto-generated by qa/qa-runner.js.*\n`;
    rp += `*It does NOT fix anything — it only describes what needs fixing.*\n`;

    fs.writeFileSync(REPAIR_MD, rp, 'utf8');
    console.log(`📋 REPAIR_PROMPT.md written → ${REPAIR_MD}`);
  } else {
    // Clear stale repair prompt if all tests pass
    if (fs.existsSync(REPAIR_MD)) {
      fs.writeFileSync(REPAIR_MD, `# REPAIR PROMPT\n\nAll tests passed on ${dateStr}. No repair needed.\n`, 'utf8');
    }
  }

  // ─── Console summary ────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════');
  console.log(`  ${overallStatus}`);
  console.log(`  ${totalPass} passed, ${totalFail} failed, ${totalSkip} skipped (${grandTotal} total)`);
  console.log('══════════════════════════════════════════════════\n');

  if (totalFail > 0) {
    console.log('❌ Failing tests:');
    for (const t of allResults.failed) {
      console.log(`   • ${t.title}`);
      if (t.error) {
        console.log(`     ${t.error.split('\n')[0].slice(0, 100)}`);
      }
    }
    console.log('');
    console.log(`📋 Repair prompt ready: qa/REPAIR_PROMPT.md`);
    console.log(`   Paste it into a new Claude Code session to get a targeted fix.\n`);
  }

  console.log(`📄 Full report: qa/QA_REPORT.md\n`);
  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('qa-runner error:', err);
  process.exit(1);
});
