import { defineConfig } from '@playwright/test';

// Browser regression checks with intercepted API responses: no database or email provider.
export default defineConfig({
  testDir: './e2e', testMatch: ['**/ux-first-use.spec.ts', '**/chart-review.spec.ts', '**/goals-report-ux.spec.ts', '**/goals-review.spec.ts'], fullyParallel: true,
  workers: 2, timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:5182', channel: 'chrome', headless: true, reducedMotion: 'reduce', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1366, height: 768 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5182 --strictPort',
    port: 5182, reuseExistingServer: false,
    env: { VITE_API_URL: 'http://127.0.0.1:5182/api', VITE_DEMO_MODE: 'false', VITE_GOOGLE_CLIENT_ID: '' },
  },
});
