// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './qa',
  timeout: 30000,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'qa/last-run.json' }],
  ],
  use: {
    baseURL: 'https://hadasab94.github.io/Tori-app/',
    headless: true,
    // Emulate iPhone 14 viewport (Chromium, no WebKit needed)
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    locale: 'he-IL',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    // Block service workers — prevents the sw.js controllerchange→reload
    // which was causing the page to reset mid-test
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'chromium-iphone',
      use: { browserName: 'chromium' },
    },
  ],
});
