// playwright.local.config.js — tests against local dev server (after patch applied)
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './qa',
  // Skip the diagnostic test when running local
  testIgnore: ['**/tori-diagnostic.spec.js'],
  timeout: 30000,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'qa/last-run-local.json' }],
  ],
  use: {
    baseURL: 'http://localhost:7777/',
    headless: true,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    locale: 'he-IL',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    // No need to block service workers for local testing
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'local-chromium-iphone',
      use: { browserName: 'chromium' },
    },
  ],
});
